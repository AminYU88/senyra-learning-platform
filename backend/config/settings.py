import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

if load_dotenv:
    load_dotenv(ENV_PATH)
elif ENV_PATH.exists():
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def comma_list(value: str | None, default: list[str] | None = None) -> list[str]:
    if not value:
        return default or []

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./senyra.db"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
DEFAULT_DEV_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
CORS_ORIGINS = comma_list(
    os.getenv("CORS_ORIGINS"),
    [] if ENVIRONMENT.lower() == "production" else DEFAULT_DEV_CORS_ORIGINS
)


if not SECRET_KEY:
    if ENVIRONMENT.lower() == "production":
        raise RuntimeError("JWT_SECRET_KEY must be set in production.")

    SECRET_KEY = "development-only-change-me"
