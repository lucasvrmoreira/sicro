// src/utils/auth.js
export function getToken() {
  return localStorage.getItem("token");
}

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp é em segundos; Date.now() em ms
    return payload?.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
