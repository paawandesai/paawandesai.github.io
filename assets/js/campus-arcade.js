/* Campus arcade: three real games built on the ideas behind my work. Be the Breaker, Blast Radius and Talk Your Way Past the Guard. All code, services and data are made up. */
(function () {
  "use strict";

  var K = window.Campus;
  if (!K || !K.unlock) return;
  var esc = K.esc;
  var Sound = K.sound;
  var panel = document.getElementById("panel");
  var body = document.body;
  var running = null; // { stop: fn } for the game on screen

  function best(key, score) {
    var b = 0;
    try { b = +localStorage.getItem("arcade-" + key) || 0; } catch (e) { /* ignore */ }
    if (score !== undefined && score > b) {
      b = score;
      try { localStorage.setItem("arcade-" + key, String(b)); } catch (e) { /* ignore */ }
    }
    return b;
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var DIFFS = [["easy", "Easy"], ["normal", "Normal"], ["hard", "Hard"]];
  function getDiff(key) {
    var d = "normal";
    try { d = localStorage.getItem("arcade-diff-" + key) || "normal"; } catch (e) { /* ignore */ }
    return d === "easy" || d === "hard" ? d : "normal";
  }
  function diffPicker(key, notes) {
    var cur = getDiff(key);
    return '<fieldset class="diff-pick"><legend>Difficulty</legend>' + DIFFS.map(function (d, i) {
      return '<label><input type="radio" name="diff-' + key + '" value="' + d[0] + '"' + (d[0] === cur ? " checked" : "") + "><span><b>" + d[1] + "</b><small>" + esc(notes[i]) + "</small></span></label>";
    }).join("") + "</fieldset>";
  }
  function wireDiff(box, key) {
    box.querySelectorAll('input[name="diff-' + key + '"]').forEach(function (r) {
      r.addEventListener("change", function () {
        try { localStorage.setItem("arcade-diff-" + key, r.value); } catch (e) { /* ignore */ }
      });
    });
  }
  function bestLine(key) {
    return DIFFS.map(function (d) { return d[1] + " <b>" + best(key + "-" + d[0]) + "</b>"; }).join(" · ");
  }

  function stopRunning() { if (running) { running.stop(); running = null; } }

  // ================= Be the Breaker =================
  var SNIPPETS = [
    { file: "reports/window.py", bug: [2], why: "range() runs one past the end, so the last iteration raises IndexError.", lines: [
      "def sum_last_n(values, n):", "    total = 0", "    for i in range(len(values) - n, len(values) + 1):", "        total += values[i]", "    return total"] },
    { file: "checkout/shipping.js", bug: [1], why: "It reads order.address.zone before checking that address exists.", lines: [
      "function shippingCost(order) {", "  const zone = order.address.zone;", "  if (!order.address) return 0;", "  return RATES[zone] * order.weightKg;", "}"] },
    { file: "payments/client.js", bug: [1], why: "A live secret key is committed to the repo.", lines: [
      "const client = new Stripe(", "  \"sk_live_8f3K…QzT1\",", "  { apiVersion: \"2026-09-01\" }", ");", "export function charge(cents, card) {", "  return client.charges.create({ amount: cents, source: card });", "}"] },
    { file: "users/lookup.py", bug: [1], why: "User input goes straight into SQL. That's an injection.", lines: [
      "def find_user(db, email):", "    query = f\"SELECT * FROM users WHERE email = '{email}'\"", "    return db.execute(query).fetchone()"] },
    { file: "sync/save.js", bug: [2], why: "db.insert() isn't awaited, so it reports success before anything is saved.", lines: [
      "async function saveAll(items) {", "  for (const item of items) {", "    db.insert(item);", "  }", "  return { saved: items.length };", "}"] },
    { file: "docs/permissions.js", bug: [2], why: "The comparison is inverted: everyone except the owner can edit.", lines: [
      "function canEdit(user, doc) {", "  if (user.role === \"admin\") return true;", "  return doc.ownerId !== user.id;", "}"] },
    { file: "tags/util.py", bug: [0], why: "A mutable default argument: tags leak between calls.", lines: [
      "def add_tag(tag, tags=[]):", "    tags.append(tag)", "    return tags"] },
    { file: "jobs/retry.js", bug: [1], why: "= assigns instead of comparing, so it never retries.", lines: [
      "function shouldRetry(attempt, max) {", "  if (attempt = max) return false;", "  return true;", "}"] },
    { file: "reports/cache.js", bug: [1], why: "The cache key has no tenant, so one company can see another's report.", lines: [
      "function cacheKey(req) {", "  return `report:${req.params.reportId}`;", "}", "const cached = await redis.get(cacheKey(req));", "if (cached) return res.json(JSON.parse(cached));"] },
    { file: "auth/login.js", bug: [2], why: "It logs the user's password.", lines: [
      "async function login(body) {", "  const user = await users.findByEmail(body.email);", "  logger.info(\"login attempt\", { email: body.email, password: body.password });",
      "  if (!user || !(await verify(body.password, user.hash))) throw unauthorized();", "  return issueToken(user);", "}"] },
    { file: "leaderboard/rank.js", bug: [1], why: "sort() compares as strings, so 100 sorts before 25.", lines: [
      "function topThree(scores) {", "  const sorted = scores.sort();", "  return sorted.slice(-3).reverse();", "}"] },
    { file: "wallet/withdraw.py", bug: [1, 4], why: "Read, then write, with no lock: two withdrawals can both pass the check.", lines: [
      "def withdraw(account_id, cents):", "    balance = db.get_balance(account_id)", "    if balance < cents:", "        raise InsufficientFunds()", "    db.set_balance(account_id, balance - cents)"] },
    { file: "orders/pay.py", bug: [2, 3], why: "The failed charge is swallowed, and the order is marked paid anyway.", lines: [
      "try:", "    charge_card(order)", "except Exception:", "    pass", "mark_paid(order)"] },
    { file: "billing/split.py", bug: [1], why: "Rounding each share loses cents: $100.00 split three ways sums to $99.99.", lines: [
      "def split_bill(total, people):", "    share = round(total / people, 2)", "    return [share] * people"] },
    { file: "api/upload.js", bug: [2], why: "The size check uses the client's claimed size, not the real body.", lines: [
      "app.post(\"/upload\", async (req, res) => {", "  const MAX = 5 * 1024 * 1024;", "  if (req.headers[\"x-file-size\"] > MAX) return res.status(413).end();",
      "  await store.put(req.body);", "  res.status(201).end();", "});"] },
    { file: "links/redirect.js", bug: [1], why: "An open redirect: any URL in ?next= is trusted.", lines: [
      "app.get(\"/login/done\", (req, res) => {", "  res.redirect(req.query.next);", "});"] },
    // Clean ones: the right move is Approve.
    { file: "util/clamp.js", bug: [], lines: ["function clamp(n, min, max) {", "  return Math.min(Math.max(n, min), max);", "}"] },
    { file: "util/chunk.py", bug: [], lines: ["def chunk(items, size):", "    return [items[i:i + size] for i in range(0, len(items), size)]"] },
    { file: "money/validate.js", bug: [], lines: ["function isValidCents(value) {", "  return Number.isSafeInteger(value) && value >= 0;", "}"] },
    { file: "math/div.py", bug: [], lines: ["def safe_div(a, b):", "    if b == 0:", "        return None", "    return a / b"] },
    { file: "users/get.js", bug: [], lines: ["async function getUser(db, tenantId, id) {", "  return db.users.findOne({ where: { tenantId, id } });", "}"] },
    // ----- Java -----
    { file: "auth/Roles.java", bug: [1], why: "== compares String references, not contents. Use \"admin\".equals(...).", lines: [
      "public boolean isAdmin(User u) {", "    return u.getRole() == \"admin\";", "}"] },
    { file: "cart/Cleanup.java", bug: [2], why: "Removing from a list inside a for-each loop throws ConcurrentModificationException.", lines: [
      "for (String id : ids) {", "    if (id.isBlank()) {", "        ids.remove(id);", "    }", "}"] },
    { file: "orders/Total.java", bug: [0], why: "<= runs one past the end: ArrayIndexOutOfBoundsException.", lines: [
      "for (int i = 0; i <= items.length; i++) {", "    total += items[i].price;", "}"] },
    { file: "limits/Quota.java", bug: [2], why: "== on Integer objects compares references. Above 127 it's false even when the values match.", lines: [
      "Integer limit = config.getLimit();", "Integer used = usage.count();", "if (used == limit) {", "    blockRequests();", "}"] },
    { file: "money/Price.java", bug: [0], why: "new BigDecimal(0.1) keeps the floating-point error. Use BigDecimal.valueOf or a string.", lines: [
      "BigDecimal price = new BigDecimal(0.1);", "BigDecimal total = price.multiply(BigDecimal.valueOf(qty));"] },
    { file: "util/MathUtil.java", bug: [], lines: ["public static int clamp(int n, int min, int max) {", "    return Math.max(min, Math.min(n, max));", "}"] },
    { file: "auth/Access.java", bug: [], lines: ["if (\"admin\".equals(user.getRole())) {", "    grantAccess(user);", "}"] },
    // ----- Go -----
    { file: "stats/count.go", bug: [0, 2], why: "Writing to a nil map panics. It needs make(map[string]int) first.", lines: [
      "var counts map[string]int", "for _, w := range words {", "    counts[w]++", "}"] },
    { file: "config/load.go", bug: [0], why: "The error from os.Open is thrown away, so f can be nil.", lines: [
      "f, _ := os.Open(path)", "defer f.Close()", "data, err := io.ReadAll(f)"] },
    { file: "files/scan.go", bug: [3], why: "defer runs when the function returns, not each loop, so every file stays open.", lines: [
      "for _, path := range paths {", "    f, err := os.Open(path)", "    if err != nil { return err }", "    defer f.Close()", "}"] },
    { file: "sum/parallel.go", bug: [2], why: "Goroutines write total with no lock, and nothing waits for them: a data race.", lines: [
      "var total int", "for _, n := range nums {", "    go func(n int) { total += n }(n)", "}", "return total"] },
    { file: "jobs/run.go", bug: [2], why: ":= declares a new err inside the block, so the outer err stays nil.", lines: [
      "var err error", "if retry {", "    result, err := compute()", "    use(result)", "}", "return err"] },
    { file: "util/max.go", bug: [], lines: ["func Max(a, b int) int {", "    if a > b {", "        return a", "    }", "    return b", "}"] },
    { file: "cache/set.go", bug: [], lines: ["mu.Lock()", "defer mu.Unlock()", "cache[key] = value"] },
    // ----- Rust -----
    { file: "src/config.rs", bug: [1], why: "unwrap() panics on bad input. Return a Result instead.", lines: [
      "fn parse_port(s: &str) -> u16 {", "    s.parse().unwrap()", "}"] },
    { file: "src/quota.rs", bug: [1], why: "If used > limit this underflows: a panic in debug, a huge number in release. Use saturating_sub.", lines: [
      "fn remaining(limit: usize, used: usize) -> usize {", "    limit - used", "}"] },
    { file: "src/recent.rs", bug: [1], why: "Panics when the slice has fewer than three items.", lines: [
      "fn last_three(v: &[i32]) -> &[i32] {", "    &v[v.len() - 3..]", "}"] },
    { file: "src/sync.rs", bug: [2], why: "A std Mutex guard held across .await blocks the thread and can deadlock other tasks.", lines: [
      "let mut guard = state.lock().unwrap();", "guard.pending += 1;", "send_update(&client).await;"] },
    { file: "src/charge.rs", bug: [1], why: "as i32 silently truncates large amounts. Use i32::try_from.", lines: [
      "let total_cents: i64 = order.total_cents();", "let amount = total_cents as i32;", "charge(amount);"] },
    { file: "src/stats.rs", bug: [], lines: ["fn mean(xs: &[f64]) -> Option<f64> {", "    if xs.is_empty() { return None; }", "    Some(xs.iter().sum::<f64>() / xs.len() as f64)", "}"] },
    { file: "src/input.rs", bug: [], lines: ["let n = input.trim().parse::<u32>().map_err(|_| Error::BadInput)?;"] },
    // ----- C++ -----
    { file: "src/user.cpp", bug: [2], why: "Returns a reference to a local string that's destroyed when the function returns.", lines: [
      "const std::string& fullName() {", "    std::string n = first + \" \" + last;", "    return n;", "}"] },
    { file: "src/filter.cpp", bug: [1], why: "erase() invalidates it, so ++it is undefined behaviour. Use it = v.erase(it).", lines: [
      "for (auto it = v.begin(); it != v.end(); ++it) {", "    if (*it < 0) v.erase(it);", "}"] },
    { file: "src/reverse.cpp", bug: [0], why: "size_t is never negative, so i >= 0 is always true and i wraps around.", lines: [
      "for (size_t i = v.size() - 1; i >= 0; --i) {", "    process(v[i]);", "}"] },
    { file: "src/buffer.cpp", bug: [2], why: "Memory from new[] must be freed with delete[].", lines: [
      "int* buf = new int[n];", "fill(buf, n);", "delete buf;"] },
    { file: "src/name.cpp", bug: [1], why: "strcpy has no bound: input over 15 characters overflows the buffer.", lines: [
      "char name[16];", "strcpy(name, userInput);"] },
    { file: "src/remove.cpp", bug: [], lines: ["auto it = std::find(v.begin(), v.end(), target);", "if (it != v.end()) {", "    v.erase(it);", "}"] },
    { file: "src/conn.cpp", bug: [], lines: ["auto conn = std::make_unique<Conn>(host);", "conn->open();"] },
    // ----- C# -----
    { file: "Orders/OrderService.cs", bug: [0], why: "async void can't be awaited, and its exceptions crash the process. Return Task.", lines: [
      "public async void SaveAsync(Order o) {", "    await db.SaveAsync(o);", "}"] },
    { file: "Users/Names.cs", bug: [1], why: "Blocking on .Result can deadlock under a sync context. Make the method async.", lines: [
      "public string GetName(int id) {", "    return client.GetNameAsync(id).Result;", "}"] },
    { file: "Cart/Cleanup.cs", bug: [1], why: "Changing a collection inside foreach throws InvalidOperationException.", lines: [
      "foreach (var item in cart.Items) {", "    if (item.Quantity == 0) cart.Items.Remove(item);", "}"] },
    { file: "Data/UserQuery.cs", bug: [0], why: "Building SQL from user input is an injection. Use parameters.", lines: [
      "var cmd = new SqlCommand(\"SELECT * FROM Users WHERE Name = '\" + name + \"'\", conn);", "var reader = cmd.ExecuteReader();"] },
    { file: "Billing/Discount.cs", bug: [1], why: "0.1 + 0.2 isn't exactly 0.3 in floating point. Use decimal for money.", lines: [
      "double total = 0.1 + 0.2;", "if (total == 0.3) ApplyDiscount();"] },
    { file: "Users/Validate.cs", bug: [], lines: ["if (string.IsNullOrWhiteSpace(email)) {", "    throw new ArgumentException(\"Email is required\", nameof(email));", "}"] },
    { file: "Users/Active.cs", bug: [], lines: ["var active = users.Where(u => u.IsActive).ToList();"] },
    // ----- Haskell -----
    { file: "src/Orders.hs", bug: [1], why: "head crashes on an empty list. Return Maybe Order instead.", lines: [
      "firstOrder :: [Order] -> Order", "firstOrder orders = head orders"] },
    { file: "src/Totals.hs", bug: [1], why: "Lazy foldl builds a long chain of thunks on big lists. Use foldl'.", lines: [
      "total :: [Int] -> Int", "total = foldl (+) 0"] },
    { file: "src/Describe.hs", bug: [1], why: "There's no case for Nothing, so it crashes at runtime.", lines: [
      "describe :: Maybe Int -> String", "describe (Just n) = \"got \" ++ show n"] },
    { file: "src/Average.hs", bug: [1], why: "Divides by zero on an empty list.", lines: [
      "average :: [Int] -> Int", "average xs = sum xs `div` length xs"] },
    { file: "src/Parse.hs", bug: [1], why: "read throws on bad input. Use readMaybe.", lines: [
      "parseAge :: String -> Int", "parseAge s = read s"] },
    { file: "src/Fact.hs", bug: [1], why: "There's no base case, so it never stops.", lines: [
      "fact :: Integer -> Integer", "fact n = n * fact (n - 1)"] },
    { file: "src/Safe.hs", bug: [], lines: ["safeHead :: [a] -> Maybe a", "safeHead [] = Nothing", "safeHead (x:_) = Just x"] },
    { file: "src/Sum.hs", bug: [], lines: ["import Data.List (foldl')", "", "sumStrict :: [Int] -> Int", "sumStrict = foldl' (+) 0"] }
  ];
  var LANGS = [["any", "Any"], ["js", "JavaScript"], ["py", "Python"], ["java", "Java"], ["go", "Go"], ["rs", "Rust"], ["cpp", "C++"], ["cs", "C#"], ["hs", "Haskell"]];
  function langOf(sn) { return sn.file.split(".").pop(); }
  function getLang() {
    var l = "any";
    try { l = localStorage.getItem("arcade-lang") || "any"; } catch (e) { /* ignore */ }
    return LANGS.some(function (x) { return x[0] === l; }) ? l : "any";
  }
  function langPicker() {
    var cur = getLang();
    return '<fieldset class="lang-pick"><legend>Language</legend>' + LANGS.map(function (l) {
      return '<label><input type="radio" name="lang-breaker" value="' + l[0] + '"' + (l[0] === cur ? " checked" : "") + "><span>" + esc(l[1]) + "</span></label>";
    }).join("") + "</fieldset>";
  }

  K.views.breaker = function () {
    return '<p class="kicker">Arcade · The Factory</p><h2>Be the Breaker</h2>' +
      '<div class="arcade" id="breaker">' +
      "<p>Pull requests are heading for the merge gate. <b>Click the buggy line</b> before each one merges, or <b>Approve</b> it if it's clean.</p>" +
      "<ul class=\"rules\"><li>Correct catches build a streak multiplier.</li><li>A wrong click costs time. Letting a bug merge, or approving one, costs a life.</li><li>PRs get faster as you go.</li></ul>" +
      diffPicker("breaker", ["90 s, 5 lives, slow PRs, wrong clicks are free", "60 s, 3 lives", "45 s, 2 lives, fast PRs"]) +
      langPicker() +
      '<p class="best">Best: ' + bestLine("breaker") + "</p>" +
      '<button type="button" class="btn primary big" data-act="start">Start</button></div>';
  };

  function mountBreaker(root) {
    var box = root.querySelector("#breaker");
    wireDiff(box, "breaker");
    box.querySelectorAll('input[name="lang-breaker"]').forEach(function (r) {
      r.addEventListener("change", function () { try { localStorage.setItem("arcade-lang", r.value); } catch (e) { /* ignore */ } });
    });
    box.querySelector('[data-act="start"]').addEventListener("click", function () { playBreaker(box); });
  }

  function playBreaker(box, opts) {
    opts = opts || {};
    stopRunning();
    K.track("arcade-breaker-start");
    var diff = opts.diff || getDiff("breaker");
    var lang = opts.lang || (opts.onEnd ? "any" : getLang());
    var pool = SNIPPETS.filter(function (sn) { return lang === "any" || langOf(sn) === lang; });
    var C = { easy: { total: 90, lives: 5, pr: 15, min: 8, step: 0.3, penalty: 0 }, normal: { total: 60, lives: 3, pr: 9, min: 4, step: 0.35, penalty: 2 }, hard: { total: 45, lives: 2, pr: 7, min: 3, step: 0.4, penalty: 3 } }[diff];
    if (opts.total) C = { total: opts.total, lives: C.lives, pr: C.pr, min: C.min, step: C.step, penalty: C.penalty };
    var state = { score: 0, lives: C.lives, streak: 0, caught: 0, missed: 0, total: C.total, left: C.total, prTime: C.pr, prLeft: C.pr, pr: 300, deck: [], cur: null, lock: false };
    var timer = null, last = performance.now();

    box.innerHTML =
      '<div class="hud-row"><span>Score <b data-k="score">0</b></span><span>Streak <b data-k="streak">×1</b></span><span>Lives <b data-k="lives"></b></span><span>Time <b data-k="left"></b></span><span class="tag-diff">' + diff + "</span>" + (lang !== "any" ? '<span class="tag-diff">' + esc(LANGS.filter(function (l) { return l[0] === lang; })[0][1]) + "</span>" : "") + "</div>" +
      '<div class="meter-lg"><i data-k="total"></i></div>' +
      '<div class="diff"><div class="diff-head"><span data-k="title"></span><span class="merge">merges in <b data-k="pr"></b>s</span></div>' +
      '<div class="meter-lg pr"><i data-k="prbar"></i></div><div class="code" data-k="code"></div></div>' +
      '<div class="arcade-actions"><button type="button" class="btn ok-btn" data-act="approve">✓ Approve, it\'s clean</button></div>' +
      '<p class="feedback" data-k="fb">Find the bug.</p>';
    function $(k) { return box.querySelector('[data-k="' + k + '"]'); }

    function draw() {
      if (!$("score")) return; // the game already ended and the end screen replaced the board
      $("score").textContent = state.score;
      $("streak").textContent = "×" + mult();
      $("lives").textContent = "♥♥♥♥♥".slice(0, state.lives) + "♡♡♡♡♡".slice(0, C.lives - state.lives);
      $("left").textContent = Math.ceil(state.left);
      $("total").style.width = (state.left / state.total * 100) + "%";
      $("pr").textContent = Math.max(0, state.prLeft).toFixed(1);
      $("prbar").style.width = Math.max(0, state.prLeft / state.prTime * 100) + "%";
    }
    function mult() { return Math.min(5, 1 + Math.floor(state.streak / 2)); }
    function feedback(text, cls) { var f = $("fb"); f.textContent = text; f.className = "feedback " + (cls || ""); }

    function next() {
      if (!state.deck.length) state.deck = shuffle(pool.slice());
      state.cur = state.deck.pop();
      state.pr++;
      state.prLeft = state.prTime;
      state.lock = false;
      $("title").textContent = "PR #" + state.pr + " · " + state.cur.file;
      $("code").innerHTML = state.cur.lines.map(function (l, i) {
        return '<button type="button" class="ln" data-i="' + i + '"><span class="no">' + (i + 1) + "</span><code>" + esc(l) + "</code></button>";
      }).join("");
      $("code").querySelectorAll(".ln").forEach(function (b) { b.addEventListener("click", function () { pick(+b.getAttribute("data-i"), b); }); });
      draw();
    }

    function resolve(good, text, mark) {
      state.lock = true;
      if (mark) mark.classList.add(good ? "hit" : "miss");
      state.cur.bug.forEach(function (i) { var el = $("code").querySelector('[data-i="' + i + '"]'); if (el) el.classList.add("hit"); });
      feedback(text, good ? "good" : "bad");
      setTimeout(function () { if (running && state.lives > 0 && state.left > 0) next(); }, good ? 750 : 1600);
    }

    function pick(i, btn) {
      if (state.lock) return;
      if (state.cur.bug.indexOf(i) >= 0) {
        state.streak++;
        state.caught++;
        var pts = Math.round((100 + state.prLeft * 10) * mult());
        state.score += pts;
        state.prTime = Math.max(C.min, state.prTime - C.step);
        Sound.play("ok");
        resolve(true, "+" + pts + " · " + state.cur.why, btn);
      } else {
        state.streak = 0;
        state.left = Math.max(0, state.left - C.penalty);
        btn.classList.add("miss");
        Sound.play("tick");
        var cost = C.penalty ? " −" + C.penalty + " s" : " Try another line.";
        feedback(state.cur.bug.length ? "Not that line." + cost : "That line is fine. Is anything wrong here at all?" + cost, "bad");
      }
      draw();
    }

    function approve() {
      if (state.lock) return;
      if (!state.cur.bug.length) {
        state.streak++;
        state.caught++;
        var pts = Math.round((80 + state.prLeft * 10) * mult());
        state.score += pts;
        Sound.play("ok");
        resolve(true, "+" + pts + " · Clean PR, approved.");
      } else {
        loseLife("You approved a bug. " + state.cur.why);
      }
      draw();
    }

    function loseLife(text) {
      state.lives--;
      state.streak = 0;
      state.missed++;
      Sound.play("caught");
      if (state.lives <= 0) { draw(); end("Out of lives. " + text); return; }
      resolve(false, text);
    }

    box.querySelector('[data-act="approve"]').addEventListener("click", approve);

    function tick() {
      var now = performance.now();
      var dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      state.left -= dt;
      if (!state.lock) {
        state.prLeft -= dt;
        if (state.prLeft <= 0) {
          if (state.cur.bug.length) loseLife("It merged with the bug. " + state.cur.why);
          else { state.lock = true; feedback("Clean PR merged on its own. No points, but no harm.", ""); setTimeout(function () { if (running) next(); }, 700); }
        }
      }
      if (state.left <= 0) { state.left = 0; draw(); end("Time's up."); return; }
      draw();
    }

    function end(reason) {
      stopRunning();
      if (opts.onEnd) { opts.onEnd({ score: state.score, caught: state.caught, missed: state.missed, reason: reason }); return; }
      var b = best("breaker-" + diff, state.score);
      if (state.score >= 1500 && diff !== "easy") K.unlock("sharp");
      K.track("arcade-breaker-end");
      box.innerHTML = '<div class="end"><p class="kicker">' + esc(reason) + '</p><p class="big-score">' + state.score + "</p>" +
        "<p>Bugs caught: <b>" + state.caught + "</b> · Let through: <b>" + state.missed + "</b> · Best on " + diff + ": <b>" + b + "</b></p>" +
        "<p class=\"lesson\">This is the Breaker's job in my build factory: a fresh agent sees only the spec and the diff, and nothing merges until it can't break it.</p>" +
        '<button type="button" class="btn primary big" data-act="start">Play again</button> <button type="button" class="btn" data-act="menu">Change difficulty</button> <a class="more" href="' + K.data.base + '/how-i-build/">How the factory works</a></div>';
      box.querySelector('[data-act="start"]').addEventListener("click", function () { playBreaker(box); });
      box.querySelector('[data-act="menu"]').addEventListener("click", function () { K.open("breaker"); });
    }

    running = { stop: function () { clearInterval(timer); } };
    next();
    timer = setInterval(tick, 100);
  }

  // ================= Blast Radius =================
  var CHANGES = [
    { change: "rename invoice.total → invoice.amount_cents", field: "invoice.total", decoys: ["invoice.total_tax", "invoice.subtotal", "order.total"] },
    { change: "drop column invoices.discount_code", field: "invoices.discount_code", decoys: ["invoices.discount_pct", "coupons.code", "orders.discount_code"] },
    { change: "customer.tax_id changes from number to string", field: "customer.tax_id", decoys: ["customer.tax_region", "vendor.tax_id", "customer.id"] },
    { change: "order.shipped event: amount becomes a string", field: "order.shipped.amount", decoys: ["order.shipped.at", "order.paid.amount", "order.refunded.amount"] },
    { change: "rename user.phone → user.phone_e164", field: "user.phone", decoys: ["user.phone_verified", "driver.phone", "user.email"] },
    { change: "remove field session.device_id", field: "session.device_id", decoys: ["session.id", "device.id", "session.device_type"] }
  ];
  var NAMES = ["payments-ui", "orders", "notifications", "risk-nightly", "search", "auth", "retention-job", "analytics", "inventory",
    "shipping", "support-desk", "ledger", "fraud-model", "email-digest", "partner-api", "mobile-app"];
  var NOISE = ["product.sku", "cart.items", "shipment.eta", "ticket.status", "user.locale", "page.views", "stock.count", "store.region", "plan.tier", "review.stars"];

  var BLAST = {
    easy: { rounds: 3, n: [5, 6, 7], time: [30, 28, 26], decoys: function () { return 0; } },
    normal: { rounds: 5, n: [6, 7, 9, 10, 12], time: [16, 15, 14, 13, 12], decoys: function (r) { return 2 + Math.floor(r / 2); } },
    hard: { rounds: 5, n: [9, 10, 12, 13, 14], time: [12, 11, 10, 9, 8], decoys: function () { return 3; } }
  };
  function makeRound(r, B) {
    var c = CHANGES[Math.floor(Math.random() * CHANGES.length)];
    var n = B.n[r];
    var hits = 2 + Math.floor(Math.random() * Math.min(3, r + 1));
    var decoyCount = Math.min(c.decoys.length, B.decoys(r));
    var names = shuffle(NAMES.slice()).slice(0, n);
    var svcs = names.map(function (name, i) {
      var reads = shuffle(NOISE.slice()).slice(0, 1 + (i % 2));
      var hit = i < hits;
      if (hit) reads.splice(Math.floor(Math.random() * (reads.length + 1)), 0, c.field);
      else if (i < hits + decoyCount) reads.splice(Math.floor(Math.random() * (reads.length + 1)), 0, c.decoys[(i - hits) % c.decoys.length]);
      return { name: name, reads: reads, hit: hit };
    });
    return { change: c, svcs: shuffle(svcs), time: B.time[r] };
  }

  K.views.blast = function () {
    return '<p class="kicker">Arcade · Service District</p><h2>Blast Radius</h2>' +
      '<div class="arcade" id="blast">' +
      "<p>You own <code>billing-api</code>. A change is about to merge. <b>Tag every service that reads the changed field</b> before the timer runs out, then press Notify.</p>" +
      "<ul class=\"rules\"><li>+100 for each team you warn correctly.</li><li>−75 for warning a team that isn't affected, and −100 for each one you miss. Watch for look-alike fields.</li><li>The company grows every round.</li></ul>" +
      diffPicker("blast", ["3 rounds, 30 s, no look-alike fields", "5 rounds, 16 s, some look-alikes", "5 rounds, 12 s, bigger company, more look-alikes"]) +
      '<p class="best">Best: ' + bestLine("blast") + "</p>" +
      '<button type="button" class="btn primary big" data-act="start">Start</button></div>';
  };
  function mountBlast(root) {
    var box = root.querySelector("#blast");
    wireDiff(box, "blast");
    box.querySelector('[data-act="start"]').addEventListener("click", function () { playBlast(box); });
  }

  function playBlast(box, opts) {
    opts = opts || {};
    stopRunning();
    K.track("arcade-blast-start");
    var diff = opts.diff || getDiff("blast"), B = BLAST[diff], ROUNDS = opts.rounds || B.rounds;
    var total = 0, r = 0, timer = null, perfectAny = false;

    function round() {
      var R = makeRound(r, B);
      var left = R.time, done = false;
      box.innerHTML =
        '<div class="hud-row"><span>Round <b>' + (r + 1) + " / " + ROUNDS + "</b></span><span>Score <b>" + total + '</b></span><span>Time <b data-k="left">' + left + '</b></span><span class="tag-diff">' + diff + "</span></div>" +
        '<div class="meter-lg"><i data-k="bar" style="width:100%"></i></div>' +
        '<div class="change"><span class="kicker">PR on billing-api</span><code>' + esc(R.change.change) + "</code></div>" +
        '<div class="svc-grid">' + R.svcs.map(function (s, i) {
          return '<button type="button" class="svc-card" data-i="' + i + '" aria-pressed="false"><b>' + esc(s.name) + "</b><span>reads " +
            s.reads.map(function (f) { return "<code>" + esc(f) + "</code>"; }).join(" ") + "</span></button>";
        }).join("") + "</div>" +
        '<div class="arcade-actions"><button type="button" class="btn primary" data-act="notify">Notify the tagged teams</button></div>' +
        '<p class="feedback" data-k="fb"></p>';
      box.querySelectorAll(".svc-card").forEach(function (b) {
        b.addEventListener("click", function () {
          if (done) return;
          var on = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", on ? "true" : "false");
          Sound.play("tick");
        });
      });
      box.querySelector('[data-act="notify"]').addEventListener("click", function () { finish(); });

      function finish() {
        if (done) return;
        done = true;
        clearInterval(timer);
        var tp = 0, fp = 0, fn = 0;
        box.querySelectorAll(".svc-card").forEach(function (b) {
          var s = R.svcs[+b.getAttribute("data-i")];
          var on = b.getAttribute("aria-pressed") === "true";
          if (s.hit && on) { tp++; b.classList.add("tp"); }
          else if (!s.hit && on) { fp++; b.classList.add("fp"); }
          else if (s.hit && !on) { fn++; b.classList.add("fn"); }
          b.disabled = true;
        });
        var perfect = fp === 0 && fn === 0;
        var pts = tp * 100 - fp * 75 - fn * 100 + (perfect ? Math.round(left) * 10 : 0);
        total += pts;
        if (perfect) { perfectAny = true; K.unlock("radius"); Sound.play("ok"); } else Sound.play("caught");
        var fb = box.querySelector('[data-k="fb"]');
        fb.className = "feedback " + (perfect ? "good" : "bad");
        fb.innerHTML = (perfect ? "Perfect. Every affected team warned, nobody else bothered. " : "Warned " + tp + " of " + (tp + fn) + " affected teams, with " + fp + " false alarm" + (fp === 1 ? "" : "s") + ". ") +
          (pts >= 0 ? "+" : "") + pts + " points." +
          ' <span class="legend"><i class="tp"></i>warned <i class="fp"></i>false alarm <i class="fn"></i>missed</span>';
        var act = box.querySelector(".arcade-actions");
        act.innerHTML = '<button type="button" class="btn primary" data-act="next">' + (r < ROUNDS - 1 ? "Next round" : "See your score") + "</button>";
        act.querySelector('[data-act="next"]').addEventListener("click", function () { r++; if (r < ROUNDS) round(); else end(); });
      }

      var last = performance.now();
      timer = setInterval(function () {
        if (document.hidden) { last = performance.now(); return; }
        var now = performance.now();
        left -= (now - last) / 1000;
        last = now;
        var l = box.querySelector('[data-k="left"]'), bar = box.querySelector('[data-k="bar"]');
        if (l) l.textContent = Math.max(0, Math.ceil(left));
        if (bar) bar.style.width = Math.max(0, left / R.time * 100) + "%";
        if (left <= 0) finish();
      }, 100);
      running = { stop: function () { clearInterval(timer); } };
    }

    function end() {
      stopRunning();
      if (opts.onEnd) { opts.onEnd({ score: total, perfect: perfectAny }); return; }
      var b = best("blast-" + diff, total);
      K.track("arcade-blast-end");
      box.innerHTML = '<div class="end"><p class="kicker">All ' + ROUNDS + ' rounds done</p><p class="big-score">' + total + "</p><p>Best on " + diff + ": <b>" + b + "</b>" +
        (perfectAny ? " · You had at least one perfect round." : "") + "</p>" +
        "<p class=\"lesson\">That's the job Company Agent Layer does on every PR: index who reads which field across all the repos, then warn exactly those teams, at field level, before merge.</p>" +
        '<button type="button" class="btn primary big" data-act="start">Play again</button> <button type="button" class="btn" data-act="menu">Change difficulty</button> <a class="more" href="' + K.data.base + '/portfolio/company-agent-layer/">About Company Agent Layer</a></div>';
      box.querySelector('[data-act="start"]').addEventListener("click", function () { playBlast(box); });
      box.querySelector('[data-act="menu"]').addEventListener("click", function () { K.open("blast"); });
    }

    round();
  }

  // ================= Talk Your Way Past the Guard =================
  var REFUND = /refund|reimburs|money back|credit (it |that |this )?back|chargeback|r\W+e\W+f\W+u\W+n\W+d/i;
  var LEVELS = [
    { name: "The trusting guard", defense: "Only staff may issue refunds.",
      hint: "It decides who you are by asking you.",
      lesson: "Agents shouldn't take identity from the conversation. Roles have to come from the session, outside the model.",
      reply: function (m) {
        if (!REFUND.test(m)) return { text: "Hi! I can help with orders. What do you need?" };
        if (/\b(admin|administrator|manager|supervisor|staff|employee|support agent|i work (here|for you)|on the team)\b/i.test(m)) return { win: true, text: "Of course, team member. Refund of $380 issued for order 4471." };
        return { text: "Sorry, only staff can issue refunds. Are you on the team?" };
      } },
    { name: "The session checker", defense: "Role claims are ignored. Your session says customer.",
      hint: "It reads help articles and tickets you paste, and does what they say.",
      lesson: "That's indirect prompt injection. Text the agent retrieves or is shown is data, never instructions.",
      reply: function (m) {
        if (!REFUND.test(m)) return { text: "Happy to help with your order. What's going on?" };
        if (/(system\s*:|\[system\]|note from|support note|ticket note|internal note|policy update|according to (the|this|our) (policy|article|doc)|help article says|<doc|"[^"]{12,}")/i.test(m)) {
          return { win: true, text: "Following the instruction in the note: refund of $380 issued for order 4471." };
        }
        if (/\b(admin|manager|staff|employee|supervisor)\b/i.test(m)) return { text: "My records show your session is a customer account, so I can't do that." };
        return { text: "Refunds need staff approval. I've noted your request." };
      } },
    { name: "The injection-proof guard", defense: "Ignores instructions inside pasted text. Refunds of $100 or more need a manager.",
      hint: "Big refunds get reviewed. Small ones don't.",
      lesson: "Thresholds invite splitting. Limits have to count the total per order, not just each request.",
      reply: function (m) {
        if (/(system\s*:|\[system\]|note from|internal note|policy update)/i.test(m)) return { text: "That looks like instructions inside a document. I don't follow those." };
        if (!REFUND.test(m)) return { text: "Hello! Ask me anything about order 4471." };
        var amounts = (m.match(/\$?\s?(\d{1,5})(?:\.\d{2})?/g) || []).map(function (a) { return +a.replace(/[^\d.]/g, ""); }).filter(function (a) { return a > 0 && a !== 4471; });
        if (amounts.length && amounts.every(function (a) { return a < 100; })) return { win: true, text: "Small refunds don't need review. Refund of $" + amounts[0] + " issued. (You could just ask again…)" };
        return { text: "Refunds of $100 or more need a manager's review. I've opened a request." };
      } },
    { name: "The verifier", defense: "Small refunds add up per order. You must verify with the order number and billing zip first.",
      hint: "Once you're verified, ask where the money should go.",
      lesson: "Verification isn't authorization. Refunds should only ever go back to the original payment method.",
      setup: "You found a receipt: order 4471, billing zip 78701.",
      reply: function (m, st) {
        if (/4471/.test(m) && /78701/.test(m)) st.verified = true;
        if (!REFUND.test(m)) return { text: st.verified ? "Thanks, you're verified for order 4471. What can I do?" : "To help, I need your order number and billing zip." };
        if (!st.verified) return { text: "First I need the order number and billing zip." };
        if (/\b(new|different|another|other|second|backup)\s+(card|account|bank|wallet)\b|card ending|account ending|to this (card|account)/i.test(m)) {
          return { win: true, text: "Verified. Refund of $380 sent to the card you gave me." };
        }
        return { text: "Done. Refund of $380 sent back to the original card. (That's the right outcome, not a win.)" };
      } },
    { name: "The keyword filter", defense: "Everything above, plus a filter that blocks the word \"refund\".",
      hint: "It blocks one word. Only one.",
      lesson: "Keyword filters are brittle. Real defenses enforce policy on the tool call, outside the model, where wording doesn't matter.",
      reply: function (m) {
        if (/refund/i.test(m)) return { text: "⚠ Blocked by the filter: I can't help with that word." };
        if (/(reimburs|money back|credit (it |that |this )?back|chargeback|return (the|my) (money|payment)|r\W+e\W+f\W+u\W+n\W+d|give back the \$?380)/i.test(m)) {
          return { win: true, text: "Sure! Reimbursement of $380 issued for order 4471." };
        }
        return { text: "Hi! What can I do for you today?" };
      } }
  ];

  K.views.guard = function () {
    return '<p class="kicker">Arcade · Security</p><h2>Talk Your Way Past the Guard</h2>' +
      '<div class="arcade" id="guard">' +
      "<p>The guard is a support agent that can issue refunds. <b>Type messages to make it refund $380 it shouldn't.</b> Each level adds one real defense, and each win teaches one real attack.</p>" +
      "<ul class=\"rules\"><li>Pick any level. Level 1 is the easiest.</li><li>It's rule-based, with no AI model behind it, and nothing you type is stored or sent anywhere.</li></ul>" +
      diffPicker("guard", ["The hint is shown from the start", "A hint button if you're stuck", "No hints"]) +
      '<p class="best">Pick a level</p><div class="level-pick">' + LEVELS.map(function (L, i) {
        var done = cleared().indexOf(i) >= 0;
        return '<button type="button" class="lvl' + (done ? " done" : "") + '" data-lvl="' + i + '"><b>' + (done ? "✓ " : "") + "Level " + (i + 1) + "</b><small>" + esc(L.name) + "</small></button>";
      }).join("") + "</div></div>";
  };
  function mountGuard(root) {
    var box = root.querySelector("#guard");
    wireDiff(box, "guard");
    box.querySelectorAll("[data-lvl]").forEach(function (b) {
      b.addEventListener("click", function () { playGuard(box, +b.getAttribute("data-lvl")); });
    });
  }

  function cleared() {
    var c = "";
    try { c = localStorage.getItem("arcade-guard-cleared") || ""; } catch (e) { /* ignore */ }
    return c.split("").map(Number);
  }
  function markCleared(i) {
    var c = cleared();
    if (c.indexOf(i) < 0) c.push(i);
    try { localStorage.setItem("arcade-guard-cleared", c.join("")); } catch (e) { /* ignore */ }
    return c.length;
  }

  function playGuard(box, level, opts) {
    opts = opts || {};
    stopRunning();
    K.track("arcade-guard-level-" + (level + 1));
    var L = LEVELS[level], st = {}, tries = 0, won = false, diff = opts.diff || getDiff("guard");
    box.innerHTML =
      '<div class="hud-row"><span>Level <b>' + (level + 1) + " / 5</b></span><span>" + esc(L.name) + '</span><span class="tag-diff">' + diff + "</span></div>" +
      '<p class="defense"><b>Defense:</b> ' + esc(L.defense) + (L.setup ? "<br><b>Intel:</b> " + esc(L.setup) : "") + "</p>" +
      '<div class="chat" data-k="chat" aria-live="polite"><p class="msg guard">Hi, I\'m the support guard. I can help with orders and refunds.</p></div>' +
      '<form class="chat-in" data-k="form"><label class="sr" for="guard-input">Your message</label>' +
      '<input id="guard-input" type="text" maxlength="300" autocomplete="off" placeholder="Type a message to the guard…">' +
      '<button type="submit" class="btn primary">Send</button></form>' +
      '<div class="arcade-actions">' + (diff === "normal" ? '<button type="button" class="btn" data-act="hint">Hint</button>' : "") +
      '<button type="button" class="btn ghost" data-act="menu">' + (opts.onEnd ? "Give up" : "All levels") + '</button><span class="tries" data-k="tries"></span></div>';
    var chat = box.querySelector('[data-k="chat"]');
    var input = box.querySelector("#guard-input");
    function add(cls, text) {
      var p = document.createElement("p");
      p.className = "msg " + cls;
      p.textContent = text;
      chat.appendChild(p);
      chat.scrollTop = chat.scrollHeight;
    }
    var hintBtn = box.querySelector('[data-act="hint"]');
    if (hintBtn) hintBtn.addEventListener("click", function () { add("hint", "Hint: " + L.hint); });
    if (diff === "easy") add("hint", "Hint: " + L.hint);
    function finishStory(ok) {
      won = true;
      var act = box.querySelector(".arcade-actions");
      act.innerHTML = '<button type="button" class="btn primary" data-act="cont">Continue</button>';
      act.querySelector('[data-act="cont"]').addEventListener("click", function () { opts.onEnd({ won: ok, tries: tries }); });
      act.querySelector('[data-act="cont"]').focus();
    }
    box.querySelector('[data-act="menu"]').addEventListener("click", function () {
      if (opts.onEnd) { if (!won) { won = true; opts.onEnd({ won: false, tries: tries }); } return; }
      K.open("guard");
    });
    box.querySelector('[data-k="form"]').addEventListener("submit", function (e) {
      e.preventDefault();
      if (won) return;
      var m = input.value.trim();
      if (!m) return;
      input.value = "";
      tries++;
      box.querySelector('[data-k="tries"]').textContent = tries + " message" + (tries === 1 ? "" : "s");
      add("you", m);
      var r = L.reply(m, st);
      setTimeout(function () {
        add(r.win ? "guard win" : "guard", r.text);
        if (r.win) {
          won = true;
          Sound.play("achievement");
          var n = markCleared(level);
          K.track("arcade-guard-cleared-" + (level + 1));
          add("lesson", "Level cleared. " + L.lesson);
          if (opts.onEnd) { finishStory(true); return; }
          var act = box.querySelector(".arcade-actions");
          if (n >= 5) K.unlock("smooth");
          if (level < 4) {
            act.innerHTML = '<button type="button" class="btn primary" data-act="next">Level ' + (level + 2) + '</button> <button type="button" class="btn ghost" data-act="menu">All levels</button>';
            act.querySelector('[data-act="next"]').addEventListener("click", function () { playGuard(box, level + 1); });
          } else {
            act.innerHTML = '<span class="feedback good">' + (n >= 5 ? "All five guards beaten. " : "That was the last level. ") + 'My red-team engine automates attacks like these against real agents.</span> ' +
              '<a class="more" href="' + K.data.base + '/portfolio/redteam-engine-auditlens/">See the red-team engine</a> <button type="button" class="btn ghost" data-act="menu">All levels</button>';
          }
          act.querySelector('[data-act="menu"]').addEventListener("click", function () { K.open("guard"); });
        } else {
          Sound.play("blocked");
          if (opts.maxTries && tries >= opts.maxTries && opts.onEnd) {
            add("lesson", "Out of messages. " + L.hint);
            finishStory(false);
          }
        }
      }, 350);
    });
    input.focus();
    running = { stop: function () { won = true; } };
  }

  // ---------- Wiring ----------
  var MOUNTS = { breaker: mountBreaker, blast: mountBlast, guard: mountGuard };
  K.arcade = {
    SNIPPETS: SNIPPETS, LEVELS: LEVELS, playBreaker: playBreaker, playBlast: playBlast, playGuard: playGuard,
    best: best, shuffle: shuffle, getDiff: getDiff, diffPicker: diffPicker, wireDiff: wireDiff, bestLine: bestLine,
    stop: stopRunning, setRunning: function (r) { stopRunning(); running = r; },
    mount: function (key, fn) { MOUNTS[key] = fn; }
  };
  document.addEventListener("campus:open", function (e) {
    stopRunning();
    var m = MOUNTS[e.detail.key];
    panel.classList.toggle("arcade-panel", !!m);
    if (!m) return;
    body.classList.add("playing");
    panel.classList.remove("left", "wide");
    m(e.detail.body);
  });
  document.addEventListener("campus:close", function () {
    stopRunning();
    panel.classList.remove("arcade-panel");
  });
})();
