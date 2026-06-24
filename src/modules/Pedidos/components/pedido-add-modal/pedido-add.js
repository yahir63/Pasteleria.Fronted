import { create } from "/src/modules/Pedidos/Service/Pedidos.Service.js";

export function init(state) {

  const modal          = document.getElementById("modalAddPedido");
  const tabla          = document.getElementById("add-details-body");
  const clienteSelect  = document.getElementById("add-cliente");
  const productoSelect = document.getElementById("add-producto");
  const inputCantidad  = document.getElementById("add-cantidad");
  const inputVolumen   = document.getElementById("add-volumen");
  const inputFecha     = document.getElementById("add-time-delivery");
  const btnAddDetalle  = document.getElementById("btn-add-detalle");
  const btnGuardar     = document.getElementById("btn-save-pedido");
  const btnCancelar    = document.getElementById("btn-cancel-add");
  const btnClose       = document.getElementById("close-add-pedido");


  const detalles = [];

  // ── Tabla de detalles ───────────────────────────────────────────
  const renderizarTabla = () => {
  tabla.innerHTML = "";
  let totalCalculado = 0;

  detalles.forEach((item, index) => {
    const subtotal = item.salePrice * item.quantity;
    totalCalculado += subtotal;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>${item.volume}</td>
      <td>C$ ${item.salePrice.toFixed(2)}</td>
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

  // Actualizar totales
  const adelanto = totalCalculado * 0.5;
  const subtotalInput  = document.getElementById("add-subtotal");
  const totalInput     = document.getElementById("add-total");
  const adelantoInput  = document.getElementById("add-adelanto");

  if (subtotalInput) subtotalInput.value = `C$ ${totalCalculado.toFixed(2)}`;
  if (totalInput)    totalInput.value    = `C$ ${totalCalculado.toFixed(2)}`;
  if (adelantoInput) adelantoInput.value = `C$ ${adelanto.toFixed(2)}`;
};

  // ── Limpiar ─────────────────────────────────────────────────────
  const limpiar = () => {
    clienteSelect.value  = "";
    productoSelect.value = "";
    inputCantidad.value  = "";
    inputVolumen.value   = "";
    inputFecha.value     = "";
    detalles.length      = 0;
    renderizarTabla();
  };

  // ── Abrir ───────────────────────────────────────────────────────
  state.abrirModalAdd = async () => {
    limpiar();
    inputFecha.value = new Date().toISOString().split("T")[0];
    // Fecha inicio solo lectura
    const inputFechaInicio = document.getElementById("txtFechaInicio");
    inputFechaInicio.value = new Date().toLocaleDateString();

    await Promise.all([cargarClientes(), cargarProductos()]);
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    
  };

  // ── Cerrar ──────────────────────────────────────────────────────
  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    limpiar();
  };

  btnCancelar.addEventListener("click", () => {
    if (confirm("¿Seguro que desea salir sin guardar?")) cerrar();
  });
  btnClose.addEventListener("click", cerrar);

  // ── Agregar producto a la lista ─────────────────────────────────
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
      salePrice:   precio,
      quantity:    parseInt(inputCantidad.value),
      volume:      parseInt(inputVolumen.value),
    });

    renderizarTabla();
    productoSelect.value = "";
    inputCantidad.value  = "";
    inputVolumen.value   = "";
  });

  // ── Guardar ─────────────────────────────────────────────────────
  btnGuardar.addEventListener("click", async () => {
    if (!clienteSelect.value)  { alert("Seleccione un cliente"); return; }
    if (detalles.length === 0) { alert("Agregue al menos un producto"); return; }

    const body = {
      customerId:   parseInt(clienteSelect.value),
      timeDelivery: inputFecha.value, 
      orderDetails: detalles.map(d => ({
        productId: d.productId,
        quantity:  d.quantity,
        volume:    d.volume,
        salePrice: d.salePrice
      })),
    };

    try {
      await create(body);
      alert("Pedido registrado exitosamente");
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message ?? "Error al guardar el pedido");
    }
  });

  // ── Cargar clientes ─────────────────────────────────────────────
  async function cargarClientes() {
    try {
      const res  = await fetch("https://localhost:7249/api/customers");
      const data = await res.json();
      clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
      (data.value?.items ?? []).forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.customerId;
        opt.textContent = c.customerName;
        clienteSelect.appendChild(opt);
      });
    } catch (err) { console.error("Error cargando clientes:", err); }
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