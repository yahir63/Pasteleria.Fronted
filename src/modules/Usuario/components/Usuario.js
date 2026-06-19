import { GetUsers } from "../services/User.services.js";

// ─── Estado global (compartido con modales) ───────────────────────────────────
window.UsuarioState = {
  UsuarioEditandoId: null,
  recargar: null,
};

// ─── DOM ──────────────────────────────────────────────────────────────────────
const tbody = document.getElementById("tbody");
const inputBuscar = document.querySelector(".top-bar input[type='text']");
const filtroEstado = document.querySelector(".top-bar select");
const spanConteo = document.querySelector(".table-footer span");
const paginacionDiv = document.querySelector(".pagination");

const modalContainer = document.getElementById("modal-container");

// ─── Estado local ─────────────────────────────────────────────────────────────
let paginaActual = 1;
let totalPaginas = 1;
let totalRegistros = 0;
let busquedaTimer = null;

function obtenerRol(usuario) {
  if (usuario.IsAdmin || usuario.isAdmin) return "Administrador";
  if (usuario.IsGerent || usuario.isGerent) return "Gerente";
  if (usuario.IsOperator || usuario.isOperator) return "Operador";
  return usuario.role ?? usuario.rol ?? "Sin rol";
}

// ─── Cargar modales ───────────────────────────────────────────────────────────
async function cargarModales() {
  const rutas = [
    "/src/modules/Usuario/components/edit-usuario/edit-user.html",
    "/src/modules/Usuario/components/delete-modal/delete-modal.html",
  ];

  const htmls = await Promise.all(
    rutas.map((ruta) => fetch(ruta).then((res) => res.text())),
  );

  htmls.forEach((html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const modal = doc.querySelector(".modal, .modal-overlay");
    if (modal) modalContainer.appendChild(modal);
  });

  const [{ init: initEdit }, { init: initDelete }] = await Promise.all([
    import("/src/modules/Usuario/components/edit-usuario/edit.js"),
    import("/src/modules/Usuario/components/delete-modal/delete-user.js"),
  ]);

  initEdit(window.UsuarioState);
  initDelete(window.UsuarioState);
}

// ─── Render tabla ─────────────────────────────────────────────────────────────
function renderTabla(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach((usuario) => {
    const rol = obtenerRol(usuario);
    const activo = usuario.isActive;
    const id = usuario.id ?? usuario.userId ?? usuario.UsuarioId ?? "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${usuario.userName ?? usuario.userName ?? ""}</td>
      <td>${rol}</td>
      <td>
        <span class="estado-badge ${activo ? "estado-activo" : "estado-inactivo"}">
          ${activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td class="table-actions">
        <button type="button" class="edit btnEdit"
          data-id="${id}"
          data-username="${usuario.userName ?? ""}"
          data-role="${rol}"
          data-is-admin="${usuario.isAdmin ?? usuario.IsAdmin ?? false}"
          data-is-gerent="${usuario.isGerent ?? usuario.IsGerent ?? false}"
          data-is-operator="${usuario.isOperator ?? usuario.IsOperator ?? false}">
          <img src="/src/modules/Shared/Assets/img/editar.png" />
          Editar
        </button>
        <button type="button" class="delete btnDelete" data-id="${id}">
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
  const hasta = (paginaActual - 1) * 8 + items.length;
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} usuarios`;
}

// ─── Carga principal ──────────────────────────────────────────────────────────
async function cargarPagina(pagina = 1) {
  const nombre = inputBuscar?.value.trim() ?? "";
  const filtro = filtroEstado?.value;
  const estado =
    filtro === "true" ? true : filtro === "false" ? false : undefined;

  try {
    const data = await GetUsers(pagina, nombre, estado);
    paginaActual = data.pageIndex;
    totalPaginas = data.totalPages;
    totalRegistros = data.totalRegisters;
    renderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (err) {
    console.error("Error cargando usuarios:", err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#e74c3c">Error al cargar usuarios</td></tr>`;
  }
}

// ─── Acciones de fila ─────────────────────────────────────────────────────────
function bindAcciones() {
  tbody.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.UsuarioState.UsuarioEditandoId = parseInt(btn.dataset.id, 10);
      window.UsuarioState.abrirModalEdit?.(btn.dataset);
    });
  });

  tbody.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.UsuarioState.UsuarioEditandoId = parseInt(btn.dataset.id, 10);
      window.UsuarioState.abrirModalDelete?.();
    });
  });
}

// ─── Abrir modal Add ──────────────────────────────────────────────────────────

// ─── Búsqueda con debounce ────────────────────────────────────────────────────
if (inputBuscar) {
  inputBuscar.addEventListener("input", () => {
    clearTimeout(busquedaTimer);
    busquedaTimer = setTimeout(() => {
      paginaActual = 1;
      cargarPagina(1);
    }, 400);
  });
}

if (filtroEstado) {
  filtroEstado.addEventListener("change", () => {
    paginaActual = 1;
    cargarPagina(1);
  });
}

// ─── Exponer recarga para los modales ─────────────────────────────────────────
window.UsuarioState.recargar = () => cargarPagina(paginaActual);

// ─── Init ─────────────────────────────────────────────────────────────────────
(async () => {
  await cargarModales();
  await cargarPagina(1);
})();
