import { Update } from "../../services/User.services.js";

export function init(state) {
  const modal = document.getElementById("modal");
  const name = document.getElementById("name");
  const rol = document.getElementById("Roles");
  const btnCancelar = document.getElementById("cancelar");
  const btnGuardar = document.getElementById("guardar");
  const btnClose = modal?.querySelector(".close");

  let originalRoleFlags = {
    isAdmin: false,
    isGerent: false,
    isOperator: false,
  };

  function abrir(data) {
    name.value = data.userName ?? data.username ?? "";
    originalRoleFlags = {
      isAdmin:
        data.isAdmin === "true" ||
        data.isAdmin === true ||
        data.IsAdmin === true,
      isGerent:
        data.isGerent === "true" ||
        data.isGerent === true ||
        data.IsGerent === true,
      isOperator:
        data.isOperator === "true" ||
        data.isOperator === true ||
        data.IsOperator === true,
    };

    const roleOption = data.role ?? data.rol ?? "";
    const roleFromFlags = originalRoleFlags.isAdmin
      ? "Admin"
      : originalRoleFlags.isGerent
        ? "Gerent"
        : originalRoleFlags.isOperator
          ? "Operator"
          : "";

    rol.value = roleOption || roleFromFlags || "";
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  if (btnCancelar) btnCancelar.addEventListener("click", cerrar);
  if (btnClose) btnClose.addEventListener("click", cerrar);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  btnGuardar.addEventListener("click", async () => {
    const id = state.UsuarioEditandoId;
    if (!id) return;

    const rolElegido = rol.value;
    const data = {
      userName: name.value.trim(),
      isGerent: originalRoleFlags.isGerent,
      isOperator: originalRoleFlags.isOperator,
      isAdmin: originalRoleFlags.isAdmin,
    };

    if (rolElegido === "Gerent") {
      data.isGerent = true;
      data.isOperator = false;
      data.isAdmin = false;
    } else if (rolElegido === "Operator") {
      data.isGerent = false;
      data.isOperator = true;
      data.isAdmin = false;
    } else if (rolElegido === "Admin") {
      data.isGerent = false;
      data.isOperator = false;
      data.isAdmin = true;
    }

    try {
      await Update(id, data);
      state.UsuarioEditandoId = null;
      cerrar();
      state.recargar();
      alert("Usuario actualizado exitosamente");
    } catch (error) {
      alert(error.message || error);
    }
  });

  state.abrirModalEdit = abrir;
}
