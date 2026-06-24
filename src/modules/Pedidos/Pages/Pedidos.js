import { getAll } from "/src/modules/Pedidos/Service/Pedidos.Service.js";

// ─── Estado compartido con modales ────────────────────────────────────────────
export const state = {
  pedidoEditandoId: null,
  recargar: null,
};

 // 1. Define el mapa fuera del forEach (o al inicio de la función)
const MAPA_ESTADOS = {
    1: "Pendiente",
    2: "En Proceso",
    3: "Cancelado",
    4: "Abortado"
};

// ─── DOM ──────────────────────────────────────────────────────────────────────
const tbody         = document.getElementById("pedidos-tbody");
const inputBuscar   = document.getElementById("searchInput");
const spanConteo    = document.getElementById("pagination-info");
const paginacionDiv = document.getElementById("pagination-controls");
const btnNuevo       = document.getElementById("btn-nuevo-pedido");
const modalContainer = document.getElementById("modal-container");
const filtroEstado   = document.getElementById("filterEstado");

// ─── Estado local ─────────────────────────────────────────────────────────────
let paginaActual   = 1;
let totalPaginas   = 1;
let totalRegistros = 0;
let busquedaTimer  = null;

// ─── Cargar modales ───────────────────────────────────────────────────────────
async function cargarModales() {
  const rutas = [
    "/src/modules/Pedidos/components/pedido-add-modal/pedido-add.html",
    "/src/modules/Pedidos/components/pedido-delete-modal/pedido-delete.html",
    "/src/modules/Pedidos/components/pedido-detalle-modal/pedido-detalle.html",
    "/src/modules/Pedidos/components/pedido-edit-modal/pedido-edit.html",
    
  ];

  const htmls = await Promise.all(rutas.map(r => fetch(r).then(res => res.text())));

  htmls.forEach(html => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const modal  = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

  // Importar módulos de modales dinámicamente
  const [{ init: initAdd },{ init: initDelete },{ init: initDetalle }, { init: initEdit } ] = await Promise.all([
    import("/src/modules/Pedidos/components/pedido-add-modal/pedido-add.js"),
    import("/src/modules/Pedidos/components/pedido-delete-modal/pedido-delete.js"),
    import("/src/modules/Pedidos/components/pedido-detalle-modal/pedido-detalle.js"),
    import("/src/modules/Pedidos/components/pedido-edit-modal/pedido-edit.js"),
    
  ]);

  initAdd(state);
  initDelete(state);
  initDetalle(state);
  initEdit(state);
 
}

// ─── Render tabla ─────────────────────────────────────────────────────────────
function renderTabla(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

items.forEach((p) => {
  console.log("Propiedades del pedido:", p);
    // 2. Determina el estado basándote en la propiedad correcta (según tu consola es isActive)
    const estadoId = p.isActive ?? 1; // Usamos 1 por defecto si es null
    const nombreEstado = MAPA_ESTADOS[estadoId] || "Desconocido";
    
    // 3. Crea una clase CSS segura (ej: "pendiente", "en-proceso")
    const claseEstado = nombreEstado.toLowerCase().replace(" ", "-");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.customerName ?? ""}</td>
      <td>${formatearFecha(p.orderDate)}</td>
      <td>C$ ${p.totalAmount ?? 0}</td>
      <td>
        <span class="estado-badge ${claseEstado}">
          ${nombreEstado}
        </span>
      </td>
      <td class="table-actions">
        <button type="button" class="view btnVer"
          data-pedido='${JSON.stringify(p)}'>
          <img src="/src/modules/Shared/Assets/img/view.png" />
          Ver detalle
        </button>
        <button type="button" class="edit btnEdit"
          data-id="${p.orderId}"
          data-cliente="${p.customerName ?? ""}"
          data-fecha="${p.orderDate ?? ""}"
          data-pedido='${JSON.stringify(p)}'>
          <img src="/src/modules/Shared/Assets/img/editar.png" />
          Editar
        </button>
        <button type="button" class="delete btnDelete"
          data-id="${p.orderId}">
          Cambiar Estado
        </button>
      </td>`;
    tbody.appendChild(tr);
});

  bindAcciones();
}

// ─── Paginación ───────────────────────────────────────────────────────────────
function renderPaginacion() {
  paginacionDiv.innerHTML = "";

  const prev = document.createElement("button");
  prev.textContent = "<";
  prev.disabled = paginaActual === 1;
  prev.addEventListener("click", () => cargarPagina(paginaActual - 1));
  paginacionDiv.appendChild(prev);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === paginaActual) btn.classList.add("active");
    btn.addEventListener("click", () => cargarPagina(i));
    paginacionDiv.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = ">";
  next.disabled = paginaActual === totalPaginas;
  next.addEventListener("click", () => cargarPagina(paginaActual + 1));
  paginacionDiv.appendChild(next);
}

function actualizarConteo(items) {
  const desde = items.length === 0 ? 0 : (paginaActual - 1) * 8 + 1;
  const hasta  = (paginaActual - 1) * 8 + items.length;
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} pedidos`;
}

// ─── Utilidad fecha ───────────────────────────────────────────────────────────
function formatearFecha(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString("es-NI", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

// ─── Carga principal ──────────────────────────────────────────────────────────
async function cargarPagina(pagina = 1) {
  const busqueda = inputBuscar.value.trim();
  const estado   = filtroEstado ? filtroEstado.value : "";
  try {
    const data = await getAll(pagina, busqueda, estado);

    if (!data || !data.items) {
      renderTabla([]);
      paginacionDiv.innerHTML = "";
      spanConteo.textContent = "0 pedidos encontrados";
      return;
    }

    paginaActual   = data.pageIndex;
    totalPaginas   = data.totalPages;
    totalRegistros = data.totalRegisters;
    renderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (err) {
    console.error("Error cargando pedidos:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#e74c3c">Error al cargar pedidos</td></tr>`;
  }
}

// ─── Acciones de fila ─────────────────────────────────────────────────────────
function bindAcciones() {
  tbody.querySelectorAll(".btnVer").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      //Usa e.currentTarget para asegurarte de leer SIEMPRE el botón, aunque toques la imagen
      const botonReal = e.currentTarget; 
      
      if (botonReal.dataset.pedido) {
        const pedidoObjeto = JSON.parse(botonReal.dataset.pedido);
        console.log("Pedido detectado con éxito:", pedidoObjeto);
        
        // Llamamos al modal de detalle pasándole la información
        state.abrirModalDetalle?.(pedidoObjeto);
      } else {
        console.error("El atributo data-pedido no está presente en el botón.");
      }
    });
  });

  tbody.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Abriendo edit, state.abrirModalEdit:", state.abrirModalEdit);
      state.pedidoEditandoId = parseInt(btn.dataset.id);
      state.abrirModalEdit?.(btn.dataset);
    });
  });

tbody.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id); // Capturamos el ID del botón
        state.abrirModalDelete?.(id); // PASAMOS EL ID AQUÍ
    });
});
  
}
// ─── Eventos ──────────────────────────────────────────────────────────────────
btnNuevo.addEventListener("click", () => state.abrirModalAdd?.());

filtroEstado.addEventListener("change", () => { paginaActual = 1; cargarPagina(1); });

inputBuscar.addEventListener("input", () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(() => { paginaActual = 1; cargarPagina(1); }, 400);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
state.recargar = () => cargarPagina(paginaActual);

(async () => {
  await cargarModales();
  await cargarPagina(1);
})();