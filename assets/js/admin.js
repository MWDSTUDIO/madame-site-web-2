/* admin.js — /admin/media/ audit.
   Reads data/media.json (the single source of truth for imagery) and shows
   every image beside its alt text, flagging entries that are missing, short,
   or non-descriptive. Nothing here is public: /admin/ is blocked in
   robots.txt and excluded from sitemap.xml. */
(function () {
  "use strict";
  var tbody = document.querySelector("[data-media-audit]");
  if (!tbody) return;

  var GENERIC = /^(image|img|photo|picture|untitled|dsc[-_ ]?\d*|placeholder)\b/i;

  function flags(m) {
    var out = [];
    var alt = (m.alt || "").trim();
    if (!alt) out.push(["Missing alt", false]);
    else {
      if (alt.length < 30) out.push(["Short alt (<30 chars)", false]);
      if (GENERIC.test(alt)) out.push(["Non-descriptive alt", false]);
      var base = (m.file || "").split("/").pop().replace(/\.[a-z]+$/i, "");
      if (alt.toLowerCase() === base.toLowerCase()) out.push(["Alt = filename", false]);
    }
    if (!(m.caption || "").trim()) out.push(["No caption", false]);
    if (!m.keywords || !m.keywords.length) out.push(["No keywords", false]);
    if (!out.length) out.push(["OK", true]);
    return out;
  }

  fetch("/data/media.json").then(function (r) { return r.json(); }).then(function (data) {
    var media = data.media || [];
    var counts = { total: media.length, flagged: 0, missingFile: 0 };
    media.forEach(function (m) {
      var tr = document.createElement("tr");

      var tdImg = document.createElement("td");
      var img = document.createElement("img");
      img.className = "thumb";
      img.alt = m.alt || "";
      img.onerror = function () {
        var d = document.createElement("div");
        d.className = "thumb ph";
        d.setAttribute("data-label", "file missing");
        tdImg.replaceChild(d, img);
        counts.missingFile++;
        summary(counts);
      };
      img.src = "/" + m.file;
      tdImg.appendChild(img);

      var tdFile = document.createElement("td");
      tdFile.innerHTML = "<code>" + m.file + "</code><br><a href='" + m.page + "'>" + m.page + "</a>";

      var tdAlt = document.createElement("td");
      tdAlt.textContent = m.alt || "—";

      var tdCap = document.createElement("td");
      tdCap.textContent = m.caption || "—";

      var tdFlags = document.createElement("td");
      var fl = flags(m);
      var bad = fl.some(function (f) { return !f[1]; });
      if (bad) counts.flagged++;
      fl.forEach(function (f) {
        var s = document.createElement("span");
        s.className = "flag" + (f[1] ? " ok" : "");
        s.textContent = f[0];
        tdFlags.appendChild(s);
      });

      [tdImg, tdFile, tdAlt, tdCap, tdFlags].forEach(function (td) { tr.appendChild(td); });
      tbody.appendChild(tr);
    });
    summary(counts);
  });

  function summary(c) {
    var el = document.querySelector("[data-media-summary]");
    if (el) el.textContent = c.total + " images registered · " + c.flagged + " flagged for alt/caption review · " + c.missingFile + " files not yet on disk";
  }
})();
