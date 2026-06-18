{
  const modalContainer = document.getElementById("modal-container");
  const btnNuevoUsuario = document.getElementById("btnNuevoUsuario");

  // ─── Cargar el modal de Nuevo Usuario (solo una vez, al iniciar la página) ───
  async function cargarModalUsuario() {
    try {
      const res  = await fetch("/src/modules/Configuracion/components/user-add-modal/user-add.html");
      const html = await res.text();

      const parser = new DOMParser();
      const doc    = parser.parseFromString(html, "text/html");
      const modal  = doc.querySelector(".modal");

      if (modal) modalContainer.appendChild(modal);

      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute("href");
        if (href && !document.querySelector(`link[href="${href}"]`)) {
          const newLink = document.createElement("link");
          newLink.rel  = "stylesheet";
          newLink.href = href;
          document.head.appendChild(newLink);
        }
      });

      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "/src/modules/Configuracion/components/user-add-modal/user-add.js";
        script.onload = resolve;
        document.body.appendChild(script);
      });

      console.log("Modal de usuario cargado correctamente");
    } catch (err) {
      console.error("Error cargando el modal de usuario:", err);
    }
  }

  // ─── Click en el botón abre el modal (ya cargado de antemano) ────────────────
  btnNuevoUsuario.addEventListener("click", () => {
    if (typeof window.abrirModalAddUser === "function") {
      window.abrirModalAddUser();
    } else {
      console.error("abrirModalAddUser no está definido todavía");
    }
  });

  // ─── Init: cargar el modal en segundo plano al entrar a la página ────────────
  cargarModalUsuario();
}