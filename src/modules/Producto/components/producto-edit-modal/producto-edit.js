import { update } from "/src/modules/Producto/services/Producto.service.js";

const CAT_API = "https://localhost:7249/api/categories";
const SUP_API = "https://localhost:7249/api/suppliers";

async function cargarOpciones(select, url, idField, nameField) {
  try {
    const res  = await fetch(`${url}?PageNumber=1&PageSize=100`);
    const json = await res.json();
    const items = json.value?.items ?? [];
    // Limpiar opciones anteriores excepto la primera
    while (select.options.length > 1) select.remove(1);
    items.forEach(item => {
      const opt = document.createElement("option");
      opt.value       = item[idField];
      opt.textContent = item[nameField];
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(`Error cargando opciones de ${url}:`, err);
  }
}

export function init(state) {
  const modal           = document.getElementById("modalEdit");
  const editNombre      = document.getElementById("editNombre");
  const editDescripcion = document.getElementById("editDescripcion");
  const editCategoria   = document.getElementById("editCategoria");
  const editProveedor   = document.getElementById("editProveedor");
  const btnActualizar   = modal.querySelector(".btn.save");
  const btnCancelar     = modal.querySelector(".btn.cancel");

  // Cargar selects una sola vez
  cargarOpciones(editCategoria, CAT_API, "categoryId", "name");
  cargarOpciones(editProveedor, SUP_API, "supplierId", "name");

  function abrir(data) {
    editNombre.value      = data.productname  ?? "";
    editDescripcion.value = data.description  ?? "";
    // Preseleccionar la categoría y proveedor actuales
    editCategoria.value   = data.categoryid   ?? "";
    editProveedor.value   = data.supplierid   ?? "";
    modal.style.display = "flex";
  }

  function cerrar() { modal.style.display = "none"; }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnActualizar.addEventListener("click", async () => {
    const id = state.productoEditandoId;
    if (id === null) return;

    if (!editCategoria.value) { alert("Selecciona una categoría."); return; }
    if (!editProveedor.value) { alert("Selecciona un proveedor."); return; }

    try {
      await update(id, {
        ProductName : editNombre.value.trim(),
        CategoryId  : Number(editCategoria.value),
        SupplierId  : Number(editProveedor.value),
        Description : editDescripcion.value.trim(),
        IsActive    : true,
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