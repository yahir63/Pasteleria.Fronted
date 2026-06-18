import { getAll } from "/src/modules/Pedidos/Service/Pedidos.Service.js";

// ─── Estado compartido con modales ────────────────────────────────────────────
export const state = {
  pedidoEditandoId: null,
  recargar: null,
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
    "/src/modules/Pedidos/components/pedido-edit-modal/pedido-edit.html",
    "/src/modules/Pedidos/components/pedido-delete-modal/pedido-delete.html",
  ];

  const htmls = await Promise.all(rutas.map(r => fetch(r).then(res => res.text())));

  htmls.forEach(html => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const modal  = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

  // Importar módulos de modales dinámicamente
  const [{ init: initAdd }, { init: initEdit }, { init: initDelete }] = await Promise.all([
    import("/src/modules/Pedidos/components/pedido-add-modal/pedido-add.js"),
    import("/src/modules/Pedidos/components/pedido-edit-modal/pedido-edit.js"),
    import("/src/modules/Pedidos/components/pedido-delete-modal/pedido-delete.js"),
  ]);

  initAdd(state);
  initEdit(state);
  initDelete(state);
}

// ─── Render tabla ─────────────────────────────────────────────────────────────
function renderTabla(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.customerName ?? ""}</td>
      <td>${formatearFecha(p.orderDate)}</td>
      <td>C$ ${p.totalAmount ?? 0}</td>
      <td>
        <span class="${p.status ?? "Pendiente"}">
          ${p.status ?? "Pendiente"}
        </span>
      </td>
      <td class="table-actions">
        <button type="button" class="view btnVer"
          data-id="${p.orderId}">
          <img src="/src/modules/Shared/Assets/img/view.png" />
          Ver detalle
        </button>
        <button type="button" class="edit btnEdit"
          data-id="${p.orderId}"
          data-cliente="${p.customerName ?? ""}"
          data-fecha="${p.orderDate ?? ""}"
          data-total="${p.totalAmount ?? ""}"
          data-status="${p.status ?? ""}">
          <img src="/src/modules/Shared/Assets/img/editar.png" />
          Editar
        </button>
        <button type="button" class="delete btnDelete"
          data-id="${p.orderId}">
          <img src="/src/modules/Shared/Assets/img/eliminar.png" />
          Eliminar
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
    const data     = await getAll(pagina, busqueda, estado);
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
    btn.addEventListener("click", () => {
      const d = btn.dataset;
      alert(`Cliente: ${d.cliente}\nFecha: ${d.fecha}\nTotal: C$ ${d.total}\nEstado: ${d.status}`);
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
      console.log("Abriendo delete, state.abrirModalDelete:", state.abrirModalDelete);
      state.pedidoEditandoId = parseInt(btn.dataset.id);
      state.abrirModalDelete?.();
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