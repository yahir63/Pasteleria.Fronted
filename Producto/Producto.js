   const openModal = document.getElementById("openModal");
    const closeModal = document.getElementById("closeModal");
    const cancelModal = document.getElementById("cancelModal");
    const modal = document.getElementById("productModal");

    openModal.addEventListener("click", function () {
        modal.style.display = "flex";
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    cancelModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });


const editModal = document.getElementById("editModal");

const openEditButtons =
    document.querySelectorAll(".openEditModal");

const closeEditModal =
    document.getElementById("closeEditModal");

const cancelEditModal =
    document.getElementById("cancelEditModal");



const editNombre =
    document.getElementById("editNombre");

const editCategoria =
    document.getElementById("editCategoria");

const editCantidad =
    document.getElementById("editCantidad");

const editPrecio =
    document.getElementById("editPrecio");




openEditButtons.forEach(button => {

    button.addEventListener("click", function () {

     

        const row = button.closest("tr");

    

        const nombre =
            row.children[0].textContent;

        const categoria =
            row.children[1].textContent;

        const cantidad =
            row.children[2].textContent;

        const precio =
            row.children[3].textContent;

  

        editNombre.value = nombre;

        editCategoria.value = categoria;

        editCantidad.value = cantidad;

        editPrecio.value = precio;

     

        editModal.style.display = "flex";

    });

});




closeEditModal.addEventListener("click", function () {

    editModal.style.display = "none";

});

cancelEditModal.addEventListener("click", function () {

    editModal.style.display = "none";

});

window.addEventListener("click", function (e) {

    if (e.target === editModal) {

        editModal.style.display = "none";

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