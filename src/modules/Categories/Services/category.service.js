import { getToken } from "/src/modules/Login/components/Services/login.Service.js";
const API_BASE = "https://localhost:7249/api/categories";

export async function getAll(pagina = 1, nombre = "") {
  const params = new URLSearchParams({ PageNumber: pagina, PageSize: 8 });
  if (nombre) params.append("Name", nombre);
  const token = getToken();
  const res = await fetch(`${API_BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener categorías");
  const json = await res.json();
  return json.value;
}

export async function create(data) {
  const token = getToken();
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    const msgs = Array.isArray(err) ? err.join("\n") : "Error al crear categoría";
    throw new Error(msgs);
  }
  return await res.json();
}

export async function update(id, data) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    const msgs = Array.isArray(err) ? err.join("\n") : "Error al actualizar categoría";
    throw new Error(msgs);
  }
}

export async function deactivate(id) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}/deactivate`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al desactivar categoría");
}