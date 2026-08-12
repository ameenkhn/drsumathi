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
    function openDrawer() {
      if (drawer) drawer.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      if (burger) burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function closeDrawer() {
      if (drawer) drawer.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.addEventListener("click", openDrawer); }
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    if (drawer) drawer.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
    /* rotating to landscape can put us past the drawer breakpoint while it is
       still open — that would leave the body scroll-locked with no way out */
    window.addEventListener("resize", function () { if (window.innerWidth > 1190) closeDrawer(); });

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

    /* ---- FAQ accordion ----
       Items open independently: the questions sit in two side-by-side columns,
       so closing the other column's answer on every click would be jarring. */
    var faqItems = document.querySelectorAll(".sd-faq__item");
    faqItems.forEach(function (item) {
      var q = item.querySelector(".sd-faq__q");
      var a = item.querySelector(".sd-faq__a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        if (item.classList.contains("is-open")) {
          item.classList.remove("is-open");
          a.style.maxHeight = null;
        } else {
          item.classList.add("is-open");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });

    /* Answers are bilingual, so their height depends entirely on the column
       width — measure rather than assume. This also covers items that ship
       open in the markup, which a hard-coded max-height used to clip on narrow
       screens. */
    function syncOpenFaq() {
      faqItems.forEach(function (item) {
        if (!item.classList.contains("is-open")) return;
        var a = item.querySelector(".sd-faq__a");
        if (a) a.style.maxHeight = a.scrollHeight + "px";
      });
    }
    if (faqItems.length) {
      syncOpenFaq();
      window.addEventListener("load", syncOpenFaq);
      var faqResize;
      window.addEventListener("resize", function () {
        clearTimeout(faqResize);
        faqResize = setTimeout(syncOpenFaq, 150);
      });
    }

    /* ---- Counter animation ---- */
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = parseFloat(el.getAttribute("data-count")), dur = 1600, start = null;
          /* years must not pick up a thousands separator — "2,007 Serving Since" */
          var plain = el.getAttribute("data-count-format") === "plain";
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var val = Math.floor(p * target);
            var out = plain ? String(val) : val.toLocaleString("en-IN");
            el.firstChild ? el.childNodes[0].nodeValue = out : el.textContent = out;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { io.observe(c); });
    }

    /* ---- AOS ---- */
    if (window.AOS) window.AOS.init({ duration: 700, once: true, offset: 80, disable: window.innerWidth < 640 });
  });
})();
