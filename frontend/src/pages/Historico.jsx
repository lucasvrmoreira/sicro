import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import api from "../api.js";

export default function Historico() {
    const [ordens, setOrdens] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [expandido, setExpandido] = useState(null);
    const API_URL = "http://localhost:8000/api/historico"; // ajuste a porta se necessário

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const fetchHistorico = async () => {
            setCarregando(true);
            try {
                const resp = await api.get("/api/historico", { withCredentials: true });
                const data = resp.data;


                // 🔹 Agrupar por ordem_id
                const grupos = {};
                data.forEach((mov) => {
                    const chave = mov.ordem_id;
                    if (!grupos[chave]) {
                        grupos[chave] = {
                            ordem_id: mov.ordem_id,
                            usuario: mov.usuario,
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

                // 🔹 Transforma o objeto em array e ordena por data (decrescente)
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
    }, []);

    const toggleExpand = (index) => {
        setExpandido(expandido === index ? null : index);
    };

    return (
        <div className="text-white px-3 md:px-6">
            <h1 className="text-xl md:text-2xl font-bold mb-6 text-purple-400 text-center md:text-left">
                Histórico de Movimentações
            </h1>


            {carregando ? (
                <p>Carregando...</p>
            ) : (
                <div className="overflow-x-auto bg-gray-800/60 backdrop-blur-md rounded-lg p-3 md:p-5 divide-y divide-gray-700 shadow-md">
                    {ordens.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">
                            Nenhuma movimentação encontrada.
                        </p>
                    ) : (
                        ordens.map((ordem, i) => (
                            <div
                                key={i}
                                className="p-3 md:p-4 hover:bg-gray-700/70 transition-all cursor-pointer rounded-lg mt-2"
                                onClick={() => toggleExpand(i)}
                            >

                                {/* Linha principal da ordem */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-purple-300">
                                            {ordem.ordem_id}
                                        </p>
                                        <p className="text-gray-400 text-xs md:text-sm">
                                            Usuário: {ordem.usuario}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${ordem.acao === "entrada"
                                                ? "text-green-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {ordem.acao.toUpperCase()}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {new Date(ordem.data).toLocaleString("pt-BR")}
                                        </p>
                                    </div>
                                </div>

                                {/* Itens da ordem (expansível) */}
                                {expandido === i && (
                                    <div className="mt-3 pl-3 md:pl-5 border-l-2 border-purple-600 space-y-1 text-sm md:text-base">
                                        {ordem.itens.map((item, j) => (
                                            <p key={j} className="text-gray-300 text-sm">
                                                • {item.tipo}{" "}
                                                <span className="text-gray-400">
                                                    {item.tamanho || "-"}
                                                </span>{" "}
                                                —{" "}
                                                <span className="text-gray-200 font-semibold">
                                                    {item.quantidade} unid.
                                                </span>
                                            </p>
                                        ))}
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
