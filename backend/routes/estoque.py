from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import SessionLocal
from backend.routes.roupa import Roupa
from backend.routes.movimentacao import Movimentacao
from backend.core.security import verificar_token
from datetime import datetime
import uuid

router = APIRouter(tags=["Estoque"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------------- SALDO -------------------------------- #
@router.get("/saldo")
def get_saldo(db: Session = Depends(get_db), token: dict = Depends(verificar_token)):
    roupas = db.query(Roupa).all()

    ordem_tipos = ["Macacão", "Botas", "Panos", "Óculos"]
    ordem_tamanhos = ["PP", "P", "M", "G", "GG", "G3", "G4"]

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
def movimentar(
    movs: dict,
    db: Session = Depends(get_db),
    token: dict = Depends(verificar_token)
):
    usuario = token.get("sub")
    role = token.get("role")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Apenas administradores podem movimentar estoque")

    mensagens = []

    # 🔹 gera um ID único para a ordem (igual para todos os itens)
    ordem_id = f"ORD-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:4]}"

    for mov in movs.get("itens", []):
        tipo = mov.get("tipo")
        tamanho = mov.get("tamanho")
        quantidade = int(mov.get("quantidade", 0))
        acao = mov.get("acao")

        roupa = db.query(Roupa).filter_by(tipo=tipo, tamanho=tamanho).first()

        if acao == "entrada":
            if roupa:
                roupa.saldo += quantidade
            else:
                roupa = Roupa(tipo=tipo, tamanho=tamanho, saldo=quantidade)
                db.add(roupa)
            mensagens.append(f"Entrada de {quantidade} {tipo} {tamanho or ''}".strip())

        elif acao == "saida":
            if not roupa:
                mensagens.append(f"Erro: {tipo} {tamanho or ''} não encontrado no estoque")
                continue
            if roupa.saldo < quantidade:
                mensagens.append(f"Erro: saldo insuficiente para {tipo} {tamanho or ''}")
                continue
            roupa.saldo -= quantidade
            mensagens.append(f"Saída de {quantidade} {tipo} {tamanho or ''}".strip())

        # 🔹 registra todos os itens com o mesmo ordem_id
        registro = Movimentacao(
            ordem_id=ordem_id,
            usuario=usuario,
            tipo=tipo,
            tamanho=tamanho,
            quantidade=quantidade,
            acao=acao,
        )
        db.add(registro)

    db.commit()
    return {"status": "ok", "ordem_id": ordem_id, "mensagem": mensagens}


# ----------------------------- HISTÓRICO ------------------------------ #
@router.get("/historico")
def get_historico(db: Session = Depends(get_db), token: dict = Depends(verificar_token)):
    logs = db.query(Movimentacao).order_by(Movimentacao.data.desc()).limit(200).all()
    return [
        {
            "ordem_id": l.ordem_id,
            "usuario": l.usuario,
            "tipo": l.tipo,
            "tamanho": l.tamanho,
            "quantidade": l.quantidade,
            "acao": l.acao,
            "data": l.data.isoformat(),
        }
        for l in logs
    ]
