/* Campus front page: an isometric map of the site drawn in SVG, plus the "Watch a PR ship" tour. */
(function () {
  "use strict";

  var data = JSON.parse(document.getElementById("campus-data").textContent);
  var svg = document.getElementById("campus");
  var NS = "http://www.w3.org/2000/svg";
  var U = 26;
  var C = Math.cos(Math.PI / 6);
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Grid (x, y, height z) to screen.
  function P(x, y, z) { return [(x - y) * C * U, (x + y) * 0.5 * U - (z || 0) * U]; }
  function pts(list) { return list.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function poly(g, list, cls) { return el("polygon", { points: pts(list), "class": cls }, g); }

  function track(name) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: "campus/" + name, title: name, event: true });
    }
  }

  // A box from (x, y, z0) with width w along x, depth d along y and height h.
  function box(g, x, y, w, d, h, z0) {
    z0 = z0 || 0;
    var t = z0 + h;
    poly(g, [P(x, y + d, z0), P(x + w, y + d, z0), P(x + w, y + d, t), P(x, y + d, t)], "f-l");
    poly(g, [P(x + w, y, z0), P(x + w, y + d, z0), P(x + w, y + d, t), P(x + w, y, t)], "f-r");
    poly(g, [P(x, y, t), P(x + w, y, t), P(x + w, y + d, t), P(x, y + d, t)], "f-t");
  }

  // Rows of windows on the two visible faces.
  function windows(g, x, y, w, d, h, z0, step) {
    z0 = z0 || 0;
    step = step || 1;
    var ww = 0.38, wh = 0.42;
    for (var z = z0 + 0.45; z + wh < z0 + h - 0.2; z += 0.9) {
      for (var i = x + 0.35; i + ww < x + w - 0.15; i += step) {
        poly(g, [P(i, y + d, z), P(i + ww, y + d, z), P(i + ww, y + d, z + wh), P(i, y + d, z + wh)], "win");
      }
      for (var j = y + 0.35; j + ww < y + d - 0.15; j += step) {
        poly(g, [P(x + w, j, z), P(x + w, j + ww, z), P(x + w, j + ww, z + wh), P(x + w, j, z + wh)], "win");
      }
    }
  }

  function flat(g, x, y, w, d, cls) { return poly(g, [P(x, y, 0), P(x + w, y, 0), P(x + w, y + d, 0), P(x, y + d, 0)], cls); }

  function tree(g, x, y, s) {
    s = s || 1;
    var base = P(x, y, 0), top = P(x, y, 1.6 * s);
    var r = 0.42 * s * U;
    el("polygon", { points: pts([[base[0] - r, base[1] - 0.3 * U], top, [base[0] + r, base[1] - 0.3 * U]]), "class": "tree" }, g);
  }

  var layers = {};
  ["ground", "world", "fx", "labels", "top"].forEach(function (n) { layers[n] = el("g", { "class": "layer-" + n }, svg); });

  function label(x, y, z, text, small) {
    var g = el("g", { "class": "label" + (small ? " small" : "") }, layers.labels);
    var p = P(x, y, z);
    var t = el("text", { x: p[0], y: p[1], "text-anchor": "middle", "dominant-baseline": "middle" }, g);
    t.textContent = text;
    var b = t.getBBox();
    el("rect", { x: b.x - 8, y: b.y - 4, width: b.width + 16, height: b.height + 8, rx: 6 }, g).parentNode.insertBefore(g.lastChild, t);
    return g;
  }

  // Ground plate, grid and roads.
  var N = 24;
  poly(layers.ground, [P(0, N, -0.6), P(N, N, -0.6), P(N, N, 0), P(0, N, 0)], "plate-side");
  poly(layers.ground, [P(N, 0, -0.6), P(N, N, -0.6), P(N, N, 0), P(N, 0, 0)], "plate-side");
  poly(layers.ground, [P(0, 0), P(N, 0), P(N, N), P(0, N)], "plate-top");
  for (var gi = 1; gi < N; gi++) {
    var a = P(gi, 0), b = P(gi, N), c = P(0, gi), d = P(N, gi);
    el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], "class": "grid" }, layers.ground);
    el("line", { x1: c[0], y1: c[1], x2: d[0], y2: d[1], "class": "grid" }, layers.ground);
  }
  flat(layers.ground, 12, 6, 11.6, 1, "road");
  flat(layers.ground, 12, 7, 1, 16.6, "road");
  flat(layers.ground, 7, 14.7, 5, 1, "road");
  flat(layers.ground, 13, 17, 2.5, 1, "road");
  flat(layers.ground, 0.4, 6, 11.6, 1, "belt");
  for (var bt = 0.9; bt < 12; bt += 0.7) {
    var b1 = P(bt, 6), b2 = P(bt, 7);
    el("line", { x1: b1[0], y1: b1[1], x2: b2[0], y2: b2[1], "class": "belt-tick" }, layers.ground);
  }

  // Paawan's name painted on the plaza.
  var o = P(13.6, 23.1);
  var nameText = el("text", {
    "class": "ground-name",
    transform: "matrix(" + [C, 0.5, -C, 0.5, o[0], o[1]].map(function (n) { return n.toFixed(3); }).join(",") + ")",
    "font-size": 1.25 * U
  }, layers.ground);
  nameText.textContent = "PAAWAN DESAI";

  // Things drawn back to front by depth.
  var things = [];
  function add(depth, fn) { things.push({ depth: depth, fn: fn }); }

  function hit(name, aria, onOpen) {
    var g = el("g", { "class": "hit", tabindex: "0", role: "button", "aria-label": aria }, null);
    g.addEventListener("click", onOpen);
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
    var top = P(12.55, 4.55, 4.95);
    beam = el("polygon", { "class": "tower-beam", points: pts([top, P(12, 6, 0), P(23.6, 6, 0), P(23.6, 7, 0), P(12, 7, 0)]) }, layers.fx);
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
    poly(g, [P(2.6, 22, 0), P(4.2, 22, 0), P(4.2, 22, 1.3), P(2.6, 22, 1.3)], "win");
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
    var f1 = P(19.6, 18.6, 4.2), f2 = P(19.6, 18.6, 6);
    el("line", { x1: f1[0], y1: f1[1], x2: f2[0], y2: f2[1], "class": "wire" }, g);
    poly(g, [f2, P(19.6, 18.6, 5.4), [f2[0] + 22, f2[1] + 6]], "f-t");
  });

  // Security building (Jailbreak the guard).
  add(22.35 + 17, function () {
    var g = hit("security", "Security: jailbreak the guard", function () { open("security"); });
    layers.world.appendChild(g);
    box(g, 21.1, 15.4, 2.5, 3.2, 2.6);
    windows(g, 21.1, 15.4, 2.5, 3.2, 2.6, 0, 0.9);
    box(g, 21.8, 16.4, 1.1, 1.1, 0.5, 2.6);
    var a1 = P(22.35, 16.95, 3.1), a2 = P(22.35, 16.95, 4.3);
    el("line", { x1: a1[0], y1: a1[1], x2: a2[0], y2: a2[1], "class": "wire" }, g);
    el("circle", { cx: a2[0], cy: a2[1], r: 4, "class": "beacon" }, g);
  });

  // Trees.
  [[0.6, 9.4, 1], [0.6, 11, 0.8], [1.6, 10.2, 0.9], [23.3, 12.6, 1], [23.3, 14.2, 0.8], [22.4, 13.3, 0.9],
    [10.4, 13.2, 0.8], [13.9, 13.6, 0.7], [21.8, 20.6, 0.9], [11.2, 21.2, 0.8], [0.8, 17.6, 0.8], [8.8, 12.2, 0.7]]
    .forEach(function (t) { add(t[0] + t[1], function () { tree(layers.world, t[0], t[1], t[2]); }); });

  things.sort(function (m, n) { return m.depth - n.depth; }).forEach(function (t) { t.fn(); });

  // Contract wires between services, drawn over the rooftops.
  var wires = [[0, 5], [1, 2], [2, 7], [3, 8], [4, 9], [6, 7], [1, 6], [3, 4]];
  var wireEls = wires.map(function (w) {
    var m = services[w[0]], n = services[w[1]];
    var p1 = P(m.cx, m.cy, m.h), p2 = P(n.cx, n.cy, n.h);
    return el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], "class": "wire" }, layers.fx);
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
        '<li><a href="' + B + '/about/">About me</a><span>Where I studied, what I do now and what I care about.</span></li>' +
        '<li><a href="' + B + '/cv/">CV</a><span>Experience, education, skills and honors.</span></li>' +
        '<li><a href="' + B + '/files/Paawan_Desai_Resume.pdf">Resume (PDF)</a><span>The one-page version.</span></li>' +
        '<li><a href="https://github.com/' + esc(data.github) + '">GitHub</a><span>Code for the public projects.</span></li>' +
        '<li><a href="https://www.linkedin.com/in/' + esc(data.linkedin) + '">LinkedIn</a><span>Get in touch.</span></li>' +
        "</ul>";
    },
    lab: function () {
      return '<p class="kicker">The Lab</p><h2>Featured work</h2><p>What I\'m building now and the projects I\'m proudest of.</p>' +
        '<button type="button" class="btn primary play" data-open="alchemist">Play Alchemist\'s Trial</button>' +
        list(data.featured) + '<a class="more" href="' + B + '/portfolio/">All projects</a>';
    },
    services: function () {
      return '<p class="kicker">Service District</p><h2>Gauntlet AI builds</h2>' +
        "<p>Built during Gauntlet AI Cohort 7 (Sep to Nov 2026), each one against a real brief and measured with its own evaluation.</p>" +
        '<button type="button" class="btn primary play" data-open="contract">Try it: break a contract</button>' +
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
        "<p>A team of AI agents with fixed roles, so nothing grades its own work.</p><table>" +
        rows.map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>"; }).join("") +
        '</table><button type="button" class="btn primary play" data-open="sneak">Play: sneak a bad PR past the factory</button>' +
        '<a class="more" href="' + B + '/how-i-build/">The full workflow and verification ladder</a>';
    },
    archive: function () {
      return '<p class="kicker">The Archive</p><h2>Earlier work</h2><p>University, research and hackathon projects.</p>' +
        list(data.earlier) + '<a class="more" href="' + B + '/portfolio/">All projects</a>';
    }
  };
  var lastFocus;
  function show(html) {
    if (panel.hidden) lastFocus = document.activeElement;
    panelBody.innerHTML = html;
    panel.hidden = false;
    document.getElementById("hint").style.visibility = "hidden";
    document.getElementById("panel-close").focus({ preventScroll: true });
  }
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
    document.dispatchEvent(new CustomEvent("campus:close"));
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.getElementById("panel-close").addEventListener("click", closePanel);
  document.querySelectorAll("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () { lastFocus = btn; open(btn.getAttribute("data-open")); });
  });

  // Theme toggle.
  var root = document.documentElement;
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t === "dark") return true;
    if (t === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  document.getElementById("theme-toggle").addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* storage can be blocked */ }
  });

  // The tour.
  var belt = 6.5;
  var stationAt = stationX.map(function (sx) { return [sx + 0.5, belt]; });
  var steps = [
    { title: "A pull request starts as a spec", at: [[0.7, belt]],
      text: "Every change on this campus starts the same way: one item from the backlog and a written idea of what done looks like." },
    { title: "Planner", at: [stationAt[0]], station: 0,
      text: "Picks the item and writes a one-page spec with acceptance tests. It never writes code." },
    { title: "Spec critic", at: [stationAt[1]], station: 1,
      text: "Checks the spec against the target and the buyer: is this the right thing, and the smallest version of it? It never approves its own suggestions." },
    { title: "Builder", at: [stationAt[2]], station: 2,
      text: "Writes the tests first, then the code, in its own worktree. It may never edit the acceptance tests to make them pass." },
    { title: "Breaker", at: [stationAt[3]], station: 3,
      text: "A fresh agent that sees only the spec and the diff, runs everything and tries to break it. It never sees the builder's reasoning." },
    { title: "Scorer", at: [stationAt[4]], station: 4,
      text: "A tester loop replays the scenario catalog against the branch build. It can't change the expected answers." },
    { title: "Company Agent Layer checks the contracts", at: [[12.5, belt]], bad: true, beam: true,
      text: "Before merge, the layer I'm building reads the contract graph across every repo. This (illustrative) change renames a field two other services read, so it comments on the PR with exactly which teams and fields are affected." },
    { title: "Back to the line", at: [stationAt[2]], bad: true, station: 2,
      text: "The fix goes back through the same stations: the builder updates the change, then the breaker and scorer run again." },
    { title: "Contracts hold", at: [stationAt[3], stationAt[4], [12.5, belt]], good: true, beam: true,
      text: "This time the layer finds nothing that breaks, and both services stay green." },
    { title: "Shipped", at: [[12.5, 15.2], [7.8, 15.2]], good: true, shipped: true,
      text: "The change ships and lands in the Lab with the rest of the featured work. Every project here went through some version of this line. Click any building to look inside." }
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

  // Shared with campus-play.js (games, ambient life, achievements and music).
  window.Campus = {
    data: data, P: P, el: el, box: box, layers: layers, svg: svg, U: U,
    stations: stations, stationX: stationX, services: services, wires: wires, wireEls: wireEls,
    beam: function (on) { if (beam) beam.classList.toggle("on", on); },
    views: views, open: open, show: show, close: closePanel, esc: esc, track: track,
    reduceMotion: reduceMotion, touring: function () { return !tour.hidden; }
  };
})();
