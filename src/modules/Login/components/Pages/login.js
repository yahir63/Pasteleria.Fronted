import { login } from "../Services/login.js";


const boton = document.getElementById("loginButton");


boton.addEventListener("click", async () => {


    const userName = document.getElementById("username").value.toString();

    const password = document.getElementById("password").value.toString();



    const datos = {
        userName: userName,
        password: password
    };


    try {

        const respuesta = await login(
            datos.userName,
            datos.password
        );


        console.log("Login correcto", respuesta);


        window.location.href = "../../Dashboard/components/dashboard.html";


    } catch(error) {

        alert(error.message);

    }


});