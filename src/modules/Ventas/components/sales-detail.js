const API_URL_DETAILS = "https://localhost:7249/api/sales";

const detailsModal = document.getElementById("details-modal");
const purchaseIdSpan = document.getElementById("purchase-id");
const detailDateSpan = document.getElementById("detail-date");
const detailSupplierSpan = document.getElementById("detail-supplier");
const detailProductsBody = document.getElementById("detail-products");
const detailTotalSpan = document.getElementById("detail-total");
const btnCloseDetail = document.getElementById("btn-close-detail");

const GetSaleById = async (saleId) => {
  try {
    const response = await fetch(`${API_URL_DETAILS}/${saleId}`);
    if (!response.ok) {
      throw new Error(`Error al obtener detalles: ${response.status}`);
    }
    const json = await response.json();
    return json.value;
  } catch (error) {
    console.error("Error obteniendo detalles de venta:", error);
    throw error;
  }
};

const RenderProductosDetalles = (productos) => {
  detailProductsBody.innerHTML = "";
  if (!productos || productos.length === 0) {
    detailProductsBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;color:#888">Sin productos en esta venta</td>
      </tr>
    `;
    return;
  }

  productos.forEach((producto) => {
    const fila = document.createElement("tr");
    const tdProducto = document.createElement("td");
    tdProducto.textContent =
      producto.productName || `Producto ${producto.productId}`;

    const tdCantidad = document.createElement("td");
    tdCantidad.textContent = producto.quantity;

    const tdPrecio = document.createElement("td");
    tdPrecio.textContent =
      producto.salePrice != null ? `$${producto.salePrice.toFixed(2)}` : "-";

    const tdSubtotal = document.createElement("td");
    const subtotal = producto.lineAmount != null ? producto.lineAmount : 0;
    tdSubtotal.textContent =
      producto.lineAmount != null ? `$${subtotal.toFixed(2)}` : "-";

    fila.append(tdProducto, tdCantidad, tdPrecio, tdSubtotal);
    detailProductsBody.appendChild(fila);
  });
};

const RenderDetalles = async (saleId) => {
  try {
    const venta = await GetSaleById(saleId);
    if (!venta) {
      alert("No se encontraron detalles para esta venta");
      return;
    }

    purchaseIdSpan.textContent = venta.saleId ?? saleId;
    detailDateSpan.textContent = venta.saleDate
      ? new Date(venta.saleDate).toLocaleDateString("es-NI")
      : "N/A";
    detailSupplierSpan.textContent =
      venta.customerName || `Cliente ${venta.customerId}`;

    RenderProductosDetalles(venta.saleDetails);

    if (venta.saleTotal != null) {
      detailTotalSpan.textContent = `$${venta.saleTotal.toFixed(2)}`;
    } else {
      detailTotalSpan.textContent = "N/A";
    }

    detailsModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    const main = document.querySelector(".main");
    if (main) main.style.pointerEvents = "none";
  } catch (error) {
    alert("Ocurrió un error al cargar los detalles de la venta");
  }
};

const CerrarDetalles = () => {
  detailsModal.style.display = "none";
  document.body.style.overflow = "auto";
  const main = document.querySelector(".main");
  if (main) main.style.pointerEvents = "auto";
};

btnCloseDetail.addEventListener("click", CerrarDetalles);

detailsModal.addEventListener("click", (e) => {
  if (e.target === detailsModal) {
    CerrarDetalles();
  }
});

window.AbrirDetalles = RenderDetalles;
