// Tento skript se musí vložit na konec každé stránky!
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navBtn = document.getElementById('nav-btn'); // Tlačítko Přihlásit
    const adminLink = document.getElementById('admin-link'); // Odkaz na Admin (pokud existuje)
    const editorLink = document.getElementById('editor-link'); // Odkaz na Editor (pokud existuje)

    if (user && navBtn) {
        // Změna tlačítka na "Účet"
        navBtn.innerText = "MŮJ ÚČET";
        navBtn.href = "account.html";
        navBtn.classList.add('btn-account');
    }

    // Zobrazení Admin/Editor odkazů podle rolí
    if (user && user.roles) {
        const adminRoles = ['founder', 'co-founder', 'head manager', 'manager', 'head dev', 'developer'];
        if (adminLink && user.roles.some(r => adminRoles.includes(r))) {
            adminLink.classList.remove('hidden');
        }
        if (editorLink && user.roles.includes('web developer')) {
            editorLink.classList.remove('hidden');
        }
    }
});