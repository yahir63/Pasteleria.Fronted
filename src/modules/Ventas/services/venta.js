import { getToken } from "../../Login/components/Services/login.Service.js";
const API_URL = "https://localhost:7249/api/sales";

const token = getToken();

window.VentaState = {
  recargar: null,
};

const tbody = document.querySelector("table tbody");
const buscarInput = document.getElementById("BuscarVenta");
const spanConteo = document.querySelector(".table-footer span");
const paginacionDiv = document.querySelector(".pagination");
const btnNuevo = document.getElementById("btn-new");
const modalContainer = document.getElementById("modal-container");

let paginaActual = 1;
let totalPaginas = 1;
let totalRegistros = 0;
let busquedaTimer = 0;

async function CargarModales() {
  CargarCSS("/src/modules/Ventas/components/add-sale/sales-add.css");
  CargarCSS("/src/modules/Ventas/components/details/sales-detail.css");
  const rutas = [
    "/src/modules/Ventas/components/add-sale/sales-add.html",
    "/src/modules/Ventas/components/details/sales-detail-modal.html",
  ];

  const htmls = await Promise.all(
    rutas.map((r) => fetch(r).then((res) => res.text())),
  );

  htmls.forEach((html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const modal = doc.querySelector(".modal");
    if (modal) modalContainer.appendChild(modal);
  });

  await Promise.all([
    CargarScripts("/src/modules/Ventas/components/add-sale/sales-add.js"),
    CargarScripts("/src/modules/Ventas/components/details/sales-detail.js"),
  ]);
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

const GetVentas = async (page = 1, Name = "") => {
  try {
    const params = new URLSearchParams({ PageNumber: page, PageSize: 8 });
    if (Name) params.append("CustomerName", Name);

    const response = await fetch(`${API_URL}?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Ocurrió un error al cargar las ventas");
    }

    const json = await response.json();
    return json.value;
  } catch (error) {
    console.error("Error en GetVentas:", error);
  }
};

const RenderTabla = (items) => {
  tbody.innerHTML = "";
  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888">Sin resultados</td></tr>`;
    return;
  }

  items.forEach((sale) => {
    const fila = document.createElement("tr");
    const cliente = document.createElement("td");
    cliente.textContent = sale.customerName;

    const Fecha = document.createElement("td");
    Fecha.textContent = new Date(sale.saleDate).toLocaleDateString("es-NI");

    const Total = document.createElement("td");
    Total.textContent = `$${sale.saleTotal.toFixed(2)}`;

    const Acciones = document.createElement("td");
    const verDetallesBtn = document.createElement("button");
    verDetallesBtn.classList.add("view");
    verDetallesBtn.innerHTML = `
          <img src="/src/modules/Shared/Assets/img/view.png" />
          Ver detalle`;
    verDetallesBtn.dataset.id = sale.saleId;
    verDetallesBtn.addEventListener("click", async () => {
      if (typeof window.AbrirDetalles === "function") {
        await window.AbrirDetalles(sale.saleId);
      }
    });

    const accionesDiv = document.createElement("div");
    accionesDiv.classList.add("action-cells");
    accionesDiv.appendChild(verDetallesBtn);

    Acciones.appendChild(accionesDiv);
    fila.append(cliente, Fecha, Total, Acciones);
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
  spanConteo.textContent = `Mostrando ${desde} a ${hasta} de ${totalRegistros} ventas`;
}

const cargaPrincipal = async (pagina = 1) => {
  const nombre = buscarInput.value.trim();
  try {
    const data = await GetVentas(pagina, nombre);
    paginaActual = data.pageIndex;
    totalPaginas = data.totalPages;
    totalRegistros = data.totalRegisters;

    RenderTabla(data.items);
    renderPaginacion();
    actualizarConteo(data.items);
  } catch (error) {
    console.error("Error cargando ventas:", error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#e74c3c">Error al cargar ventas</td></tr>`;
  }
};

const cargarPagina = (pagina) => cargaPrincipal(pagina);

btnNuevo.addEventListener("click", () => {
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

window.VentaState.recargar = () => cargaPrincipal(paginaActual);

(async () => {
  await CargarModales();
  await cargaPrincipal(1);
})();
