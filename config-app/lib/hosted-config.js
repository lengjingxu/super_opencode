const fs = require('fs');
const path = require('path');
const { CONFIG_DIR, readJsonFile, writeJsonFile, ensureDir } = require('./config-service');

const HOSTED_CONFIG_PATH = path.join(CONFIG_DIR, 'hosted-service.json');
const HOSTED_TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'hosted-service.template.json');

function loadHostedTemplate() {
  try {
    if (fs.existsSync(HOSTED_TEMPLATE_PATH)) {
      return JSON.parse(fs.readFileSync(HOSTED_TEMPLATE_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('[hosted-config] Failed to load template:', e.message);
  }
  return null;
}

const HOSTED_TEMPLATE = loadHostedTemplate() || {
  baseUrl: 'http://8.153.201.122:3000',
  planModels: {}
};

const DEFAULT_HOSTED_CONFIG = {
  enabled: false,
  baseUrl: HOSTED_TEMPLATE.baseUrl,
  username: '',
  apiKey: '',
  plan: 'free',
  lastLogin: null
};

const FALLBACK_PLAN_MODELS = HOSTED_TEMPLATE.planModels || {
  free: {
    primary: 'deepseek-chat',
    secondary: 'deepseek-chat',
    fast: 'gemini-2.0-flash',
    multimodal: 'gemini-2.0-flash',
    reasoning: 'deepseek-reasoner'
  },
  pro: {
    primary: 'claude-sonnet-4-20250514',
    secondary: 'claude-sonnet-4-20250514',
    fast: 'claude-haiku-3-5-20241022',
    multimodal: 'gemini-2.5-pro-preview-05-06',
    reasoning: 'claude-opus-4-20250514'
  },
  ultimate: {
    primary: 'claude-opus-4-20250514',
    secondary: 'claude-sonnet-4-20250514',
    fast: 'claude-haiku-3-5-20241022',
    multimodal: 'gemini-2.5-pro-preview-05-06',
    reasoning: 'o1'
  }
};

const AGENT_MODEL_MAPPING = {
  sisyphus: 'primary',
  oracle: 'reasoning',
  prometheus: 'primary',
  explore: 'fast',
  librarian: 'multimodal',
  'multimodal-looker': 'multimodal',
  metis: 'primary',
  momus: 'reasoning',
  'sisyphus-junior': 'secondary',
  compaction: 'fast'
};

const CATEGORY_MODEL_MAPPING = {
  'visual-engineering': 'multimodal',
  'ultrabrain': 'reasoning',
  'deep': 'reasoning',
  'artistry': 'multimodal',
  'quick': 'fast',
  'unspecified-low': 'fast',
  'unspecified-high': 'primary',
  'writing': 'secondary'
};

function getHostedConfig() {
  const config = readJsonFile(HOSTED_CONFIG_PATH);
  return { ...DEFAULT_HOSTED_CONFIG, ...config };
}

function saveHostedConfig(config) {
  const current = getHostedConfig();
  const updated = { ...current, ...config };
  writeJsonFile(HOSTED_CONFIG_PATH, updated);
  return updated;
}

function getModelsForPlan(plan, remotePlanModels = null) {
  if (remotePlanModels && remotePlanModels[plan]) {
    return remotePlanModels[plan];
  }
  return FALLBACK_PLAN_MODELS[plan] || FALLBACK_PLAN_MODELS.free;
}

function buildAgentModels(plan, providerName = 'hosted', remotePlanModels = null) {
  const models = getModelsForPlan(plan, remotePlanModels);
  const agentModels = {};
  
  for (const [agent, modelType] of Object.entries(AGENT_MODEL_MAPPING)) {
    const modelName = models[modelType] || models.primary;
    agentModels[agent] = `${providerName}/${modelName}`;
  }
  
  return agentModels;
}

function buildCategoryModels(plan, providerName = 'hosted', remotePlanModels = null) {
  const models = getModelsForPlan(plan, remotePlanModels);
  const categoryModels = {};
  
  for (const [category, modelType] of Object.entries(CATEGORY_MODEL_MAPPING)) {
    const modelName = models[modelType] || models.primary;
    categoryModels[category] = `${providerName}/${modelName}`;
  }
  
  return categoryModels;
}

function buildHostedProvider(baseUrl, apiKey, modelList = []) {
  const models = {};
  if (modelList && modelList.length > 0) {
    modelList.forEach(m => {
      const modelId = typeof m === 'string' ? m : m.id;
      if (modelId) {
        models[modelId] = { name: modelId };
      }
    });
  } else {
    Object.values(FALLBACK_PLAN_MODELS).forEach(planModels => {
      Object.values(planModels).forEach(model => {
        models[model] = { name: model };
      });
    });
  }

  return {
    name: 'Oh-My-OpenCode 托管服务',
    npm: '@ai-sdk/openai-compatible',
    options: {
      apiKey: apiKey,
      baseURL: baseUrl.replace(/\/$/, '') + '/v1'
    },
    models: models
  };
}

function applyHostedServiceConfig(opencodeConfig, ohMyConfig, hostedConfig, remoteConfig = null) {
  const { apiKey, plan, enabled } = hostedConfig;
  const baseUrl = remoteConfig?.baseUrl || hostedConfig.baseUrl;
  const modelList = remoteConfig?.models || [];
  const planModels = remoteConfig?.planModels || null;
  
  if (!enabled || !apiKey) {
    return { opencodeConfig, ohMyConfig };
  }

  if (!baseUrl) {
    console.error('[hosted-config] No baseUrl available');
    return { opencodeConfig, ohMyConfig };
  }

  if (opencodeConfig.providers) {
    delete opencodeConfig.providers;
  }

  opencodeConfig.provider = opencodeConfig.provider || {};
  opencodeConfig.provider.hosted = buildHostedProvider(baseUrl, apiKey, modelList);

  const agentModels = buildAgentModels(plan, 'hosted', planModels);
  const categoryModels = buildCategoryModels(plan, 'hosted', planModels);

  ohMyConfig.agents = ohMyConfig.agents || {};
  for (const [agent, model] of Object.entries(agentModels)) {
    if (agent === 'compaction') {
      const slashIndex = model.indexOf('/');
      if (slashIndex > 0) {
        if (!opencodeConfig.agent) opencodeConfig.agent = {};
        opencodeConfig.agent.compaction = {
          model: {
            providerID: model.substring(0, slashIndex),
            modelID: model.substring(slashIndex + 1)
          }
        };
      }
      continue;
    }
    ohMyConfig.agents[agent] = ohMyConfig.agents[agent] || {};
    ohMyConfig.agents[agent].model = model;
  }

  ohMyConfig.categories = ohMyConfig.categories || {};
  for (const [category, model] of Object.entries(categoryModels)) {
    ohMyConfig.categories[category] = ohMyConfig.categories[category] || {};
    ohMyConfig.categories[category].model = model;
  }

  return { opencodeConfig, ohMyConfig };
}

function removeHostedServiceConfig(opencodeConfig, ohMyConfig) {
  if (opencodeConfig.provider?.hosted) {
    delete opencodeConfig.provider.hosted;
  }

  if (opencodeConfig.agent?.compaction?.model?.providerID === 'hosted') {
    delete opencodeConfig.agent.compaction;
    if (opencodeConfig.agent && Object.keys(opencodeConfig.agent).length === 0) {
      delete opencodeConfig.agent;
    }
  }

  if (ohMyConfig.agents) {
    for (const agent of Object.keys(ohMyConfig.agents)) {
      if (ohMyConfig.agents[agent]?.model?.startsWith('hosted/')) {
        delete ohMyConfig.agents[agent].model;
      }
    }
  }

  if (ohMyConfig.categories) {
    for (const category of Object.keys(ohMyConfig.categories)) {
      if (ohMyConfig.categories[category]?.model?.startsWith('hosted/')) {
        delete ohMyConfig.categories[category].model;
      }
    }
  }

  return { opencodeConfig, ohMyConfig };
}

function isHostedServiceEnabled() {
  const config = getHostedConfig();
  return config.enabled && !!config.apiKey;
}

module.exports = {
  HOSTED_CONFIG_PATH,
  DEFAULT_HOSTED_CONFIG,
  FALLBACK_PLAN_MODELS,
  AGENT_MODEL_MAPPING,
  CATEGORY_MODEL_MAPPING,
  
  getHostedConfig,
  saveHostedConfig,
  getModelsForPlan,
  buildAgentModels,
  buildCategoryModels,
  buildHostedProvider,
  applyHostedServiceConfig,
  removeHostedServiceConfig,
  isHostedServiceEnabled
};
