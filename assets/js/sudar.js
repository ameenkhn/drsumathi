/* Sudar Hospital — site interactions */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* ---- Preloader ---- */
    var pre = document.querySelector(".sd-preload");
    window.addEventListener("load", function () {
      if (pre) setTimeout(function () { pre.classList.add("is-done"); }, 250);
    });
    // safety fallback
    setTimeout(function () { if (pre) pre.classList.add("is-done"); }, 2500);

    /* ---- Mobile drawer ---- */
    var burger = document.querySelector(".sd-burger");
    var drawer = document.querySelector(".sd-drawer");
    var overlay = document.querySelector(".sd-overlay");
    var closeBtn = document.querySelector(".sd-drawer__close");
    function openDrawer() { if (drawer) drawer.classList.add("is-open"); if (overlay) overlay.classList.add("is-open"); document.body.style.overflow = "hidden"; }
    function closeDrawer() { if (drawer) drawer.classList.remove("is-open"); if (overlay) overlay.classList.remove("is-open"); document.body.style.overflow = ""; }
    if (burger) burger.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    if (drawer) drawer.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", closeDrawer); });

    /* ---- Sticky header shadow ---- */
    var header = document.querySelector(".sd-header");
    function onScroll() {
      if (header) header.classList.toggle("is-stuck", window.scrollY > 12);
      var top = document.querySelector(".sd-top");
      if (top) top.classList.toggle("is-show", window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- Scroll to top ---- */
    var topBtn = document.querySelector(".sd-top");
    if (topBtn) topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    /* ---- FAQ accordion ---- */
    document.querySelectorAll(".sd-faq__item").forEach(function (item) {
      var q = item.querySelector(".sd-faq__q");
      var a = item.querySelector(".sd-faq__a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        document.querySelectorAll(".sd-faq__item").forEach(function (it) {
          it.classList.remove("is-open");
          var aa = it.querySelector(".sd-faq__a");
          if (aa) aa.style.maxHeight = null;
        });
        if (!open) { item.classList.add("is-open"); a.style.maxHeight = a.scrollHeight + "px"; }
      });
    });

    /* ---- Counter animation ---- */
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = parseFloat(el.getAttribute("data-count")), dur = 1600, start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var val = Math.floor(p * target);
            el.firstChild ? el.childNodes[0].nodeValue = val.toLocaleString("en-IN") : el.textContent = val;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { io.observe(c); });
    }

    /* ---- Contact form (no backend) ---- */
    var form = document.querySelector("form[data-sd-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = (form.querySelector("[name=name]") || {}).value || "";
        var phone = (form.querySelector("[name=phone]") || {}).value || "";
        var service = (form.querySelector("[name=service]") || {}).value || "";
        var msg = (form.querySelector("[name=message]") || {}).value || "";
        var text = "Hello Sudar Hospital, I would like to book an appointment.%0A%0AName: " +
          encodeURIComponent(name) + "%0APhone: " + encodeURIComponent(phone) +
          "%0ADepartment: " + encodeURIComponent(service) + "%0AMessage: " + encodeURIComponent(msg);
        window.open("https://api.whatsapp.com/send/?phone=919360313970&text=" + text, "_blank");
      });
    }

    /* ---- AOS ---- */
    if (window.AOS) window.AOS.init({ duration: 700, once: true, offset: 80, disable: window.innerWidth < 640 });
  });
})();
