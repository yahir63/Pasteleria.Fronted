// /JS/responsive.js

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger-btn');
  const overlay   = document.querySelector('.sidebar-overlay');

  // Función que conecta el botón con el sidebar
  function conectarMenu() {
    const sidebar = document.querySelector('.sidebar');
    
    // Si aún no existe el sidebar, no hacemos nada (esperamos)
    if (!sidebar) return false;

    // Limpiamos eventos anteriores para evitar duplicados
    const newHamburger = hamburger.cloneNode(true);
    const newOverlay   = overlay.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);
    overlay.parentNode.replaceChild(newOverlay, overlay);

    // Re-seleccionamos los elementos clonados
    const btn = document.querySelector('.hamburger-btn');
    const ovl = document.querySelector('.sidebar-overlay');

    // 1. Click en hamburguesa
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      sidebar.classList.toggle('open');
      ovl.classList.toggle('active');
      // Bloquear scroll del body cuando el menú está abierto
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });

    // 2. Click en el fondo oscuro (cerrar)
    ovl.addEventListener('click', () => {
      btn.classList.remove('active');
      sidebar.classList.remove('open');
      ovl.classList.remove('active');
      document.body.style.overflow = '';
    });

    // 3. Cerrar al hacer clic en un enlace del sidebar (móvil)
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          btn.classList.remove('active');
          sidebar.classList.remove('open');
          ovl.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    return true; // Éxito
  }

  // Intentar conectar inmediatamente
  if (!conectarMenu()) {
    // Si falla (porque components.js aún carga), usamos un Observador
    const observer = new MutationObserver(() => {
      if (conectarMenu()) {
        observer.disconnect(); // Deja de observar una vez conectado
      }
    });
    
    // Observar cambios en todo el body
    observer.observe(document.body, { childList: true, subtree: true });
  }
});