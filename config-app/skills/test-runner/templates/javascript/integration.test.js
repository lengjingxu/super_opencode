const fs = require('fs');
const path = require('path');
const os = require('os');

describe('{{SERVICE_NAME}} Integration', () => {
  let tempDir;
  let service;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), '{{PROJECT_NAME}}-test-'));
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    service = require('{{SERVICE_PATH}}');
  });

  describe('Data Operations', () => {
    test('should create data successfully', async () => {
      const data = {{TEST_DATA}};
      
      const result = await service.create(data);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    test('should read data successfully', async () => {
      const id = {{TEST_ID}};
      
      const result = await service.read(id);
      
      expect(result).toBeDefined();
    });

    test('should update data successfully', async () => {
      const id = {{TEST_ID}};
      const updates = {{TEST_UPDATES}};
      
      const result = await service.update(id, updates);
      
      expect(result).toBeDefined();
    });

    test('should delete data successfully', async () => {
      const id = {{TEST_ID}};
      
      await expect(service.delete(id)).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle not found error', async () => {
      const invalidId = 'nonexistent-id';
      
      await expect(service.read(invalidId)).rejects.toThrow();
    });

    test('should handle validation error', async () => {
      const invalidData = {{INVALID_DATA}};
      
      await expect(service.create(invalidData)).rejects.toThrow();
    });
  });

  describe('File Operations', () => {
    test('should write file to temp directory', () => {
      const filePath = path.join(tempDir, 'test.json');
      const data = { test: true };
      
      fs.writeFileSync(filePath, JSON.stringify(data));
      
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('should read file from temp directory', () => {
      const filePath = path.join(tempDir, 'test.json');
      
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      expect(content.test).toBe(true);
    });
  });
});
