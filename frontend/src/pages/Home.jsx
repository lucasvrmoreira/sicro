
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, isTokenValid } from "../utils/auth";

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (!isTokenValid(token)) {
            localStorage.removeItem("token"); // limpa token inválido
            navigate("/login", { replace: true });
        }
    }, [navigate]);


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Bem-vindo!</h1>
            <p className="mb-6">Você está logado. Escolha uma opção no menu acima.</p>
        </div>
    );
}
