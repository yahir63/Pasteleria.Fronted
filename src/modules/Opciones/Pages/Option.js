import { getAll } from "/src/modules/Opciones/Service/Opciones.Service.js";

// ─── Estado compartido con modales ────────────────────────────────────────────
export const state = {
  recargar: null,
};

// ─── DOM ──────────────────────────────────────────────────────────────────────
const tbody          = document.getElementById("opciones-tbody");
const inputBuscar    = document.getElementById("searchInput");
const spanConteo     = document.getElementById("pagination-info");
const paginacionDiv  = document.getElementById("pagination-controls");
const btnNuevo       = document.getElementById("btn-nueva-opcion");
const modalContainer = document.getElementById("modal-container");

// ─── Estado local ─────────────────────────────────────────────────────────────
let paginaActual   = 1;
let totalPaginas   = 1;
let totalRegistros = 0;
let busquedaTimer  = null;
const PAGE_SIZE    = 8;

// ─── Cargar modales ───────────────────────────────────────────────────────────
async function cargarModales() {
  const rutas = [
    "/src/modules/Opciones/components/opcion-add-modal/opcion-add.html",
    "/src/modules/Opciones/components/opcion-edit-modal/opcion-edit.html",
    "/src/modules/Opciones/components/opcion-delete-modal/opcion-delete.html",
    "/src/modules/Opciones/components/opcion-detalle-modal/opcion-detalle.html",
  ];

  const htmls = await Promise.all(rutas.map(r => fetch(r).then(res => res.text())));
  htmls.forEach(html => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const modal  = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

  const [
    { init: initAdd },
    { init: initEdit },
    { init: initDelete },
    { init: initDetalle },
  ] = await Promise.all([
    import("/src/modules/Opciones/components/opcion-add-modal/opcion-add.js"),
    import("/src/modules/Opciones/components/opcion-edit-modal/opcion-edit.js"),
    import("/src/modules/Opciones/components/opcion-delete-modal/opcion-delete.js"),
    import("/src/modules/Opciones/components/opcion-detalle-modal/opcion-detalle.js"),
  ]);

  initAdd(state);
  initEdit(state);
  initDelete(state);
  initDetalle(state);
}

// ─── Render tabla ─────────────────────────────────────────────────────────────
function renderTabla(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach((o) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.name ?? ""}</td>
      <td>${o.description ?? ""}</td>
      <td>${o.measurement ?? ""}</td>
      <td>C$ ${Number(o.price ?? 0).toFixed(2)}</td>
      <td class="table-actions">
        <button type="button" class="view btnVer" data-opcion='${JSON.stringify(o)}'>
          <img src="/src/modules/Shared/Assets/img/view.png" />
          Ver detalle
        </button>
        <button type="button" class="edit btnEdit" data-opcion='${JSON.stringify(o)}'>
          <img src="/src/modules/Shared/Assets/img/editar.png" />
          Editar
        </button>
        <button type="button" class="delete btnDelete" data-opcion='${JSON.stringify(o)}'>
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
  const desde = items.length === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1;
  const hasta  = (paginaActual - 1) * PAGE_SIZE + items.length;
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} opciones`;
}

// ─── Carga principal ──────────────────────────────────────────────────────────
async function cargarPagina(pagina = 1) {
  const busqueda = inputBuscar.value.trim();
  try {
    const data = await getAll(pagina, busqueda);

    if (!data || !data.items) {
      renderTabla([]);
      paginacionDiv.innerHTML = "";
      spanConteo.textContent = "0 opciones encontradas";
      return;
    }

    paginaActual   = data.pageIndex;
    totalPaginas   = data.totalPages;
    totalRegistros = data.totalRegisters;
    renderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (err) {
    console.error("Error cargando opciones:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#e74c3c">Error al cargar opciones</td></tr>`;
  }
}

// ─── Acciones de fila ─────────────────────────────────────────────────────────
function bindAcciones() {
  tbody.querySelectorAll(".btnVer").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const opcion = JSON.parse(e.currentTarget.dataset.opcion);
      state.abrirModalDetalle?.(opcion);
    });
  });

  tbody.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const opcion = JSON.parse(e.currentTarget.dataset.opcion);
      state.abrirModalEdit?.(opcion);
    });
  });

  tbody.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const opcion = JSON.parse(e.currentTarget.dataset.opcion);
      state.abrirModalDelete?.(opcion);
    });
  });
}

// ─── Eventos ──────────────────────────────────────────────────────────────────
btnNuevo.addEventListener("click", () => state.abrirModalAdd?.());

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