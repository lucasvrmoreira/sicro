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
    <div className="text-white text-center mt-10">
      <h1 className="text-3xl font-bold">Bem-vindo ao Sistema Sicro</h1>
    </div>
  );
}

export default Home;
