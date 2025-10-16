from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.database.connection import SessionLocal
from backend.models.usuario import Usuario
from backend.core.security import verificar_senha
from dotenv import load_dotenv
import os
from fastapi import Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm

load_dotenv()

router = APIRouter(tags=["Autenticação"])

SECRET_KEY = os.getenv("SECRET_KEY", "chave_teste_segura")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_HOURS = 24  # expira em 24h

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def criar_token(dados: dict, expires_delta: timedelta, token_type: str):
    to_encode = dados.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "token_type": token_type})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire


# ---------------------------- LOGIN ---------------------------- #
@router.post("/token")
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    usuario = db.query(Usuario).filter(Usuario.username == form_data.username).first()

    # 🔹 Debug prints
    print("=== DEBUG LOGIN ===")
    print("Username informado:", form_data.username)
    print("Senha informada:", form_data.password)
    print("Usuário encontrado:", usuario.username if usuario else None)
    print("Hash salvo:", usuario.hashed_password if usuario else "N/A")
    print("====================")

    if not usuario or not verificar_senha(form_data.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    # Gera tokens
    access_token, exp_access = criar_token(
        {"sub": usuario.username, "role": usuario.role},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "access"
    )
    refresh_token, exp_refresh = criar_token(
        {
            "sub": usuario.username,
            "role": usuario.role,
            "ip": request.client.host,
            "agent": request.headers.get("user-agent", "unknown"),
        },
        timedelta(hours=REFRESH_TOKEN_EXPIRE_HOURS),
        "refresh"
    )

    # Define cookie HttpOnly seguro
    response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    httponly=True,
    secure=(request.url.scheme == "https"),  # https em prod, http no dev
    samesite="lax",
    max_age=REFRESH_TOKEN_EXPIRE_HOURS * 3600,
)


    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": int(exp_access.timestamp()),
        "role": usuario.role,
    }



# --------------------------- REFRESH --------------------------- #
@router.post("/refresh")
def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token ausente")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("token_type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")

        # Valida IP e navegador
        if payload.get("ip") != request.client.host or payload.get("agent") != request.headers.get("user-agent", "unknown"):
            raise HTTPException(status_code=403, detail="Dispositivo não reconhecido")

        username = payload.get("sub")
        role = payload.get("role")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

    # Gera novo access token
    access_token, exp_access = criar_token(
        {"sub": username, "role": role},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "access"
    )

    return {
        "access_token": access_token,
        "expires_in": int(exp_access.timestamp()),
        "token_type": "bearer"
    }


# ---------------------------- LOGOUT ---------------------------- #
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"detail": "Logout realizado com sucesso"}
