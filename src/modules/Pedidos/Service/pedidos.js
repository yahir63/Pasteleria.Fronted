function init() {
  const modal        = document.getElementById("modal");
  const modalBody    = document.getElementById("modal-body");
  const closeModal   = document.getElementById("close-modal");
  const modalContent = document.querySelector(".modal-content");

  if (!modal || !closeModal) {
    setTimeout(init, 50);
    return;
  }

  function cerrarModal() {
    modal.classList.remove("show");
  }

  function abrirModal(html, size) {
    modalBody.innerHTML = html;
    modalContent.classList.remove("modal-small", "modal-medium", "modal-large");
    if (size === "large")      modalContent.classList.add("modal-large");
    else if (size === "small") modalContent.classList.add("modal-small");
    else                       modalContent.classList.add("modal-medium");
    modal.classList.add("show");
  }

  closeModal.addEventListener("click", cerrarModal);
  window.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });

  let htmlNuevoPedido = "";

  const DetallesPedido = {
    "Rosa Aguirre": {
      fecha: "29/04/26 04:30 p.m.", estado: "Pendiente", total: "C$ 4600",
      telefono: "86245867", adelanto: "C$ 500", fechaEntrega: "01/05/26 2:00 PM",
      productos: [
        { nombre: "Pastel de Chocolate", descripcion: "Con relleno de crema", cantidad: 1, precio: "C$ 900", subtotal: "C$ 900" },
        { nombre: "Cupcakes x24", descripcion: "Decorados con fondant", cantidad: 24, precio: "C$ 150", subtotal: "C$ 3600" },
      ]
    },
    "Belen Garcia": {
      fecha: "28/04/26 02:30 p.m.", estado: "En Proceso", total: "C$ 1200",
      telefono: "87654321", adelanto: "C$ 300", fechaEntrega: "02/05/26 3:00 PM",
      productos: [
        { nombre: "Pastel de Vainilla", descripcion: "Con chispas de chocolate", cantidad: 1, precio: "C$ 1200", subtotal: "C$ 1200" },
      ]
    },
    "Juan Lopez": {
      fecha: "25/04/26 10:30 a.m.", estado: "Entregado", total: "C$ 900",
      telefono: "85432167", adelanto: "C$ 200", fechaEntrega: "26/04/26 12:00 PM",
      productos: [
        { nombre: "Galletas surtidas", descripcion: "Caja de 30 unidades", cantidad: 30, precio: "C$ 30", subtotal: "C$ 900" },
      ]
    },
    "Maria Garcia": {
      fecha: "27/04/26 11:30 a.m.", estado: "Entregado", total: "C$ 1000",
      telefono: "84321675", adelanto: "C$ 400", fechaEntrega: "28/04/26 10:00 AM",
      productos: [
        { nombre: "Tarta de frutas", descripcion: "Frutas de temporada", cantidad: 1, precio: "C$ 1000", subtotal: "C$ 1000" },
      ]
    },
    "Carlos Garay": {
      fecha: "23/04/26 08:30 a.m.", estado: "Entregado", total: "C$ 800",
      telefono: "83216754", adelanto: "C$ 200", fechaEntrega: "24/04/26 09:00 AM",
      productos: [
        { nombre: "Brownies", descripcion: "Caja de 12 unidades", cantidad: 12, precio: "C$ 66", subtotal: "C$ 800" },
      ]
    },
  };

  document.addEventListener("click", (e) => {
    const btnView  = e.target.closest(".view");
    const btnNuevo = e.target.closest("#btn-nuevo-pedido");

    if (btnView) {
      const fila    = btnView.closest("tr");
      const cliente = fila.children[0].innerText.trim();
      const data    = DetallesPedido[cliente];

      if (!data) {
        abrirModal("<p style='text-align:center;color:#999;padding:20px;'>Sin detalles disponibles.</p>", "medium");
        return;
      }

      let filasProductos = "";
      data.productos.forEach(p => {
        filasProductos += `
          <tr>
            <td>${p.nombre}</td><td>${p.descripcion}</td>
            <td>${p.cantidad}</td><td>${p.precio}</td><td>${p.subtotal}</td>
          </tr>`;
      });

      const estadoClass = data.estado === "Pendiente" ? "Pendiente"
                        : data.estado === "En Proceso" ? "Proceso"
                        : "Entregado";

      abrirModal(`
        <div class="modal-header"><h2>Detalle de Pedido</h2></div>
        <div class="modal-body">
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
            <div style="flex:1;min-width:130px;background:#f0f4f8;border-radius:10px;padding:12px;">
              <p style="font-size:11px;color:#888;margin:0 0 4px;">Cliente</p>
              <p style="font-weight:700;color:#032F44;margin:0;">${cliente}</p>
            </div>
            <div style="flex:1;min-width:130px;background:#f0f4f8;border-radius:10px;padding:12px;">
              <p style="font-size:11px;color:#888;margin:0 0 4px;">Fecha Pedido</p>
              <p style="font-weight:700;color:#032F44;margin:0;">${data.fecha}</p>
            </div>
            <div style="flex:1;min-width:130px;background:#f0f4f8;border-radius:10px;padding:12px;">
              <p style="font-size:11px;color:#888;margin:0 0 4px;">Total</p>
              <p style="font-weight:700;color:#032F44;margin:0;">${data.total}</p>
            </div>
            <div style="flex:1;min-width:130px;background:#f0f4f8;border-radius:10px;padding:12px;">
              <p style="font-size:11px;color:#888;margin:0 0 4px;">Estado</p>
              <span class="${estadoClass}" style="display:inline-block;">${data.estado}</span>
            </div>
          </div>
          <p style="font-weight:600;margin-bottom:10px;">Productos</p>
          <div class="details-box">
            <table style="width:100%;">
              <thead><tr><th>Producto</th><th>Descripción</th><th>Cantidad</th><th>P. Unitario</th><th>Subtotal</th></tr></thead>
              <tbody>${filasProductos}</tbody>
            </table>
          </div>
          <p style="font-weight:600;margin:15px 0 10px;">Información Adicional</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <div style="flex:1;min-width:130px;background:#f0f4f8;border-radius:10px;padding:12px;">
              <p style="font-size:11px;color:#888;margin:0 0 4px;">📱 Teléfono</p>
              <p style="font-weight:700;color:#032F44;margin:0;">${data.telefono}</p>
            </div>
            <div style="flex:1;min-width:130px;background:#f0f4f8;border-radius:10px;padding:12px;">
              <p style="font-size:11px;color:#888;margin:0 0 4px;">💵 Adelanto</p>
              <p style="font-weight:700;color:#032F44;margin:0;">${data.adelanto}</p>
            </div>
            <div style="flex:1;min-width:130px;background:#f0f4f8;border-radius:10px;padding:12px;">
              <p style="font-size:11px;color:#888;margin:0 0 4px;">📅 Fecha Entrega</p>
              <p style="font-weight:700;color:#032F44;margin:0;">${data.fechaEntrega}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="justify-content:flex-end;">
          <button id="btn-cerrar-ver" class="btn-cancel">Cerrar</button>
        </div>
      `, "medium");

      setTimeout(() => {
        document.getElementById("btn-cerrar-ver")?.addEventListener("click", cerrarModal);
      }, 50);
    }

    if (btnNuevo) {
      const html = `
        <div class="modal-header"><h2>Nuevo Pedido</h2></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group"><label>Fecha de Pedido</label><input type="datetime-local"></div>
            <div class="form-group"><label>Cliente</label>
              <select><option>Rafaela Ramirez</option><option>Jafet Sanchez</option><option>Juan Lopez</option><option>Rosa Aguirre</option></select>
            </div>
            <div class="form-group"><label>Producto</label>
              <select><option>Pastel de Chocolate</option><option>Cupcake</option><option>Galletas</option><option>Pastel de Vainilla</option></select>
            </div>
            <div class="form-group"><label>Cantidad</label><input type="number" placeholder="0"></div>
            <div class="form-group"><label>Fecha de Entrega</label><input type="datetime-local"></div>
            <div class="form-group add-btn"><button class="btn-add">+ Agregar</button></div>
          </div>
          <div class="details-box">
            <table><thead><tr><th>Producto</th><th>Cant.</th><th>Precio Unitario</th><th>Subtotal</th><th>Acciones</th></tr></thead>
              <tbody id="details-body">
                <tr>
                  <td>Pastel de Chocolate</td><td>1</td><td>C$ 900</td><td>C$ 900</td>
                  <td><div style="display:flex;gap:6px;justify-content:center;">
                    <button class="edit-detail-btn" style="background:#07729C;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Editar</button>
                    <button class="delete-detail-btn" style="background:#dc3545;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Eliminar</button>
                  </div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <div class="total-box"><span>Total:</span><input type="text" value="C$ 0.00" readonly></div>
          <div class="form-group" style="margin:0;min-width:150px;">
            <select style="padding:9px 12px;border-radius:8px;border:1px solid #ccc;font-size:14px;">
              <option>Pendiente</option><option>En Proceso</option><option>Entregado</option>
            </select>
          </div>
          <button id="btn-cancelPedido" class="btn-cancel">Cancelar</button>
          <button id="btn-savePedido" class="btn-save">Guardar Pedido</button>
        </div>
      `;
      htmlNuevoPedido = html;
      abrirModal(html, "large");

      setTimeout(() => {
        document.getElementById("btn-cancelPedido")?.addEventListener("click", () => {
          abrirModal(`
            <div style="text-align:center;padding:15px;">
              <h3 style="margin-bottom:10px;">¿Estás seguro de cancelar?</h3>
              <div style="display:flex;gap:10px;justify-content:center;margin-top:15px;">
                <button id="btn-continue" style="background:#0BB2F4;color:white;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;">Seguir editando</button>
                <button id="confirm-cancel" style="background:#dc3545;color:white;border:none;padding:9px 18px;border-radius:8px;cursor:pointer;">Cancelar Pedido</button>
              </div>
            </div>
          `, "small");
          setTimeout(() => {
            document.getElementById("btn-continue")?.addEventListener("click", (ev) => { ev.stopPropagation(); abrirModal(htmlNuevoPedido, "large"); });
            document.getElementById("confirm-cancel")?.addEventListener("click", cerrarModal);
          }, 50);
        });

        document.getElementById("btn-savePedido")?.addEventListener("click", () => {
          abrirModal(`
            <div style="text-align:center;padding:20px;">
              <div style="width:60px;height:60px;margin:0 auto 12px;background:#d4f8d4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#1b5e20;">✓</div>
              <h3 style="margin-bottom:8px;">Pedido guardado</h3>
              <p style="color:#666;font-size:14px;">El pedido se guardó correctamente.</p>
              <button id="close-ok" style="margin-top:15px;padding:8px 20px;border:none;border-radius:8px;background:#0BB2F4;color:white;cursor:pointer;font-weight:600;">Aceptar</button>
            </div>
          `, "small");
          setTimeout(() => {
            document.getElementById("close-ok")?.addEventListener("click", cerrarModal);
          }, 50);
        });
      }, 50);
    }

    if (e.target.closest(".delete-detail-btn")) {
      e.target.closest("tr").remove();
    }

    if (e.target.closest(".edit-detail-btn")) {
      const fila     = e.target.closest("tr");
      const tbody    = fila.closest("tbody");
      const filaIndex = Array.from(tbody.rows).indexOf(fila);
      const celdas   = fila.querySelectorAll("td");
      const productoActual = celdas[0].innerText.trim();
      const cantidadActual = celdas[1].innerText.trim();
      const precioActual   = celdas[2].innerText.replace("C$", "").trim();

      abrirModal(`
        <div class="modal-header"><h2>Editar Detalle</h2></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group"><label>Producto</label>
              <select id="edit-producto">
                <option ${productoActual === "Pastel de Chocolate" ? "selected" : ""}>Pastel de Chocolate</option>
                <option ${productoActual === "Cupcake" ? "selected" : ""}>Cupcake</option>
                <option ${productoActual === "Galletas" ? "selected" : ""}>Galletas</option>
                <option ${productoActual === "Pastel de Vainilla" ? "selected" : ""}>Pastel de Vainilla</option>
              </select>
            </div>
            <div class="form-group"><label>Cantidad</label><input type="number" id="edit-cantidad" value="${cantidadActual}"></div>
            <div class="form-group"><label>Precio Unitario</label><input type="text" id="edit-precio" value="${precioActual}"></div>
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
          const nuevoSubtotal = nuevaCantidad * nuevoPrecio.replace(/[^\d.]/g, "");
          abrirModal(htmlNuevoPedido, "large");
          setTimeout(() => {
            const tbodyNuevo = document.getElementById("details-body");
            const filaNueva  = tbodyNuevo?.rows[filaIndex];
            if (filaNueva) {
              filaNueva.cells[0].innerText = nuevoProducto;
              filaNueva.cells[1].innerText = nuevaCantidad;
              filaNueva.cells[2].innerText = `C$ ${nuevoPrecio}`;
              filaNueva.cells[3].innerText = `C$ ${nuevoSubtotal}`;
            }
          }, 50);
        });
        document.getElementById("btn-cancelEdit")?.addEventListener("click", () => abrirModal(htmlNuevoPedido, "large"));
      }, 50);
    }
  });
}

init();