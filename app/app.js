import { routes, DEFAULT_ROUTE } from "./app.routers.js";

// ─── Protección de ruta ───────────────────────────────────────────────────────
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/src/modules/Login/components/Pages/login.html";
}

const appContainer = document.getElementById("app-container");

// ─── Navegar a una ruta ───────────────────────────────────────────────────────
async function navigate(hash) {
  const path    = hash.replace("#", "") || DEFAULT_ROUTE;
  const htmlUrl = routes[path];

  // Limpiar CSS de módulos anteriores
  document.querySelectorAll("link[data-module-css]").forEach(l => l.remove());

  // Limpiar modal-container
  const modalContainer = document.getElementById("modal-container");
  if (modalContainer) modalContainer.innerHTML = "";

  if (!htmlUrl) {
    appContainer.innerHTML = `
      <div style="padding:40px;text-align:center;color:#888">
        Página no encontrada
      </div>`;
    return;
  }

  try {
    const res = await fetch(htmlUrl);
    if (!res.ok) throw new Error("No se pudo cargar el módulo");
    const html = await res.text();

    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");

    appContainer.innerHTML = doc.body.innerHTML;

    // Cargar CSS del módulo con marca para poder eliminarlos luego
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute("href");
      if (href && !href.includes("global.css")) {
        const newLink = document.createElement("link");
        newLink.rel  = "stylesheet";
        newLink.href = href;
        newLink.dataset.moduleCss = path;
        document.head.appendChild(newLink);
      }
    });

    // Cargar script del módulo
const scriptSrc = doc.querySelector("script[type='module']")?.getAttribute("src");
if (scriptSrc) {
  document.querySelectorAll("script[data-module]").forEach(s => s.remove());


  await new Promise(resolve => setTimeout(resolve, 100));

  const script = document.createElement("script");
  script.type           = "module";
  script.src            = scriptSrc + "?t=" + Date.now();
  script.dataset.module = path;
  document.body.appendChild(script);
}

    actualizarSidebarActivo(path);

  } catch (err) {
    console.error("Error navegando a", path, err);
    appContainer.innerHTML = `
      <div style="padding:40px;text-align:center;color:#e74c3c">
        Error al cargar el módulo
      </div>`;
  }
}

// ─── Marcar link activo en sidebar ───────────────────────────────────────────
function actualizarSidebarActivo(path) {
  document.querySelectorAll(".sidebar a").forEach(a => {
    a.parentElement.classList.remove("active");
    if (a.getAttribute("href") === `#${path}`) {
      a.parentElement.classList.add("active");
    }
  });
}

// ─── Escuchar cambios de hash ─────────────────────────────────────────────────
window.addEventListener("hashchange", () => navigate(window.location.hash));

// ─── Carga inicial ────────────────────────────────────────────────────────────
navigate(window.location.hash || `#${DEFAULT_ROUTE}`);