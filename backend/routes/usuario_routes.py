# backend/routes/usuario_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import SessionLocal
from backend.models.usuario import Usuario
from backend.core.security import gerar_hash_senha, verificar_token

router = APIRouter(tags=["Usuários"])

# Função auxiliar para gerenciar sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------- LISTAR USUÁRIOS --------------------- #
@router.get("/usuarios")
def listar_usuarios(db: Session = Depends(get_db), token: dict = Depends(verificar_token)):
    usuarios = db.query(Usuario).all()
    return [
        {"id": u.id, "username": u.username, "role": u.role}
        for u in usuarios
    ]


# --------------------- CRIAR NOVO USUÁRIO --------------------- #
@router.post("/usuarios")
def criar_usuario(dados: dict, db: Session = Depends(get_db), token: dict = Depends(verificar_token)):
    # apenas admin pode criar usuários
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar usuários")

    username = dados.get("username")
    senha = dados.get("senha")
    role = dados.get("role", "user")

    if not username or not senha:
        raise HTTPException(status_code=400, detail="Usuário e senha são obrigatórios")

    if db.query(Usuario).filter(Usuario.username == username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")

    novo_usuario = Usuario(
        username=username,
        hashed_password=gerar_hash_senha(senha),
        role=role
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return {"id": novo_usuario.id, "username": novo_usuario.username, "role": novo_usuario.role}


# --------------------- DELETAR USUÁRIO --------------------- #
@router.delete("/usuarios/{usuario_id}")
def deletar_usuario(usuario_id: int, db: Session = Depends(get_db), token: dict = Depends(verificar_token)):
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar usuários")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    db.delete(usuario)
    db.commit()
    return {"detail": f"Usuário '{usuario.username}' deletado com sucesso"}
