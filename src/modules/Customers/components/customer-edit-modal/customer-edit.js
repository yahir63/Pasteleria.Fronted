{
  const API_BASE = "https://localhost:7249/api/customers";
  const modal    = document.getElementById("modalEdit");

  const editNombre    = document.getElementById("editNombre");
  const editApellido  = document.getElementById("editApellido");
  const editTelefono  = document.getElementById("editTelefono");
  const editCedula    = document.getElementById("editCedula");
  const editDireccion = document.getElementById("editDireccion");
  const editCiudad    = document.getElementById("editCiudad");
  const btnActualizar = modal.querySelector(".btn.save");
  const btnCancelar   = modal.querySelector(".btn.cancel");

  window.abrirModalEdit = function (data) {
    editNombre.value    = data.nombre    ?? "";
    editApellido.value  = data.apellido  ?? "";
    editTelefono.value  = data.telefono  ?? "";
    editCedula.value    = data.cedula    ?? "";
    editDireccion.value = data.direccion ?? "";
    editCiudad.value    = data.ciudad    ?? "";
    modal.style.display = "flex";
  };

  function cerrar() {
    modal.style.display = "none";
  }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnActualizar.addEventListener("click", async () => {
    const id = window.ClientesState.clienteEditandoId;
    if (id === null) return;

    const data = {
      Name    : `${editNombre.value.trim()} ${editApellido.value.trim()}`,
      DNI     : editCedula.value.trim(),
      Address : editDireccion.value.trim(),
      City    : editCiudad.value.trim(),
      Phone   : editTelefono.value.trim(),
      IsActive: true,
    };

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        const msgs = Array.isArray(err.Errors) ? err.Errors.join("\n") : "Error al actualizar cliente";
        alert(msgs);
        return;
      }

      window.ClientesState.clienteEditandoId = null;
      cerrar();
      window.ClientesState.recargar();
    } catch (err) {
      alert("No se pudo actualizar el cliente.");
      console.error(err);
    }
  });
}