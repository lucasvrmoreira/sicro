from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Carrega variáveis do .env (na raiz do projeto)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("DEBUG DATABASE_URL:", DATABASE_URL)  # teste

# Cria engine de conexão
engine = create_engine(DATABASE_URL)

# Cria sessão de conexão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os models
Base = declarative_base()
