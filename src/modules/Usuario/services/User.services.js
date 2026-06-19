import { API_BASE } from "../../../../app/app.config.js";
import { getToken } from "../../Login/components/Services/login.Service.js";

const token = getToken();

export async function GetUsers(page = 1, name = "", state) {
  const urlParams = new URLSearchParams({ PageNumber: page, PageSize: 8 });
  if (name) urlParams.append("Name", name);
  if (state !== null && state !== undefined) {
    urlParams.append("IsActive", state);
  }
  const response = await fetch(`${API_BASE}/Users?${urlParams}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const apiResponse = await response.json();
  if (!response.ok || apiResponse.isSuccess === false) {
    const msgs = apiResponse.message || "Error al obtener usuarios";
    throw new Error(msgs);
  }

  return apiResponse.value ?? apiResponse;
}

export async function Update(id, data) {
  const response = await fetch(`${API_BASE}/Users/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    const msgs = Array.isArray(err.Errors)
      ? err.Errors.join("\n")
      : "Error al actualizar usuario";
    throw new Error(msgs);
  }
}
export async function deactivate(id) {
  const response = await fetch(`${API_BASE}/Users/${id}/deactivate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    const msgs = Array.isArray(err.Errors)
      ? err.Errors.join("\n")
      : "Error al actualizar usuario";
    throw new Error(msgs);
  }
}
