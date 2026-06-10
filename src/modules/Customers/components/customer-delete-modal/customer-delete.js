{
  const API_BASE    = "https://localhost:7249/api/customers";
  const modal       = document.getElementById("modalDelete");
  const selectEstado = document.getElementById("selectEstado");
  const btnAceptar  = modal.querySelector(".btn.accept");
  const btnCancelar = modal.querySelector(".btn.cancel");

  window.abrirModalDelete = function () {
    selectEstado.value = "true";
    modal.style.display = "flex";
  };

  function cerrar() {
    modal.style.display = "none";
  }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnAceptar.addEventListener("click", async () => {
    const id = window.ClientesState.clienteEditandoId;
    if (id === null) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Error al cambiar estado");
      window.ClientesState.clienteEditandoId = null;
      cerrar();
      window.ClientesState.recargar();
    } catch (err) {
      alert("No se pudo cambiar el estado del cliente.");
      console.error(err);
    }
  });
}