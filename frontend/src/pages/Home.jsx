import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";
import api from "../api";
import { Toaster } from "react-hot-toast";

function Home() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !isTokenValid()) {
      localStorage.removeItem("access_token");
      navigate("/login", { replace: true });
      return;
    }

    async function carregarDashboard() {
      try {
        const response = await api.get('/api/dashboard/resumo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDados(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        setErro("Não foi possível carregar os dados.");
        setLoading(false);
      }
    }

    carregarDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho Limpo (Sem botão) */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Visão Geral <span className="text-blue-500">Sicro</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Resumo do mês: <span className="text-gray-200 font-mono bg-gray-800 px-2 py-1 rounded">{dados?.mes_referencia}</span>
            </p>
          </div>
        </header>

        {erro ? (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded text-red-200 text-center">
                {erro}
            </div>
        ) : (
            <>
                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-green-500/50 transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Entradas</p>
                        <h3 className="text-4xl font-bold text-white mt-2 group-hover:text-green-400 transition-colors">
                            {dados?.entradas}
                        </h3>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 hover:border-red-500/50 transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Saídas</p>
                        <h3 className="text-4xl font-bold text-white mt-2 group-hover:text-red-400 transition-colors">
                            {dados?.saidas}
                        </h3>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 transition-all group hover:border-blue-500/50`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Balanço (Líquido)</p>
                        <h3 className={`text-4xl font-bold mt-2 ${dados?.balanco_liquido >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                          {dados?.balanco_liquido > 0 ? '+' : ''}{dados?.balanco_liquido}
                        </h3>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela de Ranking e Dica */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/50">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            🔥 Top 5 - Mais Retirados
                        </h2>
                      </div>
                      <div className="p-0">
                        {dados?.ranking_saidas.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-gray-800/30">
                                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                                  <th className="px-6 py-3 font-medium">Item</th>
                                  <th className="px-6 py-3 font-medium text-right">Qtd. Saída</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800">
                                {dados.ranking_saidas.map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-300 font-medium">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                                            {item.item}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-white font-bold">{item.qtd}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                              <span className="text-2xl mb-2">😴</span>
                              <p>Nenhuma saída registrada este mês.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-6 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Dica do Sistema</h3>
                        <p className="text-gray-400 mt-2 max-w-sm">
                            Utilize o menu lateral para registrar novas <strong>Entradas</strong> ou <strong>Saídas</strong>. Acesse o menu <strong>Planejamento</strong> para ver previsões de compras.
                        </p>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
}

export default Home;