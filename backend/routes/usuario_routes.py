from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.usuario import Usuario
from backend.core.security import gerar_hash_senha, verificar_token
from backend.database.connection import get_db
from backend.schemas.usuario import UsuarioCreate, UsuarioResponse

router = APIRouter(tags=["Usuários"])

# --------------------- LISTAR (Já estava async, mantive) --------------------- #
@router.get("/usuarios")
async def listar_usuarios(db: AsyncSession = Depends(get_db), token: dict = Depends(verificar_token)):
    result = await db.execute(select(Usuario))
    usuarios = result.scalars().all()
    return [{"id": u.id, "username": u.username, "role": u.role} for u in usuarios]


# --------------------- CRIAR (Convertido para Async) --------------------- #
@router.post("/usuarios", response_model=UsuarioResponse)
async def criar_usuario(
    usuario: UsuarioCreate,
    db: AsyncSession = Depends(get_db), 
    token: dict = Depends(verificar_token)
):
    # Verifica duplicidade com select() e await
    query = select(Usuario).where(Usuario.username == usuario.username)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Usuário já existe")

    novo_usuario = Usuario(
        username=usuario.username,
        hashed_password=gerar_hash_senha(usuario.senha),
        role=usuario.role
    )
    db.add(novo_usuario) # db.add não precisa de await
    await db.commit()    # Mas o commit precisa!
    await db.refresh(novo_usuario) # E o refresh também!

    return novo_usuario


# --------------------- DELETAR (Convertido para Async) --------------------- #
@router.delete("/usuarios/{usuario_id}")
async def deletar_usuario(usuario_id: int, db: AsyncSession = Depends(get_db), token: dict = Depends(verificar_token)):
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar usuários")

    query = select(Usuario).where(Usuario.id == usuario_id)
    result = await db.execute(query)
    usuario = result.scalar_one_or_none()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    await db.delete(usuario) # db.delete precisa de await no SQLAlchemy moderno ou commit posterior
    await db.commit()
    return {"detail": f"Usuário '{usuario.username}' deletado com sucesso"}