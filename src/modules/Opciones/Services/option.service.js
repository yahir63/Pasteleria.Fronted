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