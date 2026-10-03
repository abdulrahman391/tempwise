/* TempWise landing page: GitHub links, theme button, mobile menu and the live thermostat. */
(function () {
  /* ---------- GitHub links ---------- */
  var cfg = window.TEMPWISE_CONFIG || {};
  var repo = cfg.repo || '';
  if (!repo && /\.github\.io$/i.test(location.hostname)) {
    var user = location.hostname.split('.')[0];
    var name = location.pathname.split('/').filter(Boolean)[0];
    repo = name ? 'https://github.com/' + user + '/' + name : 'https://github.com/' + user + '/' + user + '.github.io';
  }
  document.querySelectorAll('[data-repo]').forEach(function (a) {
    if (repo) { a.href = repo; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.hidden = true; }
  });

  /* ---------- theme (shared with the app) ---------- */
  var ICON = {
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/></svg>',
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    auto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18z" fill="currentColor"/></svg>'
  };
  function getTheme() { try { return localStorage.getItem('tempwise:theme') || 'dark'; } catch (e) { return 'dark'; } }
  var themeBtn = document.getElementById('theme-btn');
  function paintTheme() {
    var t = getTheme(), root = document.documentElement;
    if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
    themeBtn.innerHTML = ICON[t];
    themeBtn.setAttribute('aria-label', 'Theme: ' + t + '. Tap to change');
    themeBtn.title = 'Theme: ' + t;
  }
  themeBtn.addEventListener('click', function () {
    var order = ['dark', 'light', 'auto'], next = order[(order.indexOf(getTheme()) + 1) % 3];
    try { localStorage.setItem('tempwise:theme', next); } catch (e) {}
    paintTheme();
  });
  paintTheme();

  /* ---------- mobile menu ---------- */
  var nav = document.querySelector('.nav'), menuBtn = document.getElementById('menu-btn');
  function setMenu(open) { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  document.querySelectorAll('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- live thermostat ---------- */
  var svg = document.getElementById('lv-svg');
  if (!svg) return;
  var el = {
    target: document.getElementById('lv-target'), now: document.getElementById('lv-now'),
    hint: document.getElementById('lv-hint'), status: document.getElementById('lv-status'),
    unit: document.getElementById('lv-unit')
  };
  var SCENES = { comfort: 21, busy: 19.5, eco: 24 };
  var state = { target: 21, cur: 24.4, unit: 'C', scene: 'comfort' };
  var MIN = 10, MAX = 32, A0 = -210, A1 = 30;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ang = function (c) { return A0 + (clamp(c, MIN, MAX) - MIN) / (MAX - MIN) * (A1 - A0); };
  var pt = function (a, r) { return [100 + r * Math.cos(a * Math.PI / 180), 100 + r * Math.sin(a * Math.PI / 180)]; };
  function arc(a0, a1, r) {
    var p0 = pt(a0, r), p1 = pt(a1, r);
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }
  var temp = function (c) { var v = state.unit === 'F' ? c * 9 / 5 + 32 : c; return v.toFixed(state.unit === 'F' ? 0 : 1); };

  function draw() {
    var t = pt(ang(state.target), 78), c = pt(ang(state.cur), 66), ticks = '';
    for (var v = MIN; v <= MAX; v += 2) {
      var a = pt(ang(v), 90), b = pt(ang(v), v % 4 ? 94 : 97);
      ticks += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="var(--line)" stroke-width="1.5"/>';
    }
    svg.innerHTML =
      '<defs><linearGradient id="lvg" x1="0" x2="1"><stop offset="0" stop-color="var(--cold)"/><stop offset=".55" stop-color="var(--accent-2)"/><stop offset="1" stop-color="var(--heat)"/></linearGradient></defs>' + ticks +
      '<path d="' + arc(A0, A1, 78) + '" fill="none" stroke="var(--surface-2)" stroke-width="12" stroke-linecap="round"/>' +
      '<path d="' + arc(A0, ang(state.target), 78) + '" fill="none" stroke="url(#lvg)" stroke-width="12" stroke-linecap="round"/>' +
      '<circle cx="' + t[0].toFixed(1) + '" cy="' + t[1].toFixed(1) + '" r="9" fill="var(--fg)" stroke="var(--surface)" stroke-width="3"/>' +
      '<circle cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="3.5" fill="var(--fg)" opacity=".75"/>';
    el.target.innerHTML = temp(state.target) + '<sup>°' + state.unit + '</sup>';
    el.now.textContent = temp(state.cur) + '°' + state.unit;
    var diff = state.cur - state.target;
    if (Math.abs(diff) < 0.3) { el.status.textContent = 'At target'; el.status.className = 'tag ok'; el.hint.textContent = 'Holding steady'; }
    else if (diff > 0) { el.status.textContent = 'Cooling'; el.status.className = 'tag'; el.hint.textContent = 'Cooling to target'; }
    else { el.status.textContent = 'Warming'; el.status.className = 'tag'; el.hint.textContent = 'Warming to target'; }
  }
  function setScene(k) {
    state.scene = k; if (k) state.target = SCENES[k];
    document.querySelectorAll('[data-lv]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lv === k)); });
    draw();
  }
  function step(d) {
    var s = state.unit === 'F' ? 5 / 9 : 0.5;
    state.target = clamp(Math.round((state.target + d * s) * 100) / 100, MIN, MAX);
    var match = Object.keys(SCENES).filter(function (k) { return Math.abs(SCENES[k] - state.target) < 0.01; })[0] || null;
    setScene(match);
  }
  document.getElementById('lv-minus').addEventListener('click', function () { step(-1); });
  document.getElementById('lv-plus').addEventListener('click', function () { step(1); });
  document.querySelectorAll('[data-lv]').forEach(function (b) { b.addEventListener('click', function () { setScene(b.dataset.lv); }); });
  el.unit.addEventListener('click', function () { state.unit = state.unit === 'C' ? 'F' : 'C'; el.unit.textContent = '°' + state.unit; draw(); });

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  setInterval(function () {
    var d = state.target - state.cur;
    state.cur += reduce ? d : d * 0.05 + (Math.random() - 0.5) * 0.02;
    draw();
  }, 200);
  setScene('comfort');
})();
