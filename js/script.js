/* Simplifica Social — interações da landing page */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const navToggle = document.getElementById("navToggle");
  const menu = document.getElementById("menu");
  const navLinks = document.querySelectorAll(".nav__link");
  const hero = document.querySelector(".hero");
  const yearEl = document.getElementById("year");
  const chatPanel = document.getElementById("conversa");
  const chatPreview = document.getElementById("chatPreview") || document.querySelector(".chat-preview");
  const bubbles = document.querySelectorAll(".chat-msg");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Marca o hero como pronto (zoom suave da imagem)
  requestAnimationFrame(() => {
    hero?.classList.add("is-ready");
  });

  // Header ao rolar
  const onScrollHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  // Menu mobile
  navToggle?.addEventListener("click", () => {
    const aberto = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(aberto));
    navToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });

  menu?.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    header.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });

  // Link ativo conforme a seção visível
  const secoes = ["inicio", "conversa", "clareza", "beneficios"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const marcarLinkAtivo = () => {
    let atual = secoes[0]?.id;
    const deslocamento = window.scrollY + 120;

    secoes.forEach((secao) => {
      if (secao.offsetTop <= deslocamento) {
        atual = secao.id;
      }
    });

    navLinks.forEach((link) => {
      const ativo = link.getAttribute("href") === `#${atual}`;
      link.classList.toggle("is-active", ativo);
    });
  };

  window.addEventListener("scroll", marcarLinkAtivo, { passive: true });
  marcarLinkAtivo();

  // Reveal ao entrar na tela
  const revelaveis = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );

    revelaveis.forEach((el) => observer.observe(el));
  } else {
    revelaveis.forEach((el) => el.classList.add("is-in"));
  }

  // Transição do hero: imagem e texto somem ao rolar
  const heroMedia = hero?.querySelector(".hero__media");
  const heroContent = hero?.querySelector(".hero__content");
  const heroVeil = hero?.querySelector(".hero__veil");
  const scrollHint = document.querySelector(".scroll-hint");
  let heroRaf = 0;

  const atualizarHeroScroll = () => {
    if (!hero) return;

    const altura = Math.max(hero.offsetHeight, window.innerHeight * 0.6);
    const progresso = Math.min(Math.max(window.scrollY / (altura * 0.75), 0), 1);
    const opacidadeMidia = Math.max(0, 1 - progresso * 1.15);
    const opacidadeTexto = Math.max(0, 1 - progresso * 1.35);
    const sobe = progresso * 56;
    const escala = 1 + progresso * 0.1;

    // "important" evita conflito com preferências de reduzir movimento do Windows
    if (heroMedia) {
      heroMedia.style.setProperty("opacity", String(opacidadeMidia), "important");
      heroMedia.style.setProperty(
        "transform",
        `translate3d(0, ${progresso * 12}%, 0) scale(${escala})`,
        "important"
      );
    }

    if (heroContent) {
      heroContent.style.setProperty("opacity", String(opacidadeTexto), "important");
      heroContent.style.setProperty("transform", `translate3d(0, ${-sobe}px, 0)`, "important");
    }

    if (heroVeil) {
      heroVeil.style.setProperty("opacity", String(Math.max(0.25, 1 - progresso * 0.55)), "important");
    }

    if (scrollHint) {
      scrollHint.style.setProperty("opacity", String(Math.max(0, 1 - progresso * 3)), "important");
      scrollHint.style.pointerEvents = progresso > 0.2 ? "none" : "auto";
    }

    hero.classList.toggle("is-scrolling", progresso > 0.01);
    hero.style.setProperty("--hero-progress", progresso.toFixed(4));
  };

  const pedirAtualizacaoHero = () => {
    cancelAnimationFrame(heroRaf);
    heroRaf = requestAnimationFrame(atualizarHeroScroll);
  };

  if (hero) {
    atualizarHeroScroll();
    window.addEventListener("scroll", pedirAtualizacaoHero, { passive: true });
    window.addEventListener("resize", pedirAtualizacaoHero, { passive: true });
  }

  // Fecha menu mobile ao ampliar para desktop/laptop
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth >= 992 && header?.classList.contains("is-open")) {
        header.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
        navToggle?.setAttribute("aria-label", "Abrir menu");
      }
    },
    { passive: true }
  );

  // Animação do chat: reinicia ao rolar para fora e voltar
  let chatTimers = [];
  let chatVisivel = false;

  const limparTimersChat = () => {
    chatTimers.forEach((id) => clearTimeout(id));
    chatTimers = [];
  };

  const resetarChat = () => {
    limparTimersChat();
    bubbles.forEach((bubble) => {
      bubble.classList.remove("is-visible");
      bubble.style.transition = "none";
      bubble.style.opacity = "0";
      bubble.style.transform = "translateY(12px)";
    });
    chatPreview?.classList.remove("is-alive");
    // força o navegador a aplicar o estado "escondido" antes da próxima animação
    void chatPreview?.offsetWidth;
    bubbles.forEach((bubble) => {
      bubble.style.transition = "";
    });
  };

  const animarChat = () => {
    resetarChat();
    chatPreview?.classList.add("is-alive");

    bubbles.forEach((bubble, index) => {
      const timer = setTimeout(() => {
        bubble.style.opacity = "";
        bubble.style.transform = "";
        bubble.classList.add("is-visible");
      }, 300 + index * 650);
      chatTimers.push(timer);
    });
  };

  const alvoChat = chatPreview || chatPanel;

  if (alvoChat && "IntersectionObserver" in window) {
    const chatObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;

          if (ratio >= 0.35) {
            if (!chatVisivel) {
              chatVisivel = true;
              animarChat();
            }
            return;
          }

          // saiu o suficiente da tela → próxima passagem reinicia
          if (ratio < 0.12) {
            chatVisivel = false;
            resetarChat();
          }
        });
      },
      { threshold: [0, 0.12, 0.35, 0.6, 1] }
    );
    chatObserver.observe(alvoChat);
  } else {
    animarChat();
  }

  const irParaConversa = (event) => {
    event?.preventDefault();
    chatPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  document.getElementById("fabChat")?.addEventListener("click", irParaConversa);
  document.getElementById("btnIniciarConversa")?.addEventListener("click", irParaConversa);

  // Placeholders dos botões (sem redirecionar ainda)
  document.getElementById("btnLogin")?.addEventListener("click", (event) => {
    event.preventDefault();
    mostrarAviso("Tela de login em construção — vamos conectar depois.");
  });

  document.querySelectorAll(".btn-ver-beneficios").forEach((botao) => {
    botao.addEventListener("click", (event) => {
      event.preventDefault();
      mostrarAviso("Lista completa de benefícios em breve.");
    });
  });

  // Tradutor da burocracia
  iniciarTradutor();

  function iniciarTradutor() {
    const termos = [
      {
        hard: "Benefício de Prestação Continuada (BPC)",
        easy: "Um apoio em dinheiro todo mês para idosos a partir de 65 anos ou pessoas com deficiência, quando a renda da família é baixa.",
      },
      {
        hard: "Cadastro Único (CadÚnico)",
        easy: "O registro da sua família na prefeitura para acessar programas como o Bolsa Família.",
      },
      {
        hard: "Instituto Nacional do Seguro Social (INSS)",
        easy: "O órgão que cuida de aposentadoria, auxílio-doença e outros benefícios de quem contribui.",
      },
      {
        hard: "Renda per capita",
        easy: "Quanto cada pessoa da casa ganha, em média — soma da renda dividida pelo número de moradores.",
      },
      {
        hard: "Lei Orgânica da Assistência Social (LOAS)",
        easy: "A lei que garante o BPC e outros apoios para quem precisa, mesmo sem ter contribuído ao INSS.",
      },
    ];

    const hardEl = document.getElementById("translatorHard");
    const easyEl = document.getElementById("translatorEasy");
    const stage = document.querySelector(".translator__stage");
    const botoes = [...document.querySelectorAll(".translator__term")];
    const bloco = document.getElementById("translator");
    if (!hardEl || !easyEl || !botoes.length) return;

    let indice = 0;
    let autoTimer = null;
    let pausado = false;

    const mostrar = (i) => {
      indice = i;
      stage?.classList.add("is-swap");

      setTimeout(() => {
        hardEl.textContent = termos[i].hard;
        easyEl.textContent = termos[i].easy;
        botoes.forEach((botao, idx) => botao.classList.toggle("is-active", idx === i));
        stage?.classList.remove("is-swap");
      }, 220);
    };

    botoes.forEach((botao) => {
      botao.addEventListener("click", () => {
        pausado = true;
        clearInterval(autoTimer);
        mostrar(Number(botao.dataset.i));
        // retoma o ciclo depois de um tempo
        setTimeout(() => {
          pausado = false;
          iniciarAuto();
        }, 8000);
      });
    });

    const iniciarAuto = () => {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        if (pausado) return;
        mostrar((indice + 1) % termos.length);
      }, 4500);
    };

    if (bloco && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) iniciarAuto();
            else clearInterval(autoTimer);
          });
        },
        { threshold: 0.35 }
      );
      obs.observe(bloco);
    } else {
      iniciarAuto();
    }
  }

  // Feedback temporário e acessível
  function mostrarAviso(mensagem) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);

      const estilo = document.createElement("style");
      estilo.textContent = `
        .toast {
          position: fixed;
          left: 50%;
          bottom: 5.5rem;
          transform: translateX(-50%) translateY(20px);
          background: #163a74;
          color: #fff;
          font-family: "Nunito", sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.85rem 1.2rem;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(22, 58, 116, 0.28);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
          z-index: 200;
          max-width: min(420px, calc(100% - 2rem));
          text-align: center;
        }
        .toast.is-on {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `;
      document.head.appendChild(estilo);
    }

    toast.textContent = mensagem;
    toast.classList.add("is-on");
    clearTimeout(mostrarAviso._timer);
    mostrarAviso._timer = setTimeout(() => toast.classList.remove("is-on"), 2800);
  }

});
