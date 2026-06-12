import { create } from "/src/modules/Categories/services/category.service.js";

export function init(state) {
  const modal       = document.getElementById("modalAdd");
  const inputNombre = modal.querySelector("input");
  const inputDesc   = modal.querySelector("textarea");
  const inputIcon   = modal.querySelector(".input-icon");
  const iconPreview = modal.querySelector(".icon-preview");
  const btnGuardar  = modal.querySelector(".btn.save");
  const btnCancelar = modal.querySelector(".btn.cancel");

  const ICON_DEFAULT = "fa-solid fa-tag";

  function actualizarPreview() {
    const val = inputIcon.value.trim() || ICON_DEFAULT;
    iconPreview.className = `icon-preview ${val}`;
  }

  function abrir() {
    limpiar();
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
    limpiar();
  }

  function limpiar() {
    inputNombre.value = "";
    inputDesc.value   = "";
    inputIcon.value   = "";
    iconPreview.className = `icon-preview ${ICON_DEFAULT}`;
  }

  inputIcon.addEventListener("input", actualizarPreview);
  btnCancelar.addEventListener("click", (e) => { e.preventDefault(); cerrar(); });
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnGuardar.addEventListener("click", async () => {
    const nombre = inputNombre.value.trim();
    if (!nombre) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      await create({
        CategoryName: nombre,
        Description : inputDesc.value.trim(),
        Icon        : inputIcon.value.trim() || ICON_DEFAULT,
        IsActive    : true,
      });
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message);
    }
  });

  state.abrirModalAdd = abrir;
}