import { create } from "/src/modules/Opciones/Services/option.service.js";

export function init(state) {
  const modal       = document.getElementById("modalAddOpcion");
  const inputNombre = document.getElementById("add-opcion-nombre");
  const inputDesc   = document.getElementById("add-opcion-descripcion");
  const inputMedida = document.getElementById("add-opcion-medida");
  const inputPrecio = document.getElementById("add-opcion-precio");
  const btnGuardar  = document.getElementById("btn-save-opcion");
  const btnCancelar = document.getElementById("btn-cancel-add-opcion");
  const btnClose    = document.getElementById("close-add-opcion");

  const limpiar = () => {
    inputNombre.value = "";
    inputDesc.value   = "";
    inputMedida.value = "";
    inputPrecio.value = "";
  };

  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    limpiar();
  };

  state.abrirModalAdd = () => {
    limpiar();
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
  await create(body);
  cerrar();
  state.recargar();
  alert("Opción creada exitosamente");
} catch (err) {
  // Igual recargamos porque puede haberse creado
  cerrar();
  state.recargar();
}
  });
}