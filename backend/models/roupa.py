from sqlalchemy import Column, Integer, String
from backend.database.connection import Base

class Roupa(Base):
    __tablename__ = "roupas"
    __table_args__ = {"schema": "sicro"}

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)          # ex: Macacão, Botas...
    tamanho = Column(String, nullable=True)        # ex: P, M, G, etc.
    saldo = Column(Integer, default=0)             # quantidade atual
