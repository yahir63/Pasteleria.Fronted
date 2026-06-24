import { update } from "/src/modules/Pedidos/Service/Pedidos.Service.js";

export function init(state) {
  const modal           = document.getElementById("modalEdit");
  const editCliente     = document.getElementById("editCliente");
  const editFecha       = document.getElementById("editFecha");
  const editFechaInicio = document.getElementById("edit-fecha-inicio");
  const editTotal       = document.getElementById("edit-total-readonly");
  const editAdelanto    = document.getElementById("edit-adelanto-readonly");
  const productoSelect  = document.getElementById("edit-producto");
  const inputCantidad   = document.getElementById("edit-cantidad");
  const inputVolumen    = document.getElementById("edit-volumen");
  const btnAddDetalle   = document.getElementById("btn-add-edit-detalle");
  const tabla           = document.getElementById("edit-details-body");
  const btnGuardar      = document.getElementById("btn-save-edit");
  const btnCancelar     = document.getElementById("btn-cancel-edit");

  let detalles = [];

  // ── Renderizar tabla ────────────────────────────────────────────
  const renderizarTabla = () => {
    tabla.innerHTML = "";
    let total = 0;

    detalles.forEach((item, index) => {
      const subtotal = (item.salePrice ?? 0) * item.quantity;
      total += subtotal;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${item.volume}</td>
        <td>C$ ${subtotal.toFixed(2)}</td>
        <td>
          <button class="btn-quitar delete" data-index="${index}">✕</button>
        </td>`;
      tabla.appendChild(fila);
    });

    tabla.querySelectorAll(".btn-quitar").forEach(btn => {
      btn.addEventListener("click", () => {
        detalles.splice(parseInt(btn.dataset.index), 1);
        renderizarTabla();
      });
    });

    if (editTotal)    editTotal.textContent    = `C$ ${total.toFixed(2)}`;
    if (editAdelanto) editAdelanto.textContent = `C$ ${(total * 0.5).toFixed(2)}`;
  };

  // ── Cerrar ──────────────────────────────────────────────────────
  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    detalles = [];
  };

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  // ── Abrir ───────────────────────────────────────────────────────
  state.abrirModalEdit = async (data) => {
    detalles = [];

    try { await cargarClientes(); } catch(e) { console.error(e); }
    try { await cargarProductos(); } catch(e) { console.error(e); }

    // Pre-llenar cliente
    const opcion = [...editCliente.options]
      .find(o => o.textContent === data.cliente);
    if (opcion) editCliente.value = opcion.value;

    // Fecha inicio (solo lectura)
    if (editFechaInicio)
      editFechaInicio.textContent = data.fecha ? data.fecha.split("T")[0] : "";

    // Fecha entrega (editable)
    editFecha.value = data.fecha ? data.fecha.split("T")[0] : "";

    // Cargar detalles existentes del pedido
    const pedido = JSON.parse(data.pedido ?? "{}");
    if (pedido.orderDetails) {
      detalles = pedido.orderDetails.map(d => ({
        productId:   d.productId,
        productName: d.productName,
        quantity:    d.quantity,
        volume:      d.volume,
        salePrice:   d.salePrice,
      }));
    }

    renderizarTabla();
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  // ── Agregar producto ────────────────────────────────────────────
 btnAddDetalle.addEventListener("click", () => {
  if (!productoSelect.value || !inputCantidad.value || !inputVolumen.value) {
    alert("Complete producto, cantidad y volumen"); return;
  }
  if (Number(inputCantidad.value) <= 0 || Number(inputVolumen.value) <= 0) {
    alert("Cantidad y volumen deben ser mayores a 0"); return;
  }

  const productId = parseInt(productoSelect.value);
  const precio    = preciosProductos[productId] ?? 0;

  detalles.push({
    productId,
    productName: productoSelect.options[productoSelect.selectedIndex].text,
    quantity:    parseInt(inputCantidad.value),
    volume:      parseInt(inputVolumen.value),
    salePrice:   precio,
  });

  renderizarTabla();
  productoSelect.value = "";
  inputCantidad.value  = "";
  inputVolumen.value   = "";
});
  // ── Guardar ─────────────────────────────────────────────────────
  btnGuardar.addEventListener("click", async () => {
    if (!editCliente.value)  { alert("Seleccione un cliente"); return; }
    if (detalles.length === 0) { alert("Agregue al menos un producto"); return; }

    const body = {
      orderId:      state.pedidoEditandoId,
      customerId:   parseInt(editCliente.value),
      timeDelivery: editFecha.value,
      orderDetails: detalles.map(d => ({
        productId: d.productId,
        quantity:  d.quantity,
        volume:    d.volume,
      })),
    };

    try {
      await update(body);
      alert("Pedido actualizado correctamente");
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message ?? "Error al actualizar el pedido");
    }
  });

  // ── Cargar clientes ─────────────────────────────────────────────
  async function cargarClientes() {
    const res = await fetch("https://localhost:7249/api/customers", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (!res.ok) throw new Error("Error al cargar clientes");
    const data = await res.json();
    editCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
    (data.value?.items ?? []).forEach(c => {
      const opt = document.createElement("option");
      opt.value       = c.customerId;
      opt.textContent = c.customerName ?? c.name;
      editCliente.appendChild(opt);
    });
  }

 const preciosProductos = {};

async function cargarProductos() {
  try {
    // Cargar inventario para precios
    const resI = await fetch("https://localhost:7249/api/Inventory", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (resI.ok) {
      const dataI = await resI.json();
      (dataI.value?.items ?? []).forEach(i => {
        preciosProductos[i.productId] = i.salePrice ?? 0;
      });
    }

    // Cargar productos
    const resP = await fetch("https://localhost:7249/api/products", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (!resP.ok) throw new Error("Error al cargar productos");
    const dataP = await resP.json();

    productoSelect.innerHTML = '<option value="">Seleccione un producto</option>';
    (dataP.value?.items ?? []).forEach(p => {
      const opt = document.createElement("option");
      opt.value       = p.productId ?? p.id;
      opt.textContent = p.productName ?? p.name;
      productoSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}
}