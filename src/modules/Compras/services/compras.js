document.addEventListener("DOMContentLoaded", () => {
  // =====================
  // ELEMENTOS
  // =====================
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const closeModal = document.getElementById("close-modal");
  const modalContent = document.querySelector(".modal-content");
  const overlay = document.querySelector(".sidebar-overlay");
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle");

  // =====================
  // SIDEBAR
  // =====================
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar-open");
      overlay.classList.toggle("active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.remove("active");
    });
  }

  // =====================
  // MODAL
  // =====================
  function cerrarModal() {
    modal.classList.remove("show");
  }

  function abrirModal(html) {
    modalBody.innerHTML = html;

    // RESET TOTAL
    modalContent.classList.remove("modal-small", "modal-large");

    // APLICAR TAMAÑO
    if (size === "large") {
      modalContent.classList.add("modal-large");
    } else {
      modalContent.classList.add("modal-small");
    }

    modal.classList.add("show");
  }

  closeModal.addEventListener("click", cerrarModal);

  window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  let htmlNuevaCompra = "";

  // =====================
  // DATA
  // =====================
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

  // =====================
  // EVENTOS DELEGADOS
  // =====================
  document.addEventListener("click", (e) => {
    const btnView = e.target.closest(".view");
    const btnDelete = e.target.closest(".delete");
    const btnNewPurchase = e.target.closest(".btn-new");

    // VER
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

    // GUARDAR COMPRA
    if (e.target.id === "btn-savePurchase") {
      modalContent.classList.remove("modal-large");
      modalContent.classList.add("modal-small");

      abrirModal(`
        <div style="text-align:center; padding:10px;">
          <div style="width:60px;height:60px;margin:0 auto 10px;background:#d4f8d4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;color:#1b5e20;">✓</div>
          <h3 style="margin-bottom:8px;">Compra guardada</h3>
          <p style="color:#666; font-size:14px;">La compra se guardó correctamente.</p>
          <button id="close" style="margin-top:15px;padding:8px 16px;border:none;border-radius:8px;background:#32a8e7;color:white;cursor:pointer;font-weight:600;">Aceptar</button>
        </div>
      `);
    }

    // CERRAR DESDE SUCCESS
    if (e.target.id === "close") {
      cerrarModal();
    }

    // ELIMINAR FILA
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
          <div style="text-align:center; padding:10px;">
            <div style="width:60px;height:60px;margin:0 auto 10px;background:#d4f8d4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;color:#1b5e20;">✓</div>
            <h3 style="margin-bottom:8px;">Compra eliminada</h3>
            <p style="color:#666; font-size:14px;">La compra se eliminó correctamente.</p>
            <button id="close" style="margin-top:15px;padding:8px 16px;border:none;border-radius:8px;background:#32a8e7;color:white;cursor:pointer;font-weight:600;">Aceptar</button>
          </div>
        `);
        document.getElementById("close").onclick = cerrarModal;
      };

      document.getElementById("cancel-delete").onclick = cerrarModal;
    }

    // NUEVA COMPRA
    if (btnNewPurchase) {
      modalContent.classList.remove("modal-small");
      modalContent.classList.add("modal-large");

      let html = `
        <div class="modal-header">
          <h2>Nueva Compra</h2>
        </div>
        <div class="modal-body">
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
          <div class="details-box">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>P. Unitario</th>
                  <th>Subtotal</th>
                  <th style="text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody id="details-body">
                <tr>
                  <td>Pastel Vainilla</td>
                  <td>10</td>
                  <td>$25</td>
                  <td>$250</td>
                  <td>
                    <div class="delete-detail">
                      <button class="edit-detail-btn"><img src="/Assets/img/editar.png" alt=""> Editar</button>
                      
                      <button class="delete-detail-btn">&times;</button>
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
          <button id="btn-savePurchase" class="btn-save">Guardar Compra</button>
        </div>
      `;

      htmlNuevaCompra = html;
      abrirModal(htmlNuevaCompra, "large");
    }

    // ELIMINAR DETALLE DE TABLA
    if (e.target.closest(".delete-detail-btn")) {
      e.target.closest("tr").remove();
    }

    // EDITAR DETALLE
    if (e.target.closest(".edit-detail-btn")) {
      const fila = e.target.closest("tr");

      const tbody = fila.closest("tbody");
      const filaIndex = Array.from(tbody.rows).indexOf(fila);

      const celdas = fila.querySelectorAll("td");
      const productoActual = celdas[0].innerText.trim();
      const cantidadActual = celdas[1].innerText.trim();
      const precioActual = celdas[2].innerText.replace("$", "").trim();

      modalContent.classList.remove("modal-small");
      modalContent.classList.add("modal-large");

      abrirModal(`
        <div class="modal-header">
          <h2>Editar Detalle</h2>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Producto</label>
              <select id="edit-producto">
                <option ${productoActual === "Vainilla" ? "selected" : ""}>Vainilla</option>
                <option ${productoActual === "Chocolate" ? "selected" : ""}>Chocolate</option>
                <option ${productoActual === "Frutos Rojos" ? "selected" : ""}>Frutos Rojos</option>
                <option ${productoActual === "Pastel Vainilla" ? "selected" : ""}>Pastel Vainilla</option>
              </select>
            </div>
            <div class="form-group">
              <label>Cantidad</label>
              <input type="number" id="edit-cantidad" value="${cantidadActual}">
            </div>
            <div class="form-group">
              <label>Precio Unitario</label>
              <input type="number" id="edit-precio" value="${precioActual}">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button id="btn-cancelEdit" class="btn-cancel">Cancelar</button>
          <button id="btn-saveEdit" class="btn-save">Guardar Cambios</button>
        </div>
      `);

      document.getElementById("btn-saveEdit").onclick = () => {
        const nuevoProducto = document.getElementById("edit-producto").value;
        const nuevaCantidad = document.getElementById("edit-cantidad").value;
        const nuevoPrecio = document.getElementById("edit-precio").value;
        const nuevoSubtotal = nuevaCantidad * nuevoPrecio;

        modalContent.classList.remove("modal-small");
        modalContent.classList.add("modal-large");
        abrirModal(htmlNuevaCompra);

        const tbodyNuevo = document.getElementById("details-body");
        const filaNueva = tbodyNuevo.rows[filaIndex];

        if (filaNueva) {
          filaNueva.cells[0].innerText = nuevoProducto;
          filaNueva.cells[1].innerText = nuevaCantidad;
          filaNueva.cells[2].innerText = `$${nuevoPrecio}`;
          filaNueva.cells[3].innerText = `$${nuevoSubtotal}`;
        }
      };

      document.getElementById("btn-cancelEdit").onclick = () => {
        modalContent.classList.remove("modal-small");
        modalContent.classList.add("modal-large");
        abrirModal(htmlNuevaCompra);
      };
    }

    // CANCELAR COMPRA
    if (e.target.id === "btn-cancel") {
      modalContent.classList.remove("modal-large");
      modalContent.classList.add("modal-small");

      abrirModal(`
        <div style="text-align:center; padding:10px;">
          <h2>¿Estás seguro de cancelar?</h2>
          <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
            <button id="confirm-delete" class="delete">Cancelar Compra</button>
            <button id="btn-continue" class="view">Seguir</button>
          </div>
        </div>
      `);

      document.getElementById("btn-continue").onclick = (ev) => {
        ev.stopPropagation();
        modalContent.classList.remove("modal-small");
        modalContent.classList.add("modal-large");
        abrirModal(htmlNuevaCompra);
      };
    }

    if (e.target.id === "confirm-delete") {
      cerrarModal();
    }
  });
});
