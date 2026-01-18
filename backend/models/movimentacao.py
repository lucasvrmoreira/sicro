from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, Integer, String, DateTime
from backend.database.connection import Base

# Se quiser manter fixo o fuso de Brasília aqui:
def get_br_time():
    return datetime.now(timezone(timedelta(hours=-3)))

class Movimentacao(Base):
    __tablename__ = "movimentacoes"
    __table_args__ = {"schema": "sicro"}

    id = Column(Integer, primary_key=True, index=True)
    ordem_id = Column(String, nullable=False) # Agrupador de itens
    usuario = Column(String, nullable=False) # Quem fez a ação
    tipo = Column(String, nullable=False) # Macacão, Bota, etc
    tamanho = Column(String, nullable=True)
    quantidade = Column(Integer, nullable=False)
    acao = Column(String, nullable=False) # entrada / saída
    data = Column(DateTime(timezone=True), default=get_br_time)