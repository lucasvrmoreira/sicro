from pydantic import BaseModel
from typing import List, Optional

class ItemMovimentacao(BaseModel):
    tipo: str
    tamanho: Optional[str] = None
    quantidade: int
    acao: str # "entrada" ou "saida"

class MovimentacaoRequest(BaseModel):
    itens: List[ItemMovimentacao]