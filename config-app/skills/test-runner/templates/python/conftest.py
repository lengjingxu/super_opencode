import pytest
import tempfile
import shutil
from pathlib import Path


@pytest.fixture(scope="session")
def temp_dir():
    """Session-scoped temporary directory."""
    dir_path = tempfile.mkdtemp(prefix="{{PROJECT_NAME}}_test_")
    yield Path(dir_path)
    shutil.rmtree(dir_path, ignore_errors=True)


@pytest.fixture(scope="function")
def temp_file(temp_dir):
    """Function-scoped temporary file."""
    file_path = temp_dir / "test_file.tmp"
    yield file_path
    if file_path.exists():
        file_path.unlink()


@pytest.fixture
def sample_data():
    """Sample test data."""
    return {{SAMPLE_DATA}}


@pytest.fixture
def mock_config():
    """Mock configuration."""
    return {
        "debug": True,
        "env": "test",
    }


@pytest.fixture
def db_connection():
    """Database connection fixture for integration tests."""
    # {{DB_SETUP}}
    connection = None
    yield connection
    # {{DB_TEARDOWN}}


@pytest.fixture
def api_client():
    """API client fixture for integration tests."""
    # {{API_CLIENT_SETUP}}
    client = None
    yield client
    # {{API_CLIENT_TEARDOWN}}
