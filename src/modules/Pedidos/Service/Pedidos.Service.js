const API_BASE = "https://localhost:7249/api/Orders";

export async function getAll(page = 1, name = "", estado = "") {
     try{
        const params = new URLSearchParams({PageNumber: page, PageSize: 8,t: Date.now()});
           
        // Fechas por defecto para que el backend responda
        params.append("from", "2000-01-01");
        params.append("to", new Date().toISOString().split("T")[0]);
        if(name) params.append("CustomerName", name);
        if (estado != "") params.append("Status", estado);
        const res= await fetch(`${API_BASE}?${params}`);
        if (!res.ok) throw new Error ("Error al obtener Ordenes")
        const json = await res.json();
        return json.value;
     }
      catch (error) {
      alert("no se pudo registrar el pedido");
      console.error(error);
      throw error; 
     } 
}

export async function create(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    const msgs = err.Errors?.join("\n") ?? "Error al crear Pedido";
    throw new Error(msgs);
  }
  return await res.json();
}

export async function update(data) {
  const res = await fetch(API_BASE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    const msgs = Array.isArray(err.Errors) ? err.Errors.join("\n") : err.message ?? "Error al actualizar el Pedido";
    throw new Error(msgs);
  }
  return await res.json();
}

export async function toggleEstado(data) {

    const res = await fetch(`${API_BASE}/updateStatus`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) // Enviamos el objeto 'dto' completo
    });
 
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        throw new Error("Error al cambiar estado del Pedido");
    }
}