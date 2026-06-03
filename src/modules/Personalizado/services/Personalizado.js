const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const modal = document.getElementById("productModal");

openModal.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

cancelModal.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
const editPersonalizadoModal =
    document.getElementById("editPersonalizadoModal");

const openEditPersonalizadoButtons =
    document.querySelectorAll(".openEditPersonalizadoModal");

const closeEditPersonalizadoModal =
    document.getElementById("closeEditPersonalizadoModal");

const cancelEditPersonalizadoModal =
    document.getElementById("cancelEditPersonalizadoModal");


const editPersonalizadoNombre =
    document.getElementById("editPersonalizadoNombre");

const editPersonalizadoCategoria =
    document.getElementById("editPersonalizadoCategoria");

const editPersonalizadoCantidad =
    document.getElementById("editPersonalizadoCantidad");

const editPersonalizadoVolumen =
    document.getElementById("editPersonalizadoVolumen");

const editPersonalizadoOpciones =
    document.getElementById("editPersonalizadoOpciones");

const editPersonalizadoDescripcion =
    document.getElementById("editPersonalizadoDescripcion");

const editPersonalizadoPrecio =
    document.getElementById("editPersonalizadoPrecio");


openEditPersonalizadoButtons.forEach(button => {

    button.addEventListener("click", function () {

        const row =
            button.closest("tr");


        editPersonalizadoNombre.value =
            row.children[0].textContent;

        editPersonalizadoCategoria.value =
            row.children[1].textContent;

        editPersonalizadoCantidad.value =
            row.children[2].textContent;

        editPersonalizadoVolumen.value =
            row.children[3].textContent;

        editPersonalizadoOpciones.value =
            row.children[4].textContent;

        editPersonalizadoDescripcion.value =
            row.children[5].textContent;

        editPersonalizadoPrecio.value =
            row.children[6].textContent;


        editPersonalizadoModal.style.display = "flex";

    });

});


closeEditPersonalizadoModal.addEventListener("click", function () {

    editPersonalizadoModal.style.display = "none";

});


cancelEditPersonalizadoModal.addEventListener("click", function () {

    editPersonalizadoModal.style.display = "none";

});


window.addEventListener("click", function (e) {

    if (e.target === editPersonalizadoModal) {

        editPersonalizadoModal.style.display = "none";

    }

});
const deleteModal =
    document.getElementById("deleteModal");

const openDeleteButtons =
    document.querySelectorAll(".openDeleteModal");

const cancelDeleteModal =
    document.getElementById("cancelDeleteModal");

const confirmDelete =
    document.getElementById("confirmDelete");

const deleteText =
    document.getElementById("deleteText");


openDeleteButtons.forEach(button => {

    button.addEventListener("click", function () {

        const row =
            button.closest("tr");

        const productName =
            row.children[0].textContent;

        deleteText.textContent =
            `¿Seguro que deseas eliminar "${productName}"?`;

        deleteModal.style.display = "flex";

    });

});


cancelDeleteModal.addEventListener("click", function () {

    deleteModal.style.display = "none";

});


confirmDelete.addEventListener("click", function () {

    deleteModal.style.display = "none";

});


window.addEventListener("click", function (e) {

    if (e.target === deleteModal) {

        deleteModal.style.display = "none";

    }

});