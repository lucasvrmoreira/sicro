from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.database.connection import get_db
from backend.models.roupa import Roupa
from backend.models.movimentacao import Movimentacao
from backend.core.security import verificar_token
from datetime import datetime
import uuid

from backend.schemas.estoque import MovimentacaoRequest

router = APIRouter(tags=["Estoque"])

# ------------------------------- SALDO -------------------------------- #
@router.get("/saldo")
async def get_saldo(db: AsyncSession = Depends(get_db), token: dict = Depends(verificar_token)):
    # Busca assíncrona
    result = await db.execute(select(Roupa))
    roupas = result.scalars().all()

    ordem_tipos = ["Macacão", "Botas", "Panos", "Óculos"]
    ordem_tamanhos = ["PP", "P", "M", "G", "GG", "G3", "G4"]

    # Ordenação continua via Python (não muda nada aqui)
    roupas_ordenadas = sorted(
        roupas,
        key=lambda r: (
            ordem_tipos.index(r.tipo) if r.tipo in ordem_tipos else 999,
            ordem_tamanhos.index(r.tamanho) if r.tamanho in ordem_tamanhos else 999
        )
    )

    return [{"tipo": r.tipo, "tamanho": r.tamanho, "saldo": r.saldo} for r in roupas_ordenadas]


# ----------------------------- MOVIMENTAR ------------------------------ #
@router.post("/movimentar")
async def movimentar(
    dados: MovimentacaoRequest,
    db: AsyncSession = Depends(get_db),
    token: dict = Depends(verificar_token),
):
    usuario = token.get("sub")
    role = token.get("role")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem movimentar estoque")

    mensagens = []
    ordem_id = f"ORD-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:4]}"

    for mov in dados.itens:
        tipo = mov.tipo
        tamanho = mov.tamanho
        quantidade = int(mov.quantidade)
        acao = mov.acao

        # Busca Assíncrona (Substitui o db.query)
        query = select(Roupa).filter_by(tipo=tipo, tamanho=tamanho)
        result = await db.execute(query)
        roupa = result.scalar_one_or_none()

        if acao == "entrada":
            if roupa:
                roupa.saldo += quantidade
            else:
                roupa = Roupa(tipo=tipo, tamanho=tamanho, saldo=quantidade)
                db.add(roupa)
            mensagens.append(f"Entrada de {quantidade} {tipo} {tamanho or ''}".strip())

        elif acao == "saida":
            if not roupa:
                mensagens.append(f"Erro: {tipo} {tamanho or ''} não encontrado")
                continue
            if roupa.saldo < quantidade:
                mensagens.append(f"Erro: saldo insuficiente para {tipo} {tamanho or ''}")
                continue
            roupa.saldo -= quantidade
            mensagens.append(f"Saída de {quantidade} {tipo} {tamanho or ''}".strip())

        registro = Movimentacao(
            ordem_id=ordem_id,
            usuario=usuario,
            tipo=mov.tipo,
            tamanho=tamanho,
            quantidade=quantidade,
            acao=mov.acao,
        )
        db.add(registro)

    # Commit assíncrono
    await db.commit()
    return {"status": "ok", "ordem_id": ordem_id, "mensagem": mensagens}


# ----------------------------- HISTÓRICO ------------------------------ #
@router.get("/historico")
async def get_historico(db: AsyncSession = Depends(get_db), token: dict = Depends(verificar_token)):
    # Select Async com Ordenação e Limite
    query = select(Movimentacao).order_by(desc(Movimentacao.data)).limit(200)
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return [
        {
            "ordem_id": l.ordem_id,
            "usuario": l.usuario,
            "tipo": l.tipo,
            "tamanho": l.tamanho,
            "quantidade": l.quantidade,
            "acao": l.acao,
            "data": l.data.isoformat() if l.data else None,
        }
        for l in logs
    ]