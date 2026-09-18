"""
Configuration settings for Satori Backend
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Application
    app_name: str = Field(default="Satori Backend", alias="APP_NAME")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        alias="CORS_ORIGINS"
    )
    
    # Future: KataGo configuration
    katago_enabled: bool = Field(default=False, alias="KATAGO_ENABLED")
    katago_binary_path: str = Field(default="", alias="KATAGO_BINARY_PATH")
    katago_model_path: str = Field(default="", alias="KATAGO_MODEL_PATH")
    katago_config_path: str = Field(default="", alias="KATAGO_CONFIG_PATH")
    
    # Future: Gemini configuration
    gemini_enabled: bool = Field(default=False, alias="GEMINI_ENABLED")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
