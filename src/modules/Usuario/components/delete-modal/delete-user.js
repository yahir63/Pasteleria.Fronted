import { deactivate } from "../../services/User.services.js";

export function init(state) {
  const modal = document.getElementById("modalDelete");
  const btnBorrar = document.getElementById("delete");
  const btnCancelar = document.getElementById("save");

  function abrirModal() {
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  if (btnCancelar) btnCancelar.addEventListener("click", cerrar);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  if (btnBorrar) {
    btnBorrar.addEventListener("click", async () => {
      const id = state.UsuarioEditandoId;
      if (id === null || id === undefined) return;

      try {
        await deactivate(id);
        state.UsuarioEditandoId = null;
        cerrar();
        state.recargar();
      } catch (error) {
        alert(error.message || error);
      }
    });
  }

  state.abrirModalDelete = abrirModal;
}
