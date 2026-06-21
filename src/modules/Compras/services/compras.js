import { getToken } from "/src/modules/Login/components/Services/login.Service.js";
const API_URL = "https://localhost:7249/api/purchases";

window.CompraState = {
  recargar: null,
};

// AQUI MANEJAMOS LOS COMPONENTES HTML DEL DOM
const tbody = document.querySelector("table tbody");
const buscarInput = document.getElementById("BuscarProv");
const spanConteo = document.querySelector(".table-footer span");
const paginacionDiv = document.querySelector(".pagination");
const btnNuevo = document.getElementById("btn-new");
const modalContainer = document.getElementById("modal-container");

// CONTROL DE PAGINACION
let paginaActual = 1;
let totalPaginas = 1;
let totalRegistros = 0;
let busquedaTimer = 0;

// cargar modales
async function CargarModales() {
  CargarCSS(
    "/src/modules/Compras/components/purchases-addcompra/purchases-add.css",
  );
  CargarCSS("/src/modules/Compras/components/ver-detalles/detalles.css");
  const rutas = [
    "/src/modules/Compras/components/purchases-addcompra/purchases-addCompra.html",
    "/src/modules/Compras/components/ver-detalles/detalles-modal.html",
  ];

  const htmls = await Promise.all(
    rutas.map((r) => fetch(r).then((res) => res.text())),
  );

  htmls.forEach((html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const modal = doc.querySelector(".modal");

    console.log("modal cargado", modal);
    if (modal) modalContainer.appendChild(modal);
  });
  console.log(modalContainer.innerHTML);
  await Promise.all([
    CargarScripts(
      "/src/modules/Compras/components/purchases-addcompra/add-compra.js",
    ),
    CargarScripts("/src/modules/Compras/components/ver-detalles/detalles.js"),
  ]);

  console.log(document.querySelectorAll("#modal"));
}

const CargarScripts = (src) => {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    s.type = "module";
    s.onload = resolve;
    document.body.appendChild(s);
  });
};

const GetCompras = async (page = 1, Name = "") => {
  try {
    const params = new URLSearchParams({ PageNumber: page, PageSize: 8 });
    if (Name) {
      params.append("SupplierName", Name);
    }
    const token = getToken();
    const response = await fetch(`${API_URL}?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.log("revisa la uri");
      throw new Error("Ocurrio un error al cargar las compras");
    }

    const json = await response.json();
    return json.value;
  } catch (error) {
    console.error("ocurrio un error al cargar los clientes");
  }
};

const RenderTabla = (items) => {
  tbody.innerHTML = "";
  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach((p) => {
    const fila = document.createElement("tr");
    // Construccion de la tabla
    const proveedor = document.createElement("td");
    proveedor.textContent = p.supplierName;
    const Fecha = document.createElement("td");
    Fecha.textContent = new Date(p.date).toLocaleDateString("es-NI");
    const Total = document.createElement("td");
    Total.textContent = `$${p.totalAmount.toFixed(2)}`;
    const VerDetalles = document.createElement("td");

    const verDetallesBtn = document.createElement("button");

    verDetallesBtn.classList.add("view");

    verDetallesBtn.innerHTML = `
          <img src="/src/modules/Shared/Assets/img/ojo.png" />
          ver Detalles`;

    verDetallesBtn.dataset.id = p.purchaseId;
    VerDetalles.appendChild(verDetallesBtn);

    // Click en botón "Ver Detalles" - Llama a AbrirDetalles con el ID
    verDetallesBtn.addEventListener("click", async () => {
      if (typeof window.AbrirDetalles === "function") {
        await window.AbrirDetalles(p.purchaseId);
      }
    });

    console.log({
      proveedor,
      Fecha,
      Total,
      VerDetalles,
    });
    fila.append(proveedor, Fecha, Total, VerDetalles);
    tbody.appendChild(fila);
  });
};

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
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} Compras`;
}

const cargaPrincipal = async (pagina = 1) => {
  const nombre = buscarInput.value.trim();
  try {
    const data = await GetCompras(pagina, nombre);

    paginaActual = data.pageIndex;
    totalPaginas = data.totalPages;
    totalRegistros = data.totalRegisters;

    RenderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (error) {
    console.error("Error cargando compras :", error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#e74c3c">Error al cargar compras</td></tr>`;
  }
};

const cargarPagina = (pagina) => cargaPrincipal(pagina);

btnNuevo.addEventListener("click", () => {
  console.log("boton clickead");
  console.log(window.AbrirModal);

  if (typeof window.AbrirModal === "function") window.AbrirModal();
});

buscarInput.addEventListener("input", () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(() => {
    paginaActual = 1;
    cargarPagina(1);
  }, 400);
});
function CargarCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;

  document.head.appendChild(link);
}

// ─── Exponer recarga para los modales ─────────────────────────────────────────
window.CompraState.recargar = () => cargaPrincipal(paginaActual);

// ─── Init ─────────────────────────────────────────────────────────────────────
(async () => {
  await CargarModales();
  await cargaPrincipal(1);
})();
