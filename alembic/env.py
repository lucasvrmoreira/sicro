import sys
import os
from logging.config import fileConfig
from sqlalchemy import text
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context


current_path = os.path.dirname(os.path.abspath(__file__))


root_path = os.path.abspath(os.path.join(current_path, ".."))


sys.path.insert(0, root_path)


# Importa suas configurações usando "backend."
from backend.core.config import settings
from backend.database.connection import Base


from backend.models.usuario import Usuario
from backend.models.roupa import Roupa
from backend.models.movimentacao import Movimentacao


config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Configura o log
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Aponta o Metadata para o Base do seu projeto
target_metadata = Base.metadata

# No topo do arquivo, certifique-se de ter:
from sqlalchemy import text

# ... (mantenha seu código de path e imports igual)

def include_object(object, name, type_, reflected, compare_to):
    """
    Diz ao Alembic para ignorar qualquer objeto que não pertença 
    ao schema 'sicro'.
    """
    if type_ == "table":
        # Se a tabela não for do schema sicro, ela é ignorada (não apaga, não cria)
        return object.schema == "sicro"
    return True

def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,  # Permite gerenciar múltiplos schemas 
        version_table_schema='sicro' # Salva o controle do Alembic dentro do sicro 
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Define o sicro como schema principal para esta sessão
        connection.execute(text("SET search_path TO sicro, public"))
        connection.commit()

        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            include_schemas=True,
            version_table_schema='sicro' # Mantém tudo organizado no mesmo schema 
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()