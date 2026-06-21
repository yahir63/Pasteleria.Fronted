import { getAll } from "/src/modules/Categories/services/category.service.js";

// ─── Estado compartido con modales ────────────────────────────────────────────
export const state = {
  categoriaEditandoId: null,
  recargar: null,
};

// ─── DOM ──────────────────────────────────────────────────────────────────────
const tbody          = document.querySelector("table tbody");
const inputBuscar    = document.querySelector(".top-bar input[type='text']");
const spanConteo     = document.querySelector(".table-footer span");
const paginacionDiv  = document.querySelector(".pagination");
const spanTotal      = document.querySelector(".total-categorias strong");
const btnNuevo       = document.querySelector(".btn-new");
const modalContainer = document.getElementById("modal-container");

// ─── Estado local ─────────────────────────────────────────────────────────────
let paginaActual   = 1;
let totalPaginas   = 1;
let totalRegistros = 0;
let busquedaTimer  = null;

// Ícono por defecto si no tiene uno asignado
const ICON_DEFAULT = "fa-solid fa-tag";

// ─── Cargar modales ───────────────────────────────────────────────────────────
async function cargarModales() {
  const rutas = [
    "/src/modules/Categories/components/categoria-add-modal/categoria-add.html",
    "/src/modules/Categories/components/categoria-edit-modal/categoria-edit.html",
    "/src/modules/Categories/components/categoria-delete-modal/categoria-delete.html",
  ];

  const htmls = await Promise.all(rutas.map(r => fetch(r).then(res => res.text())));

  htmls.forEach(html => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const modal  = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

  const [{ init: initAdd }, { init: initEdit }, { init: initDelete }] = await Promise.all([
    import("/src/modules/Categories/components/categoria-add-modal/categoria-add.js"),
    import("/src/modules/Categories/components/categoria-edit-modal/categoria-edit.js"),
    import("/src/modules/Categories/components/categoria-delete-modal/categoria-delete.js"),
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

  items.forEach((c) => {
    const activo   = c.isActive;
    const iconClass = c.icon ?? ICON_DEFAULT;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><i class="${iconClass} categoria-icon"></i></td>
      <td>${c.name ?? ""}</td>
      <td>${c.description ?? ""}</td>
      <td>
        <span class="estado-badge ${activo ? "estado-activo" : "estado-inactivo"}">
          ${activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td class="table-actions">
        <button type="button" class="edit btnEdit"
          data-id="${c.categoryId}"
          data-nombre="${c.name ?? ""}"
          data-descripcion="${c.description ?? ""}"
          data-icon="${iconClass}">
          <img src="/src/modules/Shared/Assets/img/editar.png" width="16" height="16" style="width:16px;height:16px;"> Editar
        </button>
        <button type="button" class="delete btnDelete" data-id="${c.categoryId}">
          <img src="/src/modules/Shared/Assets/img/eliminar.png" width="16" height="16" style="width:16px;height:16px;"> Cambiar Estado
        </button>
      </td>`;
    tbody.appendChild(tr);
  });

  bindAcciones();
}

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
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} categorías`;
  if (spanTotal) spanTotal.textContent = totalRegistros;
}

// ─── Carga principal ──────────────────────────────────────────────────────────
async function cargarPagina(pagina = 1) {
  const nombre = inputBuscar.value.trim();
  try {
    const data     = await getAll(pagina, nombre);
    paginaActual   = data.pageIndex;
    totalPaginas   = data.totalPages;
    totalRegistros = data.totalRegisters;
    renderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (err) {
    console.error("Error cargando categorías:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#e74c3c">Error al cargar categorías</td></tr>`;
  }
}

// ─── Acciones de fila ─────────────────────────────────────────────────────────
function bindAcciones() {
  tbody.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.categoriaEditandoId = parseInt(btn.dataset.id);
      state.abrirModalEdit?.(btn.dataset);
    });
  });

  tbody.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.categoriaEditandoId = parseInt(btn.dataset.id);
      state.abrirModalDelete?.();
    });
  });
}

// ─── Eventos ──────────────────────────────────────────────────────────────────
btnNuevo.addEventListener("click", (e) => {
  e.preventDefault();
  state.abrirModalAdd?.();
});

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