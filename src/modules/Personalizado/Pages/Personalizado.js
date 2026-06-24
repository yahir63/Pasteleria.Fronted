import { getAll } from "/src/modules/Personalizado/services/personalizedProduct.service.js";

window.PersonalizedState = { recargar: null };

const tbody         = document.getElementById("tbodyPersonalized");
const buscarInput   = document.getElementById("BuscarPersonalizado");
const spanConteo    = document.getElementById("conteoPersonalized");
const paginacionDiv = document.getElementById("paginacionPersonalized");
const btnNuevo      = document.getElementById("btn-new-personalized");
const modalContainer = document.getElementById("modal-container-personalized");

let paginaActual   = 1;
let totalPaginas   = 1;
let totalRegistros = 0;
let busquedaTimer  = 0;

// ── Cargar modales ────────────────────────────────────────────
async function cargarModales() {
const rutas = [
  "/src/modules/Personalizado/components/personalizedProduct-modal-add/PersonalizedProduct-add.html",
  "/src/modules/Personalizado/components/PersonalizedProduct-modal-detail/PersonalizedProduct-detail.html",
];
  const htmls = await Promise.all(
    rutas.map(r => fetch(r).then(res => res.text()))
  );

  htmls.forEach(html => {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");
    const modal  = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

await Promise.all([
  cargarScript("/src/modules/Personalizado/components/personalizedProduct-modal-add/PersonalizedProduct-add.js"),
  cargarScript("/src/modules/Personalizado/components/PersonalizedProduct-modal-detail/PersonalizedProduct-detail.js"),
]);
}

function cargarScript(src) {
  return new Promise(resolve => {
    const s  = document.createElement("script");
    s.src    = src;
    s.type   = "module";
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

// ── Render tabla ──────────────────────────────────────────────
function renderTabla(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach(p => {
    const tr = document.createElement("tr");

    const tdCliente = document.createElement("td");
    tdCliente.textContent = p.customerName;

    const tdDesc = document.createElement("td");
    tdDesc.textContent = p.description || "—";

    const tdFecha = document.createElement("td");
    tdFecha.textContent = new Date(p.creationDate).toLocaleDateString("es-NI");

    const tdPrecio = document.createElement("td");
    tdPrecio.textContent = `$${p.salePrice.toFixed(2)}`;

    const tdAcciones = document.createElement("td");
    const btnVer = document.createElement("button");
    btnVer.className = "view";
    btnVer.innerHTML = `<img src="/src/modules/Shared/Assets/img/view.png" /> Ver detalle`;
    btnVer.addEventListener("click", () => {
      if (typeof window.AbrirDetailPersonalized === "function") {
        window.AbrirDetailPersonalized(p.personalizedId);
      }
    });

    const div = document.createElement("div");
    div.className = "action-cells";
    div.appendChild(btnVer);
    tdAcciones.appendChild(div);

    tr.append(tdCliente, tdDesc, tdFecha, tdPrecio, tdAcciones);
    tbody.appendChild(tr);
  });
}

// ── Paginación ────────────────────────────────────────────────
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
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} productos personalizados`;
}

// ── Carga principal ───────────────────────────────────────────
async function cargaPrincipal(pagina = 1) {
  try {
    const cliente = buscarInput.value.trim();
    const data = await getAll(pagina, cliente);

    if (!data || !data.items) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888">Sin resultados</td></tr>`;
      spanConteo.textContent = "Mostrando 0 resultados";
      return;
    }

    paginaActual   = data.pageIndex;
    totalPaginas   = data.totalPages;
    totalRegistros = data.totalRegisters;

    renderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (err) {
    console.error("Error cargando productos personalizados:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#e74c3c">Error al cargar datos</td></tr>`;
    spanConteo.textContent = "Mostrando 0 resultados";
  }
}

const cargarPagina = pagina => cargaPrincipal(pagina);

// ── Eventos ───────────────────────────────────────────────────
btnNuevo.addEventListener("click", () => {
  if (typeof window.AbrirAddPersonalized === "function") {
    window.AbrirAddPersonalized();
  } else {
    setTimeout(() => {
      if (typeof window.AbrirAddPersonalized === "function") {
        window.AbrirAddPersonalized();
      }
    }, 300);
  }
});

buscarInput.addEventListener("input", () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(() => {
    paginaActual = 1;
    cargarPagina(1);
  }, 400);
});

window.PersonalizedState.recargar = () => cargaPrincipal(paginaActual);

// ── Init ──────────────────────────────────────────────────────
(async () => {
  await cargarModales();
  await cargaPrincipal(1);
})();