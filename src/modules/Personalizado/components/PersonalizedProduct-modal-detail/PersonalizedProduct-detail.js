import { getById } from "/src/modules/Personalizado/services/personalizedProduct.service.js";

function cerrar() {
  document.getElementById("detailPersonalizedModal").classList.remove("active");
}

window.AbrirDetailPersonalized = async function (id) {
  const modal = document.getElementById("detailPersonalizedModal");
  modal.classList.add("active");

  // Limpiar mientras carga
  document.getElementById("detailCliente").textContent     = "Cargando...";
  document.getElementById("detailFecha").textContent       = "—";
  document.getElementById("detailProducto").textContent    = "—";
  document.getElementById("detailDescripcion").textContent = "—";
  document.getElementById("detailOpcionesBody").innerHTML  = "";
  document.getElementById("detailPrecioTotal").textContent = "$0.00";

  try {
    const p = await getById(id);

    document.getElementById("detailCliente").textContent =
      p.customerName ?? "—";
    document.getElementById("detailFecha").textContent =
      new Date(p.creationDate).toLocaleDateString("es-NI");
   document.getElementById("detailProducto").textContent = 
   p.productName ?? "—";        
    document.getElementById("detailDescripcion").textContent =
      p.description || "Sin descripción";

    const tbody = document.getElementById("detailOpcionesBody");
    tbody.innerHTML = "";

    if (!p.personalizationDetails || p.personalizationDetails.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888">Sin opciones</td></tr>`;
    } else {
      p.personalizationDetails.forEach(op => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${op.name}</td>
          <td>${op.quantity}</td>
          <td>$${op.salePrice.toFixed(2)}</td>
          <td>$${op.subTotal.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    document.getElementById("detailPrecioTotal").textContent =
      `$${p.salePrice.toFixed(2)}`;

  } catch (err) {
    document.getElementById("detailCliente").textContent = "Error al cargar";
    console.error(err);
  }
};

document.getElementById("closeDetailPersonalized")
  .addEventListener("click", cerrar);
window.addEventListener("click", e => {
  if (e.target === document.getElementById("detailPersonalizedModal")) cerrar();
});