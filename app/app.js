import { routes, DEFAULT_ROUTE } from "./app.routers.js";

// ─── Protección de ruta: si no hay sesión, ir al login ────────────────────────
const token = localStorage.getItem("token");
if (!token) {
 window.location.href = "/src/modules/Login/components/Pages/login.html";
}

const appContainer = document.getElementById("app-container");

// ─── Navegar a una ruta ───────────────────────────────────────────────────────
async function navigate(hash) {
  const path    = hash.replace("#", "") || DEFAULT_ROUTE;
  const htmlUrl = routes[path];

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

    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute("href");
      if (href && !document.querySelector(`link[href="${href}"]`)) {
        const newLink = document.createElement("link");
        newLink.rel  = "stylesheet";
        newLink.href = href;
        document.head.appendChild(newLink);
      }
    });

    const scriptSrc = doc.querySelector("script[type='module']")?.getAttribute("src");
    if (scriptSrc) {
      document.querySelectorAll("script[data-module]").forEach(s => s.remove());
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