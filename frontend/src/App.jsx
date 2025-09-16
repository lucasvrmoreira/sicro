import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import Entrada from "./pages/entrada.jsx";
import Saida from "./pages/saida.jsx";
import Saldo from "./pages/saldo.jsx";
import Login from "./pages/login.jsx";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {isAuth && (
        <div className="flex justify-center gap-8 py-4 text-lg font-semibold">
          <Link to="/entrada">Entrada</Link>
          <Link to="/saida">Saída</Link>
          <Link to="/saldo">Saldo</Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setIsAuth(false); // força atualização
              window.location.href = "/login";
            }}
            className="ml-4 text-red-400"
          >
            Logout
          </button>
        </div>
      )}

      <Routes>
        {!isAuth ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
            <Route path="/entrada" element={<Entrada />} />
            <Route path="/saida" element={<Saida />} />
            <Route path="/saldo" element={<Saldo />} />
          </>
        )}
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
