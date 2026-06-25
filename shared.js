/* =========================================================
   New Life Clinic — общий скрипт для всех версий (A/B-тест)
   Дизайн определяется папкой (/warm, /clinical, /bright),
   цена — параметром ссылки ?p=39 или ?p=49.
   ========================================================= */

/* --- НАСТРОЙКИ: замените на реальные данные клиники --- */
const CONFIG = {
  whatsappNumber: "77000000000",                      // TODO: номер WhatsApp в формате 77XXXXXXXXX
  phone: "",                                          // TODO: телефон, напр. "+7 700 000 00 00"
  instagram: "https://www.instagram.com/mamin_doctor/"
};

/* --- ценовые варианты --- */
const PRICES = {
  "39": { newP: "39 000", oldP: "65 000", save: "26 000", discount: 40 },
  "49": { newP: "49 000", oldP: "79 000", save: "30 000", discount: 38 }
};

function getParam(name) { return new URLSearchParams(location.search).get(name); }

function getDesign() {
  var p = location.pathname.toLowerCase();
  if (p.indexOf("clinical") > -1) return "clinical";
  if (p.indexOf("bright") > -1) return "bright";
  if (p.indexOf("classic") > -1) return "classic";
  return "warm";
}

var PRICE_KEY = (getParam("p") === "49") ? "49" : "39";
var PRICE = PRICES[PRICE_KEY];
var DESIGN = getDesign();
var VARIANT = DESIGN.toUpperCase() + "-" + PRICE_KEY;   // напр. WARM-39 — код версии в заявке

function waLink(service) {
  var tail = "Подскажите, пожалуйста, свободное время.";
  var msg;
  if (!service || service === "приём") {
    msg = "Здравствуйте! Хочу записаться на приём в New Life Clinic. " + tail;
  } else if (service === "осмотр") {
    msg = "Здравствуйте! Хочу записаться на комплексный осмотр за " + PRICE.newP + " ₸ в New Life Clinic. " + tail;
  } else {
    msg = "Здравствуйте! Хочу записаться — " + service + " (New Life Clinic). " + tail;
  }
  msg += " (код: " + VARIANT + ")";
  return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg);
}

document.addEventListener("DOMContentLoaded", function () {

  /* --- подстановка цены во все хуки --- */
  document.querySelectorAll("[data-price-new]").forEach(function (e) { e.textContent = PRICE.newP; });
  document.querySelectorAll("[data-price-old]").forEach(function (e) { e.textContent = PRICE.oldP; });
  document.querySelectorAll("[data-price-save]").forEach(function (e) { e.textContent = PRICE.save; });
  document.querySelectorAll("[data-discount]").forEach(function (e) { e.textContent = "Акция · −" + PRICE.discount + "%"; });

  /* --- год в футере --- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- WhatsApp-ссылки [data-wa] --- */
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.setAttribute("href", waLink(el.dataset.service));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* --- телефон --- */
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
  var form = document.getElementById("booking-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      if (!name) { form.name.focus(); return; }
      if (!phone) { form.phone.focus(); return; }
      var text =
        "Здравствуйте! Хочу записаться в New Life Clinic." +
        "\nИмя: " + name +
        "\nТелефон: " + phone +
        "\nУслуга: " + service +
        "\nЦена: " + PRICE.newP + " ₸" +
        "\n(код: " + VARIANT + ")";
      window.open("https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  /* --- «прилипающая» шапка: тень при скролле --- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 12) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- появление блоков при скролле (с лёгким каскадом) --- */
  var reveals = document.querySelectorAll(".reveal");
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
    var io = new IntersectionObserver(function (entries) {
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
  var quizCard = document.getElementById("quiz-card");
  if (quizCard) {
    var steps = Array.prototype.slice.call(quizCard.querySelectorAll(".quiz-step"));
    var bar = document.getElementById("quiz-bar");
    var total = 3;
    var current = 0;
    var answers = [];

    var showStep = function (index) {
      steps.forEach(function (s) { s.classList.toggle("is-active", Number(s.dataset.step) === index); });
      var w = (index / total) * 100;
      if (index === 0) w = 8;
      if (index >= total) w = 100;
      if (bar) bar.style.width = w + "%";
      current = index;
    };

    var buildResult = function () {
      var waBtn = document.getElementById("quiz-wa");
      var msg =
        "Здравствуйте! Прошла тест на сайте New Life Clinic." +
        "\n1) Беспокоит: " + (answers[0] || "—") +
        "\n2) Последний визит к гинекологу: " + (answers[1] || "—") +
        "\n3) УЗИ и мазок за год: " + (answers[2] || "—") +
        "\nХочу записаться на комплексный осмотр (" + PRICE.newP + " ₸)." +
        "\n(код: " + VARIANT + ")";
      if (waBtn) waBtn.href = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg);
    };

    quizCard.querySelectorAll(".quiz-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        answers[current] = btn.dataset.value;
        var next = current + 1;
        if (next >= total) { buildResult(); showStep(total); }
        else { showStep(next); }
      });
    });

    var restart = document.getElementById("quiz-restart");
    if (restart) restart.addEventListener("click", function () { answers.length = 0; showStep(0); });

    showStep(0);
  }
});
