from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone, timedelta
from backend.database.connection import Base

# 🔹 Define o fuso horário de Brasília (UTC−3)
BR_TZ = timezone(timedelta(hours=-3))

class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id = Column(Integer, primary_key=True, index=True)
    ordem_id = Column(String, nullable=False)
    usuario = Column(String, nullable=False)
    tipo = Column(String, nullable=False)
    tamanho = Column(String, nullable=True)
    quantidade = Column(Integer, nullable=False)
    acao = Column(String, nullable=False)
    data = Column(
        DateTime(timezone=True),  # 🔹 informa ao PostgreSQL que este campo usa timezone
        default=lambda: datetime.now(BR_TZ)  # 🔹 salva já no fuso de Brasília
    )
