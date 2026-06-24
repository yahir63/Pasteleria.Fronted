export function init(state) {
  // ─── Referencias del DOM con IDs estándar del componente ───────────────────
  const modal          = document.getElementById("modalViewDetalle");
  const txtCliente     = document.getElementById("view-cliente");
  const txtFecha       = document.getElementById("view-fecha");
  const txtTimeDelivery = document.getElementById("view-time-delivery");
  const txtEstado      = document.getElementById("view-estado");
  const txtTotal        = document.getElementById("view-total");
  const txtAdelanto     = document.getElementById("view-adelanto");
  const tablaProductos = document.getElementById("view-details-body");
  const btnX           = document.getElementById("close-view-Detalle");
  const btnClose       = document.getElementById("btn-close-view");

const MAPA_ESTADOS = {
    1: "Pendiente",
    2: "Cancelado",
    3: "Abortado"
};

  // ─── Lógica para cerrar el modal ───────────────────────────────────────────
  const cerrarModal = () => {
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    }
  };

  if (btnX) btnX.addEventListener("click", cerrarModal);
  if (btnClose) btnClose.addEventListener("click", cerrarModal);

  // ─── Asignación de la acción global llamada desde Pedidos.js ───────────────
  state.abrirModalDetalle = (pedido) => {
    console.log("PEDIDO COMPLETO:", JSON.stringify(pedido));
    console.log("PRIMER DETALLE:", JSON.stringify(pedido.orderDetails?.[0]));
    console.log("Datos recibidos en el modal de detalle:", pedido);

    // 1. Inyectar datos generales del pedido mapeando las propiedades de la API
    if (txtCliente) txtCliente.textContent = pedido.customerName || "No especificado";
    
    if (txtFecha) {
      const fechaOriginal = pedido.orderDate || pedido.timeDelivery;
      if (fechaOriginal) {
        // Corta el formato de fecha ISO para mostrar solo la fecha limpia
        txtFecha.textContent = fechaOriginal.split("T")[0]; 
      } else {
        txtFecha.textContent = "No especificada";
      }
    }

    if (txtTimeDelivery)
      txtTimeDelivery.textContent = pedido.timeDelivery
        ? pedido.timeDelivery.split("T")[0]
        : "No especificada";
    
    if (txtEstado) {
      // Usamos el mapa para obtener el nombre. 
      // Si el número no existe en el mapa, muestra "Desconocido" o el mismo valor.
      const estadoId = pedido.isActive; // Asumiendo que 'status' trae el número (1, 2, 3...)
      txtEstado.textContent = MAPA_ESTADOS[estadoId] || "Desconocido";
    }
    // 2. Renderizar los productos asociados al pedido (orderDetails)
    if (tablaProductos) {
      tablaProductos.innerHTML = "";
      
      // Mapea la propiedad exacta del arreglo de productos de la base de datos
      const detalles = pedido.orderDetails || [];
      let totalCalculado = 0;

      if (detalles.length === 0) {
        tablaProductos.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">No hay productos asignados</td></tr>`;
      } else {
        detalles.forEach(d => {
          const precio   = d.salePrice ?? 0;
          const cantidad = d.quantity  ?? 0;
          const subtotal = d.total     ?? 0;  // viene de la BD

          totalCalculado += subtotal;

          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${d.productName || `Producto #${d.productId}`}</td>
            <td>${d.quantity ?? 0}</td>
            <td>${d.volume || "-"}</td>
            <td>C$ ${precio.toFixed(2)}</td>
            <td>C$ ${subtotal.toFixed(2)}</td>
          `;
          tablaProductos.appendChild(fila);
        });
      }
      
      // ── Totales ────────────────────────────────────────────────
      const adelanto = totalCalculado * 0.5;

      if (txtTotal)
        txtTotal.textContent    = `C$ ${totalCalculado.toFixed(2)}`;
      if (txtAdelanto)
        txtAdelanto.textContent = `C$ ${adelanto.toFixed(2)}`;

    }
    
    

    // 3. Mostrar visualmente el modal añadiendo la clase show
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden"; // Bloquea el scroll del fondo
    } else {
      console.error("No se encontró el elemento con ID 'modalViewDetalle' en el DOM.");
    }
  };
}