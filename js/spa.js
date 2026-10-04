(() => {
    "use strict";

    /*
     * =========================================================
     * SPA — CAMADA DE NAVEGAÇÃO
     * =========================================================
     *
     * A aplicação continua utilizando as páginas HTML existentes.
     * O JavaScript intercepta a navegação interna, busca somente
     * o documento de destino e substitui o elemento <main>.
     *
     * A estrutura original, CSS, header, footer e componentes
     * existentes são preservados.
     * =========================================================
     */

    const normalizePath = (pathname) => {
        const value = pathname.replace(/\/+$/, "");
        return value || "/";
    };

    const isInternalHtmlLink = (link) => {
        if (!link || link.tagName !== "A") return false;
        if (link.hasAttribute("download")) return false;
        if (link.target && link.target !== "_self") return false;
        if (link.protocol !== window.location.protocol) return false;
        if (link.host !== window.location.host) return false;

        const pathname = link.pathname.toLowerCase();

        return (
            pathname.endsWith(".html") ||
            pathname.endsWith("/")
        );
    };

    /*
     * Atualiza o estado visual da navegação conforme a rota atual.
     */
    const updateActiveNavigation = () => {
        const currentPath = normalizePath(
            window.location.pathname
        );

        document.querySelectorAll("nav a[href]").forEach((link) => {
            const linkPath = normalizePath(
                new URL(link.href, window.location.href).pathname
            );

            const isActive = linkPath === currentPath;

            link.classList.toggle("ativo", isActive);

            link.setAttribute(
                "aria-current",
                isActive ? "page" : "false"
            );
        });
    };

    /*
     * Trata links com #âncora.
     */
    const scrollToHash = (hash) => {
        if (!hash) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;
        }

        const target = document.querySelector(hash);

        target?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    /*
     * Busca uma página existente e extrai somente o <main>.
     */
    const fetchPage = async (url) => {
        const response = await fetch(url.href, {
            headers: {
                "X-Requested-With": "SPA-Navigation"
            }
        });

        if (!response.ok) {
            throw new Error(
                `Falha ao carregar a rota: ${response.status}`
            );
        }

        const html = await response.text();

        const nextDocument =
            new DOMParser().parseFromString(
                html,
                "text/html"
            );

        const nextMain =
            nextDocument.querySelector("main");

        if (!nextMain) {
            throw new Error(
                "A página de destino não possui <main>."
            );
        }

        return {
            main: nextMain,
            title: nextDocument.title
        };
    };

    /*
     * Renderiza uma nova rota sem recarregar o documento.
     */
    const renderRoute = async (
        url,
        { pushHistory = true } = {}
    ) => {
        const currentMain =
            document.querySelector("main");

        /*
         * Fallback de segurança:
         * se não existir <main>, utiliza a navegação
         * tradicional do navegador.
         */
        if (!currentMain) {
            window.location.href = url.href;
            return;
        }

        currentMain.setAttribute(
            "aria-busy",
            "true"
        );

        try {
            const {
                main,
                title
            } = await fetchPage(url);

            /*
             * Substitui somente o conteúdo principal.
             */
            currentMain.replaceWith(
                document.importNode(main, true)
            );

            /*
             * Atualiza o título do documento.
             */
            document.title = title;

            /*
             * Atualiza o histórico do navegador.
             */
            if (pushHistory) {
                window.history.pushState(
                    {},
                    "",
                    url.href
                );
            }

            updateActiveNavigation();

            scrollToHash(url.hash);

            /*
             * Evento para futuras funcionalidades.
             * Outros módulos poderão escutar:
             *
             * document.addEventListener(
             *     "spa:rendered",
             *     () => {}
             * );
             */
            document.dispatchEvent(
                new CustomEvent("spa:rendered", {
                    detail: {
                        url: url.href
                    }
                })
            );

        } catch (error) {
            console.error(
                "Erro na navegação SPA:",
                error
            );

            /*
             * Fallback:
             * se a SPA falhar, a página continua
             * funcionando pela navegação tradicional.
             */
            window.location.href = url.href;

        } finally {
            document
                .querySelector("main")
                ?.removeAttribute("aria-busy");
        }
    };

    /*
     * Interceptação global dos links internos.
     */
    document.addEventListener("click", (event) => {
        const target =
            event.target instanceof Element
                ? event.target
                : null;

        const link =
            target?.closest("a[href]");

        if (!isInternalHtmlLink(link)) {
            return;
        }

        /*
         * Permite Ctrl/Cmd + clique,
         * Shift + clique e Alt + clique.
         */
        if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        const url = new URL(
            link.href,
            window.location.href
        );

        const currentUrl =
            new URL(window.location.href);

        const sameDocument =
            normalizePath(url.pathname) ===
            normalizePath(currentUrl.pathname);

        event.preventDefault();

        /*
         * Se for apenas uma âncora da página atual,
         * não precisamos buscar outro documento.
         */
        if (sameDocument) {
            if (url.hash) {
                window.history.pushState(
                    {},
                    "",
                    url.href
                );

                scrollToHash(url.hash);
            }

            return;
        }

        renderRoute(url);
    });

    /*
     * Suporte aos botões Voltar/Avançar do navegador.
     */
    window.addEventListener("popstate", () => {
        renderRoute(
            new URL(window.location.href),
            {
                pushHistory: false
            }
        );
    });

    /*
     * Estado inicial da navegação.
     */
    updateActiveNavigation();
})();
