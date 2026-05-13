async function loadComponents() {

    // SIDEBAR
    const sidebar = await fetch('/Components/Sidebar.html');
    const sidebarData = await sidebar.text();

    document.getElementById('sidebar-container').innerHTML = sidebarData;

    // TOPBAR
    const topbar = await fetch('/Components/Topbar.html');
    const topbarData = await topbar.text();

    document.getElementById('topbar-container').innerHTML = topbarData;
}

function activarSidebar() {

    const currentPage = window.location.pathname.split("/").pop();

    const links = document.querySelectorAll('.sidebar a');

    links.forEach(link => {

        const linkPage = link.getAttribute('href').split("/").pop();

        if (currentPage === linkPage) {

            link.parentElement.classList.add('active');
        }
    });
}

loadComponents();