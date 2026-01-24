import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas"; // <--- NOVO IMPORT
import toast from "react-hot-toast";

export default function Planejamento() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // --- FUNÇÃO: EXPORTAR PDF COM GRÁFICO ---
  const exportarPDF = async () => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString("pt-BR");

    // 1. Cabeçalho
    doc.setFontSize(18);
    doc.text("Relatório de Planejamento Estratégico", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${dataAtual}`, 14, 28);

    // 2. Tabela 1: Dados do Consumo
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("1. Dados de Consumo (Texto)", 14, 40);

    const dadosGrafico = dados.grafico_consumo.map(item => {
        const total = Object.keys(item).reduce((acc, key) => key !== 'name' ? acc + item[key] : acc, 0);
        return [item.name, total.toFixed(1)];
    });

    autoTable(doc, {
        startY: 45,
        head: [['Tipo', 'Média (unid/semana)']],
        body: dadosGrafico,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });

    // 3. Tabela 2: Itens Parados
    let finalY = doc.lastAutoTable.finalY + 15;
    doc.text("2. Itens com Baixa Movimentação", 14, finalY);

    const dadosParados = dados.menos_movimentados.map(item => [
        item.item,
        item.saidas_30d,
        item.estoque_parado
    ]);

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Item', 'Saídas (30d)', 'Estoque']],
        body: dadosParados,
        theme: 'striped',
        headStyles: { fillColor: [192, 57, 43] },
    });

    // 4. Capturar e Adicionar o Gráfico (Imagem)
    finalY = doc.lastAutoTable.finalY + 15; // Atualiza a posição
    
    // Verifica se cabe na página, senão cria nova
    if (finalY > 200) {
        doc.addPage();
        finalY = 20;
    }

    doc.text("3. Visualização Gráfica", 14, finalY);

    try {
        const elementoGrafico = document.getElementById("grafico-print");
        if (elementoGrafico) {
            // Tira o print da div
            const canvas = await html2canvas(elementoGrafico, { 
                backgroundColor: "#111827", // Mantém o fundo escuro ou mude para null
                scale: 2 // Melhora a qualidade
            });
            const imgData = canvas.toDataURL("image/png");

            // Adiciona ao PDF (x, y, largura, altura)
            // Ajuste a altura (100) conforme a proporção do seu gráfico
            doc.addImage(imgData, 'PNG', 14, finalY + 5, 180, 100);
        }
    } catch (err) {
        console.error("Erro ao gerar imagem do gráfico", err);
    }

    // Salvar
    doc.save(`Relatorio_Completo_${dataAtual.replace(/\//g, '-')}.pdf`);
    toast.success("PDF com gráficos gerado!");
  };

  // --- FUNÇÃO: EXPORTAR EXCEL ---
  const exportarExcel = () => {
    if (!dados?.menos_movimentados) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Item;Saidas (30d);Estoque Atual\n";
    dados.menos_movimentados.forEach(item => {
        csvContent += `${item.item};${item.saidas_30d};${item.estoque_parado}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Relatorio_Estoque.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel baixado!");
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-950">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );

  const coresTamanhos = {
    "PP": "#8884d8", "P": "#82ca9d", "M": "#ffc658", 
    "G": "#ff8042", "GG": "#0088FE", "G3": "#00C49F", 
    "G4": "#FFBB28", "Padrão": "#A0A0A0"
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           <div className="flex items-center gap-4 w-full md:w-auto">
             <button onClick={() => navigate('/home')} className="bg-gray-800 p-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </button>
             <div>
               <h2 className="text-2xl font-bold text-teal-400">Planejamento Estratégico</h2>
               <p className="text-gray-400 text-sm">Análise de consumo</p>
             </div>
           </div>

           {/* Botões */}
           <div className="flex gap-3">
              <button onClick={exportarExcel} className="flex items-center gap-2 bg-green-600/20 text-green-400 border border-green-600/50 px-4 py-2 rounded-lg hover:bg-green-600/40 transition-all font-bold text-sm">
                Excel
              </button>
              <button onClick={exportarPDF} className="flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-600/50 px-4 py-2 rounded-lg hover:bg-red-600/40 transition-all font-bold text-sm">
                PDF Completo
              </button>
           </div>
        </div>

        {/* GRÁFICO (Com ID para o print) */}
        <div 
            id="grafico-print"  
            className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg mb-8"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             📊 Média Semanal de Consumo
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dados.grafico_consumo} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                    {dados.lista_tamanhos.map((tam) => (
                        <Bar key={tam} dataKey={tam} stackId="a" fill={coresTamanhos[tam] || "#8884d8"} name={`Tam ${tam}`} radius={[0, 0, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela (Essa parte vai para o PDF como texto) */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">❄️ Itens com Baixa Movimentação</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs uppercase bg-gray-800 text-gray-500">
                      <tr>
                        <th className="px-6 py-3">Item</th>
                        <th className="px-6 py-3 text-center">Saídas (30d)</th>
                        <th className="px-6 py-3 text-right">Estoque</th>
                      </tr>
                  </thead>
                  <tbody>
                      {dados?.menos_movimentados.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-800/50 border-b border-gray-800">
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
    </div>
  );
}