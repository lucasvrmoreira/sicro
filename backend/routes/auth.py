from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import os

from backend.core.config import settings
from backend.database.connection import get_db  # Usando o get_db centralizado
from backend.models.usuario import Usuario
from backend.core.security import verificar_senha

router = APIRouter(tags=["Autenticação"])

# Definimos os tempos de expiração baseados no settings ou valores padrão
REFRESH_TOKEN_EXPIRE_HOURS = 24

def criar_token(dados: dict, expires_delta: timedelta, token_type: str):
    to_encode = dados.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "token_type": token_type})
    
    # Aqui usamos o settings centralizado
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, expire


# ---------------------------- LOGIN ---------------------------- #
@router.post("/token")
def login(response: Response, request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.username == form_data.username).first()

    if not user or not verificar_senha(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")

    # Access Token (curta duração)
    access_token, exp_access = criar_token(
        {"sub": user.username, "role": user.role},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access"
    )

    # Refresh Token (longa duração)
    refresh_token, exp_refresh = criar_token(
        {
            "sub": user.username, 
            "role": user.role,
            "ip": request.client.host,
            "agent": request.headers.get("user-agent", "unknown")
        },
        timedelta(hours=REFRESH_TOKEN_EXPIRE_HOURS),
        "refresh"
    )

    # Salva o refresh token num cookie seguro (HttpOnly)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_HOURS * 3600,
        expires=REFRESH_TOKEN_EXPIRE_HOURS * 3600,
        samesite="lax",
        secure=False  # Mudar para True se usar HTTPS em produção
    )

    return {
        "access_token": access_token,
        "expires_in": int(exp_access.timestamp()),
        "token_type": "bearer",
        "role": user.role
    }


# --------------------------- REFRESH --------------------------- #
@router.post("/refresh")
def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token ausente")

    try:
        # Correção aqui: usando settings.SECRET_KEY e settings.ALGORITHM
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        if payload.get("token_type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")

        # Valida IP e navegador para segurança extra
        if payload.get("ip") != request.client.host or payload.get("agent") != request.headers.get("user-agent", "unknown"):
            raise HTTPException(status_code=403, detail="Dispositivo não reconhecido")

        username = payload.get("sub")
        role = payload.get("role")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")

    # Gera novo access token
    access_token, exp_access = criar_token(
        {"sub": username, "role": role},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
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
    response.delete_cookie(key="refresh_token", path="/")
    return {"detail": "Logout realizado com sucesso"}