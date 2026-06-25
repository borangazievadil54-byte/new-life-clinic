/* =========================================================
   New Life Clinic — script
   ========================================================= */

/* --- НАСТРОЙКИ: замените на реальные данные клиники --- */
const CONFIG = {
  whatsappNumber: "77000000000",                      // TODO: номер WhatsApp в формате 77XXXXXXXXX (без +, пробелов и скобок)
  phone: "",                                          // TODO: телефон для звонка, например "+7 700 000 00 00" (пусто — показывается заглушка)
  instagram: "https://www.instagram.com/mamin_doctor/"
};

/* Собирает ссылку wa.me с готовым текстом сообщения */
function waLink(service) {
  const tail = "Подскажите, пожалуйста, свободное время.";
  let msg;
  if (!service || service === "приём") {
    msg = `Здравствуйте! Хочу записаться на приём в New Life Clinic. ${tail}`;
  } else {
    msg = `Здравствуйте! Хочу записаться — ${service} (New Life Clinic). ${tail}`;
  }
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

document.addEventListener("DOMContentLoaded", function () {

  /* --- год в футере --- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- WhatsApp-ссылки на всех элементах [data-wa] --- */
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", waLink(el.dataset.service));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* --- телефон (если задан в CONFIG) --- */
  if (CONFIG.phone) {
    document.querySelectorAll("[data-phone]").forEach(function (el) {
      el.textContent = CONFIG.phone;
      el.setAttribute("href", "tel:" + CONFIG.phone.replace(/[^\d+]/g, ""));
    });
  }

  /* --- Instagram --- */
  document.querySelectorAll("[data-instagram]").forEach(function (el) {
    el.setAttribute("href", CONFIG.instagram);
  });

  /* --- форма записи -> WhatsApp --- */
  const form = document.getElementById("booking-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const service = form.service.value;

      if (!name) { form.name.focus(); return; }
      if (!phone) { form.phone.focus(); return; }

      const text =
        "Здравствуйте! Хочу записаться в New Life Clinic." +
        "\nИмя: " + name +
        "\nТелефон: " + phone +
        "\nУслуга: " + service;

      window.open(
        "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text),
        "_blank",
        "noopener"
      );
    });
  }

  /* --- «прилипающая» шапка: тень при скролле --- */
  const header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- плавное появление блоков при скролле (с лёгким каскадом) --- */
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var sibs = Array.prototype.filter.call(parent.children, function (c) {
      return c.classList && c.classList.contains("reveal");
    });
    var idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx, 5) * 70 + "ms";
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* --- квиз-квалификация (3 вопроса) --- */
  const quizCard = document.getElementById("quiz-card");
  if (quizCard) {
    const steps = Array.prototype.slice.call(quizCard.querySelectorAll(".quiz-step"));
    const bar = document.getElementById("quiz-bar");
    const total = 3;
    let current = 0;
    const answers = [];

    function showStep(index) {
      steps.forEach(function (s) {
        s.classList.toggle("is-active", Number(s.dataset.step) === index);
      });
      let w = (index / total) * 100;
      if (index === 0) w = 8;
      if (index >= total) w = 100;
      if (bar) bar.style.width = w + "%";
      current = index;
    }

    function buildResult() {
      const waBtn = document.getElementById("quiz-wa");
      const msg =
        "Здравствуйте! Прошла тест на сайте New Life Clinic." +
        "\n1) Беспокоит: " + (answers[0] || "—") +
        "\n2) Последний визит к гинекологу: " + (answers[1] || "—") +
        "\n3) УЗИ и мазок за год: " + (answers[2] || "—") +
        "\nХочу записаться на комплексный осмотр (39 000 ₸).";
      if (waBtn) {
        waBtn.href = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg);
      }
    }

    quizCard.querySelectorAll(".quiz-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        answers[current] = btn.dataset.value;
        const next = current + 1;
        if (next >= total) {
          buildResult();
          showStep(total);
        } else {
          showStep(next);
        }
      });
    });

    const restart = document.getElementById("quiz-restart");
    if (restart) {
      restart.addEventListener("click", function () {
        answers.length = 0;
        showStep(0);
      });
    }

    showStep(0);
  }
});
