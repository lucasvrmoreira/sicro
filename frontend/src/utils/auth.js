// src/utils/auth.js
export function getToken() {
  return localStorage.getItem("access_token"); // <-- era "token"
}

export function isTokenValid(token) {
  // permite chamar sem argumento (pega do storage)
  token = token ?? getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
