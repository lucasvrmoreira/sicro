from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend import models, database
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from jose import JWTError, jwt # type: ignore
from fastapi import Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext # type: ignore
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# cria a aplicação FastAPI
app = FastAPI()
models.Base.metadata.create_all(bind=database.engine)

# habilita CORS (permitir frontend acessar)

origins = [
    "http://localhost:5173",              # dev local
    "https://sicro-bqcl.vercel.app"       # produção no Vercel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Dependência do FastAPI para pegar token no header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Contexto para criptografar/verificar senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")





# Funções auxiliares
def criar_token(data: dict, expires_delta: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verificar_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


# conexão com DB
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---
class Movimentacao(BaseModel):
    tipo: str
    tamanho: Optional[str] = None
    quantidade: int
    acao: str  # "entrada" ou "saida"

class Movimentacoes(BaseModel):
    itens: List[Movimentacao]

# --- Endpoints ---
@app.get("/saldo")
def get_saldo(db: Session = Depends(get_db), token: dict = Depends(verificar_token)):
    roupas = db.query(models.Roupa).all()
    return [{"tipo": r.tipo, "tamanho": r.tamanho, "saldo": r.saldo} for r in roupas]


@app.post("/movimentar")
def movimentar(
    movs: Movimentacoes,
    db: Session = Depends(get_db),
    token: dict = Depends(verificar_token)
):
    # só admin pode movimentar
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado: apenas administradores podem movimentar estoque")

    mensagens = []

    for mov in movs.itens:
        roupa = db.query(models.Roupa).filter_by(
            tipo=mov.tipo,
            tamanho=mov.tamanho
        ).first()

        if mov.acao == "entrada":
            if roupa:
                roupa.saldo += mov.quantidade
            else:
                roupa = models.Roupa(
                    tipo=mov.tipo,
                    tamanho=mov.tamanho,
                    saldo=mov.quantidade
                )
                db.add(roupa)
            mensagens.append(f"Entrada de {mov.quantidade} {mov.tipo} {mov.tamanho or ''}".strip())

        elif mov.acao == "saida":
            if not roupa:
                mensagens.append(f"Erro: {mov.tipo} {mov.tamanho or ''} não encontrado no estoque")
            elif roupa.saldo < mov.quantidade:
                mensagens.append(f"Erro: saldo insuficiente para {mov.tipo} {mov.tamanho or ''}")
            else:
                roupa.saldo -= mov.quantidade
                mensagens.append(f"Saída de {mov.quantidade} {mov.tipo} {mov.tamanho or ''}".strip())

    db.commit()
    return {"status": "ok", "mensagem": mensagens}


    
    
    
@app.post("/token")
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.Usuario).filter(models.Usuario.username == username).first()

    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Usuário ou senha incorretos")

    token = criar_token({"sub": username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}



    
    
