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
  function noTodo(s) { return s && !/TODO/i.test(s) ? s : null; }

  /* --- Commissions index, grouped by destination (/weddings/) ---
     The page ships with this list statically baked (crawlable); when the JSON
     changes, this re-render keeps the page current without editing HTML. */
  var wIndex = document.querySelector("[data-weddings-index]");
  if (wIndex) {
    fetch("/data/weddings.json").then(function (r) { return r.json(); }).then(function (data) {
      wIndex.textContent = "";
      (data.hubs || []).forEach(function (hub) {
        var items = (data.commissions || []).filter(function (c) { return c.hub === hub.slug; });
        if (!items.length) return;
        var group = el("div", "jgroup");
        group.appendChild(el("h2", null, esc(hub.name)));
        /* Deux colonnes qui se remplissent en alternance : c'est ce décalage
           qui donne la respiration d'une planche de magazine. Chaque figure
           porte le format réel de sa photographie, donc rien ne saute pendant
           le chargement et rien n'est recadré. */
        var cols = el("div", "wcols");
        var colA = el("div", "wcol"), colB = el("div", "wcol");
        cols.appendChild(colA); cols.appendChild(colB);
        items.forEach(function (c, i) {
          var a = el("a", "wcard");
          a.href = "/weddings/" + c.slug + "/";
          if (c.cover) {
            var fig = el("figure", "media");
            fig.setAttribute("data-media", c.cover);
            fig.setAttribute("data-nocaption", "");
            if (c.coverRatio) fig.style.aspectRatio = c.coverRatio;
            a.appendChild(fig);
          }
          var cap = el("span", "cap");
          cap.appendChild(el("span", "r", esc(noTodo(c.region) || hub.name)));
          cap.appendChild(el("span", "n", esc(noTodo(c.couple) || c.title)));
          cap.appendChild(el("span", "t", esc(c.title)));
          a.appendChild(cap);
          (i % 2 === 0 ? colA : colB).appendChild(a);
        });
        group.appendChild(cols);
        var more = el("a", "jmore", "All weddings in " + esc(hub.name) + " &rarr;");
        more.href = "/weddings/" + hub.slug + "/";
        group.appendChild(more);
        wIndex.appendChild(group);
      });
      /* Les cartes viennent d'être créées : media.js leur donne leurs images,
         leurs alts et le chargement paresseux, comme partout ailleurs. */
      if (window.MWDMedia) window.MWDMedia.hydrate();
    }).catch(function () { /* static content already in place */ });
  }

  /* --- Journal index, grouped by category (/journal/) — same pattern --- */
  var jIndex = document.querySelector("[data-journal-index]");
  if (jIndex) {
    fetch("/data/journal.json").then(function (r) { return r.json(); }).then(function (data) {
      jIndex.textContent = "";
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
    }).catch(function () { /* static content already in place */ });
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
