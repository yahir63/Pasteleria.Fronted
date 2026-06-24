import { update } from "/src/modules/Pedidos/Service/Pedidos.Service.js";

export function init(state) {
  const modal            = document.getElementById("modalEdit");
  const editFecha        = document.getElementById("editFecha");
  const editFechaInicio  = document.getElementById("edit-fecha-inicio");
  const editTotal        = document.getElementById("edit-total-readonly");
  const editAdelanto     = document.getElementById("edit-adelanto-readonly");
  const tabla            = document.getElementById("edit-details-body");
  
  const inputCantidad    = document.getElementById("edit-cantidad");
  const inputVolumen     = document.getElementById("edit-volumen");
  const inputCantidadPers = document.getElementById("edit-cantidad-pers");
  const inputVolumenPers  = document.getElementById("edit-volumen-pers");

  const btnAddDetalle     = document.getElementById("btn-add-edit-detalle");
  const btnAddDetallePers = document.getElementById("btn-add-edit-detalle-pers");
  const btnGuardar        = document.getElementById("btn-save-edit");
  const btnCancelar       = document.getElementById("btn-cancel-edit");
  const btnCloseTop       = document.getElementById("close-edit-pedido");

  let detalles = [];
  const preciosProductos = {};
  let selectedCliente = null;
  let selectedProductoNormal = null;
  let selectedProductoPersonalizado = null;
  let tipoActual = "normal";

  // ── Tabs de Edición ──────────────────────────────────────────
  document.querySelectorAll(".edit-tipo-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".edit-tipo-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      tipoActual = tab.dataset.tipo;
      document.getElementById("edit-seccion-normal").style.display = tipoActual === "normal" ? "" : "none";
      document.getElementById("edit-seccion-personalizado").style.display = tipoActual === "personalizado" ? "" : "none";
    });
  });

  // ── Buscador genérico asíncrono ──────────────────────────────
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

  // ── Cargar precios del inventario (Paginado completo) ────────
  async function cargarInventario() {
    try {
      let pagina = 1;
      let hasNext = true;
      while (hasNext) {
        const res = await fetch(`https://localhost:7249/api/Inventory?PageNumber=${pagina}&PageSize=100`, {
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

  // ── Iniciar los Buscadores dinámicos ─────────────────────────
  function iniciarBuscadores() {
    // Clientes
    crearBuscador({
      inputId:    "editInputCliente",
      dropdownId: "editDropdownCliente",
      hiddenId:   "editSelectedClienteId",
      fetchFn:    (pagina, nombre) => fetch(
        `https://localhost:7249/api/customers?PageNumber=${pagina}&PageSize=8&Name=${nombre}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(r => r.json()).then(d => d.value),
      labelFn:  c => c.customerName,
      valueFn:  c => c.customerId,
      onSelect: c => { selectedCliente = c; },
    });

    // Productos Normales
    crearBuscador({
      inputId:    "editInputProductoNormal",
      dropdownId: "editDropdownProductoNormal",
      hiddenId:   "editSelectedProductoNormalId",
      fetchFn:    (pagina, nombre) => fetch(
        `https://localhost:7249/api/products?PageNumber=${pagina}&PageSize=8&Name=${nombre}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(r => r.json()).then(d => d.value),
      labelFn:  p => {
        const precio = preciosProductos[p.productId];
        return precio !== undefined ? `${p.productName} — C$ ${precio.toFixed(2)}` : p.productName;
      },
      valueFn:  p => p.productId,
      onSelect: p => { selectedProductoNormal = p; },
    });

    // Productos Personalizados
    crearBuscador({
      inputId:    "editInputProductoPersonalizado",
      dropdownId: "editDropdownProductoPersonalizado",
      hiddenId:   "editSelectedProductoPersonalizadoId",
      fetchFn:    (pagina, nombre) => fetch(
        `https://localhost:7249/api/personalizedproducts?PageNumber=${pagina}&PageSize=8&CustomerName=${nombre}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(r => r.json()).then(d => d.value),
      labelFn:  p => `${p.customerName} — ${p.description ?? "Sin descripción"} (C$ ${p.salePrice.toFixed(2)})`,
      valueFn:  p => p.personalizedId,
      onSelect: p => { selectedProductoPersonalizado = p; },
    });
  }

  // ── Renderizar Tabla de Detalles ─────────────────────────────
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

    if (editTotal)    editTotal.textContent    = `C$ ${totalCalculado.toFixed(2)}`;
    if (editAdelanto) editAdelanto.textContent = `C$ ${(totalCalculado * 0.5).toFixed(2)}`;
  };

  // ── Agregar Producto Normal ──────────────────────────────────
  btnAddDetalle.addEventListener("click", () => {
    const id       = parseInt(document.getElementById("editSelectedProductoNormalId").value);
    const cantidad = parseInt(inputCantidad.value);
    const volumen  = parseInt(inputVolumen.value);

    if (!id || !selectedProductoNormal) { alert("Selecciona un producto normal"); return; }
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

    document.getElementById("editInputProductoNormal").value      = "";
    document.getElementById("editSelectedProductoNormalId").value = "";
    selectedProductoNormal = null;
    inputCantidad.value = "";
    inputVolumen.value  = "";
    renderizarTabla();
  });

  // ── Agregar Producto Personalizado ───────────────────────────
  btnAddDetallePers.addEventListener("click", () => {
    const id       = parseInt(document.getElementById("editSelectedProductoPersonalizadoId").value);
    const cantidad = parseInt(inputCantidadPers.value);
    const volumen  = parseInt(inputVolumenPers.value) || 1;

    if (!id || !selectedProductoPersonalizado) { alert("Selecciona un producto personalizado"); return; }
    if (!cantidad || cantidad <= 0)            { alert("Ingresa una cantidad válida"); return; }

    detalles.push({
      productId:   id,
      productName: `${selectedProductoPersonalizado.customerName} — ${selectedProductoPersonalizado.description ?? "Personalizado"}`,
      salePrice:   selectedProductoPersonalizado.salePrice,
      quantity:    cantidad,
      volume:      volumen,
    });

    document.getElementById("editInputProductoPersonalizado").value      = "";
    document.getElementById("editSelectedProductoPersonalizadoId").value = "";
    selectedProductoPersonalizado = null;
    inputCantidadPers.value = "1";
    inputVolumenPers.value  = "1";
    renderizarTabla();
  });

  // ── Limpiar Cajas de texto ───────────────────────────────────
  const limpiar = () => {
    inputCantidad.value = "";
    inputVolumen.value  = "";
    inputCantidadPers.value = "1";
    inputVolumenPers.value  = "1";
    detalles.length     = 0;

    ["editInputCliente", "editInputProductoNormal", "editInputProductoPersonalizado"].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = "";
    });
    ["editSelectedClienteId", "editSelectedProductoNormalId", "editSelectedProductoPersonalizadoId"].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = "";
    });

    selectedCliente               = null;
    selectedProductoNormal        = null;
    selectedProductoPersonalizado = null;

    document.querySelectorAll(".edit-tipo-tab").forEach((t, i) => t.classList.toggle("active", i === 0));
    document.getElementById("edit-seccion-normal").style.display       = "";
    document.getElementById("edit-seccion-personalizado").style.display = "none";
    tipoActual = "normal";

    renderizarTabla();
  };

  // ── Abrir Modal (Carga Inicial de Datos Existentes) ──────────
  state.abrirModalEdit = async (data) => {
    limpiar();
    await cargarInventoryYPrecios();

    // Seteo inicial de datos del cliente traídos de la fila/tabla
    if (data.cliente) {
      document.getElementById("editInputCliente").value = data.cliente;
      // Si la fila provee el ID del cliente mapeado por tu datatable lo asignamos directo
      if (data.customerId) {
        document.getElementById("editSelectedClienteId").value = data.customerId;
      }
    }

    // Fechas
    if (editFechaInicio) 
      editFechaInicio.textContent = data.fecha ? data.fecha.split("T")[0] : "";
    
    editFecha.value = data.fecha ? data.fecha.split("T")[0] : "";

    // Mapeo e inyección de la orden existente
    const pedido = JSON.parse(data.pedido ?? "{}");
    if (pedido.orderDetails) {
      detalles = pedido.orderDetails.map(d => ({
        productId:   d.productId,
        productName: d.productName ?? "Producto",
        quantity:    d.quantity,
        volume:      d.volume ?? 1,
        salePrice:   d.salePrice ?? preciosProductos[d.productId] ?? 0,
      }));
    }

    renderizarTabla();
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  // Helper puente para cargar el inventario reactivo al abrir
  async function cargarInventoryYPrecios() {
    await cargarInventario();
  }

  // ── Cerrar Modal ─────────────────────────────────────────────
  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    limpiar();
  };

  btnCancelar.addEventListener("click", cerrar);
  if (btnCloseTop) btnCloseTop.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  // ── Guardar Cambios (Update) ──────────────────────────────────
  btnGuardar.addEventListener("click", async () => {
    const clienteId = parseInt(document.getElementById("editSelectedClienteId").value);
    if (!clienteId)            { alert("Seleccione un cliente"); return; }
    if (detalles.length === 0) { alert("Agregue al menos un producto"); return; }

    const body = {
      orderId:      state.pedidoEditandoId,
      customerId:   clienteId,
      timeDelivery: editFecha.value,
      orderDetails: detalles.map(d => ({
        productId: d.productId,
        quantity:  d.quantity,
        volume:    d.volume,
        salePrice: d.salePrice
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

  // ── Inicialización ────────────────────────────────────────────
  iniciarBuscadores();
}