import { remove } from "/src/modules/Opciones/Services/option.service.js";

export function init(state) {
  const modal      = document.getElementById("modalDeleteOpcion");
  const btnConfirm = document.getElementById("btn-confirm-delete-opcion");
  const btnCancel  = document.getElementById("btn-cancel-delete-opcion");
  const btnClose   = document.getElementById("close-delete-opcion");
  const spanNombre = document.getElementById("delete-opcion-nombre");

  let idAEliminar = null;

  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  state.abrirModalDelete = (opcion) => {
    if (!opcion) return;
    
    idAEliminar = opcion.optionId;
    // Mostramos el nombre en el modal para que el usuario sepa qué borra
    if (spanNombre) spanNombre.textContent = opcion.name;
    
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  btnConfirm.addEventListener("click", async () => {
    if (!idAEliminar) return;

    try {
      await remove(idAEliminar);
      alert("Elemento eliminado exitosamente");
      cerrar();
      state.recargar();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar: " + (err.message || "Error desconocido"));
    }
  });

  btnCancel.addEventListener("click", cerrar);
  btnClose.addEventListener("click", cerrar);
}