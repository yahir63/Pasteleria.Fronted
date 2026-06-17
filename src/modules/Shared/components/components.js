async function loadComponents() {
  const sidebar = await fetch("/src/modules/Shared/components/Sidebar.html");
  document.getElementById("sidebar-container").innerHTML = await sidebar.text();

  const topbar = await fetch("/src/modules/Shared/components/Topbar.html");
  document.getElementById("topbar-container").innerHTML = await topbar.text();

  await new Promise(resolve => setTimeout(resolve, 50));

  // Clonar botón para eliminar listeners duplicados
  const oldBtn = document.querySelector(".hamburger-btn");
  const hamburger = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(hamburger, oldBtn);

  const sidebarEl = document.querySelector(".sidebar");
  const overlay   = document.querySelector(".sidebar-overlay");
  
hamburger.addEventListener("click", () => {

  hamburger.classList.toggle("active");
  sidebarEl.classList.toggle("open");
  if (overlay) overlay.classList.toggle("active");
});

  if (overlay) {
    overlay.addEventListener("click", () => {
      hamburger.classList.remove("active");
      sidebarEl.classList.remove("open");
      overlay.classList.remove("active");
    });
  }

  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      sidebarEl.classList.remove("open");
      if (overlay) overlay.classList.remove("active");
    });
  });

  activarSidebar();
}

function activarSidebar() {
  const hash = window.location.hash.replace("#", "");
  document.querySelectorAll(".sidebar a").forEach(link => {
    const linkHash = link.getAttribute("href")?.replace("#", "");
    link.parentElement.classList.toggle("active", linkHash === hash);
  });
}

window.addEventListener("hashchange", activarSidebar);

loadComponents();