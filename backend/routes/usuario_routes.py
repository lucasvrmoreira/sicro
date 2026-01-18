from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.models.usuario import Usuario
from backend.core.security import gerar_hash_senha, verificar_token
from backend.database.connection import get_db
from backend.schemas.usuario import UsuarioCreate, UsuarioResponse

router = APIRouter(tags=["Usuários"])

# --------------------- LISTAR USUÁRIOS --------------------- #
@router.get("/usuarios")
def listar_usuarios(db: Session = Depends(get_db), token: dict = Depends(verificar_token)):
    usuarios = db.query(Usuario).all()
    return [
        {"id": u.id, "username": u.username, "role": u.role}
        for u in usuarios
    ]


# --------------------- CRIAR NOVO USUÁRIO --------------------- #
@router.post("/usuarios", response_model=UsuarioResponse)
def criar_usuario(
    usuario: UsuarioCreate, # Aqui entra o Pydantic!
    db: Session = Depends(get_db), 
    token: dict = Depends(verificar_token)
):
    # Valida permissão
    #if token.get("role") != "admin":
    #    raise HTTPException(status_code=403, detail="Apenas administradores podem criar usuários")

    # Verifica duplicidade
    if db.query(Usuario).filter(Usuario.username == usuario.username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")

    # Cria usuário (Note que usamos usuario.senha, não dados.get)
    novo_usuario = Usuario(
        username=usuario.username,
        hashed_password=gerar_hash_senha(usuario.senha),
        role=usuario.role
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario


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
