import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    DATABASE_URL = os.getenv("DATABASE_URL")

settings = Settings()
