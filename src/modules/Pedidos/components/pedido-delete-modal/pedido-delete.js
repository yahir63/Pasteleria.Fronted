import { toggleEstado } from "/src/modules/Pedidos/Service/Pedidos.Service.js";

export function init(state) {
  const modal = document.getElementById("modalDelete");
  const btnEliminar = modal.querySelector(".btn.delete");
  const btnCancelar = modal.querySelector(".btn.cancel");
  const selectEstado = document.getElementById("selectEstado");

  // Corregido: recibe 'id' correctamente
  function abrir(id) { 
    console.log("abrir() recibido id:", id);  
    state.pedidoEditandoId = id; 
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function cerrar() {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }

  btnCancelar.addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });

  btnEliminar.addEventListener("click", async () => {
    const idPedido = state.pedidoEditandoId; 
    const estadoSeleccionado = selectEstado.value; 
    
    if (idPedido === null) return;
    const confirmacion = confirm(`¿Estás seguro de que deseas cambiar el estado a "${estadoSeleccionado}"?`);
    
    if (!confirmacion) return;
    const dto = {
        OrderId: parseInt(idPedido),
        IsActive: estadoSeleccionado 
    };

    await toggleEstado(dto);
    alert("¡Estado cambiado con éxito!");
    cerrar(); 
        
    // 4. Recargar la tabla
    state.pedidoEditandoId = null;
    state.recargar();
   
  });

  state.abrirModalDelete = abrir;
}