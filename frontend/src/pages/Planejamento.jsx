import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

export default function Planejamento() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipoGrafico, setTipoGrafico] = useState("barras");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/api/dashboard/planejamento");
        setDados(res.data);
      } catch (err) {
        console.error("Erro ao carregar planejamento", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  if (loading) return <div className="flex justify-center h-screen items-center text-white">Carregando...</div>;

  const coresTamanhos = {
    "PP": "#8884d8", "P": "#82ca9d", "M": "#ffc658", 
    "G": "#ff8042", "GG": "#0088FE", "G3": "#00C49F", "Padrão": "#A0A0A0"
  };

  // Cores para o gráfico de Pizza
  const coresPizza = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  // Prepara dados para Pizza e Linha (Calcula o total somando os tamanhos)
  const dadosTotais = dados?.grafico_consumo.map(item => {
    // Soma todas as chaves que não sejam "name"
    const total = Object.keys(item).reduce((acc, key) => {
        return key !== "name" ? acc + item[key] : acc;
    }, 0);
    return { name: item.name, total: total, ...item };
  }) || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/home')} className="bg-gray-800 p-2 rounded-lg border border-gray-700">⬅</button>
             <h2 className="text-2xl font-bold text-teal-400">Planejamento Estratégico</h2>
          </div>
          
          {/* BOTÕES DE SELEÇÃO */}
          <div className="bg-gray-800 p-1 rounded-lg flex flex-wrap gap-2 justify-center">
            <button onClick={() => setTipoGrafico("barras")} className={`px-3 py-1 rounded text-sm ${tipoGrafico === "barras" ? "bg-teal-600 text-white" : "text-gray-400 hover:text-white"}`}>Barras</button>
            <button onClick={() => setTipoGrafico("area")} className={`px-3 py-1 rounded text-sm ${tipoGrafico === "area" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Área</button>
            <button onClick={() => setTipoGrafico("linhas")} className={`px-3 py-1 rounded text-sm ${tipoGrafico === "linhas" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>Linhas</button>
            <button onClick={() => setTipoGrafico("pizza")} className={`px-3 py-1 rounded text-sm ${tipoGrafico === "pizza" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}>Donut</button>
          </div>
        </div>

        {/* CONTAINER DO GRÁFICO */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             📊 Análise Visual de Consumo
          </h3>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                
                {/* 1. GRÁFICO DE BARRAS (STACKED) */}
                {tipoGrafico === "barras" && (
                    <BarChart data={dados.grafico_consumo} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                        <Legend />
                        {dados.lista_tamanhos.map((tam) => (
                            <Bar key={tam} dataKey={tam} stackId="a" fill={coresTamanhos[tam] || "#8884d8"} />
                        ))}
                    </BarChart>
                )}

                {/* 2. GRÁFICO DE ÁREA */}
                {tipoGrafico === "area" && (
                    <AreaChart data={dados.grafico_consumo} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                        {dados.lista_tamanhos.map((tam) => (
                             <Area key={tam} type="monotone" dataKey={tam} stackId="1" stroke={coresTamanhos[tam]} fill={coresTamanhos[tam]} />
                        ))}
                    </AreaChart>
                )}

                {/* 3. GRÁFICO DE LINHAS (NOVO) */}
                {tipoGrafico === "linhas" && (
                     <LineChart data={dadosTotais} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                        <Legend />
                        <Line type="monotone" dataKey="total" name="Média Total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                     </LineChart>
                )}

                {/* 4. GRÁFICO DE PIZZA / DONUT (NOVO) */}
                {tipoGrafico === "pizza" && (
                    <PieChart>
                        <Pie
                            data={dadosTotais}
                            cx="50%"
                            cy="50%"
                            innerRadius={60} // Isso faz virar um Donut
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="total"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {dadosTotais.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={coresPizza[index % coresPizza.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                        <Legend />
                    </PieChart>
                )}

            </ResponsiveContainer>
          </div>
        </div>

        {/* TABELA DE ITENS PARADOS (Mantida igual) */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-white">❄️ Itens com Baixa Movimentação</h3>
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-800">
                    <tr><th className="px-6 py-3">Item</th><th className="px-6 py-3 text-center">Saídas (30d)</th><th className="px-6 py-3 text-right">Estoque</th></tr>
                </thead>
                <tbody>
                    {dados?.menos_movimentados.map((item, i) => (
                        <tr key={i} className="border-b border-gray-800">
                            <td className="px-6 py-4 font-medium text-white">{item.item}</td>
                            <td className="px-6 py-4 text-center text-yellow-500">{item.saidas_30d}</td>
                            <td className="px-6 py-4 text-right text-blue-400">{item.estoque_parado}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}