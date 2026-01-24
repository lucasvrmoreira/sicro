import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Saldo from "./pages/saldo.jsx";
import Entrada from "./pages/entrada.jsx";
import Saida from "./pages/saida.jsx";
import Home from "./pages/Home.jsx";
import Historico from "./pages/Historico.jsx";
import Planejamento from "./pages/Planejamento.jsx";
import { getToken, isTokenValid } from "./utils/auth";

// 🔹 Proteção de rotas
function RequireAuth({ children }) {
  const token = getToken();

  if (!isTokenValid(token)) {
    localStorage.removeItem("access_token");
    return <Navigate to="/login" replace />;
  }

  if (window.location.pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

// 🔹 Componente auxiliar de Link (Atualizado com cor 'teal' para Planejamento)
function NavLink({ to, children, colorClass }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  const baseStyle = `font-medium rounded-lg text-sm px-4 py-2 border transition-all duration-200 focus:ring-4 focus:outline-none`;
  
  return (
    <Link 
      to={to} 
      className={`
        ${baseStyle} 
        ${isActive ? 'bg-opacity-100 text-white' : 'bg-transparent'} 
        ${colorClass === 'gray' ? `border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white ${isActive ? 'bg-gray-700 border-gray-700' : ''}` : ''} 
        ${colorClass === 'blue' ? `border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white ${isActive ? 'bg-blue-600 border-blue-600' : ''}` : ''} 
        ${colorClass === 'green' ? `border-green-600 text-green-500 hover:bg-green-600 hover:text-white ${isActive ? 'bg-green-600 border-green-600' : ''}` : ''} 
        ${colorClass === 'red' ? `border-red-600 text-red-500 hover:bg-red-600 hover:text-white ${isActive ? 'bg-red-600 border-red-600' : ''}` : ''} 
        ${colorClass === 'purple' ? `border-purple-600 text-purple-500 hover:bg-purple-600 hover:text-white ${isActive ? 'bg-purple-600 border-purple-600' : ''}` : ''}
        ${colorClass === 'teal' ? `border-teal-500 text-teal-400 hover:bg-teal-600 hover:text-white ${isActive ? 'bg-teal-600 border-teal-600' : ''}` : ''}
      `}
    >
      {children}
    </Link>
  );
}

// 🔹 Layout Principal (Com o novo item no menu)
function AppLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <nav className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-blue-500">Sicro</span>
            <span className="text-gray-500 text-sm font-normal hidden sm:block">| Controle Estéril</span>
          </div>

          {/* MENU ATUALIZADO AQUI */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <NavLink to="/home" colorClass="gray">Home</NavLink>
            <NavLink to="/saldo" colorClass="blue">Saldo</NavLink>
            <NavLink to="/entrada" colorClass="green">Entrada</NavLink>
            <NavLink to="/saida" colorClass="red">Saída</NavLink>
            <NavLink to="/historico" colorClass="purple">Histórico</NavLink>
            {/* Novo Botão */}
            <NavLink to="/planejamento" colorClass="teal">Planejamento</NavLink>
          </div>

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 text-sm font-medium transition flex items-center gap-1"
          >
            Sair
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="p-4 md:p-6 w-full max-w-7xl mx-auto animate-fadeIn">
        {children}
      </main>
    </div>
  );
}

// 🔹 Rotas
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />
      <Route path="/home" element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />
      <Route path="/saldo" element={<RequireAuth><AppLayout><Saldo /></AppLayout></RequireAuth>} />
      <Route path="/entrada" element={<RequireAuth><AppLayout><Entrada /></AppLayout></RequireAuth>} />
      <Route path="/saida" element={<RequireAuth><AppLayout><Saida /></AppLayout></RequireAuth>} />
      <Route path="/historico" element={<RequireAuth><AppLayout><Historico /></AppLayout></RequireAuth>} />
      <Route path="/planejamento" element={<RequireAuth><AppLayout><Planejamento /></AppLayout></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}