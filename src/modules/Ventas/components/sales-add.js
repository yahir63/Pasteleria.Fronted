const API_URL_SALES = "https://localhost:7249/api/sales";
const API_URL_LOAD = "https://localhost:7249/api";

const modal = document.getElementById("modalAdd");
const tabla = document.getElementById("details-body");
const fecha = document.getElementById("sale-date");
const customer = document.getElementById("customer");
const productSelect = document.getElementById("product");
const cantidad = document.getElementById("quantity");
const addProduct = document.getElementById("btn-add-product");
const totalAmount = document.getElementById("sale-total");
const btnSave = document.getElementById("btn-saveSale");
const btnCancelar = document.getElementById("btn-cancel");

const detalles = [];
let productsCache = [];

const renderizarTabla = () => {
  tabla.innerHTML = "";

  detalles.forEach((item, index) => {
    const fila = document.createElement("tr");

    const producto = document.createElement("td");
    producto.textContent = item.ProductName;

    const cantidadTd = document.createElement("td");
    cantidadTd.textContent = item.quantity;

    const precio = document.createElement("td");
    precio.textContent =
      item.unitPrice != null ? `$${item.unitPrice.toFixed(2)}` : "-";

    const subtotal = document.createElement("td");
    const subtotalValue =
      item.unitPrice != null ? item.quantity * item.unitPrice : 0;
    subtotal.textContent =
      item.unitPrice != null ? `$${subtotalValue.toFixed(2)}` : "-";

    const acciones = document.createElement("td");
    const btnEliminarDetalle = document.createElement("button");
    btnEliminarDetalle.innerHTML = `
          <img src="/src/modules/Shared/Assets/img/eliminar.png" />
          Eliminar`;
    btnEliminarDetalle.classList.add("delete");
    btnEliminarDetalle.addEventListener("click", () => {
      const confirmar = confirm("¿Estás seguro de eliminar el detalle?");
      if (confirmar) {
        detalles.splice(index, 1);
        renderizarTabla();
      }
    });

    acciones.appendChild(btnEliminarDetalle);
    fila.append(producto, cantidadTd, precio, subtotal, acciones);
    tabla.appendChild(fila);
  });

  actualizarTotal();
};

const actualizarTotal = () => {
  const total = detalles.reduce(
    (sum, item) =>
      sum + (item.unitPrice != null ? item.quantity * item.unitPrice : 0),
    0,
  );
  totalAmount.value = total ? `$${total.toFixed(2)}` : "$0.00";
};

function LimpiarModal() {
  [fecha, customer, productSelect, cantidad].forEach((x) => {
    if (x) x.value = "";
  });
  detalles.length = 0;
  renderizarTabla();
}

window.AbrirModal = async function () {
  LimpiarModal();

  const hoy = new Date().toISOString().split("T")[0];
  fecha.value = hoy;
  customer.innerHTML = '<option value="">Seleccione un cliente</option>';
  productSelect.innerHTML = '<option value="">Seleccione un producto</option>';

  await Promise.all([loadCustomers(), loadProducts()]);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  const main = document.querySelector(".main");
  if (main) main.style.pointerEvents = "none";
};

function CerrarModal() {
  LimpiarModal();
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  const main = document.querySelector(".main");
  if (main) main.style.pointerEvents = "auto";
}

const agregarProducto = async () => {
  if (!productSelect.value || !cantidad.value) {
    alert("Por favor completa los campos de producto o cantidad");
    return;
  }

  if (Number(cantidad.value) <= 0) {
    alert("Ingrese una cantidad válida");
    return;
  }

  const selectedProduct = productsCache.find(
    (item) => String(item.productId) === String(productSelect.value),
  );

  const price = await getPriceProduct(productSelect.value);
  const detail = {
    ProductId: parseInt(productSelect.value, 10),
    ProductName: selectedProduct?.productName || "Producto",
    quantity: parseInt(cantidad.value, 10),
    unitPrice: price != null ? parseFloat(price) : null,
  };

  detalles.push(detail);
  renderizarTabla();
  productSelect.value = "";
  cantidad.value = "";
};

async function getPriceProduct(id) {
  try {
    const response = await fetch(
      `https://localhost:7249/api/Inventory/product/${id}`,
    );
    if (!response.ok) {
      throw new Error("No se cargo bien el producto");
      return;
    }
    const data = await response.json();

    const price = data?.value?.salePrice;
    return price != null ? parseFloat(price) : null;
  } catch (error) {
    console.error("el precio no cargo");
  }
}

async function loadCustomers() {
  try {
    const response = await fetch(`${API_URL_LOAD}/customers`);
    if (!response.ok) {
      throw new Error("Error al cargar clientes");
    }
    const data = await response.json();
    const customers = data.value?.items || [];
    customers.forEach((element) => {
      const option = document.createElement("option");
      option.value = element.customerId;
      option.textContent =
        element.name || element.customerName || `Cliente ${element.customerId}`;
      customer.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL_LOAD}/products`);
    if (!response.ok) {
      throw new Error("Error al cargar productos");
    }
    const data = await response.json();
    productsCache = data.value?.items || [];
    productsCache.forEach((o) => {
      const option = document.createElement("option");
      option.value = o.productId;
      option.textContent = o.productName || `Producto ${o.productId}`;
      productSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

btnSave.addEventListener("click", async () => {
  if (!customer.value) {
    alert("Seleccione un cliente");
    return;
  }

  if (detalles.length === 0) {
    alert("Agregue al menos un producto");
    return;
  }

  const SaleDto = {
    customerId: parseInt(customer.value, 10),
    saleDetails: detalles.map((d) => ({
      productId: d.ProductId,
      quantity: d.quantity,
    })),
  };

  try {
    const result = await fetch(API_URL_SALES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(SaleDto),
    });
    if (!result.ok) {
      const err = await result.json();
      const msgs = err.Errors?.join("\n") ?? "Error al crear la venta";
      alert(msgs);
      return;
    }

    alert("Venta registrada exitosamente");
    CerrarModal();
    if (typeof window.VentaState?.recargar === "function")
      window.VentaState.recargar();
  } catch (error) {
    alert("No se pudo registrar la venta");
    console.error(error);
  }
});

addProduct.addEventListener("click", () => {
  agregarProducto();
});

btnCancelar.addEventListener("click", () => {
  const isConfirmed = confirm("¿Está seguro de salir sin guardar la venta?");
  if (isConfirmed) CerrarModal();
});
