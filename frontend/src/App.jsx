// src/App.jsx
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Saldo from "./pages/saldo.jsx";
import Entrada from "./pages/entrada.jsx";
import Saida from "./pages/saida.jsx";

// Componente para exigir autenticação
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// Layout com navbar e botão de logout
function AppLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar fixa no topo */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 sticky top-0 z-50">
        <div className="flex-1 flex justify-center">
          <nav className="flex gap-4">
            <Link to="/entrada" class="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Entrada</Link>
            <Link to="/saida" class="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900">Saída</Link>
            <Link to="/saldo" class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800">Saldo</Link>

          </nav>
        </div>
        <button
          onClick={logout}
          type="button"
          className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 
               focus:ring-4 focus:outline-none focus:ring-red-300 font-medium 
               rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 
               dark:border-red-500 dark:text-red-500 dark:hover:text-white 
               dark:hover:bg-red-600 dark:focus:ring-red-900"
        >
          Logout
        </button>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas com layout */}
      <Route
        path="/saldo"
        element={<RequireAuth><AppLayout><Saldo /></AppLayout></RequireAuth>}
      />
      <Route
        path="/entrada"
        element={<RequireAuth><AppLayout><Entrada /></AppLayout></RequireAuth>}
      />
      <Route
        path="/saida"
        element={<RequireAuth><AppLayout><Saida /></AppLayout></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
