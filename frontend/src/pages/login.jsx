// src/pages/login.jsx
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

  // 🔹 Se já tiver token válido e abrir /login, redireciona para /home
  useEffect(() => {
    const token = getToken();
    if (isTokenValid(token)) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  // Animação de boas-vindas
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


      // 🔹 Após login bem-sucedido, sempre vai para /home
      navigate("/home", { replace: true });
    } catch (err) {
      setError("Usuário ou senha incorretos");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      {/* Logo no fundo */}
      <img
        src="/logo.png"
        alt="Logo"
        className="absolute inset-0 m-auto w-[80%] max-w-[300px] md:max-w-[500px] opacity-20 object-contain"
      />


      {/* Mensagem de boas-vindas */}
      {showWelcome && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-md text-center w-[90%] max-w-md">
          <h2 className="text-2xl font-bold text-blue-400">Bem-vindo ao SICRO</h2>
          <p className="text-gray-300 text-sm">
            Sistema de Controle de Roupas Estéreis Cellavita
          </p>
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleLogin}
        className="relative bg-black/50 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-lg w-[90%] max-w-md"
      >

        <h1 className="text-3xl font-bold mb-4 text-center">Login</h1>

        {error && (
          <div className="mb-3 p-2 bg-red-900/50 border border-red-500 text-red-300 text-sm rounded text-center">
            ⚠️ {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-600"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 md:p-3 mb-3 rounded bg-gray-800 border border-gray-600 text-sm md:text-base"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 md:p-3 text-sm md:text-base rounded font-semibold flex justify-center items-center"
        >
          {loading ? (
            <Lottie animationData={cosmosAnimation} loop={true} className="w-8 h-8" />
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      {/* 🔹 Mensagem abaixo do formulário */}
      {loading && (
        <div className="absolute bottom-6 w-full flex flex-col items-center px-4">
          <span className="text-2xl animate-bounce">⏳</span>
          <p className="text-blue-400 font-semibold text-lg tracking-wide mt-2 animate-pulse">
            Aguarde, conectando ao servidor...
          </p>
        </div>
      )}
    </div>
  );
}
