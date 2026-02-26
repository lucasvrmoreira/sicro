import { Navigate } from "react-router-dom";
import { getToken, isTokenValid } from "../utils/auth";

export default function RequireAuth({ children }) {
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