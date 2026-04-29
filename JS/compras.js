let modalActivo = false;

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.getElementById("close-modal");

closeModal.addEventListener("click", () => {
  modal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
  }
});

const DetallesCompra = {
  "Distribuidora El Sol": [
    { producto: "Pastel de manzana", cantidad: 2, precio: 30 },
    { producto: "Pastel de chocolate", cantidad: 2, precio: 25 },
  ],
  "Panadería Central": [
    { producto: "Mantequilla", cantidad: 3, precio: 15 },
    { producto: "Huevos", cantidad: 2, precio: 10 },
  ],
  "Insumos La Favorita": [
    { producto: "Chocolate", cantidad: 4, precio: 25 },
    { producto: "Vainilla", cantidad: 4, precio: 25 },
  ],
};

document.querySelectorAll(".view").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!modalActivo) {
      return;
    }
    const fila = btn.closest("tr");
    const proveedor = fila.children[0].innerText;
    const detalles = DetallesCompra[proveedor];

    if (!detalles) {
      modalBody.innerHTML = "<p>No hay detalles disponibles</p>";
      modal.classList.add("show");
      return;
    }

    let html = `
      <h3>${proveedor}</h3>
      <table style="width:100%; margin-top:10px;">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant.</th>
            <th>P. Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    detalles.forEach((item) => {
      const total = item.cantidad * item.precio;

      html += `
        <tr>
          <td>${item.producto}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precio}</td>
          <td>$${total}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;

    modalBody.innerHTML = html;

    modal.classList.add("show");
  });
});
