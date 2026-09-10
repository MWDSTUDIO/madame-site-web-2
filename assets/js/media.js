/* media.js — one source of truth for imagery.
   Every <figure class="media" data-media="assets/img/…"> is resolved against
   data/media.json: if the file exists it renders an <img> whose alt/caption
   come from media.json; if it is missing (assets pending), a tasteful neutral
   placeholder carries the caption instead. Baked-in alts in static HTML must
   match media.json — /admin/media/ audits the register. */
(function () {
  "use strict";
  var ROOT = document.documentElement.getAttribute("data-root") || "";

  function lookup(list, file) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].file === file) return list[i];
    }
    return null;
  }

  function placeholder(fig, label, tone) {
    var ph = document.createElement("div");
    ph.className = "ph ph-" + (tone || ((fig.dataset.tone) || (1 + (label.length % 4))));
    ph.setAttribute("data-label", label);
    ph.setAttribute("role", "img");
    ph.setAttribute("aria-label", label);
    fig.appendChild(ph);
  }

  function hydrate(media) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("figure.media[data-media]").forEach(function (fig) {
      if (fig.dataset.hydrated) return;
      fig.dataset.hydrated = "1";
      var file = fig.getAttribute("data-media");
      var entry = lookup(media, file);
      var alt = entry ? entry.alt : (fig.getAttribute("data-alt") || "");
      var caption = entry && entry.caption ? entry.caption : "";

      /* Optional film: <figure data-video="assets/video/…"> plays a muted loop
         when the file exists (and motion is allowed); otherwise falls back to
         the photo, then to the placeholder. */
      var videoSrc = fig.getAttribute("data-video");
      if (videoSrc && !reduced) {
        var v = document.createElement("video");
        v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
        /* Safari needs the attributes, not just the properties, for silent autoplay */
        v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("autoplay", ""); v.setAttribute("loop", "");
        v.preload = "auto";
        v.setAttribute("aria-label", alt);
        /* Some desktop configurations (Safari "Never Auto-Play", low-power modes)
           refuse even muted autoplay: retry at the visitor's first gesture. */
        var tryPlay = function () {
          v.muted = true;
          var p = v.play();
          if (p && p.catch) p.catch(function () {
            ["click", "touchstart", "scroll", "keydown"].forEach(function (evt) {
              window.addEventListener(evt, function retry() {
                window.removeEventListener(evt, retry);
                if (v.paused) { var q = v.play(); if (q && q.catch) q.catch(function () {}); }
              }, { once: true, passive: true });
            });
          });
        };
        v.addEventListener("canplay", function () {
          if (!v.parentNode) fig.insertBefore(v, fig.firstChild);
          tryPlay();
        }, { once: true });
        /* Element-level failure only (network/decode of the chosen source).
           NOT capture:true — a capture listener also caught the <source>
           fallback chain and killed the video on browsers without WebM. */
        v.addEventListener("error", function () { v.remove(); });
        /* mp4 first (universal: Safari/Chrome/Edge/mobile), webm as open-codec
           fallback — the photo underneath covers browsers that play neither. */
        var mp4 = document.createElement("source");
        mp4.src = ROOT + "/" + videoSrc;
        mp4.type = "video/mp4";
        var webm = document.createElement("source");
        webm.src = ROOT + "/" + videoSrc.replace(/\.mp4$/, ".webm");
        webm.type = "video/webm";
        /* If the LAST source errors, no format worked: remove, the photo stays. */
        webm.addEventListener("error", function () { v.remove(); });
        v.appendChild(mp4); v.appendChild(webm);
        v.load();
      }

      /* L'<img> entre dans le DOM AVANT que la source soit posée : loading="lazy"
         n'a d'effet que s'il est présent au moment où le navigateur découvre
         src. Posé après coup (ancien code), il ne servait à rien et les vingt-six
         images d'une galerie se téléchargeaient toutes d'un coup. */
      var img = document.createElement("img");
      img.alt = alt;
      /* Les premières images d'une galerie se chargent tout de suite : le haut
         du bloc est rempli avant même que la visiteuse y arrive. Les suivantes
         attendent d'approcher de l'écran. */
      var eager = fig.getBoundingClientRect().top < window.innerHeight * 1.5;
      img.loading = eager ? "eager" : "lazy";
      if (eager && "fetchPriority" in img) img.fetchPriority = "high";
      img.decoding = "async";
      img.addEventListener("error", function () {
        img.remove();
        placeholder(fig, caption || alt || "Madame Wedding Design");
      });
      fig.insertBefore(img, fig.firstChild);
      img.src = ROOT + "/" + file;
      if (caption && !fig.hasAttribute("data-nocaption") && !fig.querySelector("figcaption")) {
        var fc = document.createElement("figcaption");
        fc.textContent = caption;
        fig.appendChild(fc);
      }
    });
  }

  var cache = null;
  /* Les listes construites après coup (lists.js) appellent ceci pour hydrater
     leurs figures avec les mêmes alts et légendes que le reste du site. */
  window.MWDMedia = {
    hydrate: function () { if (cache) hydrate(cache); }
  };

  if (document.querySelector("figure.media[data-media]")) {
    fetch(ROOT + "/data/media.json")
      .then(function (r) { return r.json(); })
      .then(function (d) { cache = d.media || []; hydrate(cache); })
      .catch(function () {
        document.querySelectorAll("figure.media[data-media]").forEach(function (fig) {
          placeholder(fig, fig.getAttribute("data-alt") || "Madame Wedding Design");
        });
      });
  }
})();
