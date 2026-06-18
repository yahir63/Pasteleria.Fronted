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

  // ─── Control de visibilidad para el Login ─────────────────────────────────────
  const sidebar = document.getElementById("sidebar-container");
  const topbar = document.getElementById("topbar-container");
  const mainLayout = document.querySelector(".main");

  if (path === "/login") {
    if (sidebar) sidebar.style.display = "none";
    if (topbar) topbar.style.display = "none";
    if (mainLayout) {
      mainLayout.style.marginLeft = "0px";
      mainLayout.style.width = "100%";
    }
  } else {
    if (sidebar) sidebar.style.display = ""; 
    if (topbar) topbar.style.display = "";
    if (mainLayout) {
      mainLayout.style.marginLeft = "";
      mainLayout.style.width = "";
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  if (!htmlUrl) {
    appContainer.innerHTML = `
      <div style="padding:40px;text-align:center;color:#888">
        Página no encontrada
      </div>`;
    return;
  }

  try {
    // 1. Ocultar completamente el contenedor para evitar los saltos visuales
    appContainer.style.visibility = "hidden";

    const res = await fetch(htmlUrl);
    if (!res.ok) throw new Error("No se pudo cargar el módulo");
    const html = await res.text();

    const parser = new DOMParser();
    const doc    = parser.parseFromString(html, "text/html");

    // Limpiar CSS antiguos
    document.querySelectorAll("link[data-module-css]").forEach(l => l.remove());

    // Limpiar modal-container
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) modalContainer.innerHTML = "";

    // 2. Inyectar nuevos CSS y verificar su correcta carga en el DOM
    const cssPromises = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute("href");
      if (href && !href.includes("global.css")) {
        const newLink = document.createElement("link");
        newLink.rel  = "stylesheet";
        newLink.href = href;
        newLink.dataset.moduleCss = path;

        // Promesa robusta que espera a que el navegador registre el CSS activo
        const p = new Promise((resolve) => {
          newLink.onload = () => {
            // Un pequeño retraso extra para garantizar que las reglas CSS se procesaron
            setTimeout(resolve, 20);
          };
          newLink.onerror = resolve; 
        });
        cssPromises.push(p);

        document.head.appendChild(newLink);
      }
    });

    // Esperar a que todos los CSS estén cargados y procesados
    if (cssPromises.length > 0) {
      await Promise.all(cssPromises);
    }

    // 3. Insertar el HTML de manera segura
    appContainer.innerHTML = doc.body.innerHTML;

    // 4. Asegurar con requestAnimationFrame que el navegador calculó el Layout final
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        appContainer.style.visibility = "visible";
      });
    });

    // 5. Cargar script del módulo
    const scriptSrc = doc.querySelector("script[type='module']")?.getAttribute("src");
    if (scriptSrc) {
      document.querySelectorAll("script[data-module]").forEach(s => s.remove());

      await new Promise(resolve => setTimeout(resolve, 50));

      const script = document.createElement("script");
      script.type           = "module";
      script.src            = scriptSrc + "?t=" + Date.now();
      script.dataset.module = path;
      document.body.appendChild(script);
    }

    actualizarSidebarActivo(path);

  } catch (err) {
    console.error("Error navegando a", path, err);
    appContainer.style.visibility = "visible";
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