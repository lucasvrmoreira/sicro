import { useState, useRef } from "react";
import api from "../api.js";
import toast from "react-hot-toast";

export default function Saida() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [novoItem, setNovoItem] = useState({ tipo: "", tamanho: "", quantidade: "" });
  
  // Ref para focar no input de quantidade automaticamente
  const qtdInputRef = useRef(null);

  const tamanhosDisponiveis = ["PP", "P", "M", "G", "GG", "G3", "G4"];
  
  // Configuração visual (Mesmos ícones)
  const tiposDisponiveis = [
    { id: "Macacão", icone: "🦺", requerTamanho: true },
    { id: "Botas", icone: "👢", requerTamanho: true },
    { id: "Panos", icone: "🧼", requerTamanho: false },
    { id: "Óculos", icone: "👓", requerTamanho: false },
  ];

  // Adiciona item à lista de saída
  const adicionarItem = () => {
    if (!novoItem.tipo) return toast.error("Selecione um tipo de item.");
    if (!novoItem.quantidade || Number(novoItem.quantidade) <= 0) return toast.error("Digite uma quantidade válida.");
    
    const tipoObj = tiposDisponiveis.find(t => t.id === novoItem.tipo);
    if (tipoObj?.requerTamanho && !novoItem.tamanho) return toast.error("Selecione o tamanho.");

    setMovimentacoes([...movimentacoes, novoItem]);
    setNovoItem({ tipo: "", tamanho: "", quantidade: "" }); 
  };

  // Remove item
  const removerItem = (index) => {
    setMovimentacoes(movimentacoes.filter((_, i) => i !== index));
  };

  // Atalho: Enter no campo de quantidade já adiciona
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      adicionarItem();
    }
  };

  // Envia para o Backend (Ação: Saida)
  const handleSaida = async () => {
    if (movimentacoes.length === 0) return toast.error("Adicione itens à lista primeiro.");
    
    try {
      const payload = {
        itens: movimentacoes.map((m) => ({
          ...m,
          quantidade: Number(m.quantidade) || 0,
          acao: "saida", // <--- Importante: Define que é saída
        })),
      };
      await api.post("/api/movimentar", payload, { withCredentials: true });
      toast.success("✅ Saída registrada com sucesso!");
      setMovimentacoes([]);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        toast.error("🚫 Você não tem permissão para registrar saídas.");
      } else {
        toast.error("Erro ao registrar saída.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      
      {/* === COLUNA ESQUERDA: SELEÇÃO (7 colunas) === */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Card Principal (Vermelho) */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="bg-red-500/20 text-red-400 p-2 rounded-lg">📤</span> 
            Registrar Saída
          </h1>

          {/* 1. SELEÇÃO DE TIPO */}
          <label className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-3 block">1. Selecione o Item</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {tiposDisponiveis.map((item) => (
              <button
                key={item.id}
                onClick={() => setNovoItem({ ...novoItem, tipo: item.id, tamanho: "" })}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200
                  ${novoItem.tipo === item.id 
                    ? "bg-red-600 border-red-500 text-white shadow-lg scale-105" 
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750 hover:border-gray-600"}
                `}
              >
                <span className="text-2xl mb-2">{item.icone}</span>
                <span className="font-medium text-sm">{item.id}</span>
              </button>
            ))}
          </div>

          {/* 2. SELEÇÃO DE TAMANHO */}
          {tiposDisponiveis.find(t => t.id === novoItem.tipo)?.requerTamanho && (
            <div className="mb-6 animate-slideDown">
              <label className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-3 block">2. Escolha o Tamanho</label>
              <div className="flex flex-wrap gap-2">
                {tamanhosDisponiveis.map((tam) => (
                  <button
                    key={tam}
                    onClick={() => {
                        setNovoItem({ ...novoItem, tamanho: tam });
                        qtdInputRef.current?.focus(); 
                    }}
                    className={`
                      px-4 py-2 rounded-lg font-bold text-sm border transition-all
                      ${novoItem.tamanho === tam
                        ? "bg-white text-red-900 border-white shadow-md"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"}
                    `}
                  >
                    {tam}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. QUANTIDADE E BOTÃO */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/2">
              <label className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-2 block">3. Quantidade</label>
              <div className="relative">
                <input
                  ref={qtdInputRef}
                  type="number"
                  value={novoItem.quantidade}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 text-white text-lg rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">unid.</span>
              </div>
            </div>
            
            <button
              onClick={adicionarItem}
              className="w-full md:w-1/2 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>+</span> Adicionar à Lista
            </button>
          </div>

        </div>
      </div>

      {/* === COLUNA DIREITA: RESUMO (5 colunas) === */}
      <div className="lg:col-span-5">
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl shadow-xl h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-white">Itens para Retirar</h2>
            <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">{movimentacoes.length} itens</span>
          </div>

          {movimentacoes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-10 opacity-60">
              <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 12H4M12 4v16"></path></svg>
              <p>Lista de saída vazia</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 custom-scrollbar">
              {movimentacoes.map((m, i) => (
                <div key={i} className="group flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 p-3 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl">
                       {tiposDisponiveis.find(t => t.id === m.tipo)?.icone}
                    </div>
                    <div>
                      <p className="font-bold text-gray-200">{m.tipo}</p>
                      {m.tamanho && <p className="text-xs text-gray-400">Tamanho: <span className="text-gray-300 font-semibold">{m.tamanho}</span></p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded text-sm">
                      -{m.quantidade}
                    </span>
                    <button 
                      onClick={() => removerItem(i)}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-800">
             <button
               disabled={movimentacoes.length === 0}
               onClick={handleSaida}
               className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
               Confirmar Saída
             </button>
          </div>
        </div>
      </div>

    </div>
  );
}