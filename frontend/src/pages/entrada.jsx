import { useState } from "react";
import api from "../api.js";
import toast from "react-hot-toast";


export default function Entrada() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [novoItem, setNovoItem] = useState({ tipo: "", tamanho: "", quantidade: "" });

  const tamanhosDisponiveis = ["PP", "P", "M", "G", "GG", "G3", "G4"];

  // Adiciona item ao carrinho
  const adicionarItem = () => {
    if (!novoItem.tipo || !novoItem.quantidade) {
      toast.error("❌ Preencha o tipo e a quantidade.");
      return;
    }
    setMovimentacoes([...movimentacoes, novoItem]);
    setNovoItem({ tipo: "", tamanho: "", quantidade: "" }); // reseta formulário
  };

  // Remove item do carrinho
  const removerItem = (index) => {
    setMovimentacoes(movimentacoes.filter((_, i) => i !== index));
  };

  // Envia para backend
  const handleEntrada = async () => {
    try {
      const payload = {
        itens: movimentacoes.map((m) => ({
          ...m,
          quantidade: Number(m.quantidade) || 0,
          acao: "entrada",
        })),
      };
      const res = await api.post("/api/movimentar", payload, { withCredentials: true });
      toast.success("✅ Entradas registradas com sucesso!");
      setMovimentacoes([]); // limpa carrinho

    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        toast.error("🚫 Você não tem autorização para registrar entradas.");
      } else {
        toast.error("❌ Erro ao registrar entradas.");
      }
    }
  };

  return (
    <div className="flex gap-6 mt-10 px-6">
      {/* Coluna esquerda: formulário */}
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-1/2">
        <h1 className="text-2xl font-bold mb-4 text-center">Adicionar Roupa</h1>

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
            const val = e.target.value.replace(/\D/g, ""); // só dígitos
            setNovoItem({ ...novoItem, quantidade: val });
          }}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-600"
          placeholder="Digite a quantidade"
        />

        <button
          onClick={adicionarItem}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          + Adicionar
        </button>
      </div>

      {/* Coluna direita: carrinho */}
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4 text-center">Itens adicionados</h2>

        {movimentacoes.length === 0 ? (
          <p className="text-gray-400">Nenhum item adicionado</p>
        ) : (
          <ul className="space-y-2">
            {movimentacoes.map((m, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-lg shadow-md"
              >
                <div>
                  <span className="font-semibold text-green-300">{m.tipo}</span>
                  {m.tamanho && (
                    <span className="ml-2 text-gray-400">({m.tamanho})</span>
                  )}
                  <span className="ml-3 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
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

        )}

        {movimentacoes.length > 0 && (
          <button
            onClick={handleEntrada}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 p-2 rounded font-semibold"
          >
            Registrar Entradas
          </button>
        )}
      </div>
    </div>
  );
}
