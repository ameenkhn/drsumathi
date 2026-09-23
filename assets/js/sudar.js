/* Sudar Hospital — site interactions */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

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

    /* ---- Video tour ----
       Poster + custom play button until the visitor opts in; then the native
       controls take over. Nothing streams before that (preload="metadata"). */
    document.querySelectorAll(".sd-video").forEach(function (fig) {
      var video = fig.querySelector("video");
      var play = fig.querySelector("[data-video-play]");
      if (!video || !play) return;
      function started() { fig.classList.add("is-playing"); video.controls = true; }
      play.addEventListener("click", function () {
        started();
        var p = video.play();
        if (p && p.catch) p.catch(function () {});   // blocked autoplay: controls are showing anyway
      });
      video.addEventListener("play", started);         // e.g. keyboard / native controls
    });

    /* ---- Scroll reveal ----
       Stands in for the AOS plugin: same data-aos / data-aos-delay attributes,
       same motion. Nothing is hidden until this runs, and only on screens
       ≥640px with motion allowed — phones and no-JS visitors get the content
       immediately. Whatever is already on screen is left as-is so the first
       view is never blanked out and faded back in. */
    var reveal = document.querySelectorAll("[data-aos]");
    var motionOK = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (reveal.length && "IntersectionObserver" in window && window.innerWidth >= 640 && motionOK) {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, delay = parseInt(el.getAttribute("data-aos-delay"), 10) || 0;
          ro.unobserve(el);
          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-anim", "is-in");
          /* hand the element back to its own hover transitions once it has landed */
          setTimeout(function () { el.classList.remove("is-anim"); el.style.transitionDelay = ""; }, delay + 750);
        });
      }, { rootMargin: "0px 0px -80px 0px" });
      var vh = window.innerHeight, pending = [];
      reveal.forEach(function (el) {
        if (el.getBoundingClientRect().top < vh) el.classList.add("is-in");
        else { pending.push(el); ro.observe(el); }
      });
      document.documentElement.classList.add("sd-reveal");
      /* the observer only reports crossings — a jump (End key, #anchor link, fast
         fling) can carry an element from below the fold to above it without one,
         leaving it invisible. Sweep those up as the page scrolls. */
      var sweepQueued = false;
      window.addEventListener("scroll", function () {
        if (sweepQueued || !pending.length) return;
        sweepQueued = true;
        requestAnimationFrame(function () {
          sweepQueued = false;
          pending = pending.filter(function (el) {
            if (el.classList.contains("is-in")) return false;
            if (el.getBoundingClientRect().bottom < 0) { el.classList.add("is-in"); ro.unobserve(el); return false; }
            return true;
          });
        });
      }, { passive: true });
    }

    /* ---- Gallery lightbox ----
       Each .sd-gallery is its own set, so prev/next stay within the section
       that was clicked. Modified clicks (new tab etc.) still follow the link. */
    var galleries = document.querySelectorAll(".sd-gallery");
    if (galleries.length) {
      var icon = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
      var lb = document.createElement("div");
      lb.className = "sd-lb";
      lb.hidden = true;
      lb.setAttribute("role", "dialog");
      lb.setAttribute("aria-modal", "true");
      lb.setAttribute("aria-label", "Photo viewer");
      lb.innerHTML =
        '<figure class="sd-lb__fig"><img class="sd-lb__img" alt=""><figcaption class="sd-lb__cap"></figcaption></figure>' +
        '<div class="sd-lb__count" aria-live="polite"></div>' +
        '<button type="button" class="sd-lb__btn sd-lb__close" aria-label="Close">' + icon("M6 6l12 12M18 6L6 18") + "</button>" +
        '<button type="button" class="sd-lb__btn sd-lb__prev" aria-label="Previous photo">' + icon("M15 5l-7 7 7 7") + "</button>" +
        '<button type="button" class="sd-lb__btn sd-lb__next" aria-label="Next photo">' + icon("M9 5l7 7-7 7") + "</button>";
      document.body.appendChild(lb);
      var lbImg = lb.querySelector(".sd-lb__img"), lbCap = lb.querySelector(".sd-lb__cap"), lbCount = lb.querySelector(".sd-lb__count");
      var set = [], idx = 0, opener = null, closeTimer;

      function show(i) {
        idx = (i + set.length) % set.length;
        var a = set[idx], img = a.querySelector("img"), cap = a.querySelector(".sd-gallery__cap");
        lbImg.src = a.getAttribute("href");
        lbImg.alt = img ? img.alt : "";
        lbCap.textContent = cap ? cap.textContent : "";
        lbCount.textContent = (idx + 1) + " / " + set.length;
        [set[(idx + 1) % set.length], set[(idx - 1 + set.length) % set.length]].forEach(function (n) {
          new Image().src = n.getAttribute("href");   // warm the neighbours so paging is instant
        });
      }
      function openLb(links, i, trigger) {
        clearTimeout(closeTimer);
        set = links; opener = trigger;
        lb.classList.toggle("is-single", set.length < 2);
        show(i);
        lb.hidden = false;
        void lb.offsetWidth;   // commit the display change so the fade runs
        lb.classList.add("is-open");
        document.body.style.overflow = "hidden";
        lb.querySelector(".sd-lb__close").focus();
      }
      function closeLb() {
        if (lb.hidden) return;
        lb.classList.remove("is-open");
        document.body.style.overflow = "";
        closeTimer = setTimeout(function () { lb.hidden = true; lbImg.removeAttribute("src"); }, 250);
        if (opener) opener.focus();
      }

      galleries.forEach(function (g) {
        var links = Array.prototype.slice.call(g.querySelectorAll("a[href]"));
        links.forEach(function (a, i) {
          a.addEventListener("click", function (e) {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            openLb(links, i, a);
          });
        });
      });
      lb.querySelector(".sd-lb__close").addEventListener("click", closeLb);
      lb.querySelector(".sd-lb__prev").addEventListener("click", function () { show(idx - 1); });
      lb.querySelector(".sd-lb__next").addEventListener("click", function () { show(idx + 1); });
      lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("sd-lb__fig")) closeLb(); });
      document.addEventListener("keydown", function (e) {
        if (lb.hidden) return;
        if (e.key === "Escape") closeLb();
        else if (e.key === "ArrowLeft") show(idx - 1);
        else if (e.key === "ArrowRight") show(idx + 1);
        else if (e.key === "Tab") {   // keep focus inside the dialog
          var btns = Array.prototype.slice.call(lb.querySelectorAll("button")).filter(function (b) { return b.offsetParent; });
          var first = btns[0], last = btns[btns.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      /* swipe left / right on touch screens */
      var x0 = null;
      lb.addEventListener("touchstart", function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
      lb.addEventListener("touchend", function (e) {
        if (x0 === null || set.length < 2) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) show(idx + (dx < 0 ? 1 : -1));
        x0 = null;
      });
    }
  });
})();
