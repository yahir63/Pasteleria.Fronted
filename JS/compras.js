const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeModal = document.getElementById("close-modal");
const modalContent = document.querySelector(".modal-content");

function cerrarModal() {
  modal.classList.remove("show");
}

function abrirModal(html) {
  modalBody.innerHTML = html;
  modal.classList.add("show");
}

closeModal.addEventListener("click", cerrarModal);

window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});

// 👇 HTML GLOBAL (clave para no romper el modal)
let htmlNuevaCompra = "";

// DATA
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

document.addEventListener("click", (e) => {
  const btnView = e.target.closest(".view");
  const btnDelete = e.target.closest(".delete");
  const btnNewPurchase = e.target.closest(".btn-new");

  // ================= VER =================
  if (btnView) {
    const fila = btnView.closest("tr");
    const proveedor = fila.children[0].innerText.trim();
    const detalles = DetallesCompra[proveedor];

    if (!detalles) {
      abrirModal("<p>No hay detalles disponibles</p>");
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

    abrirModal(html);
  }

  // ================= ELIMINAR =================
  if (btnDelete && !btnDelete.matches("#confirm-delete")) {
    modalContent.classList.remove("modal-large");
    modalContent.classList.add("modal-small");

    const fila = btnDelete.closest("tr");

    abrirModal(`
      <h3>Eliminar compra</h3>
      <p>¿Estás seguro?</p>

      <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
        <button id="confirm-delete" class="delete">Eliminar</button>
        <button id="cancel-delete" class="view">Cancelar</button>
      </div>
    `);

    document.getElementById("confirm-delete").onclick = (ev) => {
      ev.stopPropagation();
      abrirModal(`
        <div style="text-align:center; padding:10px;"> <div style=" width:60px; height:60px; margin:0 auto 10px; background:#d4f8d4; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:30px; color:#1b5e20; "> ✓ </div> <h3 style="margin-bottom:8px;">Compra eliminada</h3> <p style="color:#666; font-size:14px;"> La compra se eliminó correctamente. </p> <button id="close" style=" margin-top:15px; padding:8px 16px; border:none; border-radius:8px; background:#32a8e7; color:white; cursor:pointer; font-weight:600; transition:0.2s; "> Aceptar </button> </div>
      `);
      document.getElementById("close").onclick = cerrarModal;
    };

    document.getElementById("cancel-delete").onclick = cerrarModal;
  }

  // ================= NUEVA COMPRA =================
  if (btnNewPurchase) {
    modalContent.classList.remove("modal-small");
    modalContent.classList.add("modal-large");

    let html = `<div class="modal-header">
  <h2>Nueva Compra</h2>
  
</div>

<div class="modal-body">

  <!-- GRID FORM -->
  <div class="form-grid">

    <div class="form-group">
      <label>Fecha</label>
      <input type="date">
    </div>

    <div class="form-group">
      <label>Proveedor</label>
      <select>
        <option>Distribuidora El Sol</option>
        <option>Panadería Central</option>
        <option>Insumos La Favorita</option>
      </select>
    </div>

    <div class="form-group">
      <label>Producto</label>
      <select>
        <option>Vainilla</option>
        <option>Chocolate</option>
        <option>Frutos Rojos</option>
      </select>
    </div>

    <div class="form-group">
      <label>Cantidad</label>
      <input type="number" placeholder="0">
    </div>

    <div class="form-group">
      <label>Precio Unitario</label>
      <input type="number" placeholder="$0.00">
    </div>

    <div class="form-group add-btn">
      <button class="btn-add">+ Agregar</button>
    </div>

  </div>

  <!-- TABLA -->
  <div class="details-box">
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cant.</th>
          <th>P. Unitario</th>
          <th>Subtotal</th>
          <th>Eliminar Detalle</th>
        </tr>
      </thead>
      <tbody id="details-body">
      <tr>
      <td>Pastel Vainilla</td>
      <td>10</td>
      <td>25$</td>
      <td>250$</td>
      <td>
        <div class="delete-detail" >
          <button class="delete-detail-btn">
            &times;
          </button>
        </div>
      </td>
      </tr>
      </tbody>
    </table>
  </div>

  

</div>



<div class="modal-footer">
  <div class="total-box">
    <span>Total:</span>
    <input type="text" value="$0.00" readonly>
  </div>
  <button id="btn-cancel" class="btn-cancel">Cancelar</button>
  <button id="btn-save" class="btn-save">Guardar Compra</button>
</div>`;
    htmlNuevaCompra = html;
    abrirModal(htmlNuevaCompra);
  }

  // ================= ELIMINAR DETALLE =================
  if (e.target.closest(".delete-detail-btn")) {
    const row = e.target.closest("tr");
    row.remove();
  }

  // ================= CANCELAR COMPRA =================
  if (e.target.id === "btn-cancel") {
    modalContent.classList.remove("modal-large");
    modalContent.classList.add("modal-small");

    abrirModal(`
      <div style="text-align:center; padding:10px;">
        <h2> Estas Seguro de cancelar?</h2>
        <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
          <button id="confirm-delete" class="delete">Cancelar Compra</button>
          <button id="cancel-delete" class = "view">Seguir</button>
        </div>
      </div>`);
  }

  if (e.target.id === "confirm-delete") {
    cerrarModal();
  }

  const btnKeep = document.getElementById("cancel-delete");
  btnKeep.onclick = () => {
    modalContent.classList.remove("modal-small");
    modalContent.classList.add("modal-large");
    abrirModal(htmlNuevaCompra);
  };
});
