import { useState, useEffect } from "react";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import cosmosAnimation from "../assets/Cosmos.json";
import { getToken, isTokenValid } from "../utils/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Se já tiver token válido, redireciona para /home
  useEffect(() => {
    const token = getToken();
    if (isTokenValid(token)) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  // Animação de boas-vindas (some após 3s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post(
        "/api/token",
        new URLSearchParams({ username, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 20000 }
      );

      const token = res.data.access_token;
      localStorage.setItem("access_token", token);

      // Após login, vai para home
      navigate("/home", { replace: true });
    } catch (err) {
      setError("Usuário ou senha incorretos");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      
      {/* Logo de Fundo (Marca d'água) */}
      <img
        src="/logo.png"
        alt="Logo"
        className="absolute inset-0 m-auto w-[80%] max-w-[300px] md:max-w-[500px] opacity-20 object-contain pointer-events-none"
      />

      {/* Mensagem Flutuante de Boas-vindas */}
      {showWelcome && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-900/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-blue-500/30 text-center w-[90%] max-w-md animate-slideDown z-50">
          <h2 className="text-xl font-bold text-blue-200">Bem-vindo ao SICRO</h2>
          <p className="text-blue-100 text-sm mt-1">
            Sistema Integrado de Controle de Roupas Estéreis
          </p>
        </div>
      )}

      {/* Card de Login */}
      <form
        onSubmit={handleLogin}
        className="relative bg-black/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-[90%] max-w-md border border-gray-800"
      >
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Acesso ao Sistema</h1>
            <p className="text-gray-400 text-sm mt-2">Identifique-se para continuar</p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-xl text-center flex items-center justify-center gap-2 animate-pulse">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {/* Input Usuário com Ícone */}
        <div className="relative mb-5 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700 text-white rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-500"
          />
        </div>

        {/* Input Senha com Ícone */}
        <div className="relative mb-8 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900/60 border border-gray-700 text-white rounded-xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-500"
          />
        </div>

        {/* Botão de Entrar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
                <Lottie animationData={cosmosAnimation} loop={true} className="w-6 h-6" />
                <span>Entrando...</span>
            </div>
          ) : (
            "Acessar Sistema"
          )}
        </button>
      </form>

      {/* Footer / Status de Carregamento Global */}
      {loading && (
        <div className="absolute bottom-8 flex flex-col items-center animate-fadeIn">
          <p className="text-blue-400/80 text-sm font-medium tracking-wider uppercase animate-pulse">
            Conectando ao servidor seguro...
          </p>
        </div>
      )}
      
      {!loading && (
        <p className="absolute bottom-4 text-gray-600 text-xs">
            © 2026 Cellavita - Todos os direitos reservados.
        </p>
      )}
    </div>
  );
}