import { getAll } from "/src/modules/Producto/services/Producto.service.js";

export const state = {
  productoEditandoId: null,
  recargar: null,
};

const tbody         = document.querySelector("table tbody");
const inputBuscar   = document.querySelector(".top-bar input[type='text']");
const spanConteo    = document.querySelector(".table-footer span");
const paginacionDiv = document.querySelector(".pagination");
const btnNuevo      = document.getElementById("btnNuevoProducto");
const modalContainer = document.getElementById("modal-container");
const filtroEstado  = document.getElementById("filtroEstado");

let paginaActual   = 1;
let totalPaginas   = 1;
let totalRegistros = 0;
let busquedaTimer  = null;

async function cargarModales() {
  const rutas = [
    "/src/modules/Producto/components/product-add-modal/producto-add.html",
    "/src/modules/Producto/components/producto-edit-modal/producto-edit.html",
    "/src/modules/Producto/components/product-delete-modal/producto-delete.html",
  ];

  const htmls = await Promise.all(rutas.map(r => fetch(r).then(res => res.text())));

  htmls.forEach(html => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const modal  = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

  const [{ init: initAdd }, { init: initEdit }, { init: initDelete }] = await Promise.all([
    import("/src/modules/Producto/components/product-add-modal/producto-add.js"),
    import("/src/modules/Producto/components/producto-edit-modal/producto-edit.js"),
    import("/src/modules/Producto/components/product-delete-modal/producto-delete.js"),
  ]);

  initAdd(state);
  initEdit(state);
  initDelete(state);
}

function renderTabla(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach((p) => {
    const activo = p.isActive;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.productName ?? ""}</td>
      <td>${p.description ?? ""}</td>
      <td>${p.categoryName ?? ""}</td>
      <td>${p.supplierName ?? ""}</td>
      <td>
        <span class="estado-badge ${activo ? "estado-activo" : "estado-inactivo"}">
          ${activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td class="table-actions">
        <button type="button" class="edit btnEdit"
          data-id="${p.productId}"
          data-productname="${p.productName ?? ""}"
          data-description="${p.description ?? ""}"
          data-categoryid="${p.categoryId ?? ""}"
          data-supplierid="${p.supplierId ?? ""}">
          <img src="/src/modules/Shared/Assets/img/editar.png" />
          Editar
        </button>
        <button type="button" class="delete btnDelete" data-id="${p.productId}">
          <img src="/src/modules/Shared/Assets/img/eliminar.png" />
          Cambiar Estado
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
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} productos`;
}

async function cargarPagina(pagina = 1) {
  const nombre = inputBuscar.value.trim();
  const estado = filtroEstado ? filtroEstado.value : "";
  try {
    const data     = await getAll(pagina, nombre, estado);
    paginaActual   = data.pageIndex;
    totalPaginas   = data.totalPages;
    totalRegistros = data.totalRegisters;
    renderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (err) {
    console.error("Error cargando productos:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#e74c3c">Error al cargar productos</td></tr>`;
  }
}

function bindAcciones() {
  tbody.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.productoEditandoId = parseInt(btn.dataset.id);
      state.abrirModalEdit?.(btn.dataset);
    });
  });

  tbody.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.productoEditandoId = parseInt(btn.dataset.id);
      state.abrirModalDelete?.();
    });
  });
}

btnNuevo.addEventListener("click", () => state.abrirModalAdd?.());

filtroEstado.addEventListener("change", () => { paginaActual = 1; cargarPagina(1); });

inputBuscar.addEventListener("input", () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(() => { paginaActual = 1; cargarPagina(1); }, 400);
});

state.recargar = () => cargarPagina(paginaActual);

(async () => {
  await cargarModales();
  await cargarPagina(1);
})();