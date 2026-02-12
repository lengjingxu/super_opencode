const fs = require('fs');
const path = require('path');
const os = require('os');

let tempDir;
let configService;

describe('config-service', () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
    
    jest.resetModules();
    jest.doMock('os', () => ({
      ...jest.requireActual('os'),
      homedir: () => tempDir
    }));
    
    configService = require('../lib/config-service');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.resetModules();
  });

  describe('ensureDir', () => {
    test('creates directory if not exists', () => {
      const dir = path.join(tempDir, 'new', 'nested', 'dir');
      configService.ensureDir(dir);
      expect(fs.existsSync(dir)).toBe(true);
    });

    test('does nothing if directory exists', () => {
      const dir = path.join(tempDir, 'existing');
      fs.mkdirSync(dir);
      configService.ensureDir(dir);
      expect(fs.existsSync(dir)).toBe(true);
    });
  });

  describe('readJsonFile / writeJsonFile', () => {
    test('writes and reads JSON file correctly', () => {
      const filePath = path.join(tempDir, 'test.json');
      const data = { key: 'value', nested: { a: 1 } };
      
      configService.writeJsonFile(filePath, data);
      const result = configService.readJsonFile(filePath);
      
      expect(result).toEqual(data);
    });

    test('returns null for non-existent file', () => {
      const result = configService.readJsonFile('/nonexistent/file.json');
      expect(result).toBeNull();
    });

    test('returns null for invalid JSON', () => {
      const filePath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(filePath, 'not valid json');
      
      const result = configService.readJsonFile(filePath);
      expect(result).toBeNull();
    });

    test('creates parent directories when writing', () => {
      const filePath = path.join(tempDir, 'deep', 'nested', 'file.json');
      configService.writeJsonFile(filePath, { test: true });
      
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('credentials management', () => {
    test('getCredentials returns empty object when file not exists', () => {
      const result = configService.getCredentials();
      expect(result).toEqual({});
    });

    test('saveCredentials creates credentials file', () => {
      const data = { api_key: 'test-key' };
      configService.saveCredentials(data);
      
      const result = configService.getCredentials();
      expect(result).toEqual(data);
    });

    test('updateCredentials adds new key to existing credentials', () => {
      configService.saveCredentials({ existing: 'value' });
      
      const result = configService.updateCredentials('new_key', { data: 123 });
      
      expect(result.existing).toBe('value');
      expect(result.new_key).toEqual({ data: 123 });
    });
  });

  describe('FC config', () => {
    test('getFcConfig returns empty config when not set', () => {
      const result = configService.getFcConfig();
      expect(result).toEqual({ accounts: [], default_account: '' });
    });

    test('saveFcConfig saves FC configuration', () => {
      const config = {
        accounts: [
          { name: 'test', access_key_id: 'AK123', access_key_secret: 'SK456', region: 'cn-shanghai' }
        ],
        default_account: 'test'
      };
      
      configService.saveFcConfig(config);
      const result = configService.getFcConfig();
      
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].name).toBe('test');
      expect(result.default_account).toBe('test');
    });

    test('saveFcConfig preserves masked secrets', () => {
      configService.saveFcConfig({
        accounts: [{ name: 'acc1', access_key_id: 'AK', access_key_secret: 'real-secret' }],
        default_account: 'acc1'
      });
      
      configService.saveFcConfig({
        accounts: [{ name: 'acc1', access_key_id: 'AK-NEW', access_key_secret: '••••••••' }],
        default_account: 'acc1'
      });
      
      const cred = configService.getCredentials();
      expect(cred.deploy.aliyun_fc.accounts[0].access_key_secret).toBe('real-secret');
      expect(cred.deploy.aliyun_fc.accounts[0].access_key_id).toBe('AK-NEW');
    });
  });

  describe('SQL config', () => {
    test('getSqlConfig returns empty connections when not set', () => {
      const result = configService.getSqlConfig();
      expect(result).toEqual({ connections: {} });
    });

    test('saveSqlConfig saves database connections', () => {
      const config = {
        connections: {
          default: { type: 'mysql', host: 'localhost', port: 3306, user: 'root', password: 'pass', database: 'test' }
        }
      };
      
      configService.saveSqlConfig(config);
      const result = configService.getSqlConfig();
      
      expect(result.connections.default.host).toBe('localhost');
      expect(result.connections.default.type).toBe('mysql');
    });

    test('saveSqlConfig preserves masked passwords', () => {
      configService.saveSqlConfig({
        connections: { db1: { host: 'h1', password: 'real-password' } }
      });
      
      configService.saveSqlConfig({
        connections: { db1: { host: 'h2', password: '••••••••' } }
      });
      
      const result = configService.getSqlConfig();
      expect(result.connections.db1.password).toBe('real-password');
      expect(result.connections.db1.host).toBe('h2');
    });
  });

  describe('image generator config', () => {
    test('getImageGeneratorConfig returns disabled when not set', () => {
      const result = configService.getImageGeneratorConfig();
      expect(result).toEqual({ enabled: false });
    });

    test('saveImageGeneratorConfig saves configuration', () => {
      configService.saveImageGeneratorConfig('http://sd.local:7860', 'api-key-123');
      
      const result = configService.getImageGeneratorConfig();
      expect(result.enabled).toBe(true);
      expect(result.base_url).toBe('http://sd.local:7860');
      expect(result.api_key).toBe('api-key-123');
    });

    test('saveImageGeneratorConfig uses defaults for empty values', () => {
      configService.saveImageGeneratorConfig('', '');
      
      const result = configService.getImageGeneratorConfig();
      expect(result.base_url).toBe('http://localhost:7860');
      expect(result.api_key).toBe('');
    });
  });

  describe('skill management', () => {
    test('checkSkillInstalled returns false when skill not exists', () => {
      const result = configService.checkSkillInstalled('nonexistent-skill');
      expect(result).toBe(false);
    });

    test('checkSkillInstalled returns true when SKILL.md exists', () => {
      const skillDir = path.join(tempDir, '.config', 'opencode', 'skills', 'test-skill');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# Test Skill');
      
      const result = configService.checkSkillInstalled('test-skill');
      expect(result).toBe(true);
    });
  });

  describe('backup management', () => {
    test('createBackup creates backup file', () => {
      const data = { test: 'data' };
      const result = configService.createBackup('opencode', data);
      
      expect(result.backupName).toMatch(/^opencode-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);
      expect(fs.existsSync(result.backupPath)).toBe(true);
    });

    test('listBackups returns empty array when no backups', () => {
      const result = configService.listBackups('opencode');
      expect(result).toEqual([]);
    });

    test('listBackups returns sorted backup list', async () => {
      configService.createBackup('opencode', { v: 1 });
      await new Promise(r => setTimeout(r, 10));
      configService.createBackup('opencode', { v: 2 });
      configService.createBackup('credentials', { v: 3 });
      
      const result = configService.listBackups('opencode');
      
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].name).toMatch(/^opencode-/);
    });

    test('listBackups sorts by creation time descending', async () => {
      const backupDir = path.join(tempDir, '.config', 'opencode', 'backups');
      fs.mkdirSync(backupDir, { recursive: true });
      
      const file1 = 'opencode-2024-01-01T10-00-00.json';
      const file2 = 'opencode-2024-01-02T10-00-00.json';
      const file3 = 'opencode-2024-01-03T10-00-00.json';
      
      fs.writeFileSync(path.join(backupDir, file1), '{"v":1}');
      fs.writeFileSync(path.join(backupDir, file2), '{"v":2}');
      fs.writeFileSync(path.join(backupDir, file3), '{"v":3}');
      
      const now = Date.now();
      fs.utimesSync(path.join(backupDir, file1), new Date(now - 2000), new Date(now - 2000));
      fs.utimesSync(path.join(backupDir, file2), new Date(now - 1000), new Date(now - 1000));
      fs.utimesSync(path.join(backupDir, file3), new Date(now), new Date(now));
      
      const result = configService.listBackups('opencode');
      
      expect(result.length).toBe(3);
      expect(result[0].name).toBe(file3);
      expect(result[1].name).toBe(file2);
      expect(result[2].name).toBe(file1);
    });

    test('restoreBackup restores opencode config', () => {
      const backupData = { provider: { test: {} } };
      const { backupName } = configService.createBackup('opencode', backupData);
      
      const result = configService.restoreBackup(backupName);
      
      expect(result.configType).toBe('opencode');
      const restored = configService.readJsonFile(result.targetPath);
      expect(restored).toEqual(backupData);
    });

    test('restoreBackup restores oh-my-opencode config', () => {
      const backupData = { agents: {} };
      const { backupName } = configService.createBackup('oh-my-opencode', backupData);
      
      const result = configService.restoreBackup(backupName);
      
      expect(result.configType).toBe('oh');
    });

    test('restoreBackup throws for non-existent backup', () => {
      expect(() => {
        configService.restoreBackup('nonexistent-backup.json');
      }).toThrow('Backup not found');
    });

    test('restoreBackup throws for unknown config type', () => {
      const backupDir = path.join(tempDir, '.config', 'opencode', 'backups');
      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(path.join(backupDir, 'unknown-2024.json'), '{}');
      
      expect(() => {
        configService.restoreBackup('unknown-2024.json');
      }).toThrow('Unknown config type');
    });

    test('restoreBackup restores credentials config', () => {
      const backupData = { api_key: 'test-key', deploy: { enabled: true } };
      const { backupName } = configService.createBackup('credentials', backupData);
      
      const result = configService.restoreBackup(backupName);
      
      expect(result.configType).toBe('credentials');
      expect(result.targetPath).toContain('credentials.json');
      const restored = configService.readJsonFile(result.targetPath);
      expect(restored).toEqual(backupData);
    });

    test('restoreBackup throws for invalid backup file content', () => {
      const backupDir = path.join(tempDir, '.config', 'opencode', 'backups');
      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(path.join(backupDir, 'opencode-2024-01-01T00-00-00.json'), 'invalid json content');
      
      expect(() => {
        configService.restoreBackup('opencode-2024-01-01T00-00-00.json');
      }).toThrow('Invalid backup file');
    });
  });
});
