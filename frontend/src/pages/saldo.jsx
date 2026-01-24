import { useEffect, useState } from "react";
import api from "../api.js";
import { useNavigate } from "react-router-dom";

// Função auxiliar para agrupar
function organizarPorTipo(lista) {
  const agrupado = {};
  lista.forEach((item) => {
    if (!agrupado[item.tipo]) agrupado[item.tipo] = [];
    agrupado[item.tipo].push(item);
  });
  return agrupado;
}

// --- ÍCONES PROFISSIONAIS (SVG) ---
const Icons = {
  Macacao: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Botas: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8" /> 
       {/* (Representação abstrata de calçado/caixa resistente) */}
    </svg>
  ),
  Panos: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Oculos: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Default: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
};

export default function Saldo() {
  const [estoque, setEstoque] = useState({});
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const navigate = useNavigate();

  // Configuração Visual Atualizada (Sem Emojis)
  const getConfig = (tipo) => {
    switch (tipo) {
      case "Macacão": return { Icon: Icons.Macacao, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      case "Botas": return { Icon: Icons.Botas, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
      case "Panos": return { Icon: Icons.Panos, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" };
      case "Óculos": return { Icon: Icons.Oculos, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
      default: return { Icon: Icons.Default, color: "text-gray-400", bg: "bg-gray-800", border: "border-gray-700" };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.get("/api/saldo", { withCredentials: true })
      .then((res) => {
        setEstoque(organizarPorTipo(res.data));
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) navigate("/login");
        setLoading(false);
      });
  }, [navigate]);

  // Status visual
  const getStatusCor = (qtd) => {
    if (qtd === 0) return "text-red-500 font-black";
    if (qtd < 10) return "text-orange-400 font-bold";
    return "text-emerald-400 font-bold";
  };

  const getStatusLabel = (qtd) => {
    if (qtd === 0) return <span className="text-[10px] uppercase bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full tracking-wider">Esgotado</span>;
    if (qtd < 10) return <span className="text-[10px] uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full tracking-wider">Baixo</span>;
    return null;
  };

  // Filtro
  const itensFiltrados = Object.entries(estoque).reduce((acc, [tipo, itens]) => {
    const itensDoTipo = itens.filter(item => 
      tipo.toLowerCase().includes(termoBusca.toLowerCase()) || 
      (item.tamanho && item.tamanho.toLowerCase().includes(termoBusca.toLowerCase()))
    );
    if (itensDoTipo.length > 0) acc[tipo] = itensDoTipo;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white gap-4 bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="animate-pulse text-gray-500 text-sm tracking-widest uppercase">Carregando Estoque...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4 pb-12 animate-fadeIn">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             {/* Ícone de Título SVG */}
             <div className="bg-gray-800 p-2.5 rounded-xl border border-gray-700">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
             </div>
             Saldo de Estoque
          </h1>
          <p className="text-gray-500 text-sm mt-2 ml-1">Visão geral do estoque disponível.</p>
        </div>

        {/* Busca */}
        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Pesquisar item..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-600"
          />
          <svg className="w-5 h-5 text-gray-600 group-focus-within:text-blue-400 absolute left-3.5 top-3.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Grid */}
      {Object.keys(itensFiltrados).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
          <svg className="w-12 h-12 mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12H4M12 4v16"/></svg>
          <p className="text-sm font-medium">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(itensFiltrados).map(([tipo, itens]) => {
            const estilo = getConfig(tipo);
            const Icone = estilo.Icon;
            
            return (
              <div
                key={tipo}
                className={`bg-gray-900/40 backdrop-blur-md rounded-2xl border ${estilo.border} shadow-lg hover:shadow-2xl hover:border-opacity-50 transition-all duration-300 flex flex-col group`}
              >
                {/* Cabeçalho do Card */}
                <div className={`p-5 flex items-center justify-between border-b border-white/5 ${estilo.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-950/30 rounded-lg">
                        <Icone className={`w-6 h-6 ${estilo.color}`} />
                    </div>
                    <h2 className="text-base font-bold text-gray-200 tracking-wide">{tipo}</h2>
                  </div>
                </div>

                {/* Lista */}
                <div className="p-3 flex-1 flex flex-col gap-1">
                    {itens.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 text-xs font-bold border border-gray-700">
                            {item.tamanho && item.tamanho !== "-" ? item.tamanho : "UN"}
                          </span>
                          {getStatusLabel(item.saldo)}
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <span className={`text-lg font-mono tracking-tight ${getStatusCor(item.saldo)}`}>
                                {item.saldo}
                            </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Rodapé Total */}
                <div className="px-5 py-3 bg-black/20 rounded-b-2xl border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    <span className="font-medium uppercase tracking-wider">Total</span>
                    <span className="text-gray-300 font-mono font-bold bg-gray-800 px-2 py-0.5 rounded">
                        {itens.reduce((acc, curr) => acc + curr.saldo, 0)}
                    </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}