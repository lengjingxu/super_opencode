const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function matchModelsToAgents(providerName, models) {
  const modelList = Object.keys(models || {});
  if (modelList.length === 0) return null;
  
  const patterns = {
    opus: /opus|o1|4-5.*20251101/i,
    sonnet: /sonnet|4-5(?!.*20251101)/i,
    haiku: /haiku|flash|-mini|fast$/i,
    gemini_pro: /gemini.*pro|gemini-3(?!.*flash)|gemini-2\.5-pro/i,
    gemini_flash: /gemini.*flash|gemini-2\.5-flash/i,
    gpt4: /gpt-4\.1(?!.*mini)|gpt-4o(?!.*mini)|o1/i,
    gpt4_mini: /gpt-4\.1-mini|gpt-4o-mini/i
  };
  
  const matched = {};
  for (const [category, pattern] of Object.entries(patterns)) {
    const found = modelList.find(m => pattern.test(m));
    if (found) matched[category] = `${providerName}/${found}`;
  }
  
  const result = {
    primary: matched.opus || matched.gpt4 || matched.sonnet || modelList[0] && `${providerName}/${modelList[0]}`,
    secondary: matched.sonnet || matched.gpt4_mini || matched.gemini_pro || null,
    fast: matched.haiku || matched.gemini_flash || matched.gpt4_mini || null,
    multimodal: matched.gemini_pro || matched.gemini_flash || null,
    reasoning: matched.gpt4 || matched.opus || null
  };
  
  return result;
}

function applyModelMapping(ohMyConfig, modelMapping) {
  if (!modelMapping) return ohMyConfig;
  
  const agentModelMap = {
    sisyphus: modelMapping.primary,
    oracle: modelMapping.reasoning || modelMapping.primary,
    prometheus: modelMapping.primary,
    explore: modelMapping.fast || modelMapping.secondary,
    librarian: modelMapping.multimodal || modelMapping.secondary,
    'multimodal-looker': modelMapping.multimodal || modelMapping.fast,
    metis: modelMapping.primary,
    momus: modelMapping.reasoning || modelMapping.primary
  };
  
  const categoryModelMap = {
    'visual-engineering': modelMapping.multimodal || modelMapping.secondary,
    'ultrabrain': modelMapping.reasoning || modelMapping.primary,
    'deep': modelMapping.reasoning || modelMapping.primary,
    'artistry': modelMapping.multimodal || modelMapping.secondary,
    'quick': modelMapping.fast || modelMapping.secondary,
    'unspecified-low': modelMapping.secondary || modelMapping.primary,
    'unspecified-high': modelMapping.reasoning || modelMapping.primary,
    'writing': modelMapping.fast || modelMapping.secondary
  };
  
  ohMyConfig.agents = ohMyConfig.agents || {};
  for (const [agent, model] of Object.entries(agentModelMap)) {
    if (model) {
      ohMyConfig.agents[agent] = { model };
    }
  }
  
  ohMyConfig.categories = ohMyConfig.categories || {};
  for (const [category, model] of Object.entries(categoryModelMap)) {
    if (model) {
      ohMyConfig.categories[category] = ohMyConfig.categories[category] || {};
      ohMyConfig.categories[category].model = model;
    }
  }
  
  return ohMyConfig;
}

function readCredentials(credentialsPath) {
  if (fs.existsSync(credentialsPath)) {
    try {
      return JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function writeCredentials(credentialsPath, data) {
  fs.writeFileSync(credentialsPath, JSON.stringify(data, null, 2));
}

function maskSecret(secret, visibleChars = 0) {
  if (!secret) return '';
  if (visibleChars === 0) return '••••••••';
  return secret.slice(0, visibleChars) + '••••••••';
}

module.exports = {
  copyDirSync,
  matchModelsToAgents,
  applyModelMapping,
  readCredentials,
  writeCredentials,
  maskSecret
};
