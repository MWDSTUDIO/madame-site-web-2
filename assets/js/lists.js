/* lists.js — renders the commissions index and journal index from /data/*.json.
   The pages themselves (one folder per commission / article) are static HTML;
   these lists are navigation, kept data-driven so Estelle can add an entry by
   editing JSON alone. All URLs are clean (no .html). */
(function () {
  "use strict";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* --- Commissions index, grouped by destination (/weddings/) --- */
  var wIndex = document.querySelector("[data-weddings-index]");
  if (wIndex) {
    fetch("/data/weddings.json").then(function (r) { return r.json(); }).then(function (data) {
      (data.hubs || []).forEach(function (hub) {
        var items = (data.commissions || []).filter(function (c) { return c.hub === hub.slug; });
        if (!items.length) return;
        var group = el("div", "jgroup rv");
        var h = el("h2", null, esc(hub.name));
        group.appendChild(h);
        items.forEach(function (c) {
          var a = el("a", "jrow");
          a.href = "/weddings/" + c.slug + "/";
          a.appendChild(el("span", "t", esc(c.title) + " <em>&mdash; " + esc(c.couple) + "</em>"));
          a.appendChild(el("span", "m", esc(c.origin && c.origin.label ? "From " + c.origin.label.replace(/\s*\(TODO[^)]*\)/i, "") : c.region)));
          group.appendChild(a);
        });
        var hubLink = el("a", "jrow");
        hubLink.href = "/weddings/" + hub.slug + "/";
        hubLink.appendChild(el("span", "t", "<em>All weddings in " + esc(hub.name) + " &rarr;</em>"));
        group.appendChild(hubLink);
        wIndex.appendChild(group);
      });
      if (window.MWD && window.MWD.reveal) window.MWD.reveal(wIndex);
      wIndex.querySelectorAll(".rv").forEach(function (n) { n.classList.add("in"); });
    });
  }

  /* --- Journal index, grouped by category (/journal/) --- */
  var jIndex = document.querySelector("[data-journal-index]");
  if (jIndex) {
    fetch("/data/journal.json").then(function (r) { return r.json(); }).then(function (data) {
      var cats = [];
      (data.articles || []).forEach(function (a) { if (cats.indexOf(a.category) < 0) cats.push(a.category); });
      cats.forEach(function (cat) {
        var group = el("div", "jgroup");
        group.appendChild(el("h2", null, esc(cat)));
        data.articles.filter(function (a) { return a.category === cat; }).forEach(function (a) {
          var row = el("a", "jrow");
          row.href = "/journal/" + a.slug + "/";
          row.appendChild(el("span", "t", esc(a.title)));
          row.appendChild(el("span", "m", esc(a.region)));
          group.appendChild(row);
        });
        jIndex.appendChild(group);
      });
    });
  }

  /* --- "More weddings in {region}" cross-links on commission pages --- */
  var more = document.querySelector("[data-more-weddings]");
  if (more) {
    var hub = more.getAttribute("data-more-weddings");
    var current = more.getAttribute("data-current");
    fetch("/data/weddings.json").then(function (r) { return r.json(); }).then(function (data) {
      (data.commissions || []).filter(function (c) { return c.hub === hub && c.slug !== current; })
        .slice(0, 3).forEach(function (c) {
          var a = el("a", "jrow");
          a.href = "/weddings/" + c.slug + "/";
          a.appendChild(el("span", "t", esc(c.title)));
          a.appendChild(el("span", "m", esc(c.couple)));
          more.appendChild(a);
        });
    });
  }
})();
