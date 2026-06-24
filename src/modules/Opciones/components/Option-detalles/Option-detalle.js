export function init(state) {
  const modal      = document.getElementById("modalDetalleOpcion");
  const spanNombre = document.getElementById("detalle-opcion-nombre");
  const spanDesc   = document.getElementById("detalle-opcion-descripcion");
  const spanMedida = document.getElementById("detalle-opcion-medida");
  const spanPrecio = document.getElementById("detalle-opcion-precio");
  const btnCerrar  = document.getElementById("btn-cerrar-detalle-opcion");
  const btnClose   = document.getElementById("close-detalle-opcion");

  const cerrar = () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  state.abrirModalDetalle = (opcion) => {
    spanNombre.textContent = opcion.name        ?? "";
    spanDesc.textContent   = opcion.description ?? "";
    spanMedida.textContent = opcion.measurement ?? "";
    spanPrecio.textContent = `C$ ${Number(opcion.price ?? 0).toFixed(2)}`;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  btnCerrar.addEventListener("click", cerrar);
  btnClose.addEventListener("click", cerrar);
}