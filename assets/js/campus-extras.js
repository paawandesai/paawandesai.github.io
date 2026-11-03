/* Campus extras: daily challenge, recruiter fast path, Ship Day, Eval Lab, a hidden terminal, and a campus that follows the visitor's clock. Everything here is made up; nothing reads real data. */
(function () {
  "use strict";

  var K = window.Campus;
  if (!K || !K.arcade) return;
  var A = K.arcade;
  var esc = K.esc;
  var Sound = K.sound;
  var base = K.data.base;
  var root = document.documentElement;

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* storage can be blocked */ }
    return null;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(a, r) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function copyText(text, btn) {
    function done() { var o = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = o; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
      t.remove();
    }
  }
  function email() {
    var a = document.querySelector('.foot a[href^="mailto:"]');
    return a ? a.getAttribute("href") : "#";
  }
  function project(slug) {
    var all = [].concat(K.data.featured || [], K.data.gauntlet || [], K.data.earlier || []);
    return all.filter(function (p) { return p.url.indexOf("/" + slug + "/") >= 0; })[0];
  }
  function shareBlock(text) {
    return '<pre class="share">' + esc(text) + "</pre>" +
      '<div class="arcade-actions"><button type="button" class="btn primary" data-act="copy">Copy result</button>' +
      '<a class="btn" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent("https://paawankdesai.com/") + '">Share on LinkedIn</a></div>';
  }
  function wireShare(box, text) {
    var b = box.querySelector('[data-act="copy"]');
    if (b) b.addEventListener("click", function () { copyText(text, b); K.track("share-copy"); });
  }

  // ================= Daily challenge =================
  var EPOCH = Date.UTC(2026, 10, 1);
  function today() {
    var d = new Date();
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 864e5) + 1;
  }
  function untilMidnight() {
    var d = new Date(), m = new Date(d); m.setHours(24, 0, 0, 0);
    var mins = Math.round((m - d) / 60000);
    return Math.floor(mins / 60) + "h " + (mins % 60) + "m";
  }
  function dailyStreak() {
    var n = today(), s = 0;
    while (store("daily-" + (n - s))) s++;
    return s;
  }
  function dailyShare(no, res) {
    return "Paawan's campus · Daily #" + no + "\n" + res.grid + "  guard " + (res.guard ? "🔓 in " + res.tries : "🔒") + "\n" + res.score + " points · paawankdesai.com";
  }

  K.views.daily = function () {
    var no = today(), res = store("daily-" + no);
    var head = '<p class="kicker">Daily challenge</p><h2>Daily #' + no + "</h2>";
    if (res) {
      return head + '<div class="arcade" id="daily"><p>You already played today. Your streak: <b>' + dailyStreak() + " day" + (dailyStreak() === 1 ? "" : "s") + "</b>.</p>" +
        shareBlock(dailyShare(no, res)) + '<p class="best">The next one unlocks in ' + untilMidnight() + ".</p></div>";
    }
    return head + '<div class="arcade" id="daily"><p>Same puzzle for everyone today. <b>Four pull requests</b>: click the buggy line or approve the clean ones, one try each. Then <b>one guard</b> to talk past, in six messages or fewer.</p>' +
      '<p class="best">Your streak: <b>' + dailyStreak() + '</b> · You get one go per day, and a result you can share.</p>' +
      '<button type="button" class="btn primary big" data-act="start">Start Daily #' + no + "</button></div>";
  };

  function mountDaily(root) {
    var box = root.querySelector("#daily");
    var no = today(), res = store("daily-" + no);
    if (res) { wireShare(box, dailyShare(no, res)); return; }
    box.querySelector('[data-act="start"]').addEventListener("click", function () { playDaily(box, no); });
  }

  function playDaily(box, no) {
    K.track("daily-start");
    var r = rng(no * 7919 + 17);
    var picks = seededShuffle(A.SNIPPETS, r).slice(0, 4);
    var level = Math.floor(r() * 5);
    var marks = [], score = 0, i = 0, timer = null;

    function pr() {
      var s = picks[i], left = 15, locked = false, last = performance.now();
      box.innerHTML = '<div class="hud-row"><span>Daily <b>#' + no + "</b></span><span>PR <b>" + (i + 1) + " / 4</b></span><span>Score <b>" + score + '</b></span><span class="grid-mini">' + marks.join("") + "</span></div>" +
        '<div class="diff"><div class="diff-head"><span>' + esc(s.file) + '</span><span class="merge">merges in <b data-k="pr">15</b>s</span></div>' +
        '<div class="meter-lg pr"><i data-k="bar"></i></div><div class="code">' +
        s.lines.map(function (l, k) { return '<button type="button" class="ln" data-i="' + k + '"><span class="no">' + (k + 1) + "</span><code>" + esc(l) + "</code></button>"; }).join("") +
        '</div></div><div class="arcade-actions"><button type="button" class="btn ok-btn" data-act="approve">✓ Approve, it\'s clean</button></div><p class="feedback" data-k="fb">One try. Find the bug, or approve if there isn\'t one.</p>';
      function settle(mark, text, good) {
        if (locked) return;
        locked = true;
        clearInterval(timer);
        marks.push(mark);
        s.bug.forEach(function (b) { var e = box.querySelector('.ln[data-i="' + b + '"]'); if (e) e.classList.add("hit"); });
        var fb = box.querySelector('[data-k="fb"]');
        fb.textContent = text; fb.className = "feedback " + (good ? "good" : "bad");
        Sound.play(good ? "ok" : "caught");
        var act = box.querySelector(".arcade-actions");
        act.innerHTML = '<button type="button" class="btn primary" data-act="next">' + (i < 3 ? "Next PR" : "On to the guard") + "</button>";
        act.querySelector('[data-act="next"]').addEventListener("click", function () { i++; if (i < 4) pr(); else guard(); });
        act.querySelector('[data-act="next"]').focus();
      }
      box.querySelectorAll(".ln").forEach(function (b) {
        b.addEventListener("click", function () {
          var k = +b.getAttribute("data-i");
          if (s.bug.indexOf(k) >= 0) { var pts = 100 + Math.round(left) * 10; score += pts; settle("🟩", "+" + pts + " · " + s.why, true); }
          else { b.classList.add("miss"); settle("🟥", s.bug.length ? "Not that one. " + s.why : "This PR was clean. Nothing to catch.", false); }
        });
      });
      box.querySelector('[data-act="approve"]').addEventListener("click", function () {
        if (!s.bug.length) { var pts = 80 + Math.round(left) * 10; score += pts; settle("🟩", "+" + pts + " · Clean PR, approved.", true); }
        else settle("🟥", "That one had a bug. " + s.why, false);
      });
      timer = setInterval(function () {
        if (document.hidden) { last = performance.now(); return; }
        var now = performance.now(); left -= (now - last) / 1000; last = now;
        var t = box.querySelector('[data-k="pr"]'), bar = box.querySelector('[data-k="bar"]');
        if (t) t.textContent = Math.max(0, Math.ceil(left));
        if (bar) bar.style.width = Math.max(0, left / 15 * 100) + "%";
        if (left <= 0) settle("⬛", s.bug.length ? "It merged. " + s.why : "It merged on its own. It was clean, but no points.", false);
      }, 100);
      A.setRunning({ stop: function () { clearInterval(timer); } });
    }

    function guard() {
      A.playGuard(box, level, { diff: "normal", maxTries: 6, onEnd: function (g) {
        if (g.won) score += 300 + (6 - g.tries) * 50;
        var res = { grid: marks.join(""), guard: g.won, tries: g.tries, score: score };
        store("daily-" + no, res);
        K.unlock("daily");
        K.track("daily-done");
        var text = dailyShare(no, res);
        box.innerHTML = '<div class="end"><p class="kicker">Daily #' + no + ' done</p><p class="big-score">' + score + "</p>" +
          "<p>Streak: <b>" + dailyStreak() + "</b> · Come back in " + untilMidnight() + " for the next one.</p></div>" + shareBlock(text);
        wireShare(box, text);
      } });
    }
    pr();
  }

  // ================= Ship Day =================
  var RANKS = [[0, "Intern"], [900, "Engineer"], [1700, "Senior engineer"], [2500, "Staff engineer"], [3300, "Principal engineer"]];
  K.views.shipday = function () {
    return '<p class="kicker">Arcade · Story mode</p><h2>Ship Day</h2><div class="arcade" id="shipday">' +
      "<p>One full shift across all three games. In the <b>morning</b> you catch bugs before they merge, in the <b>afternoon</b> you warn the teams a change is about to break, and in the <b>evening</b> you stop an attacker from talking the support agent into a refund.</p>" +
      A.diffPicker("shipday", ["Gentle clocks, the easy guard", "Real deadlines, a mid-level guard", "Tight clocks, the hardest guard"]) +
      '<p class="best">Best: ' + A.bestLine("shipday") + "</p>" +
      '<button type="button" class="btn primary big" data-act="start">Clock in</button></div>';
  };
  function mountShipday(root) {
    var box = root.querySelector("#shipday");
    A.wireDiff(box, "shipday");
    box.querySelector('[data-act="start"]').addEventListener("click", function () { playShipday(box); });
  }
  function interlude(box, time, title, text, button, go) {
    box.innerHTML = '<div class="end interlude"><p class="kicker">' + esc(time) + '</p><h3>' + esc(title) + "</h3><p>" + text + "</p>" +
      '<button type="button" class="btn primary big" data-act="go">' + esc(button) + "</button></div>";
    var b = box.querySelector('[data-act="go"]');
    b.addEventListener("click", go);
    b.focus();
  }
  function playShipday(box) {
    var diff = A.getDiff("shipday");
    var guardLevel = { easy: 0, normal: 2, hard: 4 }[diff];
    var parts = { bugs: 0, blast: 0, guard: 0 };
    K.track("shipday-start");
    interlude(box, "9:00 am", "Morning: the merge queue", "Forty seconds of pull requests. Catch the bugs, approve the clean ones.", "Start the morning", function () {
      A.playBreaker(box, { diff: diff, total: 40, onEnd: function (r) {
        parts.bugs = r.score;
        interlude(box, "1:30 pm", "Afternoon: a breaking change", "Morning score: <b>" + r.score + "</b>. Now billing-api is renaming fields. Warn exactly the teams who read them, three times.", "Start the afternoon", function () {
          A.playBlast(box, { diff: diff, rounds: 3, onEnd: function (b) {
            parts.blast = Math.max(0, b.score);
            interlude(box, "5:45 pm", "Evening: someone's at the support desk", "Afternoon score: <b>" + parts.blast + "</b>. Last job: you're the attacker now. Talk the guard into the refund in six messages to prove the hole exists before a real attacker finds it.", "Start the evening", function () {
              A.playGuard(box, guardLevel, { diff: diff, maxTries: 6, onEnd: function (g) {
                parts.guard = g.won ? 400 + (6 - g.tries) * 60 : 0;
                finish();
              } });
            });
          } });
        });
      } });
    });
    function finish() {
      var total = parts.bugs + parts.blast + parts.guard;
      var rank = RANKS.filter(function (r) { return total >= r[0]; }).pop()[1];
      var b = A.best("shipday-" + diff, total);
      K.unlock("shipday");
      K.track("shipday-done");
      var text = "Ship Day on paawankdesai.com (" + diff + ")\n🐛 " + parts.bugs + "  💥 " + parts.blast + "  🛡 " + parts.guard + "\n" + total + " points · " + rank;
      box.innerHTML = '<div class="end"><p class="kicker">Shift over · ' + esc(diff) + '</p><p class="big-score">' + total + '</p><p class="rank">' + esc(rank) + "</p>" +
        "<p>Bugs <b>" + parts.bugs + "</b> · Blast radius <b>" + parts.blast + "</b> · Guard <b>" + parts.guard + "</b> · Best: <b>" + b + "</b></p>" +
        '<p class="lesson">That\'s a normal day for the agents on this campus: review, impact analysis and red-teaming, all before merge.</p></div>' +
        shareBlock(text) + '<p><button type="button" class="btn" data-act="again">Another shift</button></p>';
      wireShare(box, text);
      box.querySelector('[data-act="again"]').addEventListener("click", function () { K.open("shipday"); });
    }
  }

  // ================= Eval Lab =================
  var EVAL = { easy: [75, 25, 11], normal: [68, 32, 14], hard: [62, 38, 16] };
  function evalData(diff) {
    var r = rng({ easy: 11, normal: 23, hard: 37 }[diff]);
    var cfg = EVAL[diff], out = [];
    function gauss() { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    for (var i = 0; i < 40; i++) {
      var pos = i < 12;
      var s = Math.round((pos ? cfg[0] : cfg[1]) + gauss() * cfg[2]);
      out.push({ pos: pos, s: Math.max(2, Math.min(98, s)) });
    }
    return out;
  }
  function stats(data, t) {
    var tp = 0, fp = 0, fn = 0, tn = 0;
    data.forEach(function (d) { var f = d.s >= t; if (d.pos && f) tp++; else if (!d.pos && f) fp++; else if (d.pos) fn++; else tn++; });
    var p = tp + fp ? tp / (tp + fp) : 1, rc = tp / (tp + fn), f1 = p + rc ? 2 * p * rc / (p + rc) : 0;
    return { tp: tp, fp: fp, fn: fn, tn: tn, p: p, r: rc, f1: f1 };
  }
  function goals(data) {
    var minPos = Math.min.apply(null, data.filter(function (d) { return d.pos; }).map(function (d) { return d.s; }));
    var maxNeg = Math.max.apply(null, data.filter(function (d) { return !d.pos; }).map(function (d) { return d.s; }));
    var p1 = stats(data, minPos).p, r2 = stats(data, maxNeg + 1).r, bestF = 0;
    for (var t = 0; t <= 100; t++) bestF = Math.max(bestF, stats(data, t).f1);
    function fl(x) { return Math.floor(x * 100 + 1e-9) / 100; }
    return [
      { text: "Catch every fraud (recall 100%) with precision of at least " + Math.round(fl(p1) * 100) + "%.", ok: function (s) { return s.r === 1 && s.p >= fl(p1) - 1e-9; } },
      { text: "No false alarms (precision 100%) while catching at least " + Math.round(fl(r2) * 100) + "% of fraud.", ok: function (s) { return s.p === 1 && s.tp > 0 && s.r >= fl(r2) - 1e-9; } },
      { text: "Find the balance: F1 of " + fl(bestF - 0.02).toFixed(2) + " or better.", ok: function (s) { return s.f1 >= fl(bestF - 0.02) - 1e-9; } }
    ];
  }

  K.views.evallab = function () {
    return '<p class="kicker">Arcade · The Lab</p><h2>Eval Lab</h2><div class="arcade" id="evallab">' +
      "<p>A model has scored 40 payments for fraud risk. <b>Drag the threshold</b>: everything to the right gets flagged. Hit each target to clear the lab.</p>" +
      A.diffPicker("evallab", ["The model separates fraud cleanly", "Some overlap", "Lots of overlap, every point counts"]) +
      '<button type="button" class="btn primary big" data-act="start">Open the lab</button></div>';
  };
  function mountEval(root) {
    var box = root.querySelector("#evallab");
    A.wireDiff(box, "evallab");
    box.querySelector('[data-act="start"]').addEventListener("click", function () { playEval(box); });
  }
  function playEval(box) {
    var diff = A.getDiff("evallab"), data = evalData(diff), G = goals(data), cur = 0;
    K.track("evallab-start");
    var W = 600, H = 130, X = function (s) { return 20 + s / 100 * (W - 40); };
    var rows = { true: {}, false: {} };
    var dots = data.map(function (d) {
      var key = Math.round(d.s / 3), lane = rows[d.pos][key] = (rows[d.pos][key] || 0) + 1;
      var off = lane === 1 ? 0 : (lane % 2 ? -1 : 1) * Math.floor(lane / 2) * 9;
      return '<circle class="' + (d.pos ? "pos" : "neg") + '" cx="' + X(d.s).toFixed(1) + '" cy="' + ((d.pos ? 36 : 82) + off) + '" r="5"/>';
    }).join("");
    box.innerHTML = '<div class="hud-row"><span>Eval Lab</span><span class="tag-diff">' + diff + '</span><span><i class="key pos"></i>fraud <i class="key neg"></i>legit</span></div>' +
      '<svg class="strip" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Payments plotted by risk score from 0 on the left to 100 on the right">' +
      '<rect class="flag-zone" data-k="zone" x="0" y="0" width="0" height="' + (H - 18) + '"/>' +
      '<text class="lane" x="4" y="14">fraud</text><text class="lane" x="4" y="' + (H - 24) + '">legit</text>' + dots +
      '<line class="thr" data-k="thr" x1="0" x2="0" y1="0" y2="' + (H - 18) + '"/>' +
      '<line class="axis" x1="20" x2="' + (W - 20) + '" y1="' + (H - 14) + '" y2="' + (H - 14) + '"/>' +
      '<text class="tick" x="20" y="' + (H - 2) + '">0</text><text class="tick" x="' + (W / 2) + '" y="' + (H - 2) + '" text-anchor="middle">50</text><text class="tick" x="' + (W - 20) + '" y="' + (H - 2) + '" text-anchor="end">100</text></svg>' +
      '<label class="slider"><span>Flag at risk score ≥ <b data-k="t">50</b></span><input type="range" min="0" max="100" step="1" value="50" data-k="range"></label>' +
      '<div class="ev-grid"><div class="cm"><span class="tp">Fraud caught<b data-k="tp"></b></span><span class="fp">False alarms<b data-k="fp"></b></span><span class="fn">Fraud missed<b data-k="fn"></b></span><span class="tn">Cleared correctly<b data-k="tn"></b></span></div>' +
      '<div class="ev-bars"><p>Precision <b data-k="p"></b><span class="meter-lg"><i data-k="pb"></i></span></p><p>Recall <b data-k="r"></b><span class="meter-lg"><i data-k="rb"></i></span></p><p>F1 <b data-k="f"></b><span class="meter-lg"><i data-k="fb"></i></span></p></div></div>' +
      '<ol class="goals">' + G.map(function (g, k) { return '<li data-g="' + k + '">' + esc(g.text) + "</li>"; }).join("") + "</ol>" +
      '<p class="feedback" data-k="msg"></p>';
    var range = box.querySelector('[data-k="range"]');
    function $(k) { return box.querySelector('[data-k="' + k + '"]'); }
    function pct(x) { return Math.round(x * 100) + "%"; }
    function draw() {
      var t = +range.value, s = stats(data, t), x = X(t);
      $("t").textContent = t;
      $("thr").setAttribute("x1", x); $("thr").setAttribute("x2", x);
      $("zone").setAttribute("x", x); $("zone").setAttribute("width", W - x);
      $("tp").textContent = s.tp; $("fp").textContent = s.fp; $("fn").textContent = s.fn; $("tn").textContent = s.tn;
      $("p").textContent = pct(s.p); $("r").textContent = pct(s.r); $("f").textContent = s.f1.toFixed(2);
      $("pb").style.width = pct(s.p); $("rb").style.width = pct(s.r); $("fb").style.width = pct(s.f1);
      box.querySelectorAll(".goals li").forEach(function (li, k) { li.classList.toggle("now", k === cur); });
      if (cur < G.length && G[cur].ok(s)) {
        box.querySelector('[data-g="' + cur + '"]').classList.add("done");
        Sound.play("ok");
        cur++;
        if (cur === G.length) {
          K.unlock("calibrated");
          K.track("evallab-done");
          $("msg").className = "feedback good";
          $("msg").innerHTML = "Lab cleared. There's no single right threshold: it depends on what a miss costs versus a false alarm. Picking it on purpose, with numbers, is what evals are for. " +
            '<a href="' + base + '/portfolio/nacha-slm/">See how I eval a small model</a>';
        } else {
          $("msg").className = "feedback good";
          $("msg").textContent = "Target hit. Next one.";
        }
        box.querySelectorAll(".goals li").forEach(function (li, k) { li.classList.toggle("now", k === cur); });
      }
    }
    range.addEventListener("input", draw);
    draw();
    range.focus();
  }

  A.mount("daily", mountDaily);
  A.mount("shipday", mountShipday);
  A.mount("evallab", mountEval);

  // ================= Recruiter fast path =================
  // Topics, not job titles: a wide spread so nobody gets boxed into one role.
  var ROLES = {
    agents: { name: "Agents and AI systems", projects: ["company-agent-layer", "call-center-agent", "churn-agent"],
      line: "Agents that do real work, with guardrails that keep them in bounds. The largest is Company Agent Layer, which reviews pull requests across an entire company." },
    evals: { name: "Evals, security and red-teaming", projects: ["redteam-engine-auditlens", "clinical-copilot-eval", "nacha-slm"],
      line: "A large part of my work is testing AI systems by attacking them. Start with the red-team engine, a platform that continuously attacks a clinical assistant, and a small model benchmarked against frontier models." },
    models: { name: "Training and machine learning", projects: ["nacha-slm", "energy_ai_hackathon_2025", "urban-insights"],
      line: "Training and modeling work, from a small model that outperforms much larger ones on a narrow task to earlier forecasting and vision projects." },
    products: { name: "Shipping whole products", projects: ["supplement-ledger", "zoning-engine", "alchemists-trial"],
      line: "Complete products, built end to end. An ordering system where every cent reconciles, a zoning tool that cites its sources, and a game where chemistry is the magic system." },
    data: { name: "Data and real-time systems", projects: ["telemetry-pipeline", "prediction-market-aggregator", "interpreter-workbench"],
      line: "Systems that stay correct while data streams in, including device telemetry, live market matching and realtime speech." },
    finance: { name: "Fintech and markets", projects: ["prediction-market-aggregator", "solana-0dte-markets", "quantum-monte-carlo"],
      line: "Finance and markets work, including order routing across prediction markets, daily markets on Solana, and an option pricer that replays bit for bit." },
    hardware: { name: "Hardware and engineering", projects: ["post-quantum-cryptography", "deployable-structures", "energy_ai_hackathon_2025"],
      line: "My electrical and computer engineering work, including a post-quantum crypto accelerator in Verilog, earthquake-resistant structures and energy modeling." },
    curious: { name: "Surprise me", projects: [],
      line: "Here are three at random. After that, try today's daily challenge or explore on your own. Every building opens." }
  };
  var GROUP_SPOT = { featured: "lab", gauntlet: "", earlier: "archive" };
  function groupOf(p) {
    if ((K.data.featured || []).indexOf(p) >= 0) return "featured";
    if ((K.data.gauntlet || []).indexOf(p) >= 0) return "gauntlet";
    return "earlier";
  }
  K.views.recruiter = function () {
    return '<p class="kicker">Short on time?</p><h2>What do you want to see first?</h2><p>Pick a topic and I\'ll point you to the most relevant work. Most projects cover more than one of these.</p>' +
      '<div class="role-pick">' + Object.keys(ROLES).map(function (k) { return '<button type="button" class="opt" data-role="' + k + '">' + esc(ROLES[k].name) + "</button>"; }).join("") + "</div>";
  };
  function spotlight(names) {
    document.querySelectorAll("#campus .hit.spot").forEach(function (g) { g.classList.remove("spot"); });
    (names || []).forEach(function (n) { document.querySelectorAll('#campus .hit[data-name="' + n + '"]').forEach(function (g) { g.classList.add("spot"); }); });
  }
  function showRole(k, bodyEl) {
    var R = ROLES[k];
    store("campus-role", k);
    K.track("recruiter-" + k);
    var items = R.projects.map(project).filter(Boolean);
    if (!items.length) items = A.shuffle([].concat(K.data.featured || [], K.data.gauntlet || [], K.data.earlier || [])).slice(0, 3);
    spotlight(items.map(function (p) { return GROUP_SPOT[groupOf(p)]; }));
    // Also light the project's own building or crate when it has one on the map.
    items.forEach(function (p) {
      document.querySelectorAll("#campus .hit").forEach(function (g) { if (g.getAttribute("aria-label") === p.title) g.classList.add("spot"); });
    });
    bodyEl.innerHTML = '<p class="kicker">' + esc(R.name) + "</p><h2>Start here</h2><p>" + esc(R.line) + "</p><ul>" +
      items.map(function (p) { return '<li><a href="' + p.url + '">' + esc(p.title) + "</a><span>" + esc(p.excerpt) + "</span></li>"; }).join("") + "</ul>" +
      '<p class="hint-line">The highlighted buildings on the map hold more of the same.</p>' +
      '<div class="arcade-actions"><a class="btn primary" href="' + base + '/files/Paawan_Desai_Resume.pdf">Resume (PDF)</a><a class="btn" href="' + email() + '">Email me</a>' +
      '<a class="btn" href="https://www.linkedin.com/in/' + esc(K.data.linkedin) + '">LinkedIn</a></div>' +
      '<p><button type="button" class="btn ghost" data-act="roles">Pick a different topic</button>' + (k === "curious" ? ' <button type="button" class="btn" data-act="daily">Play the daily</button>' : "") + "</p>";
    bodyEl.querySelector('[data-act="roles"]').addEventListener("click", function () { K.open("recruiter"); });
    var d = bodyEl.querySelector('[data-act="daily"]');
    if (d) d.addEventListener("click", function () { K.open("daily"); });
  }
  document.addEventListener("campus:open", function (e) {
    if (e.detail.key !== "recruiter") return;
    e.detail.body.querySelectorAll("[data-role]").forEach(function (b) {
      b.addEventListener("click", function () { showRole(b.getAttribute("data-role"), e.detail.body); });
    });
  });
  document.addEventListener("campus:close", function () { spotlight([]); });
  var fast = document.getElementById("fast-path");
  if (fast) fast.addEventListener("click", function () { K.open("recruiter"); });

  // Daily pill in the HUD.
  var dailyBtn = document.getElementById("daily-btn");
  function renderDaily() {
    if (!dailyBtn) return;
    var done = !!store("daily-" + today());
    dailyBtn.innerHTML = (done ? "✓ " : "★ ") + "Daily #" + today() + (done ? "" : '<span class="new">new</span>');
  }
  if (dailyBtn) dailyBtn.addEventListener("click", function () { K.open("daily"); });
  renderDaily();
  document.addEventListener("campus:close", renderDaily);

  // ================= Hidden terminal =================
  var term = document.createElement("div");
  term.className = "term-overlay";
  term.hidden = true;
  term.setAttribute("role", "dialog");
  term.setAttribute("aria-label", "Terminal");
  term.innerHTML = '<div class="term-bar"><span>visitor@paawan-campus: ~</span><button type="button" aria-label="Close terminal">×</button></div>' +
    '<div class="term-out" aria-live="polite"></div><form class="term-line"><label class="sr" for="term-in">Command</label><span class="ps1">$</span><input id="term-in" autocomplete="off" spellcheck="false" autocapitalize="off"></form>';
  document.body.appendChild(term);
  var out = term.querySelector(".term-out"), tin = term.querySelector("#term-in"), hist = [], hi = 0;
  function print(html, cls) {
    var p = document.createElement("div");
    p.className = "tl " + (cls || "");
    p.innerHTML = html;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  }
  function openTerm() {
    if (!term.hidden) return;
    term.hidden = false;
    if (!out.childNodes.length) {
      print("Paawan's campus shell. Nothing here touches a real system.");
      print('Type <b>help</b> to see what you can do.');
    }
    K.unlock("shell");
    K.track("terminal-open");
    tin.focus();
  }
  function closeTerm() { term.hidden = true; }
  term.querySelector(".term-bar button").addEventListener("click", closeTerm);
  var slug = function (p) { return p.url.replace(/\/$/, "").split("/").pop(); };
  var GAMES = { breaker: "breaker", blast: "blast", guard: "guard", shipday: "shipday", daily: "daily", evallab: "evallab", eval: "evallab" };
  var PLACES = { office: "office", lab: "lab", services: "services", factory: "factory", archive: "archive", security: "security", achievements: "achievements" };
  var CMDS = {
    help: function () {
      print(["<b>ls</b> [projects|games]  list things", "<b>open</b> &lt;name&gt;  open a building, project, resume or about", "<b>play</b> &lt;game&gt;  breaker, blast, guard, shipday, daily, evallab",
        "<b>whoami</b>  <b>date</b>  <b>history</b>  <b>clear</b>  <b>exit</b>", "<b>theme</b> sun|light|dark   <b>sound</b> on|off", "There are a few more. Engineers usually find them."].join("<br>"));
    },
    ls: function (a) {
      if (a[0] === "projects") print([].concat(K.data.featured, K.data.gauntlet).map(function (p) { return esc(slug(p)); }).join("  "));
      else if (a[0] === "games") print("breaker  blast  guard  shipday  daily  evallab");
      else print('about/  projects/  games/  resume.pdf  <span class="dim">secrets.txt</span>');
    },
    cat: function (a) {
      var f = (a[0] || "").replace(/\/$/, "");
      if (f === "secrets.txt") print("There are no secrets here. Though root might be able to hire someone…");
      else if (f === "resume.pdf") print("That's a binary file. Try <b>open resume</b>.");
      else if (f === "about") print(esc(K.data.bio));
      else print("cat: " + esc(f || "") + ": No such file. Try <b>ls</b>.");
    },
    open: function (a) {
      var n = (a[0] || "").toLowerCase();
      if (n === "resume" || n === "resume.pdf") { print("Opening the resume…"); window.open(base + "/files/Paawan_Desai_Resume.pdf", "_blank"); return; }
      if (n === "about") { location.href = base + "/about/"; return; }
      if (PLACES[n]) { closeTerm(); K.open(PLACES[n]); return; }
      var p = [].concat(K.data.featured, K.data.gauntlet, K.data.earlier).filter(function (x) { return slug(x) === n; })[0];
      if (p) { location.href = p.url; return; }
      print("open: nothing called " + esc(n) + ". Try <b>ls projects</b> or a building: office, lab, services, factory, archive, security.");
    },
    play: function (a) {
      var g = GAMES[(a[0] || "").toLowerCase()];
      if (!g) { print("play: pick one of breaker, blast, guard, shipday, daily, evallab."); return; }
      closeTerm(); K.open(g);
    },
    whoami: function () { print("visitor. The person who built this is Paawan. <b>open about</b> to meet him."); },
    date: function () { print(esc(new Date().toString())); },
    history: function () { print(hist.map(function (h, i) { return (i + 1) + "  " + esc(h); }).join("<br>") || "(empty)"); },
    clear: function () { out.innerHTML = ""; },
    exit: closeTerm,
    echo: function (a) { print(esc(a.join(" "))); },
    theme: function (a) {
      var want = a[0] === "sun" ? "auto" : a[0];
      if (want !== "light" && want !== "dark" && want !== "auto") { print("theme: sun, light or dark"); return; }
      window.CampusSun.setMode(want);
      document.dispatchEvent(new CustomEvent("campus:theme"));
      var lbl = document.getElementById("theme-label"); if (lbl) lbl.textContent = "Theme: " + (want === "auto" ? "sun" : want);
      print(want === "auto" ? "Theme follows the sun where you are." : "Theme set to " + want + ".");
    },
    sound: function (a) {
      var b = document.getElementById("sound-btn"), on = b.getAttribute("aria-pressed") === "true";
      if (a[0] !== "on" && a[0] !== "off") { print("sound: on or off"); return; }
      if ((a[0] === "on") !== on) b.click();
      print("Sound " + a[0] + ".");
    },
    sudo: function (a) {
      if (a.join(" ").toLowerCase() === "hire paawan") {
        K.unlock("sudo");
        K.track("terminal-sudo");
        var steps = ["[sudo] checking references… ok", "Running test suite on candidate… 0 failures", "Breaker found no bugs in candidate", "✔ Offer drafted."];
        steps.forEach(function (s, i) { setTimeout(function () { print(esc(s), i === steps.length - 1 ? "ok" : ""); }, 350 * (i + 1)); });
        setTimeout(function () { print('Last step is yours: <a href="' + email() + '">email him</a>.'); }, 350 * 5);
      } else print("visitor is not in the sudoers file. This incident will be reported. (To nobody.)");
    },
    rm: function () { print("Permission denied. The Breaker caught that one.", "err"); },
    git: function (a) {
      if (a[0] !== "log") { print("git: try <b>git log</b>"); return; }
      print(["<b>a1f9c2e</b> fix: guard no longer trusts anyone who says \"manager\"", "<b>77d0b31</b> feat: Breaker gets faster when you're good", "<b>3c4e8aa</b> chore: water the isometric trees", "<b>0000001</b> init: one belt, five agents, no sleep"].join("<br>"));
    },
    coffee: function () { print("☕ 418 I'm a teapot. Try again after the standup."); },
    vim: function () { print("You're in vim now. Just kidding. Type <b>exit</b> to leave, which is more than vim offers."); }
  };
  CMDS.ll = CMDS.ls; CMDS.dir = CMDS.ls; CMDS.cd = function (a) { CMDS.open(a); }; CMDS.quit = CMDS.exit; CMDS.man = CMDS.help; CMDS.nano = CMDS.vim; CMDS.emacs = CMDS.vim;
  term.querySelector(".term-line").addEventListener("submit", function (e) {
    e.preventDefault();
    var line = tin.value.trim();
    tin.value = "";
    if (!line) return;
    hist.push(line); hi = hist.length;
    print('<span class="ps1">$</span> ' + esc(line), "cmd");
    var parts = line.split(/\s+/), c = parts.shift().toLowerCase();
    if (CMDS[c]) { K.track("terminal-" + c); CMDS[c](parts); }
    else print(esc(c) + ": command not found. Try <b>help</b>.", "err");
  });
  tin.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) tin.value = hist[--hi]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(hist.length, hi + 1); tin.value = hist[hi] || ""; }
    else if (e.key === "Escape") { e.stopPropagation(); closeTerm(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      var m = Object.keys(CMDS).filter(function (k) { return k.indexOf(tin.value) === 0; });
      if (m.length === 1) tin.value = m[0] + " ";
    }
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (!typing && (e.key === "`" || e.key === "~")) { e.preventDefault(); if (term.hidden) openTerm(); else closeTerm(); }
  });
  var termLink = document.getElementById("term-link");
  if (termLink) termLink.addEventListener("click", function (e) { e.preventDefault(); openTerm(); });

  // ================= The campus follows the visitor's clock =================
  var stage = document.querySelector(".stage");
  var sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  sky.innerHTML = '<span class="orb"></span>';
  stage.insertBefore(sky, stage.firstChild);
  var orb = sky.querySelector(".orb"), clock = document.getElementById("clock-text");
  var Sun = window.CampusSun;
  function fmt(d) { return d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"; }
  function tick() {
    var d = new Date(), st = Sun ? Sun.apply(d) : { tod: "day" };
    var rise = st.rise, set = st.set, up = rise && set && d >= rise && d < set, prog;
    if (rise && set) {
      if (up) prog = (d - rise) / (set - rise);
      else {
        var from = d >= set ? set.getTime() : set.getTime() - 864e5, to = d >= set ? rise.getTime() + 864e5 : rise.getTime();
        prog = (d.getTime() - from) / (to - from);
      }
    } else { up = st.elevation > 0; prog = 0.5; }
    orb.className = "orb " + (up ? "sun" : "moon");
    orb.style.left = (6 + prog * 88) + "%";
    orb.style.top = (6 + (1 - Math.sin(prog * Math.PI)) * 22) + "%";
    if (clock) {
      var next = !rise || !set ? "" : d < rise ? " · sunrise " + fmt(rise) : d < set ? " · sunset " + fmt(set) : " · sunset was " + fmt(set);
      clock.textContent = fmt(d) + " your time" + next + (st.loc && st.loc.precise ? "" : " (estimated from your time zone)");
      locBtn.hidden = !!(st.loc && st.loc.precise) || !navigator.geolocation;
    }
    if (d.getHours() < 5) K.unlock("nightowl");
  }
  // Opt-in exact location for a precise sunset. Rounded, kept in this browser only.
  var locBtn = document.createElement("button");
  locBtn.type = "button";
  locBtn.className = "linkish";
  locBtn.textContent = "Use my location";
  locBtn.hidden = true;
  if (clock) clock.parentNode.appendChild(locBtn);
  locBtn.addEventListener("click", function () {
    locBtn.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(function (pos) {
      try { localStorage.setItem("campus-loc", JSON.stringify([+pos.coords.latitude.toFixed(1), +pos.coords.longitude.toFixed(1)])); } catch (e) { /* ignore */ }
      K.track("sun-precise");
      tick();
    }, function () { locBtn.textContent = "Location unavailable"; }, { maximumAge: 864e5, timeout: 10000 });
  });
  document.addEventListener("campus:theme", tick);
  tick();
  setInterval(tick, 30000);

  // ================= Accessibility: games open as a real modal dialog =================
  var panel = document.getElementById("panel");
  function syncDialog() {
    var modal = panel.classList.contains("arcade-panel") && !panel.hidden;
    if (modal) {
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      var h = panel.querySelector("h2");
      panel.setAttribute("aria-label", h ? h.textContent : "Game");
    } else {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
      panel.removeAttribute("aria-label");
    }
  }
  document.addEventListener("campus:open", function () { setTimeout(syncDialog, 0); });
  document.addEventListener("campus:close", syncDialog);
  panel.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !panel.classList.contains("arcade-panel")) return;
    var f = [].filter.call(panel.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])'), function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
