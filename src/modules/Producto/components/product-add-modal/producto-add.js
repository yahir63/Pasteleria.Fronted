import { create } from "/src/modules/Producto/services/Producto.service.js";
import { getToken } from "/src/modules/Login/components/Services/login.Service.js";

const CAT_API = "https://localhost:7249/api/categories";
const SUP_API = "https://localhost:7249/api/suppliers";

async function cargarOpciones(select, url, idField, nameField) {
  try {
    const Token = getToken();
    const res  = await fetch(`${url}?PageNumber=1&PageSize=100`, {
      headers: {
        "Authorization": `Bearer ${Token}`
      }
    });

    const json = await res.json();
    const items = json.value?.items ?? [];
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
  const modal          = document.getElementById("modalAdd");
  const addNombre      = document.getElementById("addNombre");
  const addDescripcion = document.getElementById("addDescripcion");
  const addCategoria   = document.getElementById("addCategoria");
  const addProveedor   = document.getElementById("addProveedor");
  const btnGuardar     = modal.querySelector(".btn.save");
  const btnCancelar    = modal.querySelector(".btn.cancel");

  // Cargar selects una sola vez
  cargarOpciones(addCategoria, CAT_API, "categoryId", "name");
  cargarOpciones(addProveedor, SUP_API, "supplierId", "name");

  function abrir() { limpiar(); modal.style.display = "flex"; }
  function cerrar() { modal.style.display = "none"; limpiar(); }
  function limpiar() {
    addNombre.value      = "";
    addDescripcion.value = "";
    addCategoria.value   = "";
    addProveedor.value   = "";
  }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnGuardar.addEventListener("click", async () => {
    const nombre = addNombre.value.trim();
    if (!nombre)              { alert("El nombre del producto es obligatorio."); return; }
    if (!addCategoria.value)  { alert("Selecciona una categoría."); return; }
    if (!addProveedor.value)  { alert("Selecciona un proveedor."); return; }

    try {
      await create({
        ProductName : nombre,
        CategoryId  : Number(addCategoria.value),
        SupplierId  : Number(addProveedor.value),
        Description : addDescripcion.value.trim(),
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