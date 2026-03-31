import pytest
from unittest.mock import patch
import os

from app.core.config import (
    Setting,
    Dev_settings,
    Produccion_Settings,
    SettingsForTest,
    get_settings,
)


def test_default_settings():
    """Tests the default values of the base Setting class."""
    settings = Setting()
    assert settings.PROJECT_NAME == "MVP  FastAPI PostgreSQL"
    assert settings.VERSION == "1.0.0"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.DEBUG is False
    assert settings.POSTGRES_SERVER == "localhost"
    assert settings.POSTGRES_USER == "your user"
    assert settings.POSTGRES_PASSWORD == "password"
    assert settings.POSTGRES_DB == "db"
    assert settings.POSTGRES_PORT == 5432
    assert settings.SECRET_KEY == "your-super-secret-key-change-in-production"
    assert settings.ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30
    assert settings.TESTING is False


def test_database_url_generation():
    """Tests if the database URLs are generated correctly."""
    settings = Setting(
        POSTGRES_USER="testuser",
        POSTGRES_PASSWORD="testpassword",
        POSTGRES_SERVER="testhost",
        POSTGRES_PORT=1234,
        POSTGRES_DB="testdb",
    )
    expected_async_url = "postgresql+asyncpg://testuser:testpassword@testhost:1234/testdb"
    expected_sync_url = "postgresql://testuser:testpassword@testhost:1234/testdb"
    assert settings.DATABASE_URL == expected_async_url
    assert settings.DATABASE_URL_SYNC == expected_sync_url


def test_settings_from_env(monkeypatch):
    """Tests if settings are correctly loaded from environment variables."""
    monkeypatch.setenv("PROJECT_NAME", "My Awesome App")
    monkeypatch.setenv("DEBUG", "true")
    monkeypatch.setenv("POSTGRES_USER", "env_user")
    monkeypatch.setenv("POSTGRES_PASSWORD", "env_pass")

    settings = Setting()

    assert settings.PROJECT_NAME == "My Awesome App"
    assert settings.DEBUG is True
    assert settings.POSTGRES_USER == "env_user"
    assert settings.POSTGRES_PASSWORD == "env_pass"


def test_get_settings_factory():
    """Tests the get_settings factory function for different environments."""
    # Test development environment
    with patch.dict(os.environ, {"ENVIRONMENT": "dev_settings"}):
        settings = get_settings()
        assert isinstance(settings, Dev_settings)
        assert settings.LOG_LEVEL == "DEBUG"
        assert settings.POSTGRES_DB == "TEST_DB"

    # Test production environment
    with patch.dict(os.environ, {"ENVIRONMENT": "Produccion"}):
        settings = get_settings()
        assert isinstance(settings, Produccion_Settings)
        assert settings.LOG_LEVEL == "WARNING"
        assert settings.DEBUG is False

    # Test testing environment
    with patch.dict(os.environ, {"ENVIRONMENT": "test_settings"}):
        settings = get_settings()
        assert isinstance(settings, SettingsForTest)
        assert settings.DEBUG is True
        assert settings.POSTGRES_DB == "TEST_DB"

    # Test default environment
    with patch.dict(os.environ, {}, clear=True):
        settings = get_settings()
        assert isinstance(settings, Dev_settings)


def test_settings_for_test_database_url():
    """Tests that SettingsForTest correctly redefines the DATABASE_URL."""
    test_settings = SettingsForTest(
        POSTGRES_USER="test_user",
        POSTGRES_PASSWORD="test_password",
        POSTGRES_SERVER="test_host",
        POSTGRES_PORT=5433,
        POSTGRES_DB="OVERRIDDEN_TEST_DB",
    )
    expected_url = "postgresql+asyncpg://test_user:test_password@test_host:5433/OVERRIDDEN_TEST_DB"
    assert test_settings.DATABASE_URL == expected_url
