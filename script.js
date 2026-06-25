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

  /* --- плавное появление блоков при скролле --- */
  const reveals = document.querySelectorAll(".reveal");
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
});
