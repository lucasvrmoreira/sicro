import { useState } from "react";
import api from "../api.js";
import toast from "react-hot-toast";


export default function Saida() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [novoItem, setNovoItem] = useState({ tipo: "", tamanho: "", quantidade: "" });

  const tamanhosDisponiveis = ["PP", "P", "M", "G", "GG", "G3", "G4"];

  // adiciona item ao carrinho
  const adicionarItem = () => {
    if (!novoItem.tipo || !novoItem.quantidade) {
      toast.error("❌ Preencha o tipo e a quantidade.");
      return;
    }
    setMovimentacoes([...movimentacoes, novoItem]);
    setNovoItem({ tipo: "", tamanho: "", quantidade: "" });
  };

  // remove item do carrinho
  const removerItem = (index) => {
    setMovimentacoes(movimentacoes.filter((_, i) => i !== index));
  };

  // envia para backend
  const handleSaida = async () => {
    try {
      const payload = {
        itens: movimentacoes.map((m) => ({
          ...m,
          quantidade: Number(m.quantidade) || 0,
          acao: "saida",
        })),
      };
      const res = await api.post("/api/movimentar", payload, { withCredentials: true });
      toast.success("✅ Saídas registradas com sucesso!");
      setMovimentacoes([]); // limpa carrinho

    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        toast.error("🚫 Você não tem autorização para registrar saídas.");
      } else {
        toast.error("❌ Erro ao registrar saídas.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 px-4">
      {/* Coluna esquerda: formulário */}
      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Registrar Saída</h1>

        {/* Tipo */}
        <label className="block mb-2">Tipo:</label>
        <select
          value={novoItem.tipo}
          onChange={(e) => setNovoItem({ ...novoItem, tipo: e.target.value })}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-600"
        >
          <option value="">Selecione...</option>
          <option value="Macacão">Macacão</option>
          <option value="Botas">Botas</option>
          <option value="Panos">Panos</option>
          <option value="Óculos">Óculos</option>
        </select>

        {/* Tamanho */}
        {(novoItem.tipo === "Macacão" || novoItem.tipo === "Botas") && (
          <>
            <label className="block mb-2">Tamanho:</label>
            <select
              value={novoItem.tamanho}
              onChange={(e) => setNovoItem({ ...novoItem, tamanho: e.target.value })}
              className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-600"
            >
              <option value="">Selecione...</option>
              {tamanhosDisponiveis.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Quantidade */}
        <label className="block mb-2">Quantidade:</label>
        <input
          type="text"
          value={novoItem.quantidade}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setNovoItem({ ...novoItem, quantidade: val });
          }}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-600"
          placeholder="Digite a quantidade"
        />

        <button
          onClick={adicionarItem}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 md:p-3 text-sm md:text-base rounded font-semibold"
        >
          + Adicionar
        </button>

      </div>

      {/* Coluna direita: carrinho */}
      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Itens para saída</h2>

        {movimentacoes.length === 0 ? (
          <p className="text-gray-400">Nenhum item adicionado</p>
        ) : (
        <div className="overflow-x-auto">
          <ul className="space-y-2">
            {movimentacoes.map((m, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-lg shadow-md"
              >
                <div>
                  <span className="font-semibold text-blue-300">{m.tipo}</span>
                  {m.tamanho && (
                    <span className="ml-2 text-gray-400">({m.tamanho})</span>
                  )}
                  <span className="ml-3 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {m.quantidade} un.
                  </span>
                </div>
                <button
                  onClick={() => removerItem(i)}
                  className="text-red-400 hover:text-red-600 transition"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
        )}

        {movimentacoes.length > 0 && (
          <button
            onClick={handleSaida}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 p-2 md:p-3 text-sm md:text-base rounded font-semibold"
          >
            Registrar Saídas
          </button>

        )}
      </div>
    </div>
  );
}
