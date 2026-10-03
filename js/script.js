document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       NAVEGAÇÃO RESPONSIVA
       ========================================================= */

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


    /* =========================================================
       TOAST DOS PROJETOS
       ========================================================= */

    const botoesToast = document.querySelectorAll("[data-toast]");
    const projetoToast = document.querySelector("#projeto-toast");
    const projetoToastTexto = document.querySelector("#projeto-toast-text");

    let timeoutProjetoToast;

    const mostrarProjetoToast = (mensagem) => {
        if (!projetoToast) return;

        clearTimeout(timeoutProjetoToast);

        if (projetoToastTexto) {
            projetoToastTexto.textContent = ` ${mensagem}`;
        }

        projetoToast.classList.add("toast-visivel");
        projetoToast.setAttribute("aria-hidden", "false");

        timeoutProjetoToast = window.setTimeout(() => {
            projetoToast.classList.remove("toast-visivel");
            projetoToast.setAttribute("aria-hidden", "true");
        }, 3000);
    };

    botoesToast.forEach((botao) => {
        botao.addEventListener("click", () => {
            const mensagem = botao.dataset.toast;

            if (mensagem) {
                mostrarProjetoToast(mensagem);
            }
        });
    });


    /* =========================================================
       MODAL DE VOLUNTARIADO
       ========================================================= */

    const abrirModalVoluntariado = document.querySelector(
        "[data-modal-voluntariado]"
    );

    const modalVoluntariado = document.querySelector(
        "#voluntariado-modal"
    );

    const fecharModalVoluntariado = document.querySelector(
        "#fechar-modal-voluntariado"
    );

    const abrirJanelaVoluntariado = () => {
        if (!modalVoluntariado) return;

        modalVoluntariado.classList.add("modal-visivel");
        modalVoluntariado.setAttribute("aria-hidden", "false");

        fecharModalVoluntariado?.focus();
    };

    const fecharJanelaVoluntariado = () => {
        if (!modalVoluntariado) return;

        modalVoluntariado.classList.remove("modal-visivel");
        modalVoluntariado.setAttribute("aria-hidden", "true");

        abrirModalVoluntariado?.focus();
    };

    abrirModalVoluntariado?.addEventListener(
        "click",
        abrirJanelaVoluntariado
    );

    fecharModalVoluntariado?.addEventListener(
        "click",
        fecharJanelaVoluntariado
    );

    modalVoluntariado?.addEventListener("click", (event) => {
        if (event.target === modalVoluntariado) {
            fecharJanelaVoluntariado();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modalVoluntariado?.classList.contains("modal-visivel")
        ) {
            fecharJanelaVoluntariado();
        }
    });


    /* =========================================================
       VALIDAÇÃO DO FORMULÁRIO DE APOIADOR
       ========================================================= */

    const formulario = document.querySelector(".formulario");

    if (!formulario) return;

    const campos = formulario.querySelectorAll("input");

    const obterMensagemErro = (campo) => {
        if (campo.validity.valueMissing) {
            return "Este campo é obrigatório.";
        }

        if (campo.validity.typeMismatch) {
            return "Informe um e-mail válido.";
        }

        if (campo.validity.patternMismatch) {
            return "Confira o formato informado.";
        }

        return "Confira este campo.";
    };

    const atualizarEstadoCampo = (campo) => {
        const mensagemExistente =
            campo.parentElement.querySelector(".campo-mensagem");

        mensagemExistente?.remove();

        if (campo.validity.valid) {
            campo.setAttribute("aria-invalid", "false");
            campo.classList.remove("campo--erro");
            campo.classList.add("campo--sucesso");
            return;
        }

        campo.classList.remove("campo--sucesso");

        if (campo.value.trim() === "") {
            campo.removeAttribute("aria-invalid");
            campo.classList.remove("campo--erro");
            return;
        }

        campo.setAttribute("aria-invalid", "true");
        campo.classList.add("campo--erro");

        const mensagem = document.createElement("small");
        mensagem.className = "campo-mensagem erro";
        mensagem.textContent = obterMensagemErro(campo);

        campo.parentElement.appendChild(mensagem);
    };

    campos.forEach((campo) => {
        campo.addEventListener("input", () => {
            atualizarEstadoCampo(campo);
        });

        campo.addEventListener("blur", () => {
            atualizarEstadoCampo(campo);
        });
    });

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();

        const feedbackExistente =
            formulario.querySelector(".formulario-feedback");

        feedbackExistente?.remove();

        let primeiroCampoInvalido = null;

        campos.forEach((campo) => {
            atualizarEstadoCampo(campo);

            if (!campo.validity.valid && !primeiroCampoInvalido) {
                primeiroCampoInvalido = campo;
            }
        });

        const feedback = document.createElement("div");
        feedback.className = "formulario-feedback";

        if (primeiroCampoInvalido) {
            feedback.classList.add("erro");
            feedback.setAttribute("role", "alert");
            feedback.textContent =
                "Não foi possível concluir o cadastro. Confira os campos destacados.";

            formulario.prepend(feedback);

            primeiroCampoInvalido.focus();
            return;
        }

        feedback.classList.add("sucesso");
        feedback.setAttribute("role", "status");
        feedback.textContent =
            "Cadastro validado com sucesso. Seus dados estão prontos para envio.";

        formulario.prepend(feedback);
    });
});
