from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App metadata
    app_name: str = "Sentinel AI"
    app_version: str = "0.1.0"
    app_description: str = "Enterprise AI risk-intelligence simulation platform"
    debug: bool = Field(default=False)

    # CORS
    cors_allow_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",  # Vite dev server
            "http://localhost:4173",
        ]
    )

    # Docs
    docs_url: str | None = "/docs"
    redoc_url: str | None = "/redoc"

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./sentinel.db",
        description=(
            "SQLAlchemy database URL. "
            "sqlite:/// for development, "
            "postgresql+psycopg://... for production."
        ),
    )
    # Authentication
    SECRET_KEY: str = Field(
        default="CHANGE_THIS_IN_PRODUCTION",
        description="Secret key used to sign JWT tokens.",
    )

    ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm.",
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        description="JWT access token lifetime in minutes.",
    )
        
    GOOGLE_AI_STUDIO_API_KEY: str = Field(
        default="",
        description="Google AI Studio API key.",
    )

    GOOGLE_AI_STUDIO_MODEL: str = Field(
        default="gemma-4-31b-it",
        description="Gemma model served via Google AI Studio's free tier.",
    )

    AI_BASE_URL: str = Field(default="http://localhost:8001/v1")
    AI_MODEL: str = Field(default="google/gemma-2-2b-it")
    AI_API_KEY: str = Field(default="not-needed")

settings = Settings()
