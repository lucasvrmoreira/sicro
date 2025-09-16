import { useState } from "react";
import { login } from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const tokenData = await login(username, password); // chama api.js
      const token = tokenData.access_token;

      // Decodifica payload do JWT (a parte do meio do token)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiration = payload.exp * 1000; // converte segundos -> ms

      // Salva token + expiração no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("token_exp", expiration);

      // Redireciona
      window.location.href = "/saldo";
    } catch (err) {
      alert("Usuário ou senha incorretos");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Login - SICRO
        </h2>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white focus:outline-none"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 rounded bg-gray-800 text-white focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
