import { toggleEstado } from "/src/modules/Producto/services/Producto.service.js";

export function init(state) {
  const modal       = document.getElementById("modalDelete");
  const btnAceptar  = modal.querySelector(".btn.accept");
  const btnCancelar = modal.querySelector(".btn.cancel");

  function abrir() { modal.style.display = "flex"; }
  function cerrar() { modal.style.display = "none"; }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnAceptar.addEventListener("click", async () => {
    const id = state.productoEditandoId;
    if (id === null) return;

    try {
      await toggleEstado(id);
      state.productoEditandoId = null;
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message);
    }
  });

  state.abrirModalDelete = abrir;
}