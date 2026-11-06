/* Campus guide: a short walkthrough that points at each part of the page, shown on the first visit
   and again from "How this works". */
(function () {
  "use strict";

  var K = window.Campus;
  if (!K) return;
  var phone = window.matchMedia("(max-width: 700px)").matches;
  var point = K.canHover ? "Hover over" : "Tap";

  var steps = [
    { target: "#campus", title: "Welcome",
      text: "This is my portfolio, laid out as a small campus. This guide takes about 30 seconds and shows you where everything is." },
    { target: '.hit[data-name="office"]', title: "Buildings hold the work",
      text: point + " any building to look inside. Each one is a part of my work. This is the Front Office, with my background and CV.",
      // On phones the panel is a sheet over the map, so the guide leaves it closed there.
      enter: function () { if (!phone) K.open("office"); } },
    { target: phone ? "#campus" : "#panel", title: "Read without leaving",
      text: (phone ? "Write-ups open in a panel on this page" : "Write-ups open right here in this panel") + ", and links to other sites open in a new tab, so the map and any game you're playing stay where you left them." },
    { target: ".games", title: "Games",
      text: "Each game shows one idea from my work, like catching a bug before it merges. Pick a difficulty and play in the panel.",
      enter: function () { K.close(); } },
    { target: ".districts", title: "Prefer a list?",
      text: "Every part of the campus is also here as a button." },
    { target: ".turn", title: "Look around",
      text: (phone ? "Swipe the map to pan, and use these buttons" : "Drag the map sideways, or use these buttons,") +
        " to turn the campus all the way round. Center snaps it back to the front." },
    { target: phone ? ".dock" : ".actions", title: "Short on time?",
      text: "\"Short on time?\" gives you the highlights in one panel. \"Watch a PR ship\" walks one change through the AI agents I build with. My resume is always one click away." }
  ];

  var root = document.createElement("div");
  root.className = "guide";
  root.hidden = true;
  root.innerHTML =
    '<div class="guide-spot" aria-hidden="true"></div>' +
    '<div class="guide-card" role="dialog" aria-modal="false" aria-labelledby="guide-title">' +
    '<p class="guide-count" id="guide-count"></p><h2 id="guide-title"></h2><p id="guide-text"></p>' +
    '<div class="guide-nav"><button type="button" class="btn" id="guide-back">Back</button>' +
    '<button type="button" class="btn primary" id="guide-next">Next</button>' +
    '<button type="button" class="btn ghost" id="guide-skip">Skip</button></div>' +
    '<p class="guide-more">Want the longer version? <button type="button" class="linkish" id="guide-tour">Watch a PR ship (1 min)</button></p>' +
    "</div>";
  document.body.appendChild(root);
  var spot = root.querySelector(".guide-spot"), card = root.querySelector(".guide-card");
  var cur = -1;
  K.blockHover(function () { return !root.hidden; });

  function target() {
    var list = document.querySelectorAll(steps[cur].target);
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.width && r.height) return list[i];
    }
    return null;
  }

  function layout() {
    if (cur < 0) return;
    var t = target();
    var vw = window.innerWidth, vh = window.innerHeight, pad = 8;
    var r = t ? t.getBoundingClientRect() : { left: vw / 2, top: vh / 2, width: 0, height: 0, right: vw / 2, bottom: vh / 2 };
    var big = r.width * r.height > vw * vh * 0.45;
    spot.style.left = (r.left - pad) + "px";
    spot.style.top = (r.top - pad) + "px";
    spot.style.width = (r.width + pad * 2) + "px";
    spot.style.height = (r.height + pad * 2) + "px";
    spot.classList.toggle("soft", big);
    var cw = card.offsetWidth, ch = card.offsetHeight, x, y;
    if (big) { x = (vw - cw) / 2; y = Math.max(12, Math.min(vh - ch - 12, r.top + r.height * 0.55)); }
    else {
      x = Math.max(12, Math.min(vw - cw - 12, r.left + r.width / 2 - cw / 2));
      if (r.bottom + pad + 12 + ch < vh) y = r.bottom + pad + 12;
      else if (r.top - pad - 12 - ch > 0) y = r.top - pad - 12 - ch;
      else {
        // No room above or below: sit beside it, or failing that at the bottom of the screen.
        y = Math.max(12, Math.min(vh - ch - 12, r.top));
        if (r.left - cw - 24 > 0) x = r.left - cw - 24;
        else if (r.right + cw + 24 < vw) x = r.right + 24;
        else y = vh - ch - 12;
      }
    }
    card.style.left = Math.round(x) + "px";
    card.style.top = Math.round(y) + "px";
  }

  function go(i) {
    if (i < 0) return;
    if (i >= steps.length) { end(true); return; }
    cur = i;
    var st = steps[i];
    if (st.enter) st.enter();
    document.getElementById("guide-count").textContent = (i + 1) + " of " + steps.length;
    document.getElementById("guide-title").textContent = st.title;
    document.getElementById("guide-text").textContent = st.text;
    document.getElementById("guide-back").disabled = i === 0;
    document.getElementById("guide-next").textContent = i === steps.length - 1 ? "Start exploring" : "Next";
    var t = target();
    if (t && phone && t.scrollIntoView) t.scrollIntoView({ block: "center", behavior: K.reduceMotion ? "auto" : "smooth" });
    layout();
    // Let the panel or a smooth scroll settle before measuring again.
    setTimeout(layout, 60);
    setTimeout(layout, 420);
    setTimeout(layout, 900);
  }

  function start() {
    K.track("guide-start");
    if (K.turnTo) K.turnTo(0, true);
    root.hidden = false;
    document.body.classList.add("guiding");
    go(0);
    document.getElementById("guide-next").focus({ preventScroll: true });
  }
  function end(finished) {
    if (root.hidden) return;
    K.track(finished ? "guide-finish" : "guide-skip-" + (cur + 1));
    root.hidden = true;
    document.body.classList.remove("guiding");
    if (cur >= 1 && cur <= 2) K.close();
    cur = -1;
    try { localStorage.setItem("campus-welcomed", "1"); } catch (e) { /* storage can be blocked */ }
  }

  document.getElementById("guide-next").addEventListener("click", function () { go(cur + 1); });
  document.getElementById("guide-back").addEventListener("click", function () { go(cur - 1); });
  document.getElementById("guide-skip").addEventListener("click", function () { end(false); });
  document.getElementById("guide-tour").addEventListener("click", function () { end(false); document.getElementById("tour-start").click(); });
  document.addEventListener("keydown", function (e) {
    if (root.hidden) return;
    if (e.key === "Escape") { e.stopPropagation(); end(false); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
  }, true);
  window.addEventListener("resize", layout);
  window.addEventListener("scroll", layout, { passive: true });
  var stage = document.querySelector(".stage");
  if (stage) stage.addEventListener("scroll", layout, { passive: true });
  document.getElementById("help-btn").addEventListener("click", start);

  var seen = false;
  try { seen = localStorage.getItem("campus-welcomed") === "1"; } catch (e) { seen = true; }
  if (!seen && !/[?&]noguide/.test(location.search)) setTimeout(start, 400);
  K.guide = { start: start, end: end };
})();
