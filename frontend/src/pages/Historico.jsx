import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import api from "../api.js";
import { useNavigate } from "react-router-dom";

export default function Historico() {
    const [ordens, setOrdens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [expandido, setExpandido] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (!token) {
             navigate("/login");
             return;
        }

        const fetchHistorico = async () => {
            try {
                // Usa a instância 'api' em vez de URL hardcoded
                const resp = await api.get("/api/historico", { withCredentials: true });
                const data = resp.data;

                // 🔹 Agrupar por ordem_id (Lógica mantida e melhorada)
                const grupos = {};
                data.forEach((mov) => {
                    const chave = mov.ordem_id;
                    if (!grupos[chave]) {
                        grupos[chave] = {
                            ordem_id: mov.ordem_id,
                            usuario: mov.usuario || "Sistema",
                            acao: mov.acao,
                            data: mov.data,
                            itens: [],
                        };
                    }
                    grupos[chave].itens.push({
                        tipo: mov.tipo,
                        tamanho: mov.tamanho,
                        quantidade: mov.quantidade,
                    });
                });

                // Ordenar por data (Mais recente primeiro)
                const ordensArray = Object.values(grupos).sort(
                    (a, b) => new Date(b.data) - new Date(a.data)
                );

                setOrdens(ordensArray);
            } catch (err) {
                console.error("Erro ao buscar histórico:", err);
            } finally {
                setCarregando(false);
            }
        };

        fetchHistorico();
    }, [navigate]);

    // Lógica de Filtro
    const ordensFiltradas = ordens.filter(ordem => 
        ordem.usuario.toLowerCase().includes(termoBusca.toLowerCase()) ||
        ordem.ordem_id.toString().includes(termoBusca) ||
        ordem.itens.some(item => item.tipo.toLowerCase().includes(termoBusca.toLowerCase()))
    );

    const toggleExpand = (id) => {
        setExpandido(expandido === id ? null : id);
    };

    // Formata data para "24/01 às 14:30"
    const formatarData = (dataISO) => {
        const data = new Date(dataISO);
        return new Intl.DateTimeFormat('pt-BR', { 
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        }).format(data);
    };

    return (
        <div className="max-w-5xl mx-auto mt-8 px-4 pb-12 animate-fadeIn">
            
            {/* CABEÇALHO E BUSCA */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="bg-purple-900/50 p-2.5 rounded-xl border border-purple-500/30">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Histórico
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 ml-1">Registro completo de movimentações.</p>
                </div>

                {/* Campo de Busca */}
                <div className="relative w-full md:w-80 group">
                    <input
                        type="text"
                        placeholder="Buscar por usuário, item ou ID..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                    />
                    <svg className="w-5 h-5 text-gray-600 group-focus-within:text-purple-400 absolute left-3.5 top-3.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
            </div>

            {/* LISTA DE CARDS */}
            {carregando ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                    <p className="animate-pulse text-gray-500 text-sm">Carregando registros...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {ordensFiltradas.length === 0 ? (
                        <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-gray-500">Nenhum registro encontrado.</p>
                        </div>
                    ) : (
                        ordensFiltradas.map((ordem) => (
                            <div
                                key={ordem.ordem_id}
                                onClick={() => toggleExpand(ordem.ordem_id)}
                                className={`
                                    bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-gray-600
                                    ${expandido === ordem.ordem_id ? 'ring-1 ring-purple-500/50 bg-gray-900/80' : ''}
                                `}
                            >
                                {/* LINHA PRINCIPAL (RESUMO) */}
                                <div className="p-4 md:p-5 flex items-center justify-between">
                                    
                                    {/* Lado Esquerdo: Ícone e Info Principal */}
                                    <div className="flex items-center gap-4">
                                        {/* Ícone Indicador de Entrada/Saída */}
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center border
                                            ${ordem.acao === 'entrada' 
                                                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                                : 'bg-red-500/10 border-red-500/20 text-red-400'}
                                        `}>
                                            {ordem.acao === 'entrada' ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-white font-bold text-lg">
                                                {ordem.acao === 'entrada' ? 'Entrada de Material' : 'Retirada de Material'}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                <span>{ordem.usuario}</span>
                                                <span className="text-gray-600">•</span>
                                                <span className="font-mono text-xs bg-gray-800 px-1.5 py-0.5 rounded">ID: {ordem.ordem_id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lado Direito: Data e Seta */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-gray-300 font-medium">{formatarData(ordem.data)}</p>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{ordem.itens.length} itens</p>
                                        </div>
                                        
                                        {/* Seta de Expandir */}
                                        <svg 
                                            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandido === ordem.ordem_id ? 'rotate-180 text-purple-400' : ''}`} 
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* ÁREA EXPANDIDA (DETALHES) */}
                                {expandido === ordem.ordem_id && (
                                    <div className="border-t border-gray-800 bg-black/20 animate-slideDown">
                                        <div className="p-4 md:p-5 grid gap-2">
                                            {ordem.itens.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                                        <span className="text-gray-300 font-medium">{item.tipo}</span>
                                                        {item.tamanho && (
                                                            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded border border-gray-600">
                                                                {item.tamanho}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`font-bold font-mono ${ordem.acao === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {ordem.acao === 'entrada' ? '+' : '-'}{item.quantidade}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}