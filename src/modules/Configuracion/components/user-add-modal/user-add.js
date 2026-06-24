import { CreateUser } from "../../../Usuario/services/User.services.js";
{
  const modal = document.getElementById("modalAddUser");
  const btnCancelar = document.getElementById("cancelAddUser");
  const btnClose = document.getElementById("closeAddUser");
  const savebtn = document.getElementById("saveAddUser");
  // CAMPOS DE LA CREACION DEL USUARIO
  const Nombre = document.getElementById("addUserNombre");
  const Contraseña = document.getElementById("addUserPassword");
  const SelectRol = document.getElementById("addUserRol");

  const NuevoUsuario = async () => {
    //validacion
    if (!Nombre || Nombre.value === "") {
      alert("Por Favor Complete los campos");
      return;
    }
    if (!Contraseña || Contraseña.value.length < 6) {
      alert("La Contraseña no debe ser menor a 6 caracteres");
      return;
    }

    const rolElegido = SelectRol.value;
    const data = {
      userName: Nombre.value.trim(),
      password: Contraseña.value.trim(),
      isAdmin: false,
      isGerent: false,
      isOperator: false,
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
      await CreateUser(data);
      cerrar();
      alert("Usuario Creado Exitosamente");
    } catch (error) {
      alert(error.message || error);
    }
  };

  savebtn.addEventListener("click", async () => {
    await NuevoUsuario();
  });
  function abrir() {
    modal.style.display = "flex";
  }

  function cerrar() {
    modal.style.display = "none";
  }

  // Eventos para cerrar
  btnCancelar.addEventListener("click", cerrar);
  btnClose.addEventListener("click", cerrar);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrar();
  });

  // Exponer función para abrir el modal desde Configuracion.js
  window.abrirModalAddUser = abrir;
}
