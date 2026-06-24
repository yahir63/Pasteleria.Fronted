import { getToken } from "/src/modules/Login/components/Services/login.Service.js";
const API_BASE = "https://localhost:7249/api/personalizedproducts";

export async function getAll(pagina = 1, cliente = "") {
  const params = new URLSearchParams({ PageNumber: pagina, PageSize: 8 });
  if (cliente) params.append("Name", cliente);
  const token = getToken();
  const res = await fetch(`${API_BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener productos personalizados");
  const json = await res.json();
  return json.value;
}

export async function getById(id) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener el producto personalizado");
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
    const msgs = err.Errors?.join("\n") ?? "Error al crear producto personalizado";
    throw new Error(msgs);
  }
  return await res.json();
}