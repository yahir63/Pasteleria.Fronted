{
  const API_BASE = "https://localhost:7249/api/customers";
  const modal    = document.getElementById("modalAdd");

  const addNombre    = document.getElementById("addNombre");
  const addApellido  = document.getElementById("addApellido");
  const addTelefono  = document.getElementById("addTelefono");
  const addCedula    = document.getElementById("addCedula");
  const addDireccion = document.getElementById("addDireccion");
  const addCiudad    = document.getElementById("addCiudad");
  const btnGuardar   = modal.querySelector(".btn.save");
  const btnCancelar  = modal.querySelector(".btn.cancel");

  window.abrirModalAdd = function () {
    limpiar();
    modal.style.display = "flex";
  };

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

    const data = {
      Name   : `${nombre} ${apellido}`,
      DNI    : addCedula.value.trim(),
      Address: addDireccion.value.trim(),
      City   : addCiudad.value.trim(),
      Phone  : addTelefono.value.trim(),
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        const msgs = err.Errors?.join("\n") ?? "Error al crear cliente";
        alert(msgs);
        return;
      }

      cerrar();
      window.ClientesState.recargar();
    } catch (err) {
      alert("No se pudo guardar el cliente.");
      console.error(err);
    }
  });
}