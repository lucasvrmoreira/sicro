from pydantic import BaseModel

# O que o usuário manda para criar conta
class UsuarioCreate(BaseModel):
    username: str
    senha: str
    role: str = "user"

# O que a API devolve (sem a senha!)
class UsuarioResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True # Permite ler do objeto SQLAlchemy