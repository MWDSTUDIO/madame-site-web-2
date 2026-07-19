/* map.js — "From our families to the world."
   An inline-SVG world map in the house style: ink line-work on ivory, hunter
   points, elegant arcs from where our families come FROM to where we PRODUCE.
   Data-driven from data/weddings.json (origin + destination per commission).
   No external libraries. A text alternative is written for screen readers. */
(function () {
  "use strict";
  var mount = document.querySelector("[data-world-map]");
  if (!mount) return;

  var W = 1000, H = 460;
  function xy(lon, lat) {
    return [((lon + 180) / 360) * W, ((78 - lat) / 156) * H]; /* trimmed poles */
  }

  /* Simplified continents — deliberately abstract, engraved-line register. */
  var LAND = [
    /* North America */
    [[-166,68],[-140,71],[-120,73],[-95,74],[-80,73],[-70,62],[-55,52],[-67,45],[-75,40],[-81,32],[-80,25],[-91,29],[-97,26],[-97,21],[-92,15],[-83,9],[-95,17],[-105,20],[-110,23],[-114,29],[-117,33],[-124,40],[-125,49],[-132,55],[-152,60],[-166,55]],
    /* South America */
    [[-77,8],[-60,10],[-52,5],[-35,-7],[-39,-15],[-48,-25],[-53,-34],[-58,-39],[-65,-45],[-68,-52],[-71,-54],[-73,-45],[-70,-30],[-70,-18],[-77,-12],[-81,-5],[-79,1]],
    /* Greenland */
    [[-45,60],[-30,68],[-22,70],[-25,76],[-38,77],[-55,75],[-58,68],[-52,63]],
    /* Ireland */
    [[-10,52],[-6,52],[-6,55],[-10,54]],
    /* Great Britain */
    [[-5,50],[1,51],[0,53],[-2,56],[-4,58],[-6,55],[-3,53]],
    /* Eurasia */
    [[-10,36],[-9,43],[-2,44],[-5,48],[1,50],[8,54],[5,58],[10,64],[18,70],[30,70],[45,68],[60,69],[75,72],[95,75],[110,74],[130,72],[150,70],[165,69],[178,66],[170,60],[156,51],[142,54],[140,43],[130,42],[127,35],[122,30],[121,23],[108,12],[104,2],[100,8],[98,15],[93,20],[88,22],[80,15],[77,8],[72,20],[66,25],[57,25],[59,22],[55,17],[52,13],[43,12],[39,20],[34,28],[36,36],[27,37],[26,40],[23,36],[19,40],[16,38],[15,40],[12,44],[8,44],[3,43],[0,40],[-2,37],[-6,36]],
    /* Africa */
    [[-6,35],[10,37],[20,32],[32,31],[34,28],[43,11],[51,10],[40,-2],[40,-15],[35,-24],[32,-29],[25,-34],[18,-34],[12,-18],[9,-1],[9,4],[-4,5],[-8,4],[-13,9],[-17,15],[-16,21],[-13,27]],
    /* Australia */
    [[114,-22],[122,-17],[131,-12],[142,-11],[146,-19],[153,-27],[150,-37],[144,-38],[131,-32],[124,-33],[115,-34],[113,-26]]
  ];

  function poly(points) {
    return "M" + points.map(function (p) { return xy(p[0], p[1]).map(r1).join(" "); }).join("L") + "Z";
  }
  function r1(n) { return Math.round(n * 10) / 10; }

  fetch("/data/weddings.json").then(function (r) { return r.json(); }).then(function (data) {
    var routes = [], seen = {}, origins = {}, dests = {};
    (data.commissions || []).forEach(function (c) {
      if (!c.origin || !c.destination) return;
      var key = c.origin.city + "→" + c.destination.city;
      origins[c.origin.city] = c.origin;
      dests[c.destination.city] = c.destination;
      if (!seen[key]) { seen[key] = true; routes.push(c); }
    });

    var s = '<svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="mwdmaptitle">';
    s += '<title id="mwdmaptitle">Map of commissions: arcs from our families’ home cities to the places we produce</title>';
    s += '<g fill="none" stroke="rgba(38,32,26,.30)" stroke-width=".7" stroke-linejoin="round">';
    LAND.forEach(function (p) { s += '<path d="' + poly(p) + '"/>'; });
    s += "</g>";

    /* Arcs */
    s += '<g fill="none" stroke="#3D4A3A" stroke-width=".9" opacity=".55">';
    routes.forEach(function (c) {
      var a = xy(c.origin.lon, c.origin.lat), b = xy(c.destination.lon, c.destination.lat);
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      s += '<path d="M' + r1(a[0]) + " " + r1(a[1]) + " Q" + r1(mx) + " " + r1(my - dist * 0.22) + " " + r1(b[0]) + " " + r1(b[1]) + '"/>';
    });
    s += "</g>";

    /* Origin points: open circles. Destination points: hunter, filled. */
    s += "<g>";
    Object.keys(origins).forEach(function (k) {
      var p = xy(origins[k].lon, origins[k].lat);
      s += '<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="3.2" fill="#F7F4EE" stroke="rgba(38,32,26,.55)" stroke-width="1"/>';
    });
    Object.keys(dests).forEach(function (k) {
      var p = xy(dests[k].lon, dests[k].lat);
      s += '<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="3.6" fill="#3D4A3A"/>';
    });
    s += "</g></svg>";
    mount.innerHTML = s;

    /* Text alternative for assistive technology and non-visual crawlers. */
    var ul = document.createElement("ul");
    ul.className = "sr";
    routes.forEach(function (c) {
      var li = document.createElement("li");
      li.textContent = "From " + c.origin.label + " to " + c.destination.label + " — " + c.couple + ".";
      ul.appendChild(li);
    });
    mount.appendChild(ul);
  }).catch(function () {
    mount.innerHTML = '<p class="maptext">From New York, Texas, Minnesota, Philadelphia and Dublin to Tuscany, Provence, Paris, Burgundy and Portugal — the routes our commissions travel.</p>';
  });
})();
