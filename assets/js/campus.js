/* Campus front page: an isometric map of the site drawn in SVG, plus the "Watch a PR ship" tour. */
(function () {
  "use strict";

  var data = JSON.parse(document.getElementById("campus-data").textContent);
  var svg = document.getElementById("campus");
  var NS = "http://www.w3.org/2000/svg";
  var U = 26;
  var C = Math.cos(Math.PI / 6);
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Grid (x, y, height z) to screen. ROT turns the whole campus around its centre (see "Turning the campus").
  var ROT = 0, RC = 12;
  function P(x, y, z) {
    var gx = x, gy = y;
    if (ROT) {
      var c = Math.cos(ROT), s = Math.sin(ROT), dx = x - RC, dy = y - RC;
      gx = RC + dx * c - dy * s; gy = RC + dx * s + dy * c;
    }
    var r = [(gx - gy) * C * U, (gx + gy) * 0.5 * U - (z || 0) * U];
    r.g = [x, y, z || 0];
    return r;
  }
  function Pg(q) { return P(q[0], q[1], q[2]); }
  // Everything drawn from grid points registers a redraw, so turning the campus redraws it in place.
  var redraws = [];
  function live(fn) { redraws.push(fn); fn(); }
  function pts(list) { return list.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function poly(g, list, cls) {
    var e = el("polygon", { "class": cls }, g);
    var grid = list.map(function (p) { return p.g; });
    e._grid = grid;
    live(function () { e.setAttribute("points", pts(grid.map(Pg))); });
    return e;
  }
  // A vertical face with outward normal n = [nx, ny] on the grid. It is drawn only while it faces the viewer,
  // and wall faces take the left or right shade from which way they point on screen.
  function face(g, list, n, cls) {
    var e = el("polygon", {}, g);
    var grid = list.map(function (p) { return p.g; });
    e._grid = grid;
    live(function () {
      var c = Math.cos(ROT), s = Math.sin(ROT);
      var nx = n[0] * c - n[1] * s, ny = n[0] * s + n[1] * c;
      if (nx + ny <= 0.0001) { e.setAttribute("display", "none"); return; }
      e.removeAttribute("display");
      e.setAttribute("class", cls || (nx - ny < 0 ? "f-l" : "f-r"));
      e.setAttribute("points", pts(grid.map(Pg)));
    });
    return e;
  }
  function seg(g, a, b, cls) {
    var e = el("line", { "class": cls }, g);
    live(function () {
      var p = Pg(a), q = Pg(b);
      e.setAttribute("x1", p[0].toFixed(1)); e.setAttribute("y1", p[1].toFixed(1));
      e.setAttribute("x2", q[0].toFixed(1)); e.setAttribute("y2", q[1].toFixed(1));
    });
    return e;
  }

  function track(name) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: "campus/" + name, title: name, event: true });
    }
  }

  // A box from (x, y, z0) with width w along x, depth d along y and height h.
  function box(g, x, y, w, d, h, z0) {
    z0 = z0 || 0;
    var t = z0 + h;
    face(g, [P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, t), P(x, y + d, t)], [0, 1]);
    face(g, [P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, t), P(x + w, y, t)], [1, 0]);
    face(g, [P(x, y, z0), P(x + w, y, z0), P(x + w, y, t), P(x, y, t)], [0, -1]);
    face(g, [P(x, y, z0), P(x, y + d, z0), P(x, y + d, t), P(x, y, t)], [-1, 0]);
    poly(g, [P(x, y, t), P(x + w, y, t), P(x + w, y + d, t), P(x, y + d, t)], "f-t");
  }

  // Rows of windows on all four sides, so the back of each building looks finished when the campus turns.
  function windows(g, x, y, w, d, h, z0, step) {
    z0 = z0 || 0;
    step = step || 1;
    var ww = 0.38, wh = 0.42;
    for (var z = z0 + 0.45; z + wh < z0 + h - 0.2; z += 0.9) {
      for (var i = x + 0.35; i + ww < x + w - 0.15; i += step) {
        face(g, [P(i, y + d, z), P(i + ww, y + d, z), P(i + ww, y + d, z + wh), P(i, y + d, z + wh)], [0, 1], "win");
        face(g, [P(i, y, z), P(i + ww, y, z), P(i + ww, y, z + wh), P(i, y, z + wh)], [0, -1], "win");
      }
      for (var j = y + 0.35; j + ww < y + d - 0.15; j += step) {
        face(g, [P(x + w, j, z), P(x + w, j + ww, z), P(x + w, j + ww, z + wh), P(x + w, j, z + wh)], [1, 0], "win");
        face(g, [P(x, j, z), P(x, j + ww, z), P(x, j + ww, z + wh), P(x, j, z + wh)], [-1, 0], "win");
      }
    }
  }

  function flat(g, x, y, w, d, cls) { return poly(g, [P(x, y, 0), P(x + w, y, 0), P(x + w, y + d, 0), P(x, y + d, 0)], cls); }

  function tree(g, x, y, s) {
    s = s || 1;
    var r = 0.42 * s * U;
    var e = el("polygon", { "class": "tree" }, g);
    e._at = [x, y];
    live(function () {
      var base = P(x, y, 0), top = P(x, y, 1.6 * s);
      e.setAttribute("points", pts([[base[0] - r, base[1] - 0.3 * U], top, [base[0] + r, base[1] - 0.3 * U]]));
    });
  }

  var layers = {};
  ["ground", "world", "fx", "labels", "top"].forEach(function (n) { layers[n] = el("g", { "class": "layer-" + n }, svg); });

  function label(x, y, z, text, small) {
    var g = el("g", { "class": "label" + (small ? " small" : "") }, layers.labels);
    live(function () { var p = P(x, y, z); g.setAttribute("transform", "translate(" + p[0].toFixed(1) + "," + p[1].toFixed(1) + ")"); });
    var t = el("text", { x: 0, y: 0, "text-anchor": "middle", "dominant-baseline": "middle" }, g);
    t.textContent = text;
    var b = t.getBBox();
    el("rect", { x: b.x - 8, y: b.y - 4, width: b.width + 16, height: b.height + 8, rx: 6 }, g).parentNode.insertBefore(g.lastChild, t);
    return g;
  }

  // Ground plate, grid and roads.
  var N = 24;
  face(layers.ground, [P(0, N, -0.6), P(N, N, -0.6), P(N, N, 0), P(0, N, 0)], [0, 1], "plate-side");
  face(layers.ground, [P(N, 0, -0.6), P(N, N, -0.6), P(N, N, 0), P(N, 0, 0)], [1, 0], "plate-side");
  face(layers.ground, [P(0, 0, -0.6), P(N, 0, -0.6), P(N, 0, 0), P(0, 0, 0)], [0, -1], "plate-side");
  face(layers.ground, [P(0, 0, -0.6), P(0, N, -0.6), P(0, N, 0), P(0, 0, 0)], [-1, 0], "plate-side");
  poly(layers.ground, [P(0, 0), P(N, 0), P(N, N), P(0, N)], "plate-top");
  for (var gi = 1; gi < N; gi++) {
    seg(layers.ground, [gi, 0, 0], [gi, N, 0], "grid");
    seg(layers.ground, [0, gi, 0], [N, gi, 0], "grid");
  }
  flat(layers.ground, 12, 6, 11.6, 1, "road");
  flat(layers.ground, 12, 7, 1, 16.6, "road");
  flat(layers.ground, 7, 14.7, 5, 1, "road");
  flat(layers.ground, 13, 17, 2.5, 1, "road");
  flat(layers.ground, 0.4, 6, 11.6, 1, "belt");
  for (var bt = 0.9; bt < 12; bt += 0.7) {
    seg(layers.ground, [bt, 6, 0], [bt, 7, 0], "belt-tick");
  }

  // Paawan's name painted on the plaza.
  // Centred along the front edge and scaled so it always fits inside the plate.
  var nameText = el("text", { "class": "ground-name", "text-anchor": "middle", "font-size": 1.25 * U }, layers.ground);
  live(function () {
    // The text's x axis runs along the grid's x axis and its y axis along the grid's y axis, both scaled to one grid unit.
    var o = P(12, 23.35), ex = P(13, 23.35), ey = P(12, 24.35);
    var m = [(ex[0] - o[0]) / U, (ex[1] - o[1]) / U, (ey[0] - o[0]) / U, (ey[1] - o[1]) / U, o[0], o[1]];
    nameText.setAttribute("transform", "matrix(" + m.map(function (n) { return n.toFixed(3); }).join(",") + ")");
  });
  nameText.textContent = "PAAWAN DESAI";
  try {
    var room = 20 * U, len = nameText.getComputedTextLength();
    if (len > room) nameText.setAttribute("font-size", (1.25 * U * room / len).toFixed(1));
  } catch (e) { /* measuring can fail before layout; the default size still fits */ }

  // Things drawn back to front by depth.
  var things = [];
  function add(depth, fn) { things.push({ depth: depth, fn: fn }); }

  // Hovering a building with a mouse opens its panel after a short pause; a click or tap opens it straight away.
  var canHoverDevice = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hoverTimer = 0, hoverOpening = false, panelMode = "pinned", hoverBlock = [];
  function hoverAllowed() {
    if (!canHoverDevice || turning.drag || Date.now() < turning.quiet || !document.getElementById("tour").hidden) return false;
    if (document.body.classList.contains("playing")) return false;
    for (var i = 0; i < hoverBlock.length; i++) if (hoverBlock[i]()) return false;
    return panel.hidden || panelMode === "hover";
  }
  function hoverOpen(fn) {
    clearTimeout(hoverTimer);
    if (!hoverAllowed()) return;
    hoverTimer = setTimeout(function () {
      if (!hoverAllowed()) return;
      hoverOpening = true;
      try { fn(); } finally { hoverOpening = false; }
    }, 220);
  }
  function hoverCancel() { clearTimeout(hoverTimer); }
  function hoverable(g, fn) {
    g.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hoverOpen(fn); });
    g.addEventListener("pointerleave", hoverCancel);
  }
  var turning = { drag: false, quiet: 0 };

  function hit(name, aria, onOpen) {
    var g = el("g", { "class": "hit", tabindex: "0", role: "button", "aria-label": aria }, null);
    g.addEventListener("click", function () { hoverCancel(); onOpen(); });
    hoverable(g, onOpen);
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); }
    });
    g.dataset.name = name;
    return g;
  }

  // The Factory and its stations.
  var stationNames = ["Planner", "Spec critic", "Builder", "Breaker", "Scorer"];
  var stationX = [1.2, 3.2, 5.2, 7.2, 9.2];
  var stations = [];
  add(2.5 + 6, function () {
    var g = hit("factory", "The Factory: how I build", function () { open("factory"); });
    layers.world.appendChild(g);
    box(g, 0.8, 0.8, 10.4, 3, 2.8);
    windows(g, 0.8, 0.8, 10.4, 3, 2.8, 0, 1.1);
    for (var s = 0; s < 4; s++) box(g, 1.6 + s * 2.5, 1.3, 1.6, 1.4, 0.7, 2.8);
    box(g, 9.6, 1.0, 0.6, 0.6, 1.6, 2.8);
  });
  stationX.forEach(function (sx, i) {
    add(sx + 5.2 + 0.5, function () {
      var g = hit("factory", stationNames[i] + " station", function () { open("factory"); });
      g.classList.add("station");
      layers.world.appendChild(g);
      box(g, sx, 4.4, 1, 1.1, 1.3);
      stations.push({ g: g, label: label(sx + 0.5, 4.95, 2.2, stationNames[i], true) });
      g.addEventListener("mouseenter", function () { stations[i].label.classList.add("show"); });
      g.addEventListener("mouseleave", function () { if (!g.classList.contains("on")) stations[i].label.classList.remove("show"); });
    });
  });

  // Company Agent Layer tower at the gate between the factory and the services.
  var beam;
  add(12.6 + 4.6, function () {
    var g = hit("cal", "Company Agent Layer", function () { openProject(data.featured[0], "lab"); });
    layers.world.appendChild(g);
    box(g, 12.15, 4.15, 0.8, 0.8, 4.6);
    windows(g, 12.15, 4.15, 0.8, 0.8, 4.6, 0, 1);
    box(g, 12.0, 4.0, 1.1, 1.1, 0.35, 4.6);
    beam = poly(layers.fx, [P(12.55, 4.55, 4.95), P(12, 6, 0), P(23.6, 6, 0), P(23.6, 7, 0), P(12, 7, 0)], "tower-beam");
  });

  // Service District: one building per Gauntlet build.
  var shortNames = ["Call Center Agent", "Clinical Co-Pilot", "Prediction Markets", "0DTE Markets", "Monte Carlo Pricer",
    "Telemetry Pipeline", "Zoning Engine", "Interpreter Workbench", "Supplement Ledger", "Churn Agent"];
  var heights = [2.2, 1.6, 2.8, 1.9, 2.4, 1.7, 2.6, 2.0, 3.0, 1.8];
  var services = [];
  data.gauntlet.slice(0, 10).forEach(function (p, i) {
    var col = i % 5, row = Math.floor(i / 5);
    var x = 14 + col * 2, y = row === 0 ? 3.6 : 8.2, w = 1.5, dd = 1.6, h = heights[i];
    services.push({ cx: x + w / 2, cy: y + dd / 2, h: h });
    add(x + y + 1.5, function () {
      var g = hit("service", p.title, function () { openProject(p, "services"); });
      g.classList.add("svc");
      layers.world.appendChild(g);
      box(g, x, y, w, dd, h);
      windows(g, x, y, w, dd, h, 0, 0.6);
      services[i].g = g;
      var lab = label(x + w / 2, y + dd / 2, h + 0.7, shortNames[i] || p.title, true);
      services[i].label = lab;
      g.addEventListener("mouseenter", function () { lab.classList.add("show"); });
      g.addEventListener("mouseleave", function () { lab.classList.remove("show"); });
      g.addEventListener("focus", function () { lab.classList.add("show"); });
      g.addEventListener("blur", function () { lab.classList.remove("show"); });
    });
  });

  // The Lab (featured work) with a crate that lands at the end of the tour.
  var shippedCrate;
  add(4.5 + 15.25, function () {
    var g = hit("lab", "The Lab: featured work", function () { open("lab"); });
    layers.world.appendChild(g);
    box(g, 2, 13.5, 5, 3.6, 2.4);
    windows(g, 2, 13.5, 5, 3.6, 2.4, 0, 1.1);
    box(g, 3.2, 14.4, 2.4, 1.8, 0.9, 2.4);
    box(g, 4.1, 14.9, 0.6, 0.6, 1.4, 3.3);
  });
  add(8 + 16.6, function () {
    shippedCrate = el("g", { "class": "crate", style: "display:none" }, layers.world);
    box(shippedCrate, 7.4, 15.9, 0.8, 0.8, 0.7);
  });

  // The Archive (earlier work), with one crate per earlier project.
  add(5 + 20.5, function () {
    var g = hit("archive", "The Archive: earlier work", function () { open("archive"); });
    layers.world.appendChild(g);
    box(g, 2, 19, 6, 3, 1.8);
    face(g, [P(2.6, 22, 0), P(4.2, 22, 0), P(4.2, 22, 1.3), P(2.6, 22, 1.3)], [0, 1], "win");
  });
  data.earlier.forEach(function (p, i) {
    var x = 8.6 + (i % 3) * 1.05, y = 19.3 + Math.floor(i / 3) * 1.3;
    add(x + y + 0.8, function () {
      var g = hit("crate", p.title, function () { openProject(p, "archive"); });
      g.classList.add("crate");
      layers.world.appendChild(g);
      box(g, x, y, 0.8, 0.9, 0.75);
      var lab = label(x + 0.4, y + 0.45, 1.4, p.title.split(/[–(:-]/)[0].trim(), true);
      g.addEventListener("mouseenter", function () { lab.classList.add("show"); });
      g.addEventListener("mouseleave", function () { lab.classList.remove("show"); });
      g.addEventListener("focus", function () { lab.classList.add("show"); });
      g.addEventListener("blur", function () { lab.classList.remove("show"); });
    });
  });

  // Front Office (About and CV).
  add(18 + 17.25, function () {
    var g = hit("office", "Front Office: about me and my CV", function () { open("office"); });
    layers.world.appendChild(g);
    box(g, 15.5, 15, 5, 4.5, 4.2);
    windows(g, 15.5, 15, 5, 4.5, 4.2, 0, 0.8);
    box(g, 16.4, 15.8, 1.2, 1.2, 0.5, 4.2);
    seg(g, [19.6, 18.6, 4.2], [19.6, 18.6, 6], "wire");
    var flag = el("polygon", { "class": "f-t" }, g);
    live(function () {
      var f2 = P(19.6, 18.6, 6), f3 = P(19.6, 18.6, 5.4);
      flag.setAttribute("points", pts([f2, f3, [f2[0] + 22, f2[1] + 6]]));
    });
  });

  // Security building (Jailbreak the guard).
  add(22.35 + 17, function () {
    var g = hit("security", "Security: jailbreak the guard", function () { open("security"); });
    layers.world.appendChild(g);
    box(g, 21.1, 15.4, 2.5, 3.2, 2.6);
    windows(g, 21.1, 15.4, 2.5, 3.2, 2.6, 0, 0.9);
    box(g, 21.8, 16.4, 1.1, 1.1, 0.5, 2.6);
    seg(g, [22.35, 16.95, 3.1], [22.35, 16.95, 4.3], "wire");
    var bc = el("circle", { r: 4, "class": "beacon" }, g);
    live(function () { var a2 = P(22.35, 16.95, 4.3); bc.setAttribute("cx", a2[0].toFixed(1)); bc.setAttribute("cy", a2[1].toFixed(1)); });
  });

  // Trees.
  [[0.6, 9.4, 1], [0.6, 11, 0.8], [1.6, 10.2, 0.9], [23.3, 12.6, 1], [23.3, 14.2, 0.8], [22.4, 13.3, 0.9],
    [10.4, 13.2, 0.8], [13.9, 13.6, 0.7], [21.8, 20.6, 0.9], [11.2, 21.2, 0.8], [0.8, 17.6, 0.8], [8.8, 12.2, 0.7]]
    .forEach(function (t) { add(t[0] + t[1], function () { tree(layers.world, t[0], t[1], t[2]); }); });

  things.sort(function (m, n) { return m.depth - n.depth; }).forEach(function (t) {
    var before = layers.world.childNodes.length;
    t.fn();
    for (var k = before; k < layers.world.childNodes.length; k++) layers.world.childNodes[k]._d0 = t.depth;
  });

  // Drawing order when the campus turns. Each building is sorted by how near its centre is to the viewer,
  // keeping the hand-tuned order from the front view as a bias so the front view is unchanged.
  function nearness(x, y) {
    var c = Math.cos(ROT), s = Math.sin(ROT), dx = x - RC, dy = y - RC;
    return 2 * RC + dx * c - dy * s + dx * s + dy * c;
  }
  var depthItems = Array.prototype.map.call(layers.world.childNodes, function (n) {
    var pts0 = [];
    (n._grid ? [n] : Array.prototype.slice.call(n.querySelectorAll("polygon"))).forEach(function (p) { if (p._grid) pts0 = pts0.concat(p._grid); });
    if (n.classList.contains("tree")) pts0 = [];
    var xs = pts0.map(function (q) { return q[0]; }), ys = pts0.map(function (q) { return q[1]; });
    var cx = xs.length ? (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2 : 0;
    var cy = ys.length ? (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2 : 0;
    return { n: n, cx: cx, cy: cy, bias: (n._d0 || 0) - (cx + cy) };
  });
  // Trees are a single polygon whose grid point is the trunk.
  depthItems.forEach(function (it) {
    if (it.n.classList.contains("tree")) { it.cx = it.n._at[0]; it.cy = it.n._at[1]; it.bias = 0; }
  });
  var movingItems = [];
  function sortWorld() {
    var turned = Math.abs(ROT) > 0.25;
    var list = depthItems.map(function (it) { return { n: it.n, d: nearness(it.cx, it.cy) + it.bias }; });
    movingItems.forEach(function (m) {
      // Close to the front view, figures and the PR stay on top as before; once turned they sort with the buildings.
      if (!turned) { if (m.n.parentNode !== m.home) m.home.appendChild(m.n); return; }
      var p = m.pos();
      list.push({ n: m.n, d: nearness(p[0], p[1]) + 0.3 });
    });
    list.sort(function (a, b) { return a.d - b.d; });
    var kids = layers.world.childNodes, same = kids.length === list.length;
    for (var i = 0; same && i < list.length; i++) if (kids[i] !== list[i].n) same = false;
    if (!same) list.forEach(function (it) { layers.world.appendChild(it.n); });
  }
  setInterval(function () { if (Math.abs(ROT) > 0.25 && movingItems.length) sortWorld(); }, 250);

  // Contract wires between services, drawn over the rooftops.
  var wires = [[0, 5], [1, 2], [2, 7], [3, 8], [4, 9], [6, 7], [1, 6], [3, 4]];
  var wireEls = wires.map(function (w) {
    var m = services[w[0]], n = services[w[1]];
    return seg(layers.fx, [m.cx, m.cy, m.h], [n.cx, n.cy, n.h], "wire");
  });

  label(6, 2.3, 4.4, "The Factory · how I build");
  label(18.8, 2.4, 3.6, "Service District · Gauntlet builds");
  label(4.5, 15.3, 4.6, "The Lab · featured work");
  label(5, 20.5, 2.9, "The Archive · earlier work");
  label(18, 17.25, 5.6, "Front Office · about and CV");
  label(22.35, 17, 4.9, "Security");
  label(12.55, 4.55, 6, "Company Agent Layer", true).classList.add("show");

  // The pull request travelling through the tour.
  var packet = el("g", { "class": "packet" }, layers.top);
  el("polygon", { "class": "gem", points: "0,-14 12,-4 0,6 -12,-4" }, packet);
  var gemText = el("text", { "class": "gem-t", x: 0, y: -3, "text-anchor": "middle", "dominant-baseline": "middle" }, packet);
  gemText.textContent = "PR";

  var bubble = el("g", { "class": "bubble" }, layers.top);
  (function () {
    var bp = P(16.6, 3.6, 7.4);
    var lines = ["Company Agent Layer", "This PR renames invoice.total.", "2 services read that field.", "Notified: Billing, Retention."];
    el("rect", { x: bp[0] - 8, y: bp[1] - 18, width: 210, height: 76, rx: 8 }, bubble);
    lines.forEach(function (ln, i) {
      var t = el("text", { x: bp[0] + 2, y: bp[1] + i * 17 - 3, "class": i === 0 ? "b-h" : "" }, bubble);
      t.textContent = ln;
    });
  })();

  // Fit the drawing to its content.
  var bb = svg.getBBox();
  svg.setAttribute("viewBox", [bb.x - 12, bb.y - 12, bb.width + 24, bb.height + 24].map(Math.round).join(" "));
  // On phones the map is drawn wider than the screen and scrolls sideways; start in the middle.
  var stageEl = svg.parentNode;
  function centerStage() { if (stageEl.scrollWidth > stageEl.clientWidth) stageEl.scrollLeft = (stageEl.scrollWidth - stageEl.clientWidth) / 2; }
  centerStage();
  window.addEventListener("load", centerStage);
  stageEl.addEventListener("scroll", function () { document.body.classList.add("swiped"); }, { once: true, passive: true });
  document.querySelectorAll("[data-click]").forEach(function (b) {
    b.addEventListener("click", function () { var t = document.getElementById(b.getAttribute("data-click")); if (t) t.click(); });
  });

  // Panel.
  var panel = document.getElementById("panel");
  var panelBody = document.getElementById("panel-body");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }
  function list(items) {
    return "<ul>" + items.map(function (p) {
      return '<li><a href="' + esc(p.url) + '">' + esc(p.title) + "</a><span>" + esc(p.excerpt) + "</span></li>";
    }).join("") + "</ul>";
  }
  var B = data.base;
  var views = {
    office: function () {
      return '<p class="kicker">Front Office</p><img class="photo" src="' + esc(data.photo) + '" alt="Paawan Desai">' +
        "<h2>Paawan Desai</h2><p>" + esc(data.bio) + "</p>" +
        "<ul>" +
        '<li><a href="' + B + '/about/">About me</a><span>Background and current work.</span></li>' +
        '<li><a href="' + B + '/cv/">CV</a><span>Full experience and education.</span></li>' +
        '<li><a href="' + B + '/files/Paawan_Desai_Resume.pdf">Resume (PDF)</a><span>The one-page version.</span></li>' +
        '<li><a href="https://github.com/' + esc(data.github) + '">GitHub</a><span>Code for my public projects.</span></li>' +
        '<li><a href="https://www.linkedin.com/in/' + esc(data.linkedin) + '">LinkedIn</a><span>Get in touch.</span></li>' +
        "</ul>";
    },
    lab: function () {
      return '<p class="kicker">The Lab</p><h2>Featured work</h2><p>Current work and the projects I\'m proudest of.</p>' +
        '<button type="button" class="btn primary play" data-open="alchemist">Play Alchemist\'s Trial</button>' +
        '<button type="button" class="btn play" data-open="evallab">▶ Play Eval Lab: pick a threshold</button>' +
        list(data.featured) + '<a class="more" href="' + B + '/portfolio/">All projects</a>';
    },
    services: function () {
      return '<p class="kicker">Service District</p><h2>Gauntlet AI builds</h2>' +
        "<p>I built these during Gauntlet AI\'s Cohort 7 (Sep to Nov 2026). Each one started from a real company\'s brief and had to prove itself with its own evals.</p>" +
        '<button type="button" class="btn primary play" data-open="blast">▶ Play Blast Radius</button>' +
        '<button type="button" class="btn play" data-open="contract">Watch the demo: break a contract</button>' +
        list(data.gauntlet) + '<a class="more" href="' + B + '/portfolio/">All projects</a>';
    },
    factory: function () {
      var rows = [["Planner", "Writes a one-page spec with acceptance tests. Never writes code."],
        ["Spec critic", "Asks if it's the right thing, and the smallest version. Never approves its own suggestions."],
        ["Builder", "Tests first, then code. Never edits the acceptance tests."],
        ["Breaker", "Fresh context, tries to break it. Never sees the builder's reasoning."],
        ["Scorer", "Replays the scenario catalog. Never changes expected answers."],
        ["Buyer panel", "Three personas score the product. Never see the code."]];
      return '<p class="kicker">The Factory</p><h2>How I build</h2>' +
        "<p>I build with a small team of AI agents. Each has one job and one thing it is never allowed to do, so no agent grades its own work.</p><table>" +
        rows.map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>"; }).join("") +
        '</table><button type="button" class="btn primary play" data-open="breaker">▶ Play Be the Breaker</button>' +
        '<button type="button" class="btn play" data-open="sneak">Watch the demo: sneak a bad PR past the factory</button>' +
        '<a class="more" href="' + B + '/how-i-build/">The full workflow and verification ladder</a>';
    },
    archive: function () {
      return '<p class="kicker">The Archive</p><h2>Earlier work</h2><p>Projects from university, research and hackathons.</p>' +
        list(data.earlier) + '<a class="more" href="' + B + '/portfolio/">All projects</a>';
    }
  };
  var lastFocus;
  function show(html) {
    var byHover = hoverOpening;
    if (panel.hidden && !byHover) lastFocus = document.activeElement;
    panelBody.innerHTML = html;
    panel.classList.remove("reader");
    panel.hidden = false;
    panel.scrollTop = 0;
    panelMode = byHover ? "hover" : "pinned";
    panel.classList.toggle("peek", byHover);
    document.getElementById("hint").style.visibility = "hidden";
    // A hover preview doesn't take focus away from where the visitor is.
    if (!byHover) document.getElementById("panel-close").focus({ preventScroll: true });
  }
  // Once the visitor clicks, types or scrolls inside the panel, hovering the map no longer replaces it.
  function pin() { panelMode = "pinned"; panel.classList.remove("peek"); }
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) { panel.addEventListener(ev, pin, { passive: true }); });
  function open(key) {
    if (!views[key]) return;
    track("open-" + key);
    show(views[key]());
    document.dispatchEvent(new CustomEvent("campus:open", { detail: { key: key, body: panelBody } }));
  }
  function openProject(p, back) {
    track("project-" + p.url);
    show('<p class="kicker">' + (back === "services" ? "Service District" : back === "archive" ? "The Archive" : "The Lab") + "</p>" +
      "<h2>" + esc(p.title) + "</h2><p>" + esc(p.excerpt) + "</p>" +
      '<a class="more" href="' + esc(p.url) + '">Read the write-up</a><br>' +
      '<button type="button" class="btn" style="margin-top:12px" data-back="' + back + '">See the rest</button>');
  }
  panelBody.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-back],[data-open]");
    if (t) open(t.getAttribute("data-back") || t.getAttribute("data-open"));
  });
  function closePanel() {
    panel.hidden = true;
    panel.classList.remove("reader", "peek");
    readerStack = [];
    document.dispatchEvent(new CustomEvent("campus:close"));
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.getElementById("panel-close").addEventListener("click", closePanel);
  document.querySelectorAll("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () { lastFocus = btn; open(btn.getAttribute("data-open")); });
  });

  // ---------- Reading pages without leaving the campus ----------
  // Links to this site's own pages open inside the panel, so games, the map and the tour stay as they were.
  // Other sites and files (GitHub, LinkedIn, the resume PDF) open in a new tab.
  var readerStack = [];
  function bareHost(h) { return h.replace(/^www\./, ""); }
  var siteHost = "";
  try { siteHost = bareHost(new URL(data.base || location.href, location.href).host); } catch (e) { /* ignore */ }
  // This site's own page for a link, on the origin the visitor is using (so it can be fetched), or null.
  function localPage(a) {
    if (!a.href || a.target || a.hasAttribute("download")) return null;
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return null; }
    var h = bareHost(u.host);
    if (h !== bareHost(location.host) && h !== siteHost) return null;
    if (/\.(pdf|png|jpe?g|gif|svg|zip|xml|txt)$/i.test(u.pathname)) return null;
    if (u.pathname === location.pathname) return null;
    return location.origin + u.pathname + u.search;
  }
  function readPage(url) {
    track("read-" + new URL(url, location.href).pathname);
    // Keep the panel's current contents (with any game still running) to come back to.
    if (!panel.hidden) readerStack.push({ nodes: Array.prototype.slice.call(panelBody.childNodes), cls: panel.className, top: panel.scrollTop });
    if (panel.hidden) lastFocus = document.activeElement;
    panel.hidden = false;
    pin();
    panel.classList.add("reader");
    panelBody.innerHTML = '<p class="kicker">Loading…</p>';
    fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("status " + r.status);
      return r.text();
    }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, "text/html");
      var main = doc.querySelector("#main .page") || doc.querySelector("#main .archive") || doc.querySelector("#main");
      if (!main) throw new Error("no content");
      main.querySelectorAll("script, style, noscript, .page-back, .page__share, .page__related, .pagination, .page__meta, .page__date, meta").forEach(function (n) { n.remove(); });
      var bar = '<div class="reader-bar">' +
        (readerStack.length ? '<button type="button" class="btn" data-reader-back>← Back</button>' : "") +
        '<a class="btn ghost" href="' + esc(url) + '" target="_blank" rel="noopener">Open as a full page ↗</a></div>';
      panelBody.innerHTML = bar + '<div class="reader-body">' + main.innerHTML + "</div>";
      panel.scrollTop = 0;
      var h = panelBody.querySelector("h1, h2");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }).catch(function () {
      // If the page can't be shown here, open it in a new tab instead.
      readerBack();
      window.open(url, "_blank", "noopener");
    });
  }
  function readerBack() {
    var last = readerStack.pop();
    if (!last) { closePanel(); return; }
    panelBody.textContent = "";
    last.nodes.forEach(function (n) { panelBody.appendChild(n); });
    panel.className = last.cls;
    panel.scrollTop = last.top;
  }
  panelBody.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-reader-back]")) { readerBack(); }
  });
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.closest(".bar") || a.classList.contains("skip")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) return;
    var inside = a.closest("#panel, #agent-card, .toasts");
    var page = localPage(a);
    if (inside && page) { e.preventDefault(); readPage(page); return; }
    if (!page && !a.target) { a.target = "_blank"; a.rel = "noopener"; }
  });

  // Theme: follows the sun by default (see campus-sun.js), or a fixed light or dark.
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle"), themeLabel = document.getElementById("theme-label");
  var NEXT = { auto: "light", light: "dark", dark: "auto" };
  var NAMES = { auto: "sun", light: "light", dark: "dark" };
  function renderTheme() {
    var m = (window.CampusSun && window.CampusSun.state().mode) || "auto";
    themeLabel.textContent = "Theme: " + NAMES[m];
    themeBtn.setAttribute("aria-label", "Theme: " + (m === "auto" ? "follows the sun where you are" : m) + ". Switch to " + (NEXT[m] === "auto" ? "following the sun" : NEXT[m]) + ".");
  }
  themeBtn.addEventListener("click", function () {
    if (!window.CampusSun) return;
    window.CampusSun.setMode(NEXT[window.CampusSun.state().mode || "auto"]);
    renderTheme();
    document.dispatchEvent(new CustomEvent("campus:theme"));
  });
  renderTheme();

  // The tour.
  var belt = 6.5;
  var stationAt = stationX.map(function (sx) { return [sx + 0.5, belt]; });
  var steps = [
    { title: "A pull request starts as a spec", at: [[0.7, belt]],
      text: "Everything here starts the same way: one item off the backlog, and a short note on what done looks like." },
    { title: "Planner", at: [stationAt[0]], station: 0,
      text: "The Planner picks the item and writes a one-page spec, including the tests it has to pass. It doesn't write any code." },
    { title: "Spec critic", at: [stationAt[1]], station: 1,
      text: "The critic pushes back on the spec. Is this actually the right thing to build, and is there a smaller version? It can't approve its own suggestions." },
    { title: "Builder", at: [stationAt[2]], station: 2,
      text: "The Builder writes the tests first, then the code, in its own copy of the repo. It's not allowed to touch the acceptance tests to make them pass." },
    { title: "Breaker", at: [stationAt[3]], station: 3,
      text: "This is a fresh agent that only sees the spec and the diff. Its only job is to find what breaks, and it never sees the Builder's reasoning." },
    { title: "Scorer", at: [stationAt[4]], station: 4,
      text: "The Scorer replays a catalog of scenarios against the new build. It can't change what the right answers are." },
    { title: "Company Agent Layer checks the contracts", at: [[12.5, belt]], bad: true, beam: true,
      text: "Before anything merges, Company Agent Layer (the product I'm building) checks who depends on what across all the repos. In this made-up example the change renames a field two other services read, so it leaves a comment on the PR saying which teams and fields would break." },
    { title: "Back to the line", at: [stationAt[2]], bad: true, station: 2,
      text: "The change goes back through the line. The Builder fixes it, and the Breaker and Scorer run again." },
    { title: "Contracts hold", at: [stationAt[3], stationAt[4], [12.5, belt]], good: true, beam: true,
      text: "This time nothing breaks, and both services stay green." },
    { title: "Shipped", at: [[12.5, 15.2], [7.8, 15.2]], good: true, shipped: true,
      text: "It ships and lands in the Lab with the rest of my featured work. Most of the projects on this site went through a version of this process. Click any building to look inside." }
  ];

  var tour = document.getElementById("tour");
  var cur = -1;
  var pos = steps[0].at[0];
  var anim = 0;

  function place(p) {
    var s = P(p[0], p[1], 0.9);
    packet.setAttribute("transform", "translate(" + s[0].toFixed(1) + "," + s[1].toFixed(1) + ")");
    pos = p;
  }

  function travel(route) {
    cancelAnimationFrame(anim);
    if (reduceMotion) { place(route[route.length - 1]); return; }
    var legs = [], from = pos;
    route.forEach(function (to) { legs.push([from, to]); from = to; });
    var leg = 0, start = null;
    function frame(ts) {
      if (leg >= legs.length) return;
      var l = legs[leg];
      var dist = Math.abs(l[1][0] - l[0][0]) + Math.abs(l[1][1] - l[0][1]);
      var dur = Math.max(150, dist * 140);
      if (start === null) start = ts;
      var k = Math.min(1, (ts - start) / dur);
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      place([l[0][0] + (l[1][0] - l[0][0]) * e, l[0][1] + (l[1][1] - l[0][1]) * e]);
      if (k >= 1) { leg++; start = null; }
      anim = requestAnimationFrame(frame);
    }
    anim = requestAnimationFrame(frame);
  }

  var badSet = [2, 7];
  function apply(i, animate) {
    var st = steps[i];
    stations.forEach(function (s, k) {
      var on = st.station === k;
      s.g.classList.toggle("on", on);
      s.label.classList.toggle("show", on);
    });
    services.forEach(function (s, k) {
      var flagged = badSet.indexOf(k) >= 0;
      s.g.classList.toggle("bad", flagged && !!st.bad);
      s.g.classList.toggle("good", flagged && !!st.good);
      s.label.classList.toggle("show", flagged && (!!st.bad || !!st.good));
    });
    wireEls.forEach(function (w, k) {
      var hitsBad = badSet.indexOf(wires[k][0]) >= 0 && badSet.indexOf(wires[k][1]) >= 0;
      w.classList.toggle("bad", hitsBad && !!st.bad);
    });
    if (beam) beam.classList.toggle("on", !!st.beam);
    bubble.classList.toggle("on", i === 6);
    shippedCrate.style.display = st.shipped ? "" : "none";
    if (animate) travel(st.at); else place(st.at[st.at.length - 1]);

    document.getElementById("tour-count").textContent = "Step " + (i + 1) + " of " + steps.length;
    document.getElementById("tour-title").textContent = st.title;
    document.getElementById("tour-text").textContent = st.text;
    document.getElementById("tour-back").disabled = i === 0;
    document.getElementById("tour-next").textContent = i === steps.length - 1 ? "Explore the campus" : "Next";
  }

  function go(i) {
    if (i < 0) return;
    if (i >= steps.length) { endTour(); return; }
    var forward = i === cur + 1;
    cur = i;
    apply(i, forward);
  }

  function startTour() {
    track("tour-start");
    turnTo(0, true);
    panel.hidden = true;
    tour.hidden = false;
    document.body.classList.add("touring");
    packet.classList.add("on");
    cur = -1;
    pos = steps[0].at[0];
    go(0);
    document.getElementById("tour-next").focus({ preventScroll: true });
  }

  function endTour() {
    if (tour.hidden) return;
    if (cur === steps.length - 1) {
      track("tour-finish");
      document.dispatchEvent(new CustomEvent("campus:tour-finish"));
    }
    cancelAnimationFrame(anim);
    tour.hidden = true;
    document.body.classList.remove("touring");
    packet.classList.remove("on");
    cur = -1;
    stations.forEach(function (s) { s.g.classList.remove("on"); s.label.classList.remove("show"); });
    services.forEach(function (s) { s.g.classList.remove("bad", "good"); s.label.classList.remove("show"); });
    wireEls.forEach(function (w) { w.classList.remove("bad"); });
    if (beam) beam.classList.remove("on");
    bubble.classList.remove("on");
    document.getElementById("tour-start").focus({ preventScroll: true });
  }

  document.getElementById("tour-start").addEventListener("click", startTour);
  document.getElementById("tour-next").addEventListener("click", function () { go(cur + 1); });
  document.getElementById("tour-back").addEventListener("click", function () { go(cur - 1); });
  document.getElementById("tour-exit").addEventListener("click", endTour);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!tour.hidden) endTour(); else if (!panel.hidden) closePanel();
      return;
    }
    if (tour.hidden) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(cur + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(cur - 1); }
  });

  // ---------- Turning the campus ----------
  // Drag the map sideways (or use the turn buttons) to look around the buildings; Center snaps it back.
  // It turns all the way round: each building shows whichever sides face the viewer and is redrawn in depth order.
  var TAU = Math.PI * 2, STEP_TURN = 45 * Math.PI / 180;
  function norm(a) { a = a % TAU; if (a > Math.PI) a -= TAU; if (a <= -Math.PI) a += TAU; return a; }
  var turnAnim = 0, turnListeners = [];
  var centerBtn = document.getElementById("turn-center");
  function setTurn(a) {
    ROT = norm(a);
    redraws.forEach(function (fn) { fn(); });
    sortWorld();
    turnListeners.forEach(function (fn) { fn(ROT); });
    var off = Math.abs(ROT) > 0.001;
    document.body.classList.toggle("turned", off);
    if (centerBtn) centerBtn.disabled = !off;
  }
  function turnLocked() { return !tour.hidden || document.body.classList.contains("playing"); }
  function turnTo(target, quick) {
    cancelAnimationFrame(turnAnim);
    // Go the short way round.
    var from0 = norm(ROT);
    target = from0 + norm(target - from0);
    if (reduceMotion || Math.abs(target - ROT) < 0.001) { setTurn(target); return; }
    var from = from0, start = null, dur = quick ? 260 : 560;
    var snap = Math.abs(norm(target)) < 0.001;
    function frame(ts) {
      if (start === null) start = ts;
      var k = Math.min(1, (ts - start) / dur);
      // Ease out, with a small overshoot when snapping back to the centre.
      var e = snap ? 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2) : 1 - Math.pow(1 - k, 3);
      setTurn(from + (target - from) * e);
      if (k < 1) turnAnim = requestAnimationFrame(frame); else setTurn(target);
    }
    turnAnim = requestAnimationFrame(frame);
  }
  // A positive angle moves the near corner of the campus to the left, so "right" is a negative turn.
  [["turn-left", 1], ["turn-right", -1]].forEach(function (b) {
    var btn = document.getElementById(b[0]);
    if (btn) btn.addEventListener("click", function () {
      if (turnLocked()) return;
      track("turn");
      turnTo(Math.round((ROT + b[1] * STEP_TURN) / STEP_TURN) * STEP_TURN);
    });
  });
  if (centerBtn) centerBtn.addEventListener("click", function () { turnTo(0); });
  svg.addEventListener("dblclick", function () { if (ROT) turnTo(0); });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (!tour.hidden || turnLocked()) return;
    if (e.key === "[") turnTo(ROT + STEP_TURN);
    if (e.key === "]") turnTo(ROT - STEP_TURN);
  });
  // Dragging with a mouse or pen. On touch screens a swipe scrolls the map instead.
  (function () {
    var down = null, suppress = false;
    svg.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0 || turnLocked()) return;
      down = { x: e.clientX, rot: ROT, id: e.pointerId };
    });
    svg.addEventListener("pointermove", function (e) {
      if (!down || e.pointerId !== down.id) return;
      var dx = e.clientX - down.x;
      if (!turning.drag && Math.abs(dx) < 6) return;
      if (!turning.drag) {
        turning.drag = true;
        hoverCancel();
        cancelAnimationFrame(turnAnim);
        document.body.classList.add("dragging");
        try { svg.setPointerCapture(down.id); } catch (err) { /* ignore */ }
      }
      // The campus follows the mouse: drag right and the near side moves right.
      setTurn(down.rot - dx * 0.008);
    });
    function up() {
      if (!down) return;
      if (turning.drag) { suppress = true; track("turn-drag"); setTimeout(function () { suppress = false; }, 0); }
      if (turning.drag) turning.quiet = Date.now() + 600;
      turning.drag = false;
      down = null;
      document.body.classList.remove("dragging");
    }
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    svg.addEventListener("lostpointercapture", up);
    // A drag shouldn't count as a click on whatever building it ended over.
    svg.addEventListener("click", function (e) { if (suppress) { e.stopPropagation(); e.preventDefault(); suppress = false; } }, true);
  })();
  // Games draw on the map, so the campus faces front while one is running.
  new MutationObserver(function () {
    if (document.body.classList.contains("playing") && ROT) turnTo(0, true);
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  setTurn(0);

  // Shared with campus-play.js (games, ambient life, achievements and music).
  window.Campus = {
    data: data, P: P, el: el, box: box, layers: layers, svg: svg, U: U,
    stations: stations, stationX: stationX, services: services, wires: wires, wireEls: wireEls,
    beam: function (on) { if (beam) beam.classList.toggle("on", on); },
    views: views, open: open, show: show, close: closePanel, esc: esc, track: track,
    reduceMotion: reduceMotion, touring: function () { return !tour.hidden; },
    live: live, moving: function (n, pos) { movingItems.push({ n: n, home: n.parentNode, pos: pos }); }, onTurn: function (fn) { turnListeners.push(fn); }, turnTo: turnTo,
    hoverable: hoverable, hoverCancel: hoverCancel, blockHover: function (fn) { hoverBlock.push(fn); },
    canHover: canHoverDevice, readPage: readPage
  };
})();
