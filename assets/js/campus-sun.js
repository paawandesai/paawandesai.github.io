/* Campus sun: works out where the sun is for the visitor and blends the campus between day and night.
   Location comes from the browser's time zone (no permission prompt). A visitor can opt in to their
   exact location; it stays in their browser and is never sent anywhere. Loaded in <head> so the first
   paint already has the right colours. */
(function () {
  "use strict";
  var root = document.documentElement;
  var RAD = Math.PI / 180;

  // Representative coordinates for common time zones. Anything else falls back to the UTC offset.
  var TZ = {
    "America/New_York": [40.7, -74.0], "America/Detroit": [42.3, -83.0], "America/Toronto": [43.7, -79.4], "America/Chicago": [41.9, -87.6],
    "America/Denver": [39.7, -105.0], "America/Phoenix": [33.4, -112.1], "America/Los_Angeles": [34.1, -118.2], "America/Vancouver": [49.3, -123.1],
    "America/Anchorage": [61.2, -149.9], "Pacific/Honolulu": [21.3, -157.9], "America/Mexico_City": [19.4, -99.1], "America/Bogota": [4.7, -74.1],
    "America/Lima": [-12.0, -77.0], "America/Santiago": [-33.4, -70.7], "America/Sao_Paulo": [-23.5, -46.6], "America/Argentina/Buenos_Aires": [-34.6, -58.4],
    "America/Halifax": [44.6, -63.6], "America/St_Johns": [47.6, -52.7], "America/Edmonton": [53.5, -113.5], "America/Winnipeg": [49.9, -97.1],
    "Europe/London": [51.5, -0.1], "Europe/Dublin": [53.3, -6.3], "Europe/Lisbon": [38.7, -9.1], "Europe/Madrid": [40.4, -3.7],
    "Europe/Paris": [48.9, 2.4], "Europe/Brussels": [50.8, 4.4], "Europe/Amsterdam": [52.4, 4.9], "Europe/Berlin": [52.5, 13.4],
    "Europe/Zurich": [47.4, 8.5], "Europe/Rome": [41.9, 12.5], "Europe/Vienna": [48.2, 16.4], "Europe/Prague": [50.1, 14.4],
    "Europe/Warsaw": [52.2, 21.0], "Europe/Stockholm": [59.3, 18.1], "Europe/Oslo": [59.9, 10.8], "Europe/Copenhagen": [55.7, 12.6],
    "Europe/Helsinki": [60.2, 24.9], "Europe/Athens": [38.0, 23.7], "Europe/Istanbul": [41.0, 29.0], "Europe/Kiev": [50.5, 30.5], "Europe/Kyiv": [50.5, 30.5],
    "Europe/Moscow": [55.8, 37.6], "Africa/Cairo": [30.0, 31.2], "Africa/Lagos": [6.5, 3.4], "Africa/Nairobi": [-1.3, 36.8], "Africa/Johannesburg": [-26.2, 28.0],
    "Asia/Dubai": [25.2, 55.3], "Asia/Riyadh": [24.7, 46.7], "Asia/Tehran": [35.7, 51.4], "Asia/Karachi": [24.9, 67.0],
    "Asia/Kolkata": [19.1, 72.9], "Asia/Calcutta": [19.1, 72.9], "Asia/Kathmandu": [27.7, 85.3], "Asia/Dhaka": [23.8, 90.4],
    "Asia/Bangkok": [13.8, 100.5], "Asia/Jakarta": [-6.2, 106.8], "Asia/Singapore": [1.35, 103.8], "Asia/Kuala_Lumpur": [3.1, 101.7],
    "Asia/Manila": [14.6, 121.0], "Asia/Hong_Kong": [22.3, 114.2], "Asia/Shanghai": [31.2, 121.5], "Asia/Taipei": [25.0, 121.6],
    "Asia/Seoul": [37.6, 127.0], "Asia/Tokyo": [35.7, 139.7], "Australia/Perth": [-31.95, 115.9], "Australia/Adelaide": [-34.9, 138.6],
    "Australia/Brisbane": [-27.5, 153.0], "Australia/Sydney": [-33.9, 151.2], "Australia/Melbourne": [-37.8, 145.0], "Pacific/Auckland": [-36.8, 174.8]
  };

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
    } catch (e) { /* storage can be blocked */ }
    return null;
  }

  function location() {
    var saved = store("campus-loc");
    if (saved) {
      try { var c = JSON.parse(saved); if (isFinite(c[0]) && isFinite(c[1])) return { lat: c[0], lon: c[1], precise: true }; } catch (e) { /* ignore */ }
    }
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { /* ignore */ }
    if (TZ[tz]) return { lat: TZ[tz][0], lon: TZ[tz][1], precise: false, tz: tz };
    // Fallback: longitude from the UTC offset, a mid-northern latitude (southern for obvious southern zones).
    var off = -new Date().getTimezoneOffset() / 60;
    var south = /^(Australia|Antarctica|America\/(Argentina|Santiago|Sao_Paulo|Montevideo|Asuncion|La_Paz|Lima)|Africa\/(Johannesburg|Maputo|Harare|Windhoek)|Pacific\/(Auckland|Fiji|Chatham))/.test(tz);
    return { lat: south ? -30 : 38, lon: off * 15, precise: false, tz: tz };
  }

  // Solar elevation in degrees (low-precision almanac formula; good to well under a degree).
  function elevation(date, lat, lon) {
    var d = date.getTime() / 864e5 - 10957.5; // days since J2000.0
    var g = (357.529 + 0.98560028 * d) * RAD;
    var q = 280.459 + 0.98564736 * d;
    var L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
    var e = (23.439 - 0.00000036 * d) * RAD;
    var ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RAD;
    var dec = Math.asin(Math.sin(e) * Math.sin(L));
    var gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    var ha = ((gmst + lon / 15) * 15 - ra) * RAD;
    var la = lat * RAD;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha)) / RAD;
  }

  // Today's sunrise and sunset (local day), by scanning and interpolating the -0.833° crossings.
  function sunTimes(date, loc) {
    var start = new Date(date); start.setHours(0, 0, 0, 0);
    var STEP = 6e5, H = -0.833, rise = null, set = null, prev = elevation(start, loc.lat, loc.lon);
    for (var t = start.getTime() + STEP; t <= start.getTime() + 864e5; t += STEP) {
      var cur = elevation(new Date(t), loc.lat, loc.lon);
      if (prev < H && cur >= H && !rise) rise = new Date(t - STEP + STEP * (H - prev) / (cur - prev));
      if (prev >= H && cur < H && !set) set = new Date(t - STEP + STEP * (H - prev) / (cur - prev));
      prev = cur;
    }
    return { rise: rise, set: set };
  }

  // Scene colours that blend; the text and panel colours flip at mid-twilight so contrast never drops.
  // Three stops: day, golden hour, night. Mixing straight from day to night goes muddy grey in the middle.
  var SCENE = {
    "--ground": ["#ebe5d5", "#e3c3a3", "#10172b"], "--ground-side": ["#d9d0ba", "#c49b7f", "#0c1222"], "--top": ["#fbf8f0", "#f6d3ae", "#222c4d"],
    "--left": ["#e4dccb", "#dcae8b", "#19213b"], "--right": ["#d3c8b1", "#b98c72", "#141a31"], "--road": ["#ddd4c0", "#d2ad8e", "#182038"],
    "--belt": ["#c9bea5", "#b08b72", "#1f2944"], "--tree": ["#9fb08a", "#7f8f62", "#1f4a44"], "--win": ["rgba(31,58,95,0.28)", "#ffcf7a", "#ffd27a"]
  };
  function parse(c) {
    if (c[0] === "#") return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16), 1];
    var m = c.match(/[\d.]+/g).map(Number);
    return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1];
  }
  Object.keys(SCENE).forEach(function (k) { SCENE[k] = SCENE[k].map(parse); });
  function mix(a, b, t) {
    return "rgba(" + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }).join(",") + "," + (a[3] + (b[3] - a[3]) * t).toFixed(3) + ")";
  }
  function setScene(t) {
    Object.keys(SCENE).forEach(function (k) {
      // Windows light up earlier than the sky darkens.
      var c = SCENE[k], tt = k === "--win" ? Math.min(1, t * 1.6) : t;
      root.style.setProperty(k, tt < 0.5 ? mix(c[0], c[1], tt * 2) : mix(c[1], c[2], tt * 2 - 1));
    });
    root.style.setProperty("--night", t.toFixed(3));
  }
  function clearScene() {
    Object.keys(SCENE).forEach(function (k) { root.style.removeProperty(k); });
    root.style.removeProperty("--night");
  }
  function smooth(e0, e1, x) { var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

  var state = {};
  function apply(now) {
    now = now || new Date();
    var mode = store("theme");
    if (mode !== "light" && mode !== "dark") mode = "auto";
    var loc = location();
    var el = elevation(now, loc.lat, loc.lon);
    var times = sunTimes(now, loc);
    // 0 = full day (sun 6° up), 1 = full night (sun 8° below the horizon).
    var night = smooth(6, -8, el);
    var noon = times.rise && times.set ? (times.rise.getTime() + times.set.getTime()) / 2 : null;
    var tod = el > 6 ? "day" : el < -6 ? "night" : (noon && now.getTime() < noon ? "dawn" : "dusk");
    root.setAttribute("data-tod", tod);
    root.setAttribute("data-theme-mode", mode);
    var osDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    if (mode === "auto" && !osDark) {
      root.setAttribute("data-theme", night >= 0.5 ? "dark" : "light");
      setScene(night);
    } else {
      root.setAttribute("data-theme", mode === "auto" ? "dark" : mode);
      clearScene();
    }
    state = { mode: mode, loc: loc, elevation: el, night: night, tod: tod, rise: times.rise, set: times.set, now: now };
    return state;
  }
  function setMode(m) {
    store("theme", m === "auto" ? null : m);
    return apply();
  }

  window.CampusSun = { apply: apply, setMode: setMode, state: function () { return state; }, elevation: elevation, sunTimes: sunTimes, location: location };
  apply();
})();
