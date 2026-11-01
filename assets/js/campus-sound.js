/* Campus sound: a generated ambient score and small effects, built with Web Audio so there are no audio files. Off until the visitor turns it on. */
(function () {
  "use strict";

  var ctx = null, master = null, musicBus = null, fxBus = null, delay = null;
  var on = false, timer = 0, nextChord = 0, nextPluck = 0, chordIndex = 0;

  // A slow I - vi - IV - V loop in C, voiced as seventh chords.
  var chords = [
    [48, 55, 59, 64], // Cmaj7
    [45, 52, 55, 60], // Am7
    [41, 48, 52, 57], // Fmaj7
    [43, 50, 53, 59]  // G7
  ];
  var pentatonic = [72, 74, 76, 79, 81, 84];
  var CHORD_SECONDS = 4.8;

  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function setup() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    musicBus = ctx.createBiquadFilter();
    musicBus.type = "lowpass";
    musicBus.frequency.value = 1400;
    musicBus.connect(master);

    delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.42;
    var feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(musicBus);

    fxBus = ctx.createGain();
    fxBus.gain.value = 0.9;
    fxBus.connect(master);
    return true;
  }

  function voice(freq, type, start, attack, hold, release, peak, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(peak, start + attack);
    g.gain.setValueAtTime(peak, start + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
    o.connect(g);
    g.connect(dest);
    o.start(start);
    o.stop(start + attack + hold + release + 0.05);
    return g;
  }

  function schedule() {
    var now = ctx.currentTime;
    while (nextChord < now + 0.6) {
      chords[chordIndex % chords.length].forEach(function (n, i) {
        voice(hz(n), i === 0 ? "sine" : "triangle", nextChord, 1.6, CHORD_SECONDS - 2.2, 2.4, i === 0 ? 0.09 : 0.035, musicBus);
      });
      chordIndex++;
      nextChord += CHORD_SECONDS;
    }
    while (nextPluck < now + 0.6) {
      var n = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      var g = voice(hz(n), "sine", nextPluck, 0.01, 0.05, 1.2, 0.05, musicBus);
      g.connect(delay);
      nextPluck += 0.8 + Math.random() * 1.8;
    }
  }

  function start() {
    if (!ctx && !setup()) return false;
    if (ctx.state === "suspended") ctx.resume();
    on = true;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.7, t + 1.5);
    nextChord = Math.max(nextChord, t + 0.05);
    nextPluck = Math.max(nextPluck, t + 1.2);
    schedule();
    timer = setInterval(schedule, 250);
    return true;
  }

  function stop() {
    on = false;
    clearInterval(timer);
    if (!ctx) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.6);
  }

  var effects = {
    caught: function (t) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(330, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.28);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g); g.connect(fxBus); o.start(t); o.stop(t + 0.35);
    },
    blocked: function (t) {
      voice(hz(52), "sawtooth", t, 0.01, 0.08, 0.2, 0.04, fxBus);
      voice(hz(52), "sawtooth", t + 0.16, 0.01, 0.08, 0.2, 0.04, fxBus);
    },
    achievement: function (t) {
      voice(hz(76), "sine", t, 0.01, 0.08, 0.5, 0.12, fxBus);
      voice(hz(83), "sine", t + 0.12, 0.01, 0.1, 0.7, 0.12, fxBus);
      voice(hz(88), "sine", t + 0.24, 0.01, 0.12, 0.9, 0.1, fxBus);
    },
    ok: function (t) {
      voice(hz(72), "triangle", t, 0.01, 0.05, 0.3, 0.08, fxBus);
      voice(hz(79), "triangle", t + 0.09, 0.01, 0.05, 0.4, 0.08, fxBus);
    },
    tick: function (t) { voice(hz(96), "sine", t, 0.002, 0.01, 0.06, 0.04, fxBus); }
  };

  window.CampusSound = {
    isOn: function () { return on; },
    toggle: function () { if (on) { stop(); return false; } return start(); },
    play: function (name) {
      if (!on || !ctx || !effects[name]) return;
      effects[name](ctx.currentTime + 0.01);
    }
  };
})();
