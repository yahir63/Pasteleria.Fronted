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

const DetallesVenta = {
  "Maria Lopez": [
    { producto: "Pastel de Chocolate XL", cantidad: 1, precio: 80.0 },
    { producto: "Cupcakes Vainilla", cantidad: 4, precio: 10.0 },
  ],

  "Jose Sanchez": [
    { producto: "Tarta de Manzana", cantidad: 1, precio: 50.5 },
    { producto: "Donas Glaseadas", cantidad: 7, precio: 5.0 },
  ],

  "Juan Gonzales": [
    { producto: "Pastel Red Velvet", cantidad: 2, precio: 75.0 },
    { producto: "Caja de Macarons", cantidad: 1, precio: 50.0 },
  ],

  "Luis Vargas": [
    { producto: "Brazo de Reina", cantidad: 1, precio: 45.5 },
    { producto: "Galletas de Mantequilla", cantidad: 4, precio: 10.0 },
  ],

  "Ines Aburto": [
    { producto: "Cheesecake de Arándanos", cantidad: 2, precio: 90.0 },
    { producto: "Muffins de Chocolate", cantidad: 2, precio: 10.0 },
  ],

  "Carolina Rodriguez": [
    { producto: "Pastel de Tres Leches", cantidad: 3, precio: 80.0 },
    { producto: "Bolsa de Alfajores", cantidad: 1, precio: 70.75 },
  ],
};

document.querySelectorAll(".view").forEach((btn) => {
  // CORRECCIÓN: Se pasa la función como segundo argumento
  btn.addEventListener("click", () => {
    const fila = btn.closest("tr");

    const cliente = fila.children[0].innerText.trim();
    console.log(cliente);
    const detalles = DetallesVenta[cliente];

    if (!detalles) {
      modalBody.innerHTML = "<p>No hay detalles disponibles</p>";
      modal.classList.add("show");
      return;
    }

    let html = `<h3>Detalles de: ${cliente}</h3>
        <table style="width:100%; border-collapse: collapse; margin-top:10px;">
        <thead>
          <tr style="border-bottom: 1px solid #ddd;">
            <th>Producto</th>
            <th>Cant.</th>
            <th>P. Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>`;

    detalles.forEach((item) => {
      const total = item.cantidad * item.precio;
      html += `
                <tr>
                  <td>${item.producto}</td>
                  <td style="text-align:center;">${item.cantidad}</td>
                  <td>$${item.precio}</td>
                  <td>$${total}</td>
                </tr>`;
    });

    html += `</tbody></table>`;
    modalBody.innerHTML = html;
    modal.classList.add("show");
  }); // Cierre correcto del addEventListener
});
