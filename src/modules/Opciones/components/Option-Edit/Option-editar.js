import { update } from "/src/modules/Opciones/Services/option.service.js";

export function init(state) {
  const modal       = document.getElementById("modalEditOpcion");
  const inputNombre = document.getElementById("edit-opcion-nombre");
  const inputDesc   = document.getElementById("edit-opcion-descripcion");
  const inputMedida = document.getElementById("edit-opcion-medida");
  const inputPrecio = document.getElementById("edit-opcion-precio");
  const btnGuardar  = document.getElementById("btn-save-edit-opcion");
  const btnCancelar = document.getElementById("btn-cancel-edit-opcion");
  const btnClose    = document.getElementById("close-edit-opcion");

  let opcionId = null;

  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  state.abrirModalEdit = (opcion) => {
    console.log("Datos recibidos en el modal:", opcion); 


    opcionId = opcion.optionId ?? opcion.OptionId;
    inputNombre.value = opcion.name        ?? "";
    inputDesc.value   = opcion.description ?? "";
    inputMedida.value = opcion.measurement ?? "";
    inputPrecio.value = opcion.price       ?? "";
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  btnCancelar.addEventListener("click", () => {
    if (confirm("¿Seguro que desea salir sin guardar?")) cerrar();
  });
  btnClose.addEventListener("click", cerrar);

  btnGuardar.addEventListener("click", async () => {
    if (!inputNombre.value.trim()) { alert("El nombre es obligatorio"); return; }
    if (!inputPrecio.value)        { alert("El precio es obligatorio"); return; }

    const body = {
      name:        inputNombre.value.trim(),
      description: inputDesc.value.trim(),
      measurement: inputMedida.value.trim(),
      price:       parseFloat(inputPrecio.value),
    };

    try {
      await update(opcionId, body);
      alert("Opción actualizada exitosamente");
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message ?? "Error al actualizar la opción");
    }
  });
}