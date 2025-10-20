import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !isTokenValid()) {
      localStorage.removeItem("access_token");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <h1 className="text-2xl md:text-4xl font-bold text-white-400 drop-shadow-lg">
      Bem-vindo ao <span className="text-white">Sistema Sicro</span>
    </h1>

  );
}

export default Home;
