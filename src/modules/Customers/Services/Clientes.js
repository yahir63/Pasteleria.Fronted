const API_BASE = "https://localhost:7249/api/customers";

// ─── Estado global (compartido con modales) ───────────────────────────────────
window.ClientesState = {
  clienteEditandoId: null,
  recargar: null, // se asigna abajo
};

// ─── DOM ──────────────────────────────────────────────────────────────────────
const tbody         = document.querySelector("table tbody");
const inputBuscar   = document.querySelector(".top-bar input[type='text']");
const spanConteo    = document.querySelector(".table-footer span");
const paginacionDiv = document.querySelector(".pagination");
const btnNuevo      = document.getElementById("btnNuevoCliente");
const modalContainer = document.getElementById("modal-container");

// ─── Estado local ─────────────────────────────────────────────────────────────
let paginaActual   = 1;
let totalPaginas   = 1;
let totalRegistros = 0;
let busquedaTimer  = null;

// ─── Cargar modales ───────────────────────────────────────────────────────────
async function cargarModales() {
  const rutas = [
    "/src/modules/Customers/components/customer-add-modal/customer-add.html",
    "/src/modules/Customers/components/customer-edit-modal/customer-edit.html",
    "/src/modules/Customers/components/customer-delete-modal/customer-delete.html",
  ];

  const htmls = await Promise.all(rutas.map(r => fetch(r).then(res => res.text())));

  // Extraer solo el contenido del <body> de cada modal
  htmls.forEach(html => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const modal  = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

  // Cargar scripts de modales en orden
  await cargarScript("/src/modules/Customers/components/customer-add-modal/customer-add.js");
  await cargarScript("/src/modules/Customers/components/customer-edit-modal/customer-edit.js");
  await cargarScript("/src/modules/Customers/components/customer-delete-modal/customer-delete.js");
}

function cargarScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchClientes(pagina = 1, nombre = "") {
  const params = new URLSearchParams({ PageNumber: pagina, PageSize: 8 });
  if (nombre) params.append("Name", nombre);
  const res  = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  const json = await res.json();
  return json.value;
}

// ─── Render tabla ─────────────────────────────────────────────────────────────
function renderTabla(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach((c) => {
    const partes   = (c.customerName ?? "").split(" ");
    const nombre   = partes[0] ?? "";
    const apellido = partes.slice(1).join(" ");
    const activo   = c.isActive;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${apellido}</td>
      <td>${c.phone ?? ""}</td>
      <td>${c.cedula ?? ""}</td>
      <td>${c.customerAddress ?? ""}</td>
      <td>
        <span class="estado-badge ${activo ? "estado-activo" : "estado-inactivo"}">
          ${activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td class="table-actions">
        <button type="button" class="edit btnEdit"
          data-id="${c.customerId}"
          data-nombre="${nombre}"
          data-apellido="${apellido}"
          data-telefono="${c.phone ?? ""}"
          data-cedula="${c.cedula ?? ""}"
          data-direccion="${c.customerAddress ?? ""}"
          data-ciudad="${c.city ?? ""}">
          <img src="/src/modules/Shared/Assets/img/editar.png" />
          Editar
        </button>
        <button type="button" class="delete btnDelete" data-id="${c.customerId}">
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
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} clientes`;
}

// ─── Carga principal ──────────────────────────────────────────────────────────
async function cargarPagina(pagina = 1) {
  const nombre = inputBuscar.value.trim();
  try {
    const data     = await fetchClientes(pagina, nombre);
    paginaActual   = data.pageIndex;
    totalPaginas   = data.totalPages;
    totalRegistros = data.totalRegisters;
    renderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (err) {
    console.error("Error cargando clientes:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#e74c3c">Error al cargar clientes</td></tr>`;
  }
}

// ─── Acciones de fila ─────────────────────────────────────────────────────────
function bindAcciones() {
  tbody.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.ClientesState.clienteEditandoId = parseInt(btn.dataset.id);
      // Llenar modal editar y abrirlo
      if (typeof window.abrirModalEdit === "function") {
        window.abrirModalEdit(btn.dataset);
      }
    });
  });

  tbody.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.ClientesState.clienteEditandoId = parseInt(btn.dataset.id);
      if (typeof window.abrirModalDelete === "function") {
        window.abrirModalDelete();
      }
    });
  });
}

// ─── Abrir modal Add ──────────────────────────────────────────────────────────
btnNuevo.addEventListener("click", () => {
  if (typeof window.abrirModalAdd === "function") window.abrirModalAdd();
});

// ─── Búsqueda con debounce ────────────────────────────────────────────────────
inputBuscar.addEventListener("input", () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(() => { paginaActual = 1; cargarPagina(1); }, 400);
});

// ─── Exponer recarga para los modales ─────────────────────────────────────────
window.ClientesState.recargar = () => cargarPagina(paginaActual);

// ─── Init ─────────────────────────────────────────────────────────────────────
(async () => {
  await cargarModales();
  await cargarPagina(1);
})();