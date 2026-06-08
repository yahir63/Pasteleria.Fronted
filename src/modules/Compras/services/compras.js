document.addEventListener("DOMContentLoaded", () => {
  const modal        = document.getElementById("modal");
  const modalBody    = document.getElementById("modal-body");
  const closeModal   = document.getElementById("close-modal");
  const modalContent = document.querySelector(".modal-content");
  const overlay      = document.querySelector(".sidebar-overlay");
  const sidebar      = document.querySelector(".sidebar");
  const toggleBtn    = document.querySelector(".sidebar-toggle");

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

  function cerrarModal() { modal.classList.remove("show"); }

  function abrirModal(html, size) {
    modalBody.innerHTML = html;
    modalContent.classList.remove("modal-small", "modal-large");
    if (size === "large") modalContent.classList.add("modal-large");
    else modalContent.classList.add("modal-small");
    modal.classList.add("show");
  }

  closeModal.addEventListener("click", cerrarModal);
  window.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });

  let htmlNuevaCompra = "";

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
    const btnView        = e.target.closest(".view");
    const btnDelete      = e.target.closest(".delete");
    const btnNewPurchase = e.target.closest(".btn-new");

    // ================= VER =================
    if (btnView) {
      const fila     = btnView.closest("tr");
      const proveedor = fila.children[0].innerText.trim();
      const detalles  = DetallesCompra[proveedor];

      if (!detalles) {
        abrirModal("<p>No hay detalles disponibles</p>", "small");
        return;
      }

      let html = `
        <h3>${proveedor}</h3>
        <table style="width:100%; margin-top:10px;">
          <thead>
            <tr>
              <th>Producto</th><th>Cant.</th><th>P. Unitario</th><th>Total</th>
            </tr>
          </thead>
          <tbody>`;

      detalles.forEach((item) => {
        const total = item.cantidad * item.precio;
        html += `<tr>
          <td>${item.producto}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precio}</td>
          <td>$${total}</td>
        </tr>`;
      });

      html += `</tbody></table>`;
      abrirModal(html);
    }

    // ================= GUARDAR COMPRA =================
    if (e.target.id === "btn-savePurchase") {
      abrirModal(`
        <div style="text-align:center; padding:20px;">
          <div style="width:60px;height:60px;margin:0 auto 12px;background:#d4f8d4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#1b5e20;">✓</div>
          <h3 style="margin-bottom:8px;">Compra guardada</h3>
          <p style="color:#666;font-size:14px;">La compra se guardó correctamente.</p>
          <button id="close" style="margin-top:15px;padding:8px 20px;border:none;border-radius:8px;background:#0BB2F4;color:white;cursor:pointer;font-weight:600;">Aceptar</button>
        </div>
      `, "small");
      setTimeout(() => {
        document.getElementById("close")?.addEventListener("click", cerrarModal);
      }, 50);
    }

    if (e.target.id === "close") cerrarModal();

    // ================= ELIMINAR =================
    if (btnDelete && !btnDelete.matches("#confirm-delete")) {
      const fila = btnDelete.closest("tr");
      abrirModal(`
        <div style="text-align:center; padding:15px;">
          <div style="width:60px;height:60px;margin:0 auto 15px;background:#ffe4e4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;">🗑️</div>
          <h3 style="margin-bottom:8px;">Eliminar compra</h3>
          <p style="color:#666;font-size:14px;margin-bottom:20px;">¿Estás seguro? Esta acción no se puede deshacer.</p>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button id="cancel-delete" style="background:#ccc;color:black;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:14px;">Cancelar</button>
            <button id="confirm-delete" style="background:#dc3545;color:white;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:6px;">
              <img src="/src/modules/Shared/Assets/img/eliminar.png" style="width:12px;height:14px;"> Eliminar
            </button>
          </div>
        </div>
      `, "small");

      setTimeout(() => {
        document.getElementById("confirm-delete")?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          fila?.remove();
          abrirModal(`
            <div style="text-align:center; padding:20px;">
              <div style="width:60px;height:60px;margin:0 auto 12px;background:#d4f8d4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#1b5e20;">✓</div>
              <h3 style="margin-bottom:8px;">Compra eliminada</h3>
              <p style="color:#666;font-size:14px;">La compra se eliminó correctamente.</p>
              <button id="close" style="margin-top:15px;padding:8px 20px;border:none;border-radius:8px;background:#0BB2F4;color:white;cursor:pointer;font-weight:600;">Aceptar</button>
            </div>
          `, "small");
          setTimeout(() => {
            document.getElementById("close")?.addEventListener("click", cerrarModal);
          }, 50);
        });
        document.getElementById("cancel-delete")?.addEventListener("click", cerrarModal);
      }, 50);
    }

    // ================= NUEVA COMPRA =================
    if (btnNewPurchase) {
      const html = `
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
                  <th style="text-align:center;">Acciones</th>
                </tr>
              </thead>
              <tbody id="details-body">
                <tr>
                  <td>Pastel Vainilla</td>
                  <td>10</td>
                  <td>$25</td>
                  <td>$250</td>
                  <td>
                    <div style="display:flex; gap:6px; justify-content:center;">
                      <button class="edit-detail-btn" style="background:#07729C;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:5px;">
                        <img src="/src/modules/Shared/Assets/img/editar.png" style="width:12px;height:14px;"> Editar
                      </button>
                      <button class="delete-detail-btn" style="background:#dc3545;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:5px;">
                        <img src="/src/modules/Shared/Assets/img/eliminar.png" style="width:12px;height:14px;"> Eliminar
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
          <button id="btn-savePurchase" class="btn-save">Guardar Compra</button>
        </div>
      `;

      htmlNuevaCompra = html;
      abrirModal(htmlNuevaCompra, "large");
    }

    // ================= ELIMINAR FILA DETALLE =================
    if (e.target.closest(".delete-detail-btn")) {
      e.target.closest("tr").remove();
    }

    // ================= EDITAR DETALLE =================
    if (e.target.closest(".edit-detail-btn")) {
      const fila      = e.target.closest("tr");
      const tbody     = fila.closest("tbody");
      const filaIndex = Array.from(tbody.rows).indexOf(fila);
      const celdas    = fila.querySelectorAll("td");
      const productoActual = celdas[0].innerText.trim();
      const cantidadActual = celdas[1].innerText.trim();
      const precioActual   = celdas[2].innerText.replace("$", "").trim();

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
      `, "large");

      setTimeout(() => {
        document.getElementById("btn-saveEdit")?.addEventListener("click", () => {
          const nuevoProducto = document.getElementById("edit-producto").value;
          const nuevaCantidad = document.getElementById("edit-cantidad").value;
          const nuevoPrecio   = document.getElementById("edit-precio").value;
          const nuevoSubtotal = nuevaCantidad * nuevoPrecio;

          abrirModal(htmlNuevaCompra, "large");

          setTimeout(() => {
            const tbodyNuevo = document.getElementById("details-body");
            const filaNueva  = tbodyNuevo?.rows[filaIndex];
            if (filaNueva) {
              filaNueva.cells[0].innerText = nuevoProducto;
              filaNueva.cells[1].innerText = nuevaCantidad;
              filaNueva.cells[2].innerText = `$${nuevoPrecio}`;
              filaNueva.cells[3].innerText = `$${nuevoSubtotal}`;
            }
          }, 50);
        });

        document.getElementById("btn-cancelEdit")?.addEventListener("click", () => {
          abrirModal(htmlNuevaCompra, "large");
        });
      }, 50);
    }

    // ================= CANCELAR COMPRA =================
    if (e.target.id === "btn-cancel") {
      abrirModal(`
        <div style="text-align:center; padding:15px;">
          <h3 style="margin-bottom:10px;">¿Estás seguro de cancelar?</h3>
          <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
            <button id="btn-continue" style="background:#0BB2F4;color:white;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:14px;">Seguir editando</button>
            <button id="confirm-delete" style="background:#dc3545;color:white;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:14px;">Cancelar Compra</button>
          </div>
        </div>
      `, "small");

      setTimeout(() => {
        document.getElementById("btn-continue")?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          abrirModal(htmlNuevaCompra, "large");
        });
        document.getElementById("confirm-delete")?.addEventListener("click", cerrarModal);
      }, 50);
    }

    if (e.target.id === "confirm-delete") cerrarModal();
  });
});