// ═══════════════════════════════════════════════════════════════════════════════
// MODAL DE DETALLES DE COMPRA - CONSUMO DE API Y RENDERIZADO
// ═══════════════════════════════════════════════════════════════════════════════

const API_URL_DETAILS = "https://localhost:7249/api/purchases";

// ─── ELEMENTOS DEL DOM ─────────────────────────────────────────────────────────
const detailsModal = document.getElementById("details-modal");
const purchaseIdSpan = document.getElementById("purchase-id");
const detailDateSpan = document.getElementById("detail-date");
const detailSupplierSpan = document.getElementById("detail-supplier");
const detailProductsBody = document.getElementById("detail-products");
const detailTotalSpan = document.getElementById("detail-total");
const btnCloseDetail = document.getElementById("btn-close-detail");

// ─── FUNCIÓN: Obtener detalles por ID ──────────────────────────────────────────
/**
 * @async
 * @function GetPurchaseById
 * @param {number} purchaseId - ID de la compra a obtener
 * @returns {Promise<Object>} Objeto con datos de la compra
 * @description Consume GET /api/purchases/{id} para traer todos los detalles
 */
const GetPurchaseById = async (purchaseId) => {
  try {
    const response = await fetch(`${API_URL_DETAILS}/${purchaseId}`);

    if (!response.ok) {
      throw new Error(`Error al obtener detalles: ${response.status}`);
    }

    const json = await response.json();
    return json.value; // La API devuelve { value: {...} }
  } catch (error) {
    console.error("Error obteniendo detalles de compra:", error);
    throw error;
  }
};

// ─── FUNCIÓN: Renderizar tabla de productos ────────────────────────────────────
/**
 * @function RenderProductosDetalles
 * @param {Array} productos - Array de productos con detalles
 * @description Itera cada producto y crea filas en la tabla
 * Calcula subtotal por cada línea: cantidad × precio unitario
 */
const RenderProductosDetalles = (productos) => {
  detailProductsBody.innerHTML = ""; // Limpiar tabla anterior

  if (!productos || productos.length === 0) {
    detailProductsBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color:#888;">
          Sin productos en esta compra
        </td>
      </tr>
    `;
    return;
  }

  productos.forEach((producto) => {
    const fila = document.createElement("tr");

    // Columna: Producto
    const tdProducto = document.createElement("td");
    tdProducto.textContent = producto.productName;

    // Columna: Cantidad
    const tdCantidad = document.createElement("td");
    tdCantidad.textContent = producto.quantity;

    // Columna: Precio Unitario
    const tdPrecio = document.createElement("td");
    tdPrecio.textContent = `$${producto.purchasePrice.toFixed(2)}`;

    // Columna: Subtotal (cantidad × precio)
    const tdSubtotal = document.createElement("td");
    const subtotal = producto.quantity * producto.purchasePrice;
    tdSubtotal.textContent = `$${subtotal.toFixed(2)}`;

    fila.append(tdProducto, tdCantidad, tdPrecio, tdSubtotal);
    detailProductsBody.appendChild(fila);
  });
};

// ─── FUNCIÓN: Renderizar modal con datos ──────────────────────────────────────
/**
 * @async
 * @function RenderDetalles
 * @param {number} purchaseId - ID de la compra a mostrar
 * @description Obtiene datos de la API, renderiza todo el modal y lo muestra
 * Maneja: fechas, proveedor, productos y total
 */
const RenderDetalles = async (purchaseId) => {
  try {
    // 1. CONSUMIR API - Traer datos de la compra
    const compra = await GetPurchaseById(purchaseId);

    // 2. VALIDAR DATOS - Asegurar que tenemos lo que esperamos
    if (!compra) {
      alert("No se encontraron detalles para esta compra");
      return;
    }

    // 3. RENDERIZAR INFORMACIÓN GENERAL
    purchaseIdSpan.textContent = compra.purchaseId;

    // Formatear fecha: convertir a formato legible
    const fecha = new Date(compra.date).toLocaleDateString("es-NI");
    detailDateSpan.textContent = fecha;

    detailSupplierSpan.textContent = compra.supplierName;

    // 4. RENDERIZAR PRODUCTOS EN TABLA
    RenderProductosDetalles(compra.purchaseDetails);

    // 5. RENDERIZAR TOTAL
    detailTotalSpan.textContent = `$${compra.totalAmount.toFixed(2)}`;

    // 6. MOSTRAR MODAL
    detailsModal.style.display = "flex";

    // Bloquear interacción con fondo (mismo que en agregar)
    document.body.style.overflow = "hidden";
    const main = document.querySelector(".main");
    if (main) main.style.pointerEvents = "none";
  } catch (error) {
    console.error("Error renderizando detalles:", error);
    alert("Ocurrió un error al cargar los detalles de la compra");
  }
};

// ─── FUNCIÓN: Cerrar modal ────────────────────────────────────────────────────
/**
 * @function CerrarDetalles
 * @description Cierra el modal y restaura la interacción del fondo
 */
const CerrarDetalles = () => {
  detailsModal.style.display = "none";

  // Restaurar interacción con fondo
  document.body.style.overflow = "auto";
  const main = document.querySelector(".main");
  if (main) main.style.pointerEvents = "auto";
};

// ─── EVENT LISTENERS ───────────────────────────────────────────────────────────
// Botón de cerrar (X) en la esquina
btnCloseDetail.addEventListener("click", CerrarDetalles);

// Cerrar al hacer click fuera del modal (en el overlay)
detailsModal.addEventListener("click", (e) => {
  // Solo cerrar si clickeamos directamente en el modal (no en el contenido)
  if (e.target === detailsModal) {
    CerrarDetalles();
  }
});

// ─── EXPONER FUNCIÓN GLOBALMENTE ──────────────────────────────────────────────
// Esto permite que compras.js pueda llamar window.AbrirDetalles(id)
window.AbrirDetalles = RenderDetalles;
