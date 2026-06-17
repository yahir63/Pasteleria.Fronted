const API_BASE = "https://localhost:7249/api/Auth";

export async function login(userName, password) {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    const msgs = err.Errors?.join("\n") ?? "Usuario o contraseña incorrectos";
    throw new Error(msgs);
  }

  const json = await res.json();

  localStorage.setItem("user", JSON.stringify(json));

  return json;
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}