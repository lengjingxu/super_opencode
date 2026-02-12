const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  copyDirSync,
  matchModelsToAgents,
  applyModelMapping,
  readCredentials,
  writeCredentials,
  maskSecret
} = require('../lib/utils');

describe('utils', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('copyDirSync', () => {
    test('copies files from source to destination', () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');
      
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'test.txt'), 'hello');
      
      copyDirSync(srcDir, destDir);
      
      expect(fs.existsSync(path.join(destDir, 'test.txt'))).toBe(true);
      expect(fs.readFileSync(path.join(destDir, 'test.txt'), 'utf-8')).toBe('hello');
    });

    test('copies nested directories recursively', () => {
      const srcDir = path.join(tempDir, 'src');
      const nestedDir = path.join(srcDir, 'nested');
      const destDir = path.join(tempDir, 'dest');
      
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(path.join(nestedDir, 'deep.txt'), 'deep content');
      
      copyDirSync(srcDir, destDir);
      
      expect(fs.existsSync(path.join(destDir, 'nested', 'deep.txt'))).toBe(true);
      expect(fs.readFileSync(path.join(destDir, 'nested', 'deep.txt'), 'utf-8')).toBe('deep content');
    });

    test('creates destination directory if not exists', () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'nonexistent', 'dest');
      
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'file.txt'), 'content');
      
      copyDirSync(srcDir, destDir);
      
      expect(fs.existsSync(destDir)).toBe(true);
    });

    test('copies to existing destination directory', () => {
      const srcDir = path.join(tempDir, 'src');
      const destDir = path.join(tempDir, 'dest');
      
      fs.mkdirSync(srcDir);
      fs.mkdirSync(destDir);
      fs.writeFileSync(path.join(srcDir, 'new.txt'), 'new content');
      fs.writeFileSync(path.join(destDir, 'existing.txt'), 'existing content');
      
      copyDirSync(srcDir, destDir);
      
      expect(fs.existsSync(path.join(destDir, 'new.txt'))).toBe(true);
      expect(fs.existsSync(path.join(destDir, 'existing.txt'))).toBe(true);
    });
  });

  describe('matchModelsToAgents', () => {
    test('returns null for empty models', () => {
      expect(matchModelsToAgents('provider', {})).toBeNull();
      expect(matchModelsToAgents('provider', null)).toBeNull();
    });

    test('matches opus model correctly', () => {
      const models = { 'claude-opus-4-5-20251101': {} };
      const result = matchModelsToAgents('test', models);
      
      expect(result.primary).toBe('test/claude-opus-4-5-20251101');
      expect(result.reasoning).toBe('test/claude-opus-4-5-20251101');
    });

    test('matches sonnet model correctly', () => {
      const models = { 'claude-sonnet-4': {} };
      const result = matchModelsToAgents('test', models);
      
      expect(result.secondary).toBe('test/claude-sonnet-4');
    });

    test('matches gemini models correctly', () => {
      const models = { 
        'gemini-3-pro-preview': {},
        'gemini-3-flash': {}
      };
      const result = matchModelsToAgents('google', models);
      
      expect(result.multimodal).toBe('google/gemini-3-pro-preview');
      expect(result.fast).toBe('google/gemini-3-flash');
    });

    test('matches gpt models correctly', () => {
      const models = { 
        'gpt-4o': {},
        'gpt-4o-mini': {}
      };
      const result = matchModelsToAgents('openai', models);
      
      expect(result.primary).toBe('openai/gpt-4o');
      expect(result.fast).toBe('openai/gpt-4o-mini');
    });

    test('falls back to first model when no pattern matches', () => {
      const models = { 'unknown-model': {} };
      const result = matchModelsToAgents('provider', models);
      
      expect(result.primary).toBe('provider/unknown-model');
    });
  });

  describe('applyModelMapping', () => {
    test('returns config unchanged when modelMapping is null', () => {
      const config = { agents: {} };
      const result = applyModelMapping(config, null);
      
      expect(result).toBe(config);
    });

    test('applies agent model mapping correctly', () => {
      const config = {};
      const modelMapping = {
        primary: 'provider/opus',
        secondary: 'provider/sonnet',
        fast: 'provider/haiku',
        multimodal: 'provider/gemini',
        reasoning: 'provider/gpt4'
      };
      
      const result = applyModelMapping(config, modelMapping);
      
      expect(result.agents.sisyphus.model).toBe('provider/opus');
      expect(result.agents.oracle.model).toBe('provider/gpt4');
      expect(result.agents.explore.model).toBe('provider/haiku');
    });

    test('applies category model mapping correctly', () => {
      const config = {};
      const modelMapping = {
        primary: 'provider/opus',
        secondary: 'provider/sonnet',
        fast: 'provider/haiku',
        multimodal: 'provider/gemini',
        reasoning: 'provider/gpt4'
      };
      
      const result = applyModelMapping(config, modelMapping);
      
      expect(result.categories['visual-engineering'].model).toBe('provider/gemini');
      expect(result.categories['ultrabrain'].model).toBe('provider/gpt4');
      expect(result.categories['quick'].model).toBe('provider/haiku');
    });

    test('preserves existing category config', () => {
      const config = {
        categories: {
          'visual-engineering': { prompt_append: 'existing prompt' }
        }
      };
      const modelMapping = { multimodal: 'provider/gemini' };
      
      const result = applyModelMapping(config, modelMapping);
      
      expect(result.categories['visual-engineering'].prompt_append).toBe('existing prompt');
      expect(result.categories['visual-engineering'].model).toBe('provider/gemini');
    });

    test('uses fallback when multimodal is null', () => {
      const config = {};
      const modelMapping = {
        primary: 'provider/opus',
        secondary: 'provider/sonnet',
        fast: 'provider/haiku',
        multimodal: null,
        reasoning: null
      };
      
      const result = applyModelMapping(config, modelMapping);
      
      expect(result.agents.librarian.model).toBe('provider/sonnet');
      expect(result.agents['multimodal-looker'].model).toBe('provider/haiku');
      expect(result.categories['visual-engineering'].model).toBe('provider/sonnet');
      expect(result.categories['artistry'].model).toBe('provider/sonnet');
    });

    test('uses primary fallback when reasoning is null', () => {
      const config = {};
      const modelMapping = {
        primary: 'provider/opus',
        secondary: null,
        fast: null,
        multimodal: null,
        reasoning: null
      };
      
      const result = applyModelMapping(config, modelMapping);
      
      expect(result.agents.oracle.model).toBe('provider/opus');
      expect(result.agents.momus.model).toBe('provider/opus');
      expect(result.categories['ultrabrain'].model).toBe('provider/opus');
      expect(result.categories['deep'].model).toBe('provider/opus');
    });

    test('skips agents/categories when no model available', () => {
      const config = {};
      const modelMapping = {
        primary: null,
        secondary: null,
        fast: null,
        multimodal: null,
        reasoning: null
      };
      
      const result = applyModelMapping(config, modelMapping);
      
      expect(result.agents.sisyphus).toBeUndefined();
      expect(result.categories['visual-engineering']).toBeUndefined();
    });
  });

  describe('readCredentials', () => {
    test('returns empty object when file does not exist', () => {
      const result = readCredentials('/nonexistent/path.json');
      expect(result).toEqual({});
    });

    test('reads and parses JSON file correctly', () => {
      const credPath = path.join(tempDir, 'cred.json');
      const data = { api_key: 'test-key' };
      fs.writeFileSync(credPath, JSON.stringify(data));
      
      const result = readCredentials(credPath);
      expect(result).toEqual(data);
    });

    test('returns empty object on invalid JSON', () => {
      const credPath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(credPath, 'not valid json');
      
      const result = readCredentials(credPath);
      expect(result).toEqual({});
    });
  });

  describe('writeCredentials', () => {
    test('writes JSON data to file', () => {
      const credPath = path.join(tempDir, 'output.json');
      const data = { key: 'value', nested: { a: 1 } };
      
      writeCredentials(credPath, data);
      
      const written = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
      expect(written).toEqual(data);
    });

    test('formats JSON with 2-space indentation', () => {
      const credPath = path.join(tempDir, 'formatted.json');
      writeCredentials(credPath, { a: 1 });
      
      const content = fs.readFileSync(credPath, 'utf-8');
      expect(content).toBe('{\n  "a": 1\n}');
    });
  });

  describe('maskSecret', () => {
    test('returns empty string for falsy input', () => {
      expect(maskSecret('')).toBe('');
      expect(maskSecret(null)).toBe('');
      expect(maskSecret(undefined)).toBe('');
    });

    test('returns masked string by default', () => {
      expect(maskSecret('my-secret-key')).toBe('••••••••');
    });

    test('shows specified number of visible characters', () => {
      expect(maskSecret('my-secret-key', 3)).toBe('my-••••••••');
    });
  });
});
