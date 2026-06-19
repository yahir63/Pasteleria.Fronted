{
  import { getToken } from "../../../Login/components/Services/login.Service";
  const API_URL_DETAILS = "https://localhost:7249/api/purchases";

  const detailsModal = document.getElementById("details-modal");
  const purchaseIdSpan = document.getElementById("purchase-id");
  const detailDateSpan = document.getElementById("detail-date");
  const detailSupplierSpan = document.getElementById("detail-supplier");
  const detailProductsBody = document.getElementById("detail-products");
  const detailTotalSpan = document.getElementById("detail-total");
  const btnCloseDetail = document.getElementById("btn-close-detail");

  const GetPurchaseById = async (purchaseId) => {
    try {
      const response = await fetch(`${API_URL_DETAILS}/${purchaseId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok)
        throw new Error(`Error al obtener detalles: ${response.status}`);
      const json = await response.json();
      return json.value;
    } catch (error) {
      console.error("Error obteniendo detalles de compra:", error);
      throw error;
    }
  };

  const RenderProductosDetalles = (productos) => {
    detailProductsBody.innerHTML = "";

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

      const tdProducto = document.createElement("td");
      tdProducto.textContent = producto.productName;

      const tdCantidad = document.createElement("td");
      tdCantidad.textContent = producto.quantity;

      const tdPrecio = document.createElement("td");
      tdPrecio.textContent = `$${producto.purchasePrice.toFixed(2)}`;

      const tdSubtotal = document.createElement("td");
      const subtotal = producto.quantity * producto.purchasePrice;
      tdSubtotal.textContent = `$${subtotal.toFixed(2)}`;

      fila.append(tdProducto, tdCantidad, tdPrecio, tdSubtotal);
      detailProductsBody.appendChild(fila);
    });
  };

  const RenderDetalles = async (purchaseId) => {
    try {
      const compra = await GetPurchaseById(purchaseId);

      if (!compra) {
        alert("No se encontraron detalles para esta compra");
        return;
      }

      purchaseIdSpan.textContent = compra.purchaseId;

      const fecha = new Date(compra.date).toLocaleDateString("es-NI");
      detailDateSpan.textContent = fecha;

      detailSupplierSpan.textContent = compra.supplierName;

      RenderProductosDetalles(compra.purchaseDetails);

      detailTotalSpan.textContent = `$${compra.totalAmount.toFixed(2)}`;

      detailsModal.style.display = "flex";

      document.body.style.overflow = "hidden";
      // Corrección: Eliminado el bloqueo de pointerEvents en .main de detalles
    } catch (error) {
      console.error("Error renderizando detalles:", error);
      alert("Ocurrió un error al cargar los detalles de la compra");
    }
  };

  const CerrarDetalles = () => {
    detailsModal.style.display = "none";
    document.body.style.overflow = "auto";
    // Corrección: Eliminado el desbloqueo innecesario de detalles
  };

  btnCloseDetail.addEventListener("click", CerrarDetalles);

  detailsModal.addEventListener("click", (e) => {
    if (e.target === detailsModal) {
      CerrarDetalles();
    }
  });

  window.AbrirDetalles = RenderDetalles;
}
