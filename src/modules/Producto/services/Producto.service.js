import { getToken } from "/src/modules/Login/components/Services/login.Service.js";
const API_BASE = "https://localhost:7249/api/products";

export async function getAll(pagina = 1, nombre = "", estado = "") {
  const params = new URLSearchParams({ PageNumber: pagina, PageSize: 8 });
  if (nombre) params.append("Name", nombre);
  if (estado !== "") params.append("IsActive", estado);
  const token = getToken();
  const res = await fetch(`${API_BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener productos");
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
    const msgs = Array.isArray(err) ? err.join("\n") : err.Errors?.join("\n") ?? "Error al crear producto";
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
    const msgs = Array.isArray(err) ? err.join("\n") : err.Errors?.join("\n") ?? "Error al actualizar producto";
    throw new Error(msgs);
  }
}

export async function toggleEstado(id) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Error al cambiar estado");
}