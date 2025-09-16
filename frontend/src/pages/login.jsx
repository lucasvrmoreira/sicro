import { useState, useEffect } from "react";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(true); // controla mensagem
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000); // 3 segundos
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post(
        "/token",
        new URLSearchParams({
          username,
          password,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const token = res.data.access_token;
      localStorage.setItem("token", token);

      window.location.href = "/saldo";
    } catch (err) {
      setError("Usuário ou senha incorretos");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-950 text-white">
      {/* Logo no fundo */}
      <img
        src={logo}
        alt="Logo"
        className="absolute inset-0 m-auto w-[600px] max-h-screen opacity-20 block"
      />

      {/* Mensagem de boas-vindas */}
      {showWelcome && (
        <div className="absolute top-10 text-center animate-fade-in-out">
          <h2 className="text-xl font-bold">Bem-vindo ao SICRO</h2>
          <p className="text-gray-300 text-sm">
            Sistema de Controle de Roupas Estéreis Cellavita
          </p>
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleLogin}
        className="relative bg-black bg-opacity-70 p-6 rounded-xl shadow-lg w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>

        {error && <p className="text-red-400 mb-2 text-center">{error}</p>}

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
          className="w-full p-2 mb-3 rounded bg-gray-800 border border-gray-600"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
