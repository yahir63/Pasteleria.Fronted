import { deactivate } from "/src/modules/Categories/services/category.service.js";

export function init(state) {
  const modal        = document.getElementById("modalDelete");
  const selectEstado = document.getElementById("selectEstadoCategoria");
  const btnAceptar   = modal.querySelector(".btn.accept");
  const btnCancelar  = modal.querySelector(".btn.cancel");

  function abrir() {
    selectEstado.value = "true";
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnAceptar.addEventListener("click", async () => {
    const id = state.categoriaEditandoId;
    if (id === null) return;

    try {
      await deactivate(id);
      state.categoriaEditandoId = null;
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message);
    }
  });

  state.abrirModalDelete = abrir;
}