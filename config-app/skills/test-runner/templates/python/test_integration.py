import pytest
import json
from pathlib import Path


@pytest.mark.integration
class Test{{SERVICE_NAME}}Integration:

    def test_create_operation(self, temp_dir, sample_data):
        from {{SERVICE_PATH}} import {{SERVICE_NAME}}
        
        service = {{SERVICE_NAME}}()
        result = service.create(sample_data)
        
        assert result is not None
        assert "id" in result or hasattr(result, "id")

    def test_read_operation(self, temp_dir):
        from {{SERVICE_PATH}} import {{SERVICE_NAME}}
        
        service = {{SERVICE_NAME}}()
        test_id = "{{TEST_ID}}"
        
        result = service.read(test_id)
        
        assert result is not None

    def test_update_operation(self, temp_dir, sample_data):
        from {{SERVICE_PATH}} import {{SERVICE_NAME}}
        
        service = {{SERVICE_NAME}}()
        test_id = "{{TEST_ID}}"
        updates = {"{{UPDATE_FIELD}}": "{{UPDATE_VALUE}}"}
        
        result = service.update(test_id, updates)
        
        assert result is not None

    def test_delete_operation(self, temp_dir):
        from {{SERVICE_PATH}} import {{SERVICE_NAME}}
        
        service = {{SERVICE_NAME}}()
        test_id = "{{TEST_ID}}"
        
        service.delete(test_id)

    def test_not_found_error(self):
        from {{SERVICE_PATH}} import {{SERVICE_NAME}}
        
        service = {{SERVICE_NAME}}()
        
        with pytest.raises({{NOT_FOUND_EXCEPTION}}):
            service.read("nonexistent-id")

    def test_validation_error(self, sample_data):
        from {{SERVICE_PATH}} import {{SERVICE_NAME}}
        
        service = {{SERVICE_NAME}}()
        invalid_data = {"invalid": "data"}
        
        with pytest.raises({{VALIDATION_EXCEPTION}}):
            service.create(invalid_data)


@pytest.mark.integration
class TestFileOperations:

    def test_write_json_file(self, temp_dir):
        file_path = temp_dir / "test.json"
        data = {"key": "value", "number": 42}
        
        file_path.write_text(json.dumps(data, indent=2))
        
        assert file_path.exists()

    def test_read_json_file(self, temp_dir):
        file_path = temp_dir / "test.json"
        expected = {"key": "value", "number": 42}
        file_path.write_text(json.dumps(expected))
        
        result = json.loads(file_path.read_text())
        
        assert result == expected

    def test_file_not_found(self, temp_dir):
        file_path = temp_dir / "nonexistent.json"
        
        with pytest.raises(FileNotFoundError):
            file_path.read_text()
