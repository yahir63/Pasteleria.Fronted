import { create } from "/src/modules/Producto/services/producto.service.js";

export function init(state) {
  const modal = document.getElementById("modalAdd");

  const addNombre = document.getElementById("addNombre");
  const addCategoria = document.getElementById("addCategoria");
  const addProveedor = document.getElementById("addProveedor");
  const addDescripcion = document.getElementById("addDescripcion");

  const btnGuardar = modal.querySelector(".btn.save");
  const btnCancelar = modal.querySelector(".btn.cancel");

  function abrir() {
    limpiar();
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
    limpiar();
  }

  function limpiar() {
    [
      addNombre,
      addCategoria,
      addProveedor,
      addDescripcion
    ].forEach(i => i.value = "");
  }

  btnCancelar.addEventListener("click", cerrar);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  btnGuardar.addEventListener("click", async () => {

    const nombre = addNombre.value.trim();

    if (!nombre) {
      alert("El nombre del producto es obligatorio.");
      return;
    }

    try {

      await create({
        ProductName: addNombre.value.trim(),
        CategoryId: Number(addCategoria.value),
        SupplierId: Number(addProveedor.value),
        Description: addDescripcion.value.trim(),
        IsActive: true
      });

      cerrar();
      state.recargar();

    } catch (err) {

      alert(err.message);

    }

  });

  state.abrirModalAdd = abrir;
}