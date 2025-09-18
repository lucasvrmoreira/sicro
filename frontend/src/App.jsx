// src/App.jsx
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Saldo from "./pages/saldo.jsx";
import Entrada from "./pages/entrada.jsx";
import Saida from "./pages/saida.jsx";
import Home from "./pages/Home.jsx";
import { getToken, isTokenValid } from "./utils/auth";

// 🔹 Proteção de rotas
function RequireAuth({ children }) {
  const token = getToken();

  // Se não tem token válido → limpa e manda pro login
  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // Se entrou pela raiz "/" → redireciona pro /home
  if (window.location.pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  // Se já está em /home, /saldo, /entrada ou /saida → deixa seguir
  return children;
}

// 🔹 Layout com navbar e botão de logout
function AppLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="flex items-center justify-between p-4 bg-gray-800">
        {/* Espaço vazio à esquerda */}
        <div className="w-24"></div>

        {/* Menus centralizados */}
        <div className="flex gap-4 justify-center flex-1">
          <Link class="text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800" to="/home">Home</Link>
          <Link class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800" to="/saldo">Saldo</Link>
          <Link class="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800" to="/entrada">Entrada</Link>
          <Link class="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900" to="/saida">Saída</Link>
        </div>

        {/* Botão Sair alinhado à direita */}
        <button
          onClick={handleLogout}
          class="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
        >
          Sair
        </button>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}

// 🔹 Rotas
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Home protegido */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout>
              <Home />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/home"
        element={
          <RequireAuth>
            <AppLayout>
              <Home />
            </AppLayout>
          </RequireAuth>
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/saldo"
        element={
          <RequireAuth>
            <AppLayout>
              <Saldo />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/entrada"
        element={
          <RequireAuth>
            <AppLayout>
              <Entrada />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/saida"
        element={
          <RequireAuth>
            <AppLayout>
              <Saida />
            </AppLayout>
          </RequireAuth>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
