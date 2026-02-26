import { Routes, Route, Navigate } from "react-router-dom";

// Telas (Pages)
import Login from "./pages/login.jsx";
import Home from "./pages/Home.jsx";
import Saldo from "./pages/saldo.jsx";
import Entrada from "./pages/entrada.jsx";
import Saida from "./pages/saida.jsx";
import Historico from "./pages/Historico.jsx";
import Planejamento from "./pages/Planejamento.jsx";

// Componentes Globais e Layouts
import RequireAuth from "./components/RequireAuth.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rotas Protegidas que usam o Layout com Navbar */}
      <Route path="/" element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />
      <Route path="/home" element={<RequireAuth><AppLayout><Home /></AppLayout></RequireAuth>} />
      <Route path="/saldo" element={<RequireAuth><AppLayout><Saldo /></AppLayout></RequireAuth>} />
      <Route path="/entrada" element={<RequireAuth><AppLayout><Entrada /></AppLayout></RequireAuth>} />
      <Route path="/saida" element={<RequireAuth><AppLayout><Saida /></AppLayout></RequireAuth>} />
      <Route path="/historico" element={<RequireAuth><AppLayout><Historico /></AppLayout></RequireAuth>} />
      <Route path="/planejamento" element={<RequireAuth><AppLayout><Planejamento /></AppLayout></RequireAuth>} />
      
      {/* Qualquer rota que não exista, manda de volta pro início */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}