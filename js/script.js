document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("nav");
    const dropdown = document.querySelector(".menu-dropdown");
    const dropdownToggle = document.querySelector(".dropdown-toggle");

    const fecharMenu = () => {
        if (menuToggle && nav) {
            menuToggle.setAttribute("aria-expanded", "false");
            nav.classList.remove("menu-aberto");
        }

        if (dropdown && dropdownToggle) {
            dropdown.classList.remove("dropdown-aberto");
            dropdownToggle.setAttribute("aria-expanded", "false");
        }
    };

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            const aberto =
                menuToggle.getAttribute("aria-expanded") === "true";

            menuToggle.setAttribute("aria-expanded", String(!aberto));
            nav.classList.toggle("menu-aberto", !aberto);
        });
    }

    if (dropdown && dropdownToggle) {
        dropdownToggle.addEventListener("click", (event) => {
            event.stopPropagation();

            const aberto =
                dropdownToggle.getAttribute("aria-expanded") === "true";

            dropdownToggle.setAttribute("aria-expanded", String(!aberto));
            dropdown.classList.toggle("dropdown-aberto", !aberto);
        });
    }

    document.querySelectorAll("nav a").forEach((link) => {
        link.addEventListener("click", () => {
            fecharMenu();
        });
    });

    document.addEventListener("click", (event) => {
        if (!nav) return;

        if (!nav.contains(event.target)) {
            fecharMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            fecharMenu();

            if (menuToggle) {
                menuToggle.focus();
            }
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 800) {
            fecharMenu();
        }
    });
});
