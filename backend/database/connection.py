from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from backend.core.config import settings 

# 1. Pega a URL original
database_url = settings.DATABASE_URL

# 2. Garante que o driver seja o assíncrono (asyncpg)
if "postgresql://" in database_url:
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")

# 3. TRUQUE DO NEON: Remove o '?sslmode=' da URL se existir
# O asyncpg não aceita isso na string, ele trava se deixar.
if "?sslmode=" in database_url:
    database_url = database_url.split("?")[0]

# 4. Criação do Engine Assíncrono com a configuração de SSL correta
engine = create_async_engine(
    database_url,
    echo=False,           
    pool_pre_ping=True,
    # Aqui dizemos ao asyncpg para usar SSL (obrigatório no Neon)
    connect_args={"ssl": "require"} 
)

# 5. Configuração da Sessão
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

# 6. Função de Injeção de Dependência
async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()