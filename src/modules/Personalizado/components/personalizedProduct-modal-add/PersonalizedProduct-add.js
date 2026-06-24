import { getAll as getClientes } from "/src/modules/Customers/Services/customer.service.js";
import { getAll as getProductos } from "/src/modules/Producto/services/Producto.service.js";
import { getAll as getOpciones } from "/src/modules/Opciones/Services/option.service.js";
import { create } from "/src/modules/Personalizado/services/personalizedProduct.service.js";

let opcionesSeleccionadas = [];
let selectedOpcion = null;

// ── Búsqueda genérica con dropdown ───────────────────────────
function crearBuscador({ inputId, dropdownId, hiddenId, fetchFn, labelFn, valueFn, priceFn, onSelect }) {
  const input    = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const hidden   = hiddenId ? document.getElementById(hiddenId) : null;
  let timer      = 0;

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const texto = input.value.trim();

    if (!texto) {
      dropdown.classList.remove("show");
      dropdown.innerHTML = "";
      if (hidden) hidden.value = "";
      return;
    }

    timer = setTimeout(async () => {
      try {
        const data  = await fetchFn(1, texto);
        const items = data.items ?? [];
        dropdown.innerHTML = "";

        if (items.length === 0) {
          dropdown.innerHTML = `<li class="no-results">Sin resultados</li>`;
        } else {
          items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = priceFn
              ? `${labelFn(item)} — $${priceFn(item).toFixed(2)}`
              : labelFn(item);
            li.addEventListener("click", () => {
              input.value = labelFn(item);
              if (hidden) hidden.value = valueFn(item);
              dropdown.classList.remove("show");
              dropdown.innerHTML = ""; // ← limpia al seleccionar
              if (onSelect) onSelect(item);
            });
            dropdown.appendChild(li);
          });
        }
        dropdown.classList.add("show");
      } catch (err) {
        console.error("Error en búsqueda:", err);
      }
    }, 300);
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

function iniciarBuscadores() {
  crearBuscador({
    inputId:    "inputCliente",
    dropdownId: "dropdownCliente",
    hiddenId:   "selectedClienteId",
    fetchFn:    (pagina, nombre) => getClientes(pagina, nombre),
    labelFn:    c => c.customerName,
    valueFn:    c => c.customerId,
  });

  crearBuscador({
    inputId:    "inputProducto",
    dropdownId: "dropdownProducto",
    hiddenId:   "selectedProductoId",
    fetchFn:    (pagina, nombre) => getProductos(pagina, nombre),
    labelFn:    p => p.productName,
    valueFn:    p => p.productId,
  });


  crearBuscador({
    inputId:    "inputOpcion",
    dropdownId: "dropdownOpcion",
    fetchFn:    (pagina, nombre) => getOpciones(pagina, nombre),
    labelFn:    o => o.name,
    valueFn:    o => o.optionId,
   priceFn:    o => o.price,
    onSelect:   o => { selectedOpcion = { optionId: o.optionId, name: o.name, price: o.price }; },
  });
}

// ── Opciones seleccionadas ────────────────────────────────────
function renderOpciones() {
  const lista = document.getElementById("listaOpciones");
  lista.innerHTML = "";
  let total = 0;

  opcionesSeleccionadas.forEach((op, i) => {
    const subtotal = op.price * op.quantity;
    total += subtotal;

    const tag = document.createElement("div");
    tag.className = "opcion-tag";
    tag.innerHTML = `
      <span>${op.name} x${op.quantity}</span>
      <span class="precio-opcion">$${subtotal.toFixed(2)}</span>
      <button type="button" data-index="${i}">&times;</button>
    `;
    tag.querySelector("button").addEventListener("click", () => {
      opcionesSeleccionadas.splice(i, 1);
      renderOpciones();
    });
    lista.appendChild(tag);
  });

  document.getElementById("precioTotal").textContent = `$${total.toFixed(2)}`;
}

document.getElementById("btnAgregarOpcion").addEventListener("click", () => {
  if (!selectedOpcion) {
    alert("Selecciona una opción primero.");
    return;
  }
  const cantidad = parseInt(document.getElementById("addCantidadOpcion").value) || 1;
  const existe   = opcionesSeleccionadas.find(o => o.optionId === selectedOpcion.optionId);

  if (existe) {
    existe.quantity += cantidad;
  } else {
    opcionesSeleccionadas.push({ ...selectedOpcion, quantity: cantidad });
  }

  document.getElementById("inputOpcion").value = "";
  selectedOpcion = null;
  renderOpciones();
});

// ── Reset y cerrar ────────────────────────────────────────────
function resetForm() {
  document.getElementById("formAddPersonalized").reset();
  document.getElementById("selectedClienteId").value  = "";
  document.getElementById("selectedProductoId").value = "";
  document.getElementById("inputCliente").value       = "";
  document.getElementById("inputProducto").value      = "";
  document.getElementById("inputOpcion").value        = "";
  document.getElementById("dropdownCliente").innerHTML  = "";
  document.getElementById("dropdownProducto").innerHTML = "";
  document.getElementById("dropdownOpcion").innerHTML   = "";
  opcionesSeleccionadas = [];
  selectedOpcion        = null;
  renderOpciones();
}

function cerrar() {
  document.getElementById("addPersonalizedModal").classList.remove("active");
  resetForm();
}

window.AbrirAddPersonalized = function () {
  resetForm();
  document.getElementById("addPersonalizedModal").classList.add("active");
};

document.getElementById("closeAddPersonalized")
  .addEventListener("click", cerrar);
document.getElementById("cancelAddPersonalized")
  .addEventListener("click", cerrar);
window.addEventListener("click", e => {
  if (e.target === document.getElementById("addPersonalizedModal")) cerrar();
});

// ── Submit ────────────────────────────────────────────────────
document.getElementById("formAddPersonalized").addEventListener("submit", async e => {
  e.preventDefault();

  const customerId  = parseInt(document.getElementById("selectedClienteId").value);
  const productId   = parseInt(document.getElementById("selectedProductoId").value);
  const description = document.getElementById("addDescripcion").value.trim() || null;

  if (!customerId) { alert("Selecciona un cliente."); return; }
  if (!productId)  { alert("Selecciona un producto."); return; }
  if (opcionesSeleccionadas.length === 0) { alert("Agrega al menos una opción."); return; }

  const payload = {
    customerId,
    productId,
    description,
    personalizationDetails: opcionesSeleccionadas.map(o => ({
      optionId: o.optionId,
      quantity: o.quantity,
    })),
  };

  try {
    await create(payload);
    cerrar();
    if (window.PersonalizedState?.recargar) window.PersonalizedState.recargar();
  } catch (err) {
    alert(err.message);
  }
});

iniciarBuscadores();