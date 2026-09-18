"""
Configuration settings for Satori Backend
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    app_name: str = Field(default="Satori Backend", env="APP_NAME")
    app_version: str = Field(default="0.1.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    
    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        env="CORS_ORIGINS"
    )
    
    # Future: KataGo configuration
    katago_enabled: bool = Field(default=False, env="KATAGO_ENABLED")
    katago_binary_path: str = Field(default="", env="KATAGO_BINARY_PATH")
    katago_model_path: str = Field(default="", env="KATAGO_MODEL_PATH")
    katago_config_path: str = Field(default="", env="KATAGO_CONFIG_PATH")
    
    # Future: Gemini configuration
    gemini_enabled: bool = Field(default=False, env="GEMINI_ENABLED")
    gemini_api_key: str = Field(default="", env="GEMINI_API_KEY")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
