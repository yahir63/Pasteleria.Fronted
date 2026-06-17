import { login } from "/src/modules/Login/components/Services/login.Service.js";

const boton = document.getElementById("loginButton");

boton.addEventListener("click", async () => {
  const userName = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!userName || !password) {
    alert("Usuario y contraseña son obligatorios.");
    return;
  }

  try {
    const respuesta = await login(userName, password);
    localStorage.setItem("token", respuesta.value.token);
    localStorage.setItem("user", JSON.stringify(respuesta.value));
    window.location.href = "/index.html#/dashboard";
  } catch (err) {
    alert(err.message);
  }
});