{
  const API_URL_PURCHASES = "https://localhost:7249/api/purchases";
  const API_URL_LOAD = "https://localhost:7249/api";

  const modal = document.getElementById("modalAdd");
  const tabla = document.getElementById("details-body");
  const fecha = document.getElementById("purchase-date");
  const supplier = document.getElementById("supplier");
  const productSelect = document.getElementById("product");
  const cantidad = document.getElementById("quantity");
  const unitPrice = document.getElementById("unit-price");
  const addProduct = document.getElementById("btn-add-product");
  const totalAmout = document.getElementById("purchase-total");
  const btnSave = document.getElementById("btn-savePurchase");
  const btnCancelar = document.getElementById("btn-cancel");

  const detalles = [];

  const renderizarTabla = () => {
    tabla.innerHTML = "";

    detalles.forEach((item, index) => {
      const fila = document.createElement("tr");

      const producto = document.createElement("td");
      producto.textContent = item.ProductName;

      const cantidadTd = document.createElement("td");
      cantidadTd.textContent = item.Quantity;

      const precio = document.createElement("td");
      precio.textContent = item.PurchasePrice.toFixed(2);

      const subtotal = document.createElement("td");
      subtotal.textContent = (item.Quantity * item.PurchasePrice).toFixed(2);

      const acciones = document.createElement("td");

      const btnEliminarDetalle = document.createElement("button");
      btnEliminarDetalle.innerHTML = `
            <img src="/src/modules/Shared/Assets/img/eliminar.png" />
            Eliminar`;
      btnEliminarDetalle.classList.add("delete");
      btnEliminarDetalle.addEventListener("click", () => {
        const confirmar = confirm("estas seguro de eliminar el detalle");
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
      (sum, item) => sum + item.Quantity * item.PurchasePrice,
      0,
    );
    totalAmout.value = `$${total.toFixed(2)}`;
  };

  function LimpiarModal() {
    [fecha, supplier, productSelect, cantidad, unitPrice].forEach((x) => {
      if (x) x.value = "";
    });
    detalles.length = 0;
    renderizarTabla();
  }

  window.AbrirModal = async function () {
    LimpiarModal();

    const hoy = new Date().toISOString().split("T")[0];
    fecha.value = hoy;
    supplier.innerHTML = '<option value="">Seleccione un proveedor</option>';
    productSelect.innerHTML = '<option value="">Seleccione un producto</option>';

    await Promise.all([loadProducts(), loadSuppliers()]);

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    // Corrección: Eliminado el bloqueo de pointerEvents en .main
  };

  function CerrarModal() {
    LimpiarModal();
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    // Corrección: Eliminado el desbloqueo innecesario
  }

  const agregarProducto = () => {
    if (!productSelect.value || !cantidad.value) {
      alert("Por favor completa los campos de producto o cantidad");
      return;
    }
    if (
      !productSelect.value ||
      Number(cantidad.value) <= 0 ||
      Number(unitPrice.value) <= 0
    ) {
      alert("Ingrese datos válidos");
      return;
    }

    const detail = {
      ProductId: productSelect.value,
      ProductName: productSelect.options[productSelect.selectedIndex].text,
      Quantity: parseInt(cantidad.value),
      PurchasePrice: parseFloat(unitPrice.value),
    };

    detalles.push(detail);
    renderizarTabla();
    productSelect.value = "";
    cantidad.value = "";
    unitPrice.value = "";
  };

  async function loadSuppliers() {
    try {
      const response = await fetch(`${API_URL_LOAD}/suppliers`);
      if (!response.ok) throw new Error("ocurrio un error al cargar los proveedores");

      const data = await response.json();
      const suppliers = data.value.items;
      supplier.innerHTML = '<option value="">Elija un proveedor</option>';

      suppliers.forEach((element) => {
        const option = document.createElement("option");
        option.value = element.supplierId;
        option.textContent = element.name;
        supplier.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL_LOAD}/products`);
      if (!response.ok) throw new Error("Ocurrio un error al cargar los productos");

      const data = await response.json();
      const products = data.value.items;

      products.forEach((o) => {
        const option = document.createElement("option");
        option.value = o.productId;
        option.textContent = o.productName;
        productSelect.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }

  btnSave.addEventListener("click", async () => {
    if (!supplier.value) {
      alert("Seleccione un proveedor");
      return;
    }

    if (detalles.length === 0) {
      alert("Agregue al menos un producto");
      return;
    }

    const jsonDetalles = detalles.map((d) => ({
      ProductId: d.ProductId,
      Quantity: d.Quantity,
      PurchasePrice: d.PurchasePrice,
    }));

    const PurchaseDto = {
      SupplierId: parseInt(supplier.value),
      PurchaseDetails: jsonDetalles,
    };

    try {
      const result = await fetch(API_URL_PURCHASES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(PurchaseDto),
      });

      if (!result.ok) {
        const err = await result.json();
        const msgs = err.Errors?.join("\n") ?? "Error al crear la compra";
        alert(msgs);
        return;
      }

      alert("Compra Registrada Exitosamente");
      CerrarModal();
      window.CompraState.recargar();
    } catch (error) {
      alert("no se pudo registrar la compra");
      console.error(error);
    }
  });

  addProduct.addEventListener("click", () => {
    agregarProducto();
  });

  btnCancelar.addEventListener("click", () => {
    const isConfirmed = confirm("esta seguro de salir sin guardar la compra?");
    if (isConfirmed) {
      CerrarModal();
    }
  });
}