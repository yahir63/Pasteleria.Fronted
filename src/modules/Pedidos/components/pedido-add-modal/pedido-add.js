import { create } from "/src/modules/Pedidos/Service/Pedidos.Service.js";

export function init(state) {

  const modal         = document.getElementById("modalAddPedido");
  const tabla         = document.getElementById("add-details-body");
  const inputCantidad = document.getElementById("add-cantidad");
  const inputVolumen  = document.getElementById("add-volumen");
  const inputFecha    = document.getElementById("add-time-delivery");
  const btnAddDetalle = document.getElementById("btn-add-detalle");
  const btnGuardar    = document.getElementById("btn-save-pedido");
  const btnCancelar   = document.getElementById("btn-cancel-add");
  const btnClose      = document.getElementById("close-add-pedido");

  const detalles = [];
  const preciosProductos = {};
  let selectedCliente               = null;
  let selectedProductoNormal        = null;
  let selectedProductoPersonalizado = null;
  let tipoActual = "normal";

  // ── Tabs ────────────────────────────────────────────────────
  document.querySelectorAll(".tipo-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tipo-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      tipoActual = tab.dataset.tipo;
      document.getElementById("seccion-normal").style.display       = tipoActual === "normal" ? "" : "none";
      document.getElementById("seccion-personalizado").style.display = tipoActual === "personalizado" ? "" : "none";
    });
  });

  // ── Buscador genérico ───────────────────────────────────────
  function crearBuscador({ inputId, dropdownId, hiddenId, fetchFn, labelFn, valueFn, onSelect }) {
    const input    = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    const hidden   = hiddenId ? document.getElementById(hiddenId) : null;
    let timer      = 0;

    input.addEventListener("input", () => {
      clearTimeout(timer);
      const texto = input.value.trim();
      if (!texto) {
        dropdown.classList.remove("show");
        dropdown.innerHTML = "";
        if (hidden) hidden.value = "";
        return;
      }
      timer = setTimeout(async () => {
        try {
          const data  = await fetchFn(1, texto);
          const items = data.items ?? [];
          dropdown.innerHTML = "";
          if (items.length === 0) {
            dropdown.innerHTML = `<li class="no-results">Sin resultados</li>`;
          } else {
            items.forEach(item => {
              const li = document.createElement("li");
              li.textContent = labelFn(item);
              li.addEventListener("click", () => {
                input.value = labelFn(item);
                if (hidden) hidden.value = valueFn(item);
                dropdown.classList.remove("show");
                dropdown.innerHTML = "";
                if (onSelect) onSelect(item);
              });
              dropdown.appendChild(li);
            });
          }
          dropdown.classList.add("show");
        } catch (err) { console.error("Error búsqueda:", err); }
      }, 300);
    });

    document.addEventListener("click", e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target))
        dropdown.classList.remove("show");
    });
  }

  // ── Cargar precios del inventario ───────────────────────────
  async function cargarInventario() {
    try {
      let pagina = 1;
      let hasNext = true;
      while (hasNext) {
        const res  = await fetch(`https://localhost:7249/api/Inventory?PageNumber=${pagina}&PageSize=100`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        const items = data.value?.items ?? [];
        items.forEach(i => {
          preciosProductos[i.productId] = i.salePrice ?? 0;
        });
        hasNext = data.value?.hasNextPage ?? false;
        pagina++;
      }
    } catch (err) { console.error("Error cargando inventario:", err); }
  }

  // ── Iniciar buscadores ──────────────────────────────────────
  function iniciarBuscadores() {
    // Cliente
    crearBuscador({
      inputId:    "inputCliente",
      dropdownId: "dropdownCliente",
      hiddenId:   "selectedClienteId",
      fetchFn:    (pagina, nombre) => fetch(
        `https://localhost:7249/api/customers?PageNumber=${pagina}&PageSize=8&Name=${nombre}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(r => r.json()).then(d => d.value),
      labelFn:  c => c.customerName,
      valueFn:  c => c.customerId,
      onSelect: c => { selectedCliente = c; },
    });

    // Producto normal
    crearBuscador({
      inputId:    "inputProductoNormal",
      dropdownId: "dropdownProductoNormal",
      hiddenId:   "selectedProductoNormalId",
      fetchFn:    (pagina, nombre) => fetch(
        `https://localhost:7249/api/products?PageNumber=${pagina}&PageSize=8&Name=${nombre}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(r => r.json()).then(d => d.value),
      labelFn:  p => {
        const precio = preciosProductos[p.productId];
        return precio !== undefined
          ? `${p.productName} — C$ ${precio.toFixed(2)}`
          : p.productName;
      },
      valueFn:  p => p.productId,
      onSelect: p => { selectedProductoNormal = p; },
    });

    // Producto personalizado
    crearBuscador({
      inputId:    "inputProductoPersonalizado",
      dropdownId: "dropdownProductoPersonalizado",
      hiddenId:   "selectedProductoPersonalizadoId",
      fetchFn:    (pagina, nombre) => fetch(
        `https://localhost:7249/api/personalizedproducts?PageNumber=${pagina}&PageSize=8&CustomerName=${nombre}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(r => r.json()).then(d => d.value),
      labelFn:  p => `${p.customerName} — ${p.description ?? "Sin descripción"} (C$ ${p.salePrice.toFixed(2)})`,
      valueFn:  p => p.personalizedId,
      onSelect: p => { selectedProductoPersonalizado = p; },
    });
  }

  // ── Tabla de detalles ───────────────────────────────────────
  const renderizarTabla = () => {
    tabla.innerHTML = "";
    let totalCalculado = 0;

    if (detalles.length === 0) {
      tabla.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;padding:16px;">Sin productos agregados</td></tr>`;
    }

    detalles.forEach((item, index) => {
      const subtotal = item.salePrice * item.quantity * (item.volume || 1);
      totalCalculado += subtotal;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${item.volume}</td>
        <td>C$ ${item.salePrice.toFixed(2)}</td>
        <td>C$ ${subtotal.toFixed(2)}</td>
        <td><button class="btn-quitar" data-index="${index}">✕</button></td>`;
      tabla.appendChild(fila);
    });

    tabla.querySelectorAll(".btn-quitar").forEach(btn => {
      btn.addEventListener("click", () => {
        detalles.splice(parseInt(btn.dataset.index), 1);
        renderizarTabla();
      });
    });

    const totalInput    = document.getElementById("add-total");
    const adelantoInput = document.getElementById("add-adelanto");
    if (totalInput)    totalInput.value    = `C$ ${totalCalculado.toFixed(2)}`;
    if (adelantoInput) adelantoInput.value = `C$ ${(totalCalculado * 0.5).toFixed(2)}`;
  };

  // ── Agregar producto normal ─────────────────────────────────
  btnAddDetalle.addEventListener("click", () => {
    const id       = parseInt(document.getElementById("selectedProductoNormalId").value);
    const cantidad = parseInt(inputCantidad.value);
    const volumen  = parseInt(inputVolumen.value);

    if (!id || !selectedProductoNormal) { alert("Selecciona un producto"); return; }
    if (!cantidad || cantidad <= 0)     { alert("Ingresa una cantidad válida"); return; }
    if (!volumen  || volumen  <= 0)     { alert("Ingresa un volumen válido"); return; }

    const precio = preciosProductos[id] ?? 0;

    detalles.push({
      productId:   id,
      productName: selectedProductoNormal.productName,
      salePrice:   precio,
      quantity:    cantidad,
      volume:      volumen,
    });

    document.getElementById("inputProductoNormal").value      = "";
    document.getElementById("selectedProductoNormalId").value = "";
    selectedProductoNormal = null;
    inputCantidad.value = "";
    inputVolumen.value  = "";
    renderizarTabla();
  });

  // ── Agregar producto personalizado ──────────────────────────
  document.getElementById("btn-add-detalle-pers").addEventListener("click", () => {
    const id       = parseInt(document.getElementById("selectedProductoPersonalizadoId").value);
    const cantidad = parseInt(document.getElementById("add-cantidad-pers").value);
    const volumen  = parseInt(document.getElementById("add-volumen-pers").value) || 1;

    if (!id || !selectedProductoPersonalizado) { alert("Selecciona un producto personalizado"); return; }
    if (!cantidad || cantidad <= 0)            { alert("Ingresa una cantidad válida"); return; }

    detalles.push({
      productId:   id,
      productName: `${selectedProductoPersonalizado.customerName} — ${selectedProductoPersonalizado.description ?? "Personalizado"}`,
      salePrice:   selectedProductoPersonalizado.salePrice,
      quantity:    cantidad,
      volume:      volumen,
    });

    document.getElementById("inputProductoPersonalizado").value      = "";
    document.getElementById("selectedProductoPersonalizadoId").value = "";
    selectedProductoPersonalizado = null;
    document.getElementById("add-cantidad-pers").value = "";
    document.getElementById("add-volumen-pers").value  = "";
    renderizarTabla();
  });

  // ── Limpiar ─────────────────────────────────────────────────
  const limpiar = () => {
    inputCantidad.value = "";
    inputVolumen.value  = "";
    inputFecha.value    = "";
    detalles.length     = 0;

    ["inputCliente", "inputProductoNormal", "inputProductoPersonalizado"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    ["selectedClienteId", "selectedProductoNormalId", "selectedProductoPersonalizadoId"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    selectedCliente               = null;
    selectedProductoNormal        = null;
    selectedProductoPersonalizado = null;

    document.querySelectorAll(".tipo-tab").forEach((t, i) => t.classList.toggle("active", i === 0));
    document.getElementById("seccion-normal").style.display       = "";
    document.getElementById("seccion-personalizado").style.display = "none";
    tipoActual = "normal";

    renderizarTabla();
  };

  // ── Abrir ───────────────────────────────────────────────────
  state.abrirModalAdd = async () => {
    limpiar();
    inputFecha.value = new Date().toISOString().split("T")[0];
    const inputFechaInicio = document.getElementById("txtFechaInicio");
    if (inputFechaInicio) inputFechaInicio.value = new Date().toLocaleDateString();
    await cargarInventario();
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  // ── Cerrar ──────────────────────────────────────────────────
  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    limpiar();
  };

  btnCancelar.addEventListener("click", () => {
    if (confirm("¿Seguro que desea salir sin guardar?")) cerrar();
  });
  btnClose.addEventListener("click", cerrar);

  // ── Guardar ─────────────────────────────────────────────────
  btnGuardar.addEventListener("click", async () => {
    const clienteId = parseInt(document.getElementById("selectedClienteId").value);
    if (!clienteId)            { alert("Seleccione un cliente"); return; }
    if (detalles.length === 0) { alert("Agregue al menos un producto"); return; }
    if (!inputFecha.value)     { alert("Seleccione una fecha de entrega"); return; }

    const body = {
      customerId:   clienteId,
      timeDelivery: inputFecha.value,
      orderDetails: detalles.map(d => ({
        productId: d.productId,
        quantity:  d.quantity,
        volume:    d.volume,
        salePrice: d.salePrice,
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

  // ── Init ────────────────────────────────────────────────────
  iniciarBuscadores();
}