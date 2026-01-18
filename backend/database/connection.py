from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.core.config import settings 


DATABASE_URL = settings.DATABASE_URL 

# Cria engine de conexão
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True, # Verifica se a conexão caiu antes de usar
    echo=False # Mude para False em produção para não poluir o terminal
)

# Cria sessão de conexão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os models
Base = declarative_base()

# Função para injetar o banco de dados nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()