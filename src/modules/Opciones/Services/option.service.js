import { getToken } from "/src/modules/Login/components/Services/login.Service.js";
const API_BASE = "https://localhost:7249/api/options";

export async function getAll(pagina = 1, nombre = "", estado = "") {
  const params = new URLSearchParams({ PageNumber: pagina, PageSize: 100 });
  if (nombre) params.append("Name", nombre);
  if (estado !== "") params.append("IsActive", estado);
  const token = getToken();
  const res = await fetch(`${API_BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener opciones");
  const json = await res.json();
  return json.value;
}

export async function getById(id) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener la opción");
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
    const msgs = err.Errors?.join("\n") ?? "Error al crear la opción";
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
    const msgs = Array.isArray(err.Errors)
      ? err.Errors.join("\n")
      : err.message ?? "Error al actualizar la opción";
    throw new Error(msgs);
  }
  return await res.json();
}

export async function remove(id) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al eliminar la opción");
}