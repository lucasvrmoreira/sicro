from sqlalchemy import Column, Integer, String
from backend.database import Base


class Roupa(Base):
    __tablename__ = "roupas"
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, index=True)        # macacao, bota, pano, oculos
    tamanho = Column(String, nullable=True)  # PP, P, M, G, GG, G3, G4 (ou None)
    saldo = Column(Integer, default=0)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # "admin" ou "user"
