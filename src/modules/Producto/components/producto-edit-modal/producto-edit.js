import { update } from "/src/modules/Producto/services/product.service.js";

export function init(state) {

  const modal = document.getElementById("modalEdit");

  const editNombre = document.getElementById("editNombre");
  const editCategoria = document.getElementById("editCategoria");
  const editProveedor = document.getElementById("editProveedor");
  const editDescripcion = document.getElementById("editDescripcion");

  const btnActualizar = modal.querySelector(".btn.save");
  const btnCancelar = modal.querySelector(".btn.cancel");

  function abrir(data) {

    editNombre.value = data.productName ?? "";
    editCategoria.value = data.categoryId ?? "";
    editProveedor.value = data.supplierId ?? "";
    editDescripcion.value = data.description ?? "";

    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  btnCancelar.addEventListener("click", cerrar);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  btnActualizar.addEventListener("click", async () => {

    const id = state.productoEditandoId;

    if (id === null) return;

    try {

      await update(id, {
        ProductName: editNombre.value.trim(),
        CategoryId: Number(editCategoria.value),
        SupplierId: Number(editProveedor.value),
        Description: editDescripcion.value.trim(),
        IsActive: true
      });

      state.productoEditandoId = null;

      cerrar();

      state.recargar();

    } catch (err) {

      alert(err.message);

    }

  });

  state.abrirModalEdit = abrir;
}