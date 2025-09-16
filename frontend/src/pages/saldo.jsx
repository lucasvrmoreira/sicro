import { useEffect, useState } from "react";
import api from "../api.js";
import { useNavigate } from "react-router-dom";


function organizarPorTipo(lista) {
  const agrupado = {};
  lista.forEach((item) => {
    if (!agrupado[item.tipo]) agrupado[item.tipo] = [];
    agrupado[item.tipo].push(item);
  });
  return agrupado;
}

export default function Saldo() {
  const [estoque, setEstoque] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.get("/saldo")
      .then((res) => {
        console.log("📊 Resposta saldo:", res.data);
        setEstoque(organizarPorTipo(res.data));
      })
      .catch((err) => {
        console.error("❌ Erro saldo:", err.response?.status, err.response?.data || err.message);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      });


  }, []);


  return (
    <div className="-mt-5 px-6">
      <h1 className="text-2xl font-bold text-center text-white mt-1 mb-1">
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(estoque).map(([tipo, itens]) => (
          <div
            key={tipo}
            className="bg-gray-900 text-white p-5 rounded-xl shadow-lg h-auto"
          >
            <h2 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 text-center">
              {tipo}
            </h2>
            <div className="flex flex-col gap-2">
              {itens.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-800 px-1 py-1 rounded text-sm"
                >
                  <span className="text-gray-300">
                    {item.tamanho && item.tamanho !== "-" ? item.tamanho : "Padrão"}
                  </span>
                  <span
                    className={`font-bold ${item.saldo > 0 ? "text-green-400" : "text-red-400"
                      }`}
                  >
                    {item.saldo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
