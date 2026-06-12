import { update } from "/src/modules/Categories/services/category.service.js";

export function init(state) {
  const modal       = document.getElementById("modalEdit");
  const inputNombre = modal.querySelector("input");
  const inputDesc   = modal.querySelector("textarea");
  const inputIcon   = modal.querySelector(".input-icon");
  const iconPreview = modal.querySelector(".icon-preview");
  const btnActualizar = modal.querySelector(".btn.save");
  const btnCancelar   = modal.querySelector(".btn.cancel");

  const ICON_DEFAULT = "fa-solid fa-tag";

  function actualizarPreview() {
    const val = inputIcon.value.trim() || ICON_DEFAULT;
    iconPreview.className = `icon-preview ${val}`;
  }

  function abrir(data) {
    inputNombre.value = data.nombre      ?? "";
    inputDesc.value   = data.descripcion ?? "";
    inputIcon.value   = data.icon !== ICON_DEFAULT ? (data.icon ?? "") : "";
    iconPreview.className = `icon-preview ${data.icon ?? ICON_DEFAULT}`;
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  inputIcon.addEventListener("input", actualizarPreview);
  btnCancelar.addEventListener("click", (e) => { e.preventDefault(); cerrar(); });
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnActualizar.addEventListener("click", async () => {
    const id = state.categoriaEditandoId;
    if (id === null) return;

    const nombre = inputNombre.value.trim();
    if (!nombre) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      await update(id, {
        CategoryName: nombre,
        Description : inputDesc.value.trim(),
        Icon        : inputIcon.value.trim() || ICON_DEFAULT,
        IsActive    : true,
      });
      state.categoriaEditandoId = null;
      cerrar();
      state.recargar();
    } catch (err) {
      alert(err.message);
    }
  });

  state.abrirModalEdit = abrir;
}