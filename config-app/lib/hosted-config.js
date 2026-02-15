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

const AGENT_RECOMMENDATIONS = {
  sisyphus: {
    name: '主力执行 (Sisyphus)',
    role: '核心任务执行，需要强大的代码能力',
    prefer: ['opus', 'gpt4'],
    tier: 'primary'
  },
  oracle: {
    name: '架构顾问 (Oracle)',
    role: '架构审查和调试，需要深度推理',
    prefer: ['gpt4', 'opus'],
    tier: 'reasoning'
  },
  prometheus: {
    name: '任务规划 (Prometheus)',
    role: '任务分解和规划',
    prefer: ['opus', 'gpt4'],
    tier: 'primary'
  },
  explore: {
    name: '代码搜索 (Explore)',
    role: '快速代码搜索，需要速度',
    prefer: ['haiku', 'gemini_flash'],
    tier: 'fast'
  },
  librarian: {
    name: '文档查找 (Librarian)',
    role: '文档和开源项目查找，需要多模态',
    prefer: ['gemini_pro', 'gemini_flash'],
    tier: 'multimodal'
  },
  'multimodal-looker': {
    name: '图像分析 (Multimodal)',
    role: '图片和PDF分析',
    prefer: ['gemini_pro', 'gemini_flash'],
    tier: 'multimodal'
  },
  metis: {
    name: '需求分析 (Metis)',
    role: '发现隐藏意图和歧义',
    prefer: ['opus', 'gpt4'],
    tier: 'primary'
  },
  momus: {
    name: '方案审查 (Momus)',
    role: '严格评审工作计划',
    prefer: ['gpt4', 'opus'],
    tier: 'reasoning'
  },
  atlas: {
    name: '任务编排 (Atlas)',
    role: '主编排器，管理任务全生命周期，混合调度 Categories 和 Skills',
    prefer: ['sonnet', 'opus', 'gpt4'],
    tier: 'primary'
  },
  hephaestus: {
    name: '深度工作 (Hephaestus)',
    role: '自主深度执行代理，目标导向，先探索后行动，端到端完成',
    prefer: ['gpt4', 'opus'],
    tier: 'reasoning'
  },
  compaction: {
    name: '上下文压缩 (Compaction)',
    role: '会话摘要压缩，推荐便宜快速模型',
    prefer: ['haiku', 'gemini_flash', 'deepseek'],
    tier: 'fast',
    target: 'opencode.json'
  }
};

const CATEGORY_RECOMMENDATIONS = {
  'visual-engineering': {
    name: '前端/UI开发',
    role: '前端、UI/UX、设计',
    prefer: ['gemini_pro', 'sonnet'],
    tier: 'multimodal'
  },
  'ultrabrain': {
    name: '复杂逻辑',
    role: '复杂逻辑任务',
    prefer: ['gpt4', 'opus'],
    tier: 'reasoning'
  },
  'deep': {
    name: '深度研究',
    role: '深度问题研究',
    prefer: ['gpt4', 'opus'],
    tier: 'reasoning'
  },
  'artistry': {
    name: '创意设计',
    role: '创意和非常规方案',
    prefer: ['gemini_pro', 'sonnet'],
    tier: 'multimodal'
  },
  'quick': {
    name: '快速任务',
    role: '简单快速任务',
    prefer: ['haiku', 'gemini_flash'],
    tier: 'fast'
  },
  'unspecified-low': {
    name: '通用低复杂度',
    role: '低复杂度通用任务',
    prefer: ['sonnet', 'gpt4_mini'],
    tier: 'secondary'
  },
  'unspecified-high': {
    name: '通用高复杂度',
    role: '高复杂度通用任务（思维链推理）',
    prefer: ['codex', 'opus', 'o1', 'o3'],
    tier: 'reasoning'
  },
  'writing': {
    name: '文档撰写',
    role: '文档和技术写作',
    prefer: ['gemini_flash', 'sonnet'],
    tier: 'fast'
  }
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
    npm: '@ai-sdk/anthropic',
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
      if (model) {
        if (!opencodeConfig.agent) opencodeConfig.agent = {};
        opencodeConfig.agent.compaction = {
          model: model
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

  const compactionModel = opencodeConfig.agent?.compaction?.model;
  if (compactionModel) {
    const isHosted = typeof compactionModel === 'string' 
      ? compactionModel.startsWith('hosted/') 
      : (compactionModel && compactionModel.providerID === 'hosted');
    
    if (isHosted) {
      delete opencodeConfig.agent.compaction;
      if (opencodeConfig.agent && Object.keys(opencodeConfig.agent).length === 0) {
        delete opencodeConfig.agent;
      }
    }
  }

  if (ohMyConfig.agents) {
    for (const agent of Object.keys(ohMyConfig.agents)) {
      const model = ohMyConfig.agents[agent]?.model;
      if (model) {
        const isHosted = typeof model === 'string' 
          ? model.startsWith('hosted/') 
          : (model && model.providerID === 'hosted');
        
        if (isHosted) {
          delete ohMyConfig.agents[agent].model;
        }
      }
    }
  }

  if (ohMyConfig.categories) {
    for (const category of Object.keys(ohMyConfig.categories)) {
      const model = ohMyConfig.categories[category]?.model;
      if (model) {
        const isHosted = typeof model === 'string' 
          ? model.startsWith('hosted/') 
          : (model && model.providerID === 'hosted');
        
        if (isHosted) {
          delete ohMyConfig.categories[category].model;
        }
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
  AGENT_RECOMMENDATIONS,
  CATEGORY_RECOMMENDATIONS,
  
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
