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
    document.querySelectorAll("figure.media[data-media]").forEach(function (fig) {
      var file = fig.getAttribute("data-media");
      var entry = lookup(media, file);
      var alt = entry ? entry.alt : (fig.getAttribute("data-alt") || "");
      var caption = entry && entry.caption ? entry.caption : "";
      var img = new Image();
      img.onload = function () {
        img.alt = alt;
        img.loading = "lazy";
        img.decoding = "async";
        fig.insertBefore(img, fig.firstChild);
      };
      img.onerror = function () {
        placeholder(fig, caption || alt || "Madame Wedding Design");
      };
      img.src = ROOT + "/" + file;
      if (caption && !fig.querySelector("figcaption")) {
        var fc = document.createElement("figcaption");
        fc.textContent = caption;
        fig.appendChild(fc);
      }
    });
  }

  if (document.querySelector("figure.media[data-media]")) {
    fetch(ROOT + "/data/media.json")
      .then(function (r) { return r.json(); })
      .then(function (d) { hydrate(d.media || []); })
      .catch(function () {
        document.querySelectorAll("figure.media[data-media]").forEach(function (fig) {
          placeholder(fig, fig.getAttribute("data-alt") || "Madame Wedding Design");
        });
      });
  }
})();
