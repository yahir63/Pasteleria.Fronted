{
  const modal       = document.getElementById("modalAddUser");
  const btnCancelar  = document.getElementById("cancelAddUser");
  const btnClose     = document.getElementById("closeAddUser");

  function abrir() {
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  // Eventos para cerrar
  btnCancelar.addEventListener("click", cerrar);
  btnClose.addEventListener("click", cerrar);
  
  modal.addEventListener("click", (e) => { 
    if (e.target === modal) cerrar(); 
  });

  // Exponer función para abrir el modal desde Configuracion.js
  window.abrirModalAddUser = abrir;
}