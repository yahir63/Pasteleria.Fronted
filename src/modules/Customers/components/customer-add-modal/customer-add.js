import { create } from "/src/modules/Customers/services/customer.service.js";

export function init(state) {
  const modal      = document.getElementById("modalAdd");
  const addNombre    = document.getElementById("addNombre");
  const addApellido  = document.getElementById("addApellido");
  const addTelefono  = document.getElementById("addTelefono");
  const addCedula    = document.getElementById("addCedula");
  const addDireccion = document.getElementById("addDireccion");
  const addCiudad    = document.getElementById("addCiudad");
  const btnGuardar   = modal.querySelector(".btn.save");
  const btnCancelar  = modal.querySelector(".btn.cancel");

  function abrir() {
    limpiar();
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
    limpiar();
  }

  function limpiar() {
    [addNombre, addApellido, addTelefono, addCedula, addDireccion, addCiudad]
      .forEach(i => i.value = "");
  }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnGuardar.addEventListener("click", async () => {
    const nombre   = addNombre.value.trim();
    const apellido = addApellido.value.trim();

    if (!nombre || !apellido) {
      alert("Nombre y Apellido son obligatorios.");
      return;
    }

    try {
      await create({
        Name   : `${nombre} ${apellido}`,
        DNI    : addCedula.value.trim(),
        Address: addDireccion.value.trim(),
        City   : addCiudad.value.trim(),
        Phone  : addTelefono.value.trim(),
      });
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message);
    }
  });

  // Exponer al state para que Clientes.js pueda abrirlo
  state.abrirModalAdd = abrir;
}