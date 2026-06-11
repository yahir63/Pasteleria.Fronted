import { update } from "/src/modules/Customers/services/customer.service.js";

export function init(state) {
  const modal       = document.getElementById("modalEdit");
  const editNombre    = document.getElementById("editNombre");
  const editApellido  = document.getElementById("editApellido");
  const editTelefono  = document.getElementById("editTelefono");
  const editCedula    = document.getElementById("editCedula");
  const editDireccion = document.getElementById("editDireccion");
  const editCiudad    = document.getElementById("editCiudad");
  const btnActualizar = modal.querySelector(".btn.save");
  const btnCancelar   = modal.querySelector(".btn.cancel");

  function abrir(data) {
    editNombre.value    = data.nombre    ?? "";
    editApellido.value  = data.apellido  ?? "";
    editTelefono.value  = data.telefono  ?? "";
    editCedula.value    = data.cedula    ?? "";
    editDireccion.value = data.direccion ?? "";
    editCiudad.value    = data.ciudad    ?? "";
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnActualizar.addEventListener("click", async () => {
    const id = state.clienteEditandoId;
    if (id === null) return;

    try {
      await update(id, {
        Name    : `${editNombre.value.trim()} ${editApellido.value.trim()}`,
        DNI     : editCedula.value.trim(),
        Address : editDireccion.value.trim(),
        City    : editCiudad.value.trim(),
        Phone   : editTelefono.value.trim(),
        IsActive: true,
      });
      state.clienteEditandoId = null;
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message);
    }
  });

  state.abrirModalEdit = abrir;
}