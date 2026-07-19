/* main.js — dignified motion, the private-circle threshold, and the film's sound. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Soft reveals (respecting prefers-reduced-motion) --- */
  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
  }

  /* --- Current page in the masthead nav --- */
  var path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".masthead nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href !== "/" && path.indexOf(href) === 0) a.setAttribute("aria-current", "page");
    else if (href === "/" && path === "/") a.setAttribute("aria-current", "page");
  });

  /* --- The threshold (home only) --- */
  var intro = document.getElementById("intro");
  var film = document.getElementById("mwdfilm");
  var hero = document.getElementById("filmhero");
  var toggle = document.getElementById("soundtoggle");
  if (!intro) return;

  var SOUND_ON = "◑", SOUND_OFF = "◐";

  function setToggle() {
    if (!toggle) return;
    var muted = !film || film.muted;
    toggle.textContent = muted ? SOUND_OFF : SOUND_ON;
    toggle.setAttribute("aria-pressed", String(!muted));
    toggle.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
  }

  document.getElementById("enterbtn").addEventListener("click", function () {
    document.body.classList.add("entered");
    intro.setAttribute("aria-hidden", "true");
    if (film && !reduced) {
      /* The click is the browser gesture: the film may now play with sound. */
      film.muted = false;
      film.volume = 1;
      var p = film.play();
      if (p && p.catch) p.catch(function () { film.muted = true; setToggle(); });
    }
    setToggle();
    /* Return focus to the document for keyboard users. */
    var mast = document.querySelector(".masthead .brand");
    if (mast) mast.setAttribute("tabindex", "-1");
  });

  if (toggle && film) {
    toggle.addEventListener("click", function () {
      film.muted = !film.muted;
      if (!film.muted && film.paused && !reduced) film.play();
      setToggle();
    });
  }

  /* Auto-mute when the visitor scrolls past the hero (<25% visible). */
  if (hero && film && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!document.body.classList.contains("entered")) return;
        if (e.intersectionRatio < 0.25 && !film.muted) { film.muted = true; setToggle(); }
      });
    }, { threshold: [0, 0.25, 1] }).observe(hero);
  }

  /* Reduced motion, or a missing film file: rest on the poster. */
  if (film) {
    if (reduced) { film.removeAttribute("autoplay"); film.pause(); }
    film.addEventListener("error", function () { film.style.display = "none"; }, true);
  }
  setToggle();
})();
