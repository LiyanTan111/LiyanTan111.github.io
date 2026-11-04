/* MobileSpec 项目页的交互图表。数值取自论文表格；搜索空间曲线、INT4 上的 QES 曲线与 iPhone 损失曲线由论文矢量图读取；玩具矩阵与 ES 成员动画仅作示意。 */
(function () {
  'use strict';
  var PP = window.PP, svg = PP.svg, text = PP.text;
  var css = getComputedStyle(document.documentElement);
  function v(n) { return css.getPropertyValue(n).trim(); }
  var C = { ours: v('--s-ours'), sel: v('--s-mezo'), green: '#2a8a6b', violet: '#8a63b8', ink: v('--ink'), text: v('--text'), muted: v('--muted'),
            faint: v('--faint'), line: v('--line'), soft: v('--line-soft'), base: '#9aa6b6', surface: '#ffffff', accentSoft: v('--accent-soft') };
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function width(el, max) { return Math.max(280, Math.min(max || 760, Math.round(el.clientWidth || max || 760))); }
  var renders = [];
  function onResize(fn) { renders.push(fn); }
  var rt = 0, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastW) < 8) return; lastW = window.innerWidth;
    clearTimeout(rt); rt = setTimeout(function () { renders.forEach(function (f) { f(); }); }, 150);
  });
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function mul(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gs(r) { var u = 0, w = 0; while (u === 0) u = r(); while (w === 0) w = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); }
  function hoverTip(s, W, node, x, y, title, rows, tip) {
    node.addEventListener('pointermove', function () { var b = s.getBoundingClientRect(), k = b.width / W; tip.show(x * k, (y - 10) * k, title, rows); });
    node.addEventListener('pointerleave', function () { tip.hide(); });
  }
  var DATA = {"mot":[{"Full ES":[1.2,16.6,19.4,22.0,22.2,23.8,26.4,27.6,29.6],"LoRA-ES":[1.2,18.0,22.4,24.8,25.2,26.4,28.4,29.2,28.65],"Uni-LoRA-ES":[1.2,14.8,20.8,19.0,20.6,22.2,21.0,20.2,16.3],"FuRA-S":[1.2,21.4,23.8,27.6,29.8,33.6,34.2,35.0,34.2]},{"Full ES":[70.8,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"LoRA-ES":[55.2,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"Uni-LoRA-ES":[50.0,3.34,3.34,0.0,3.34,0.0,0.0,0.0,0.0],"FuRA-S":[61.0,6.2,10.0,13.34,6.67,3.34,0.0,0.0,0.0]},{"Full ES":[0.0,0.008,0.019,0.021,0.028,0.034,0.044,0.052,0.062],"LoRA-ES":[0.0,0.014,0.026,0.029,0.038,0.04,0.048,0.064,0.074],"Uni-LoRA-ES":[0.0,0.008,0.031,0.062,0.106,0.134,0.187,0.244,0.374],"FuRA-S":[0.0,0.007,0.013,0.021,0.032,0.042,0.04,0.058,0.063]}],"qes":{"1.5B":{"QES":[[0.0,3.4],[1.0,2.55],[26.0,5.5],[51.0,8.45],[76.0,9.15],[101.0,13.95],[126.0,15.4],[151.0,16.6],[176.0,16.45],[201.0,16.75],[226.0,15.9],[251.0,16.5],[276.0,15.6],[300.0,16.0]],"FuRA-S":[[0,3.55],[25,15.95],[50,17.7],[75,18.55],[100,18.9],[125,19.5],[150,19.5],[175,19.5],[200,20.1],[225,20.45],[250,21.7],[275,22.25],[300,21.85]]},"3B":{"QES":[[-0.0,2.95],[1.0,8.7],[26.0,12.85],[51.0,16.45],[76.0,22.95],[101.0,22.7],[126.0,21.95],[151.0,25.2],[176.0,25.5],[201.0,26.05],[226.0,27.4],[251.0,28.7],[276.0,33.6],[300.0,34.15]],"FuRA-S":[[0,3.25],[25,27.15],[50,39.2],[75,41.85],[100,43.75],[125,45.35],[150,46.65],[175,47.75],[200,48.0],[225,48.95],[250,49.85],[275,49.05],[300,50.4]]}},"dev":{"training":[[0.23,0.823],[0.7,0.663],[1.2,0.595],[1.69,0.485],[2.19,0.434],[2.68,0.395],[3.18,0.354],[3.68,0.33],[4.17,0.295],[4.66,0.261],[5.15,0.253],[5.64,0.231],[6.13,0.199],[6.62,0.185],[7.11,0.189],[7.63,0.173],[8.21,0.17],[8.83,0.169],[9.48,0.164],[10.12,0.157]],"validation":[[0.0,0.85],[0.46,0.637],[0.95,0.531],[1.45,0.513],[1.94,0.445],[2.44,0.379],[2.93,0.348],[3.43,0.307],[3.93,0.303],[4.42,0.25],[4.91,0.248],[5.4,0.263],[5.89,0.232],[6.38,0.231],[6.88,0.245],[7.37,0.219],[7.91,0.273],[8.53,0.23],[9.15,0.206],[9.81,0.193],[10.45,0.191]]}};

  /* =====================================================================
     1) 主图：晚上在手机上训练一个专家（任务选择 + ES 循环 + 存储 + 服务公式）
     ===================================================================== */
  (function system() {
    var root = document.getElementById('w-sys'); if (!root) return;
    var host = document.getElementById('chart-sys'), capEl = document.getElementById('sys-cap'), tasksEl = document.getElementById('sys-tasks');
    var TASKS = [
      { id: 'reply', name: 'MastodonReply', label: 'Reply to a post', ask: 'Reply to that Mastodon post for me.', fail: 'Searched the post’s text and scrolled to the step limit', ok: 'Opened the author’s account and replied', base: 23.4, ep: 79.7, sw: 89.1, col: '#3866aa' },
      { id: 'alarm', name: 'CheckEventTime', label: 'Alarm from an email', ask: 'Set an alarm 1 h before tonight’s event in my email.', fail: 'Party at 7:00 pm · alarm set for 6:00 am', ok: 'Party at 7:00 pm · alarm set for 6:00 pm', base: 9.4, ep: 92.2, sw: 100.0, col: '#cf8c4a' },
      { id: 'carpool', name: 'RequestCarpooling', label: 'Ask for a ride', ask: 'Text my contact and ask for a ride.', fail: 'Did not finish within 30 steps', ok: 'Ride request sent', base: 6.2, ep: 14.1, sw: 98.4, col: '#2a8a6b' },
      { id: 'follow', name: 'MastodonFollow', label: 'Follow an account', ask: 'Follow this Mastodon account.', fail: 'Did not finish within 30 steps', ok: 'Account followed', base: 23.4, ep: 64.1, sw: 64.1, col: '#8a63b8' },
      { id: 'poll', name: 'MastodonPostPoll', label: 'Post a poll', ask: 'Post a poll with these hashtags.', fail: 'Did not finish within 30 steps', ok: 'Poll posted with the hashtags', base: 9.4, ep: 20.3, sw: 68.8, col: '#b0577a' }
    ];
    var cur = 0, iter = 0, playing = false, timer = 0, trained = {}, shown = null, rnd = mul(7);
    TASKS.forEach(function (t, k) {
      var b = document.createElement('button'); b.type = 'button'; b.style.setProperty('--c', t.col);
      b.appendChild(el('b', null, t.label)); b.appendChild(el('span', null, t.name));
      b.addEventListener('click', function () { if (playing) return; cur = k; iter = trained[t.id] ? 15 : 0; render(); });
      tasksEl.appendChild(b);
    });
    function bubble(s, x, y, w, txt, me, col) {
      var lines = wrap(txt, me ? 26 : 28), h = 12 + lines.length * 15;
      svg('rect', { x: me ? x + 18 : x, y: y, width: w - 18, height: h, rx: 10, fill: me ? C.accentSoft : '#f3f4f6', stroke: col || 'none', 'stroke-width': col ? 1.5 : 0 }, s);
      lines.forEach(function (l, i) { text(s, (me ? x + 28 : x + 10), y + 19 + i * 15, l, { 'font-size': 11.5, fill: C.ink }); });
      return y + h;
    }
    function wrap(t, n) { var out = [], line = ''; t.split(' ').forEach(function (w) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; }
    function render() {
      clear(host);
      var cw = host.clientWidth || 760, narrow = cw < 640, VW = narrow ? 360 : 800;
      var s = svg('svg', { viewBox: '0 0 ' + VW + ' 10', role: 'img', 'aria-label': 'MobileSpec trains a specialist for one task' }, host);
      var t = TASKS[cur], done = iter >= 15, rate = done ? t.sw : t.base;
      [].forEach.call(tasksEl.children, function (b, k) { b.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); b.classList.toggle('is-done', !!trained[TASKS[k].id]); });
      /* 手机 */
      var px = narrow ? (VW - 236) / 2 : 10, py = 8, pw = narrow ? 236 : 196, ph = narrow ? 350 : 350;
      svg('rect', { x: px, y: py, width: pw, height: ph, rx: 26, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, s);
      svg('rect', { x: px + pw / 2 - 26, y: py + 9, width: 52, height: 9, rx: 4.5, fill: C.ink }, s);
      text(s, px + pw / 2, py + 38, done ? 'Tue 8:00 am' : 'Mon 8:00 am', { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted });
      var yy = bubble(s, px + 10, py + 48, pw - 20, t.ask, true);
      var res = (done ? '✓ ' + t.ok : '✗ ' + t.fail);
      yy = bubble(s, px + 10, yy + 10, pw - 20, res, false, done ? C.ours : '#d58a8a');
      var val = shown === null ? rate : shown, hits = Math.round(val * 64 / 100), gx = px + pw / 2 - 3.5 * 11, gy = Math.max(yy + 16, py + ph - 168);
      for (var e = 0; e < 64; e++) svg('circle', { cx: gx + (e % 8) * 11, cy: gy + Math.floor(e / 8) * 11, r: 3.6, fill: e < hits ? (done ? C.ours : C.ink) : '#fff', stroke: e < hits ? 'none' : C.line, 'stroke-width': 1.2 }, s);
      text(s, px + pw / 2, py + ph - 70, done ? 'specialist' : 'generalist', { 'text-anchor': 'middle', 'font-size': 11, fill: C.muted });
      text(s, px + pw / 2, py + ph - 40, val.toFixed(1) + '%', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700, fill: done ? C.ours : C.ink, 'font-variant-numeric': 'tabular-nums' });
      text(s, px + pw / 2, py + ph - 22, 'success on 64 new episodes', { 'text-anchor': 'middle', 'font-size': 10, fill: C.muted });
      /* ES 循环 */
      var ex = narrow ? 8 : pw + 34, ey = narrow ? py + ph + 22 : 8, ew = narrow ? VW - 16 : 352, eh = 226;
      svg('rect', { x: ex, y: ey, width: ew, height: eh, rx: 14, fill: '#f7f9fc', stroke: C.line }, s);
      text(s, ex + 14, ey + 22, 'Forward-only ES', { 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
      text(s, ex + ew - 14, ey + 22, 'iteration ' + iter + '/15 · ' + (iter * 64) + ' episodes', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted, 'font-variant-numeric': 'tabular-nums' });
      var cx = ex + ew / 2, cy = ey + 112, active = playing;
      for (var j = 0; j < 8; j++) {
        [1, -1].forEach(function (sg) {
          var mx = cx + sg * 110, my = cy - 62 + j * 17.5, f = active ? 0.25 + 0.75 * rnd() : 0.35;
          svg('line', { x1: cx + sg * 14, y1: cy, x2: mx - sg * 7, y2: my, stroke: C.line, 'stroke-width': 1 }, s);
          svg('rect', { x: mx - 6, y: my - 7, width: 12, height: 14, rx: 3, fill: '#fff', stroke: sg > 0 ? C.ours : C.sel, 'stroke-width': 1.3 }, s);
          svg('rect', { x: sg > 0 ? mx + 10 : mx - 10 - 30 * f, y: my - 3, width: 30 * f, height: 6, rx: 3, fill: sg > 0 ? C.ours : C.sel, 'fill-opacity': active ? 0.55 : 0.18 }, s);
        });
      }
      text(s, cx - 110, ey + 40, 'θ − Dz', { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted });
      text(s, cx + 110, ey + 40, 'θ + Dz', { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted });
      svg('circle', { cx: cx, cy: cy, r: 13, fill: done ? C.ours : '#fff', stroke: C.ours, 'stroke-width': 2 }, s);
      text(s, cx, cy + 4.5, 'θ', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: done ? '#fff' : C.ours });
      text(s, ex + 14, ey + eh - 24, '8 antithetic pairs, each member tries the task 4 times', { 'font-size': 10.5, fill: C.muted });
      text(s, ex + 14, ey + eh - 9, 'θ ← θ + (α/N) D Σ (F⁺ − F⁻) z  ·  bars: fitness (schematic)', { 'font-size': 10.5, fill: C.ink });
      /* 存储 */
      var sx = narrow ? 8 : ex + ew + 18, sy = narrow ? ey + eh + 14 : 8, sw = narrow ? VW - 16 : VW - sx - 8, sh = 226;
      svg('rect', { x: sx, y: sy, width: sw, height: sh, rx: 14, fill: '#fff', stroke: C.line }, s);
      text(s, sx + 14, sy + 22, 'Storage (flash)', { 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
      svg('rect', { x: sx + 14, y: sy + 34, width: sw - 28, height: 54, rx: 8, fill: '#eef1f5', stroke: C.line }, s);
      text(s, sx + 26, sy + 56, 'Generalist · INT4', { 'font-size': 11.5, 'font-weight': 600, fill: C.ink });
      text(s, sx + 26, sy + 74, '≈ 2 GB, shared, frozen', { 'font-size': 10.5, fill: C.muted });
      text(s, sx + 14, sy + 108, 'Specialists · 2 MB each (δ)', { 'font-size': 11.5, 'font-weight': 600, fill: C.ink });
      TASKS.forEach(function (tk, k) {
        var ry = sy + 120 + k * 17, on = !!trained[tk.id] || (k === cur && done);
        svg('rect', { x: sx + 14, y: ry, width: 11, height: 11, rx: 2.5, fill: on ? tk.col : '#fff', stroke: tk.col, 'stroke-width': 1.4 }, s);
        text(s, sx + 32, ry + 9.5, 'δ_' + tk.id + (on ? '  ✓' : ''), { 'font-size': 10.5, fill: on ? C.ink : C.muted, 'font-weight': k === cur ? 700 : 400 });
      });
      /* 服务公式 */
      var vy = narrow ? sy + sh + 16 : ey + eh + 16, vx = narrow ? 8 : ex, vw = narrow ? VW - 16 : VW - ex - 8, vh = narrow ? 108 : 100;
      svg('rect', { x: vx, y: vy, width: vw, height: vh, rx: 14, fill: '#fff', stroke: C.line }, s);
      text(s, vx + 14, vy + 22, narrow ? 'Serving (RAM)' : 'Serving (RAM): the specialist is a transformation of the input', { 'font-size': 12, 'font-weight': 700, fill: C.ink });
      var by = vy + 60, pad = narrow ? 10 : 22;
      var BOX = [['x', null, 26, 44], ['Rᵀ', '#eef1f5', 30, 44], ['diag(δ)', t.col, 46, 70], ['R', '#eef1f5', 30, 44], ['+ x', null, 30, 44], [narrow ? 'W_q' : 'W_q · INT4', '#dfe7f3', 38, 84], ['y', null, 22, 44]];
      var tot = 0; BOX.forEach(function (q) { tot += narrow ? q[2] : q[3]; });
      var gap = (vw - 2 * pad - tot) / (BOX.length - 1), xx = vx + pad;
      BOX.forEach(function (q, k) {
        var w = narrow ? q[2] : q[3];
        if (q[1]) svg('rect', { x: xx, y: by - 16, width: w, height: 30, rx: 7, fill: q[1], 'fill-opacity': k === 2 ? 0.85 : 1 }, s);
        text(s, xx + w / 2, by + 3.5, q[0], { 'text-anchor': 'middle', 'font-size': narrow ? 10.5 : 12, 'font-weight': 600, fill: k === 2 ? '#fff' : C.ink });
        if (k < BOX.length - 1) text(s, xx + w + gap / 2, by + 4, '→', { 'text-anchor': 'middle', 'font-size': 12, fill: C.faint });
        xx += w + gap;
      });
      text(s, vx + 14, vy + vh - 12, narrow ? 'y = W_q (x + R diag(δ) Rᵀ x) · δ = 0 gives the INT4 model' : 'y = W_q (x + R diag(δ) Rᵀ x)  ·  INT4 weights and kernels untouched  ·  switching tasks swaps only δ', { 'font-size': 10.5, fill: C.muted });
      var H = vy + vh + 6;
      s.setAttribute('viewBox', '0 0 ' + VW + ' ' + Math.max(H, py + ph + 6));
      document.getElementById('sys-train').textContent = playing ? 'Training…' : done ? 'Trained ✓' : 'Train tonight';
      document.getElementById('sys-train').disabled = playing || done;
      capEl.textContent = done ? (t.name + ': ' + t.base.toFixed(1) + '% → ' + t.sw.toFixed(1) + '% success after 15 iterations (960 episodes), from a 2 MB specialist that changes 0.024% of the model. With episode rewards alone the same training reaches ' + t.ep.toFixed(1) + '%.') :
        playing ? 'Members try the task in sandboxed apps; the step-wise fitness credits each action against what the other members did on the same screen.' :
        t.name + ': the generalist MAI-UI-2B succeeds in ' + t.base.toFixed(1) + '% of episodes. Press “Train tonight”.';
    }
    function tick() {
      iter++; render();
      if (iter >= 15) { playing = false; trained[TASKS[cur].id] = true; countUp(); return; }
      timer = setTimeout(tick, PP.reduceMotion ? 0 : 260);
    }
    function countUp() {
      var t = TASKS[cur], t0 = performance.now(), dur = PP.reduceMotion ? 1 : 700;
      (function f(now) { var p = Math.min(1, (now - t0) / dur); shown = t.base + (t.sw - t.base) * (1 - Math.pow(1 - p, 3)); render(); if (p < 1) requestAnimationFrame(f); else { shown = null; render(); } })(t0);
    }
    document.getElementById('sys-train').addEventListener('click', function () { if (playing || iter >= 15) return; playing = true; iter = 0; tick(); });
    document.getElementById('sys-reset').addEventListener('click', function () { clearTimeout(timer); playing = false; trained = {}; iter = 0; shown = null; render(); });
    render(); onResize(render);
  })();

  /* =====================================================================
     2) 玩具矩阵：块奇异值缩放会转动奇异向量（实时 Jacobi SVD）
     ===================================================================== */
  (function spectral() {
    var host = document.getElementById('chart-spec'); if (!host) return;
    var N = 12, TOP = 3;
    function zeros(m, n) { var a = []; for (var i = 0; i < m; i++) { a.push(new Float64Array(n)); } return a; }
    function col(A, j) { return A.map(function (r) { return r[j]; }); }
    /* 单边 Jacobi SVD：返回按降序排列的 U(m×n)、s(n)、V(n×n) */
    function svd(A0) {
      var m = A0.length, n = A0[0].length, A = A0.map(function (r) { return Float64Array.from(r); }), V = zeros(n, n), i, j, k;
      for (i = 0; i < n; i++) V[i][i] = 1;
      for (var sweep = 0; sweep < 60; sweep++) {
        var off = 0;
        for (j = 0; j < n - 1; j++) for (k = j + 1; k < n; k++) {
          var a = 0, b = 0, c = 0;
          for (i = 0; i < m; i++) { a += A[i][j] * A[i][j]; b += A[i][k] * A[i][k]; c += A[i][j] * A[i][k]; }
          if (Math.abs(c) <= 1e-15 * Math.sqrt(a * b)) continue;
          off = Math.max(off, Math.abs(c) / Math.sqrt(a * b));
          var z = (b - a) / (2 * c), t = (z >= 0 ? 1 : -1) / (Math.abs(z) + Math.sqrt(1 + z * z)), cs = 1 / Math.sqrt(1 + t * t), sn = cs * t;
          for (i = 0; i < m; i++) { var x = A[i][j], y = A[i][k]; A[i][j] = cs * x - sn * y; A[i][k] = sn * x + cs * y; }
          for (i = 0; i < n; i++) { var p = V[i][j], q = V[i][k]; V[i][j] = cs * p - sn * q; V[i][k] = sn * p + cs * q; }
        }
        if (off < 1e-13) break;
      }
      var s = [], ord = [];
      for (j = 0; j < n; j++) { var nn = 0; for (i = 0; i < m; i++) nn += A[i][j] * A[i][j]; s.push(Math.sqrt(nn)); ord.push(j); }
      ord.sort(function (p, q) { return s[q] - s[p]; });
      var U = zeros(m, n), Vs = zeros(n, n), ss = [];
      ord.forEach(function (o, c2) { ss.push(s[o]); for (i = 0; i < m; i++) U[i][c2] = s[o] > 1e-14 ? A[i][o] / s[o] : 0; for (i = 0; i < n; i++) Vs[i][c2] = V[i][o]; });
      return { U: U, s: ss, V: Vs };
    }
    function orth(r) { var G = zeros(N, N); for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) G[i][j] = gs(r); return svd(G).U; }
    var r0 = mul(11), U0 = orth(r0), V0 = orth(r0), SIG = [];
    for (var i = 0; i < N; i++) SIG.push(Math.exp(-i / 6));
    var W = zeros(N, N);
    for (var a = 0; a < N; a++) for (var b = 0; b < N; b++) { var acc = 0; for (var k = 0; k < N; k++) acc += U0[a][k] * SIG[k] * V0[b][k]; W[a][b] = acc; }
    var base = svd(W), WN = Math.sqrt(SIG.reduce(function (p, q) { return p + q * q; }, 0));
    /* 每种 K 的列块 SVD 只算一次 */
    var BLK = {};
    [1, 2, 3, 4].forEach(function (K) {
      var c = N / K, parts = [];
      for (var q = 0; q < K; q++) { var sub = W.map(function (row) { return Array.prototype.slice.call(row, q * c, q * c + c); }); parts.push(svd(sub)); }
      BLK[K] = parts;
    });
    function blockDelta(K, r) {
      var c = N / K, D = zeros(N, N);
      BLK[K].forEach(function (f, q) {
        var d = f.s.map(function () { return gs(r); });
        for (var a2 = 0; a2 < N; a2++) for (var b2 = 0; b2 < c; b2++) { var v2 = 0; for (var t2 = 0; t2 < c; t2++) v2 += f.U[a2][t2] * f.s[t2] * d[t2] * f.V[b2][t2]; D[a2][q * c + b2] = v2; }
      });
      return D;
    }
    function denseDelta(r) { var D = zeros(N, N); for (var a2 = 0; a2 < N; a2++) for (var b2 = 0; b2 < N; b2++) D[a2][b2] = gs(r); return D; }
    function scaleTo(D, rel) { var n2 = 0; D.forEach(function (row) { row.forEach(function (x) { n2 += x * x; }); }); var f = rel * WN / Math.sqrt(n2); return D.map(function (row) { return row.map(function (x) { return x * f; }); }); }
    function angle(A, B) {
      var M = zeros(TOP, TOP);
      for (var p = 0; p < TOP; p++) for (var q = 0; q < TOP; q++) { var v2 = 0; for (var t2 = 0; t2 < N; t2++) v2 += A[t2][p] * B[t2][q]; M[p][q] = v2; }
      var sm = svd(M).s, mn = Math.min.apply(null, sm);
      return Math.acos(Math.max(-1, Math.min(1, mn))) * 180 / Math.PI;
    }
    function measure(D) {
      var Wp = W.map(function (row, a2) { return row.map(function (x, b2) { return x + D[a2][b2]; }); }), f = svd(Wp), ds = 0, s0 = 0;
      f.s.forEach(function (x, t2) { ds += (x - base.s[t2]) * (x - base.s[t2]); s0 += base.s[t2] * base.s[t2]; });
      return { s: f.s, u: angle(base.U, f.U), v: angle(base.V, f.V), spec: Math.sqrt(ds / s0) * 100, D: D };
    }
    var K = 4, size = 3, seed = 1, avg = null, cur = null;
    function averages() {
      var r = mul(1234), out = { block: [0, 0], global: [0, 0], dense: [0, 0] }, R = 40;
      for (var t2 = 0; t2 < R; t2++) {
        var mb = measure(scaleTo(blockDelta(K, r), size / 100)), mg = K === 1 ? mb : measure(scaleTo(blockDelta(1, r), size / 100)), md = measure(scaleTo(denseDelta(r), size / 100));
        out.block[0] += mb.u / R; out.block[1] += mb.v / R; out.global[0] += mg.u / R; out.global[1] += mg.v / R; out.dense[0] += md.u / R; out.dense[1] += md.v / R;
      }
      return out;
    }
    function recompute(all) { if (all) avg = averages(); cur = measure(scaleTo(blockDelta(K, mul(seed * 97 + 5)), size / 100)); render(); }
    function render() {
      clear(host);
      var Wd = width(host, 860), narrow = Wd < 640, tip = PP.tooltip(host);
      var cell = narrow ? 17 : 15, hm = cell * N, H, s;
      var p1 = { x: 6, y: 34 }, p2, p3;
      if (narrow) { p2 = { x: 6, y: p1.y + hm + 80, w: Wd - 12 }; p3 = { x: 6, y: p2.y + 196, w: Wd - 12 }; H = p3.y + 196; }
      else { p2 = { x: hm + 48, y: 34, w: Math.round((Wd - hm - 48) * 0.44) }; p3 = { x: p2.x + p2.w + 34, y: 34, w: Wd - (p2.x + p2.w + 34) - 6 }; H = 34 + hm + 46; }
      s = svg('svg', { viewBox: '0 0 ' + Wd + ' ' + H, role: 'img', 'aria-label': 'Block-spectral perturbation of a toy matrix' }, host);
      /* 热力图：ΔW，块之间留缝 */
      text(s, p1.x, 16, 'Update ΔW, ' + K + (K === 1 ? ' block' : ' column blocks'), { 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
      var D = cur.D, mx = 0; D.forEach(function (row) { row.forEach(function (x) { mx = Math.max(mx, Math.abs(x)); }); });
      var c = N / K;
      for (var q = 0; q < K; q++) {
        var bx = p1.x + q * c * cell + q * 3;
        svg('rect', { x: bx, y: p1.y - 9, width: c * cell, height: 4, rx: 2, fill: C.ours, 'fill-opacity': .55 }, s);
        for (var a2 = 0; a2 < N; a2++) for (var b2 = 0; b2 < c; b2++) {
          var v2 = D[a2][q * c + b2] / mx, col2 = v2 >= 0 ? '56,102,170' : '207,140,74';
          svg('rect', { x: bx + b2 * cell, y: p1.y + a2 * cell, width: cell - 1, height: cell - 1, fill: 'rgba(' + col2 + ',' + (0.08 + 0.85 * Math.abs(v2)).toFixed(3) + ')' }, s);
        }
      }
      text(s, p1.x, p1.y + hm + 18, 'Each block keeps its own singular vectors;', { 'font-size': 10.5, fill: C.muted });
      text(s, p1.x, p1.y + hm + 32, 'only its singular values are rescaled.', { 'font-size': 10.5, fill: C.muted });
      /* 奇异值：前后对比 */
      var sh = narrow ? 120 : hm - 10, sy0 = p2.y + 6, bw = (p2.w - 30) / N;
      text(s, p2.x, 16 + (narrow ? p2.y - 34 : 0), 'Singular values of W', { 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
      text(s, p2.x + p2.w, 16 + (narrow ? p2.y - 34 : 0), 'change ' + cur.spec.toFixed(1) + '%', { 'text-anchor': 'end', 'font-size': 11.5, fill: C.muted, 'font-variant-numeric': 'tabular-nums' });
      var Ys = function (x) { return sy0 + sh - x / SIG[0] * (sh - 6); };
      svg('line', { x1: p2.x + 24, x2: p2.x + p2.w, y1: sy0 + sh, y2: sy0 + sh, stroke: C.line }, s);
      for (var t2 = 0; t2 < N; t2++) {
        var x0 = p2.x + 26 + t2 * bw, g = svg('g', {}, s);
        svg('rect', { x: x0, y: Ys(base.s[t2]), width: bw * 0.42, height: sy0 + sh - Ys(base.s[t2]), rx: 2, fill: '#c3cbd6' }, g);
        svg('rect', { x: x0 + bw * 0.46, y: Ys(cur.s[t2]), width: bw * 0.42, height: sy0 + sh - Ys(cur.s[t2]), rx: 2, fill: C.ours }, g);
        svg('rect', { x: x0 - 2, y: sy0, width: bw, height: sh, fill: 'transparent' }, g);
        hoverTip(s, Wd, g, x0 + bw / 2, Ys(base.s[t2]), 'σ' + (t2 + 1), [{ color: '#c3cbd6', value: base.s[t2].toFixed(3), label: 'before' }, { color: C.ours, value: cur.s[t2].toFixed(3), label: 'after' }], tip);
      }
      [0, 0.5, 1].forEach(function (f) { text(s, p2.x + 20, Ys(f * SIG[0]) + 4, f.toFixed(1), { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
      var lg = sy0 + sh + 18;
      svg('rect', { x: p2.x + 26, y: lg - 8, width: 10, height: 10, rx: 2, fill: '#c3cbd6' }, s); text(s, p2.x + 40, lg + 1, 'before', { 'font-size': 10.5, fill: C.muted });
      svg('rect', { x: p2.x + 88, y: lg - 8, width: 10, height: 10, rx: 2, fill: C.ours }, s); text(s, p2.x + 102, lg + 1, 'after', { 'font-size': 10.5, fill: C.muted });
      /* 子空间转角：块缩放 vs 全局缩放 vs 稠密更新 */
      var ty = narrow ? p3.y - 18 : 16;
      text(s, p3.x, ty, 'Rotation of the top-3 singular vectors', { 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
      var rows = [
        { k: 'block', name: K === 1 ? 'Global rescaling (1 block)' : 'Block rescaling (' + K + ' blocks)', col: C.ours, now: cur },
        { k: 'global', name: 'Global rescaling (SVF)', col: '#8f9bad' },
        { k: 'dense', name: 'Dense update, same ‖ΔW‖', col: C.sel }
      ];
      if (K === 1) rows.splice(1, 1);
      var mxA = Math.max(1, avg.block[0], avg.block[1], avg.dense[0], avg.dense[1], cur.u, cur.v) * 1.15, lx = p3.x + 22, lw = p3.w - 60;
      var X = function (d) { return lx + d / mxA * lw; }, ry = (narrow ? p3.y : p3.y) + 8;
      rows.forEach(function (rw, n) {
        var yb = ry + n * 54;
        text(s, p3.x, yb + 8, rw.name, { 'font-size': 11.5, 'font-weight': rw.k === 'block' ? 700 : 500, fill: C.ink });
        ['U', 'V'].forEach(function (lab, z) {
          var y3 = yb + 16 + z * 15, val = avg[rw.k][z], g = svg('g', {}, s);
          text(g, p3.x + 2, y3 + 9, lab, { 'font-size': 10.5, fill: C.muted, 'font-style': 'italic' });
          svg('rect', { x: lx, y: y3, width: Math.max(2, X(val) - lx), height: 11, rx: 3, fill: rw.col, 'fill-opacity': z ? .6 : .9 }, g);
          text(g, X(val) + 6, y3 + 9.5, val.toFixed(1) + '°', { 'font-size': 10.5, fill: C.text, 'font-variant-numeric': 'tabular-nums' });
          if (rw.now) svg('line', { x1: X(z ? cur.v : cur.u), x2: X(z ? cur.v : cur.u), y1: y3 - 2.5, y2: y3 + 13.5, stroke: C.ink, 'stroke-width': 2 }, g);
          svg('rect', { x: p3.x, y: y3 - 2, width: p3.w, height: 15, fill: 'transparent' }, g);
          var rws = [{ color: rw.col, value: val.toFixed(2) + '°', label: 'mean over 40 draws' }];
          if (rw.now) rws.push({ color: C.ink, value: (z ? cur.v : cur.u).toFixed(2) + '°', label: 'this draw' });
          hoverTip(s, Wd, g, X(val), y3, rw.name + ' · ' + (z ? 'right (V)' : 'left (U)'), rws, tip);
        });
      });
      var ny = ry + rows.length * 54 + 4;
      svg('line', { x1: lx, x2: lx + 14, y1: ny, y2: ny, stroke: C.ink, 'stroke-width': 2, transform: 'rotate(90 ' + (lx + 7) + ' ' + ny + ')' }, s);
      text(s, lx + 16, ny + 4, 'this draw', { 'font-size': 10.5, fill: C.muted });
    }
    PP.segmented(document.getElementById('seg-k'), function (v2) { K = +v2; recompute(true); });
    PP.slider(document.getElementById('spec-size'), document.getElementById('spec-size-out'), function (x) { return x + '%'; }, function (x) { var first = avg === null; size = x; if (!first) recompute(true); });
    document.getElementById('spec-draw').addEventListener('click', function () { seed++; recompute(false); });
    recompute(true); onResize(render);
  })();

  /* =====================================================================
     3) 四种搜索空间：准确率 / 优于中心的成员比例 / KL（三图联动悬停）
     ===================================================================== */
  (function search() {
    var host = document.getElementById('search-panels'); if (!host) return;
    var ORDER = ['FuRA-S', 'Full ES', 'LoRA-ES', 'Uni-LoRA-ES'];
    var COL = { 'FuRA-S': C.ours, 'Full ES': C.sel, 'LoRA-ES': C.green, 'Uni-LoRA-ES': C.violet };
    var LAB = { 'FuRA-S': 'FuRA-S (ours)', 'Full ES': 'Full-parameter ES', 'LoRA-ES': 'LoRA-ES', 'Uni-LoRA-ES': 'Uni-LoRA-ES' };
    var PANELS = [
      { title: 'Test accuracy (%)', d: DATA.mot[0], max: 40, ticks: [0, 10, 20, 30, 40], f: function (x) { return x.toFixed(1) + '%'; } },
      { title: 'Perturbations beating the model (%)', d: DATA.mot[1], max: 80, ticks: [0, 20, 40, 60, 80], f: function (x) { return x.toFixed(1) + '%'; } },
      { title: 'KL from the base policy', d: DATA.mot[2], max: 0.4, ticks: [0, 0.1, 0.2, 0.3, 0.4], f: function (x) { return x.toFixed(3); } }
    ];
    var IT = [0, 25, 50, 75, 100, 125, 150, 175, 200];
    var leg = document.getElementById('search-legend'); clear(leg);
    ORDER.forEach(function (k) { var sp = el('span'); var i = el('i'); i.style.background = COL[k]; sp.appendChild(i); sp.appendChild(document.createTextNode(LAB[k])); leg.appendChild(sp); });
    var hooks = [];
    function render() {
      clear(host); hooks = [];
      PANELS.forEach(function (P) {
        var box = el('div'); box.style.position = 'relative'; host.appendChild(box);
        var W = Math.max(260, Math.min(420, box.clientWidth || 300)), H = 230, m = { l: 40, r: 12, t: 28, b: 30 };
        var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': P.title }, box), tip = PP.tooltip(box);
        var X = function (it) { return m.l + it / 200 * (W - m.l - m.r); }, Y = function (v2) { return H - m.b - v2 / P.max * (H - m.t - m.b); };
        text(s, m.l - 34, 14, P.title, { 'font-size': 12, 'font-weight': 700, fill: C.ink });
        P.ticks.forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft }, s); text(s, m.l - 6, Y(t) + 4, P.max < 1 ? t.toFixed(1) : t, { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
        [0, 100, 200].forEach(function (t) { text(s, X(t), H - m.b + 16, t, { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted }); });
        text(s, W - m.r, H - 2, 'iteration', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted });
        ORDER.slice().reverse().forEach(function (k) {
          var d = P.d[k].map(function (v2, i) { return (i ? 'L' : 'M') + X(IT[i]).toFixed(1) + ',' + Y(v2).toFixed(1); }).join('');
          svg('path', { d: d, fill: 'none', stroke: COL[k], 'stroke-width': k === 'FuRA-S' ? 2.4 : 1.8, 'stroke-linejoin': 'round' }, s);
        });
        var cross = svg('line', { y1: m.t, y2: H - m.b, stroke: C.ink, 'stroke-opacity': .4, opacity: 0 }, s);
        var dots = ORDER.map(function (k) { return svg('circle', { r: 3.8, fill: COL[k], stroke: '#fff', 'stroke-width': 1.4, opacity: 0 }, s); });
        var hit = svg('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent', style: 'cursor:crosshair' }, s);
        function show(i, withTip) {
          cross.setAttribute('x1', X(IT[i])); cross.setAttribute('x2', X(IT[i])); cross.setAttribute('opacity', 1);
          ORDER.forEach(function (k, n) { dots[n].setAttribute('cx', X(IT[i])); dots[n].setAttribute('cy', Y(P.d[k][i])); dots[n].setAttribute('opacity', 1); });
          if (withTip) { var b = s.getBoundingClientRect(), kk = b.width / W; tip.show(X(IT[i]) * kk, (m.t + 10) * kk, 'Iteration ' + IT[i], ORDER.map(function (k) { return { color: COL[k], value: P.f(P.d[k][i]), label: LAB[k] }; })); }
          else tip.hide();
        }
        function hide() { cross.setAttribute('opacity', 0); dots.forEach(function (d) { d.setAttribute('opacity', 0); }); tip.hide(); }
        hooks.push({ show: show, hide: hide });
        function move(ev) { var b = s.getBoundingClientRect(), px = (ev.clientX - b.left) * W / b.width, i = Math.max(0, Math.min(8, Math.round((px - m.l) / (W - m.l - m.r) * 8))); hooks.forEach(function (h) { h.show(i, h.show === show); }); }
        hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
        hit.addEventListener('pointerleave', function () { hooks.forEach(function (h) { h.hide(); }); });
      });
    }
    render(); onResize(render);
  })();

  /* =====================================================================
     4) MobileWorld：每个任务一列（论文表）
     ===================================================================== */
  (function agent() {
    var host = document.getElementById('chart-agent'); if (!host) return;
    var T = [['Mastodon', 'Reply', 23.4, 79.7, 89.1], ['Check', 'EventTime', 9.4, 92.2, 100.0], ['Request', 'Carpooling', 6.2, 14.1, 98.4], ['Mastodon', 'Follow', 23.4, 64.1, 64.1], ['Mastodon', 'PostPoll', 9.4, 20.3, 68.8]];
    function render() {
      clear(host);
      var W = width(host, 760), narrow = W < 520, H = 330, m = { l: 40, r: 8, t: 46, b: 44 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Success rate by MobileWorld task' }, host), tip = PP.tooltip(host);
      var cw = (W - m.l - m.r) / T.length, Y = function (v2) { return H - m.b - v2 / 100 * (H - m.t - m.b); };
      [0, 25, 50, 75, 100].forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft }, s); text(s, m.l - 8, Y(t) + 4, t + '%', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
      text(s, m.l - 32, 14, 'Gain', { 'font-size': 10.5, fill: C.muted });
      T.forEach(function (r, i) {
        var cx = m.l + cw * (i + 0.5), g = svg('g', {}, s);
        svg('rect', { x: cx - cw / 2 + 2, y: m.t - 6, width: cw - 4, height: H - m.t - m.b + 6, rx: 6, fill: 'transparent' }, g);
        svg('line', { x1: cx, x2: cx, y1: Y(r[2]), y2: Y(r[4]), stroke: C.ours, 'stroke-width': 2.2, 'stroke-opacity': .55 }, g);
        svg('circle', { cx: cx, cy: Y(r[2]), r: 5.5, fill: C.base, stroke: '#fff', 'stroke-width': 1.6 }, g);
        svg('circle', { cx: cx + (narrow ? 9 : 12), cy: Y(r[3]), r: 5, fill: C.sel, stroke: '#fff', 'stroke-width': 1.6 }, g);
        svg('circle', { cx: cx, cy: Y(r[4]), r: 6.5, fill: C.ours, stroke: '#fff', 'stroke-width': 1.8 }, g);
        text(g, cx - 10, Y(r[4]) + 4, r[4].toFixed(r[4] === 100 ? 0 : 1), { 'text-anchor': 'end', 'font-size': 11, 'font-weight': 600, fill: C.ink });
        text(g, cx - 10, Y(r[2]) + 4, r[2].toFixed(1), { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted });
        text(g, cx, 14, '+' + (r[4] - r[2]).toFixed(1), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.ours, 'font-variant-numeric': 'tabular-nums' });
        text(g, cx, H - m.b + 17, r[0], { 'text-anchor': 'middle', 'font-size': narrow ? 10 : 11.5, fill: C.text });
        text(g, cx, H - m.b + 31, r[1], { 'text-anchor': 'middle', 'font-size': narrow ? 10 : 11.5, fill: C.text });
        hoverTip(s, W, g, cx, Y(r[4]), r[0] + r[1] + ' · success on 64 episodes', [{ color: C.base, value: r[2].toFixed(1) + '%', label: 'generalist' }, { color: C.sel, value: r[3].toFixed(1) + '%', label: 'episode reward' }, { color: C.ours, value: r[4].toFixed(1) + '%', label: 'step-wise fitness' }], tip);
      });
    }
    render(); onResize(render);
  })();

  /* =====================================================================
     5) Countdown / MATH 准确率（论文表）
     ===================================================================== */
  (function rlvr() {
    var host = document.getElementById('chart-rlvr'); if (!host) return;
    var D = {
      countdown: {
        sub: 'Countdown test accuracy (%) after ES training, by base model. Dots are ES in four search spaces; the dash is the best of PPO, GRPO and Dr. GRPO, which train by backpropagation. The top row is FuRA-S minus LoRA-ES.',
        x: ['Qwen2.5-0.5B', 'Llama-3.2-1B', 'Qwen2.5-1.5B', 'Qwen2.5-3B', 'Qwen2.5-7B'], xs: ['Qwen 0.5B', 'Llama 1B', 'Qwen 1.5B', 'Qwen 3B', 'Qwen 7B'],
        orig: [0.1, 0.4, 0.7, 10.0, 31.2],
        s: { 'FuRA-S': [14.4, 15.8, 37.0, 55.8, 56.2], 'Full ES': [14.4, 15.6, 36.7, 58.2, 58.9], 'LoRA-ES': [12.6, 11.7, 34.7, 54.3, 55.5], 'VeRA-ES': [13.5, 13.7, 28.1, 55.2, 54.2] },
        bp: { PPO: [0.3, 11.2, 14.2, 20.1, 55.1], GRPO: [13.0, 14.9, 27.8, 37.8, 57.0], 'Dr. GRPO': [13.5, 13.9, 31.0, 43.8, 57.5] },
        max: 60, ticks: [0, 20, 40, 60]
      },
      math: {
        sub: 'Greedy pass@1 (%) of Qwen2.5-Math-7B at the final checkpoint, by benchmark. Avg-3 averages the three larger sets (MATH500, Minerva, OlympiadBench). The top row is FuRA-S minus LoRA-ES.',
        x: ['AIME24', 'AMC', 'MATH500', 'Minerva', 'Olympiad', 'Avg-5', 'Avg-3'], xs: ['AIME24', 'AMC', 'MATH500', 'Minerva', 'Olympiad', 'Avg-5', 'Avg-3'],
        s: { 'FuRA-S': [23.3, 54.2, 76.8, 26.5, 40.0, 44.2, 47.8], 'Full ES': [26.7, 57.8, 77.6, 26.8, 37.0, 45.2, 47.2], 'LoRA-ES': [16.7, 53.0, 74.0, 22.8, 35.4, 40.4, 44.1] },
        max: 80, ticks: [0, 20, 40, 60, 80]
      }
    };
    var COL = { 'FuRA-S': C.ours, 'Full ES': C.sel, 'LoRA-ES': C.green, 'VeRA-ES': C.violet };
    var LAB = { 'FuRA-S': 'FuRA-S (ours)', 'Full ES': 'Full-parameter ES', 'LoRA-ES': 'LoRA-ES', 'VeRA-ES': 'VeRA-ES' };
    var key = 'countdown';
    function render() {
      clear(host);
      var d = D[key], names = Object.keys(d.s), W = width(host, 760), narrow = W < 560, H = 320, m = { l: 40, r: 8, t: 40, b: narrow && key === 'math' ? 40 : 30 };
      document.getElementById('rlvr-sub').textContent = d.sub;
      var leg = document.getElementById('rlvr-legend'); clear(leg);
      names.forEach(function (k) { var sp = el('span'), i = el('i'); i.style.background = COL[k]; sp.appendChild(i); sp.appendChild(document.createTextNode(LAB[k])); leg.appendChild(sp); });
      if (d.bp) { var sp = el('span'), i = el('i'); i.style.background = C.ink; i.style.height = '2px'; sp.appendChild(i); sp.appendChild(document.createTextNode('Best backprop RL')); leg.appendChild(sp); }
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Accuracy by ' + (key === 'math' ? 'benchmark' : 'model') }, host), tip = PP.tooltip(host);
      var n = d.x.length, cw = (W - m.l - m.r) / n, Y = function (v2) { return H - m.b - v2 / d.max * (H - m.t - m.b); };
      d.ticks.forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft }, s); text(s, m.l - 8, Y(t) + 4, t + '%', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
      text(s, m.l - 32, 14, 'vs LoRA', { 'font-size': 10, fill: C.muted });
      var off = { 'FuRA-S': 0, 'Full ES': 1.3, 'LoRA-ES': 2.4, 'VeRA-ES': 3.5 }, dx = Math.min(9, cw / 9);
      d.x.forEach(function (lab, j) {
        var cx = m.l + cw * (j + 0.5), g = svg('g', {}, s), lo = 1e9, hi = -1e9;
        if (key === 'math' && j === 5) svg('line', { x1: cx - cw / 2, x2: cx - cw / 2, y1: m.t - 4, y2: H - m.b, stroke: C.line, 'stroke-dasharray': '3 3' }, s);
        svg('rect', { x: cx - cw / 2 + 2, y: m.t - 6, width: cw - 4, height: H - m.t - m.b + 6, rx: 6, fill: 'transparent' }, g);
        names.forEach(function (k) { lo = Math.min(lo, d.s[k][j]); hi = Math.max(hi, d.s[k][j]); });
        
        var bpBest = null, bpName = '';
        if (d.bp) { Object.keys(d.bp).forEach(function (b) { if (bpBest === null || d.bp[b][j] > bpBest) { bpBest = d.bp[b][j]; bpName = b; } }); svg('line', { x1: cx - 8, x2: cx + 40, y1: Y(bpBest), y2: Y(bpBest), stroke: C.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g); }
        names.slice().reverse().forEach(function (k) {
          svg('circle', { cx: cx + off[k] * dx * (k === 'FuRA-S' ? 0 : 1), cy: Y(d.s[k][j]), r: k === 'FuRA-S' ? 6.2 : 4.6, fill: COL[k], stroke: '#fff', 'stroke-width': 1.5 }, g);
        });
        var fv = d.s['FuRA-S'][j];
        if (!narrow) text(g, cx - 11, Y(fv) + 4, fv.toFixed(1), { 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 600, fill: C.ink, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
        var dl = fv - d.s['LoRA-ES'][j];
        text(g, cx, 14, (dl >= 0 ? '+' : '−') + Math.abs(dl).toFixed(1), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: dl >= 0 ? C.ours : C.muted, 'font-variant-numeric': 'tabular-nums' });
        var lb = narrow ? d.xs[j] : d.x[j];
        if (narrow && key === 'math') { text(g, cx, H - m.b + 15, lb.slice(0, 4), { 'text-anchor': 'middle', 'font-size': 10, fill: C.text }); if (lb.length > 4) text(g, cx, H - m.b + 28, lb.slice(4), { 'text-anchor': 'middle', 'font-size': 10, fill: C.text }); }
        else text(g, cx, H - m.b + 17, lb, { 'text-anchor': 'middle', 'font-size': narrow ? 10 : 11.5, fill: C.text });
        var rows = names.map(function (k) { return { color: COL[k], value: d.s[k][j].toFixed(1) + '%', label: LAB[k] }; });
        if (d.bp) Object.keys(d.bp).forEach(function (b) { rows.push({ color: b === bpName ? C.ink : '#c3cbd6', value: d.bp[b][j].toFixed(1) + '%', label: b + ' (backprop)' }); });
        if (d.orig) rows.push({ color: '#e3e7ed', value: d.orig[j].toFixed(1) + '%', label: 'before training' });
        hoverTip(s, W, g, cx, Y(hi), d.x[j], rows, tip);
      });
    }
    PP.segmented(document.getElementById('seg-rlvr'), function (k) { key = k; render(); });
    render(); onResize(render);
  })();

  /* =====================================================================
     6) INT4 上训练：FuRA-S vs QES
     ===================================================================== */
  (function int4() {
    var host = document.getElementById('chart-int4'); if (!host) return;
    var sumEl = document.getElementById('int4-summary'), key = '3B';
    var META = { '1.5B': { best: 16.75, fin: 16.0, max: 25, ticks: [0, 5, 10, 15, 20, 25] }, '3B': { best: 34.15, fin: 34.15, max: 55, ticks: [0, 10, 20, 30, 40, 50] } };
    var cursor = null;
    function render() {
      clear(host);
      var F = DATA.qes[key]['FuRA-S'], Q = DATA.qes[key].QES, M = META[key];
      var W = width(host, 760), H = 300, m = { l: 40, r: 14, t: 16, b: 30 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'INT4 Countdown accuracy over training' }, host), tip = PP.tooltip(host);
      var X = function (it) { return m.l + it / 300 * (W - m.l - m.r); }, Y = function (v2) { return H - m.b - v2 / M.max * (H - m.t - m.b); };
      M.ticks.forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft }, s); text(s, m.l - 8, Y(t) + 4, t + '%', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
      [0, 50, 100, 150, 200, 250, 300].forEach(function (t) { text(s, X(t), H - m.b + 17, t, { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted }); });
      text(s, W - m.r, H - 2, 'iteration', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted });
      svg('line', { x1: m.l, x2: W - m.r, y1: Y(M.best), y2: Y(M.best), stroke: C.sel, 'stroke-width': 1.3, 'stroke-dasharray': '2 4', 'stroke-linecap': 'round' }, s);
      text(s, W - m.r, Y(M.best) - 7, 'QES best ' + M.best.toFixed(2) + '%', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
      function path(P) { return P.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(''); }
      svg('path', { d: path(Q), fill: 'none', stroke: C.sel, 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
      svg('path', { d: path(F), fill: 'none', stroke: C.ours, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, s);
      var pass = null; F.forEach(function (p) { if (pass === null && p[1] > M.best) pass = p; });
      if (pass) {
        svg('circle', { cx: X(pass[0]), cy: Y(pass[1]), r: 7, fill: '#fff', stroke: C.ours, 'stroke-width': 2.2 }, s);
        if (W >= 560) text(s, X(pass[0]) + 4, Y(pass[1]) - 30, 'passes QES’s best at iteration ' + pass[0], { 'font-size': 11.5, 'font-weight': 600, fill: C.ink, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
      }
      var last = F[F.length - 1];
      text(s, X(last[0]) - 4, Y(last[1]) - 10, last[1].toFixed(2) + '%', { 'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 700, fill: C.ours });
      sumEl.textContent = 'Qwen2.5-' + key + '-Instruct, GPTQ-INT4: FuRA-S reaches ' + last[1].toFixed(2) + '% at iteration 300, ' + (last[1] - M.best).toFixed(2) + ' points above the best QES accuracy, and passes that best within ' + pass[0] + ' iterations.';
      var cross = svg('line', { y1: m.t, y2: H - m.b, stroke: C.ink, 'stroke-opacity': .4, opacity: 0 }, s);
      var df = svg('circle', { r: 4.5, fill: C.ours, stroke: '#fff', 'stroke-width': 1.5, opacity: 0 }, s), dq = svg('circle', { r: 4, fill: C.sel, stroke: '#fff', 'stroke-width': 1.5, opacity: 0 }, s);
      var hit = svg('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent', style: 'cursor:crosshair' }, s);
      function near(P, it) { var b = P[0]; P.forEach(function (p) { if (Math.abs(p[0] - it) < Math.abs(b[0] - it)) b = p; }); return b; }
      function at(it) {
        var f = near(F, it), q = near(Q, it); cursor = it;
        cross.setAttribute('x1', X(f[0])); cross.setAttribute('x2', X(f[0])); cross.setAttribute('opacity', 1);
        df.setAttribute('cx', X(f[0])); df.setAttribute('cy', Y(f[1])); df.setAttribute('opacity', 1);
        dq.setAttribute('cx', X(q[0])); dq.setAttribute('cy', Y(q[1])); dq.setAttribute('opacity', 1);
        var b = s.getBoundingClientRect(), kk = b.width / W;
        tip.show(X(f[0]) * kk, (m.t + 30) * kk, 'Iteration ' + f[0], [{ color: C.ours, value: f[1].toFixed(2) + '%', label: 'FuRA-S on INT4' }, { color: C.sel, value: q[1].toFixed(2) + '%', label: 'QES' }]);
      }
      function move(ev) { var b = s.getBoundingClientRect(), px = (ev.clientX - b.left) * W / b.width; at(Math.max(0, Math.min(300, (px - m.l) / (W - m.l - m.r) * 300))); }
      hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
      hit.addEventListener('pointerleave', function () { cross.setAttribute('opacity', 0); df.setAttribute('opacity', 0); dq.setAttribute('opacity', 0); tip.hide(); });
    }
    PP.segmented(document.getElementById('seg-int4'), function (k) { key = k; render(); });
    render(); onResize(render);
  })();

  /* =====================================================================
     7) iPhone：损失曲线 + 内存
     ===================================================================== */
  (function iphone() {
    var host = document.getElementById('chart-iphone'); if (!host) return;
    var V = DATA.dev.validation, T = DATA.dev.training;
    function render() {
      clear(host);
      var W = width(host, 560), H = 276, m = { l: 40, r: 12, t: 22, b: 30 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Loss over hours of training on the phone' }, host), tip = PP.tooltip(host);
      var X = function (h) { return m.l + h / 11 * (W - m.l - m.r); }, Y = function (v2) { return H - m.b - v2 / 0.9 * (H - m.t - m.b); };
      [0, 0.2, 0.4, 0.6, 0.8].forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft }, s); text(s, m.l - 8, Y(t) + 4, t.toFixed(1), { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
      [0, 2, 4, 6, 8, 10].forEach(function (t) { text(s, X(t), H - m.b + 17, t + ' h', { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted }); });
      text(s, m.l - 34, 12, 'loss', { 'font-size': 10.5, fill: C.muted });
      svg('line', { x1: m.l, x2: W - m.r, y1: Y(0.8505), y2: Y(0.8505), stroke: C.base, 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, s);
      text(s, W - m.r, Y(0.8505) + 14, 'generalist 0.85', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted });
      function path(P) { return P.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(''); }
      svg('path', { d: path(T), fill: 'none', stroke: '#9db8dc', 'stroke-width': 1.8 }, s);
      svg('path', { d: path(V), fill: 'none', stroke: C.ours, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, s);
      V.forEach(function (p) { svg('circle', { cx: X(p[0]), cy: Y(p[1]), r: 2.4, fill: C.ours }, s); });
      var lv = V[V.length - 1];
      text(s, X(lv[0]) - 2, Y(lv[1]) - 10, lv[1].toFixed(2), { 'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 700, fill: C.ours });
      var cross = svg('line', { y1: m.t, y2: H - m.b, stroke: C.ink, 'stroke-opacity': .4, opacity: 0 }, s), dv = svg('circle', { r: 4.5, fill: C.ours, stroke: '#fff', 'stroke-width': 1.5, opacity: 0 }, s);
      var hit = svg('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent', style: 'cursor:crosshair' }, s);
      function move(ev) {
        var b = s.getBoundingClientRect(), px = (ev.clientX - b.left) * W / b.width, h = (px - m.l) / (W - m.l - m.r) * 11, i = 0;
        V.forEach(function (p, k) { if (Math.abs(p[0] - h) < Math.abs(V[i][0] - h)) i = k; });
        var p = V[i], kk = b.width / W;
        cross.setAttribute('x1', X(p[0])); cross.setAttribute('x2', X(p[0])); cross.setAttribute('opacity', 1);
        dv.setAttribute('cx', X(p[0])); dv.setAttribute('cy', Y(p[1])); dv.setAttribute('opacity', 1);
        var rows = [{ color: C.ours, value: p[1].toFixed(3), label: 'validation loss' }];
        if (i > 0 && T[i - 1]) rows.push({ color: '#9db8dc', value: T[i - 1][1].toFixed(3), label: 'training loss, iteration ' + i });
        tip.show(X(p[0]) * kk, (m.t + 30) * kk, i === 0 ? 'Start' : 'After iteration ' + i + ' · ' + p[0].toFixed(1) + ' h', rows);
      }
      hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
      hit.addEventListener('pointerleave', function () { cross.setAttribute('opacity', 0); dv.setAttribute('opacity', 0); tip.hide(); });
    }
    render(); onResize(render);
  })();
  (function memory() {
    var host = document.getElementById('chart-mem'); if (!host) return;
    function render() {
      clear(host);
      var W = width(host, 420), H = 270, m = { l: 8, r: 12, t: 14, b: 28 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Memory use on the iPhone' }, host), tip = PP.tooltip(host);
      var X = function (g) { return m.l + g / 8 * (W - m.l - m.r); };
      text(s, m.l, m.t, 'Memory (GB)', { 'font-size': 12, 'font-weight': 700, fill: C.ink });
      [0, 2, 4, 6, 8].forEach(function (t) { svg('line', { x1: X(t), x2: X(t), y1: m.t + 12, y2: H - m.b, stroke: C.soft }, s); text(s, X(t), H - m.b + 16, t, { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted }); });
      var R = [
        { name: 'iPhone 16 Pro memory', v: 8, col: '#e3e7ed' },
        { name: 'INT4 Llama-3.1-8B, loaded whole', v: 5.5, col: '#d7a9a9', mark: '✗ too large' },
        { name: 'MobileSpec training, streaming layers', v: 3.5, res: 2.1, col: C.ours, mark: '✓ peak 3.5 · resident 2.1' }
      ];
      R.forEach(function (r, i) {
        var y = m.t + 34 + i * 62, g = svg('g', {}, s);
        text(g, m.l, y, r.name, { 'font-size': 11.5, fill: C.ink, 'font-weight': i === 2 ? 700 : 400, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
        svg('rect', { x: X(0), y: y + 8, width: X(r.v) - X(0), height: 18, rx: 4, fill: r.col, 'fill-opacity': r.res ? .45 : 1 }, g);
        if (r.res) svg('rect', { x: X(0), y: y + 8, width: X(r.res) - X(0), height: 18, rx: 4, fill: r.col }, g);
        if (r.mark) text(g, X(r.v) + 6, y + 21, r.mark, { 'font-size': 10.5, fill: i === 1 ? '#a35d5d' : C.ink, 'font-weight': 600 });
        svg('rect', { x: 0, y: y - 12, width: W, height: 42, fill: 'transparent' }, g);
        var rows = r.res ? [{ color: C.ours, value: '2.1 GB', label: 'resident' }, { color: '#9db8dc', value: '3.5 GB', label: 'peak' }] : [{ color: r.col, value: r.v.toFixed(1) + ' GB', label: r.name }];
        hoverTip(s, W, g, X(r.v) / 2, y + 6, r.name, rows, tip);
      });
      svg('line', { x1: X(5.3), x2: X(5.3), y1: m.t + 12, y2: H - m.b, stroke: C.ink, 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, s);
      text(s, X(5.3) + 4, H - m.b - 6, 'app limit 5.3', { 'font-size': 10.5, fill: C.ink, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
    }
    render(); onResize(render);
  })();

  /* =====================================================================
     8) LaMP 表格：按用户 / 按时间 两种划分
     ===================================================================== */
  (function lamp() {
    var host = document.getElementById('table-lamp'); if (!host) return;
    var TASKS = [['LaMP-1 citation', 'accuracy'], ['LaMP-2 movie tag', 'accuracy'], ['LaMP-3 rating', 'MAE ↓'], ['LaMP-4 news headline', 'ROUGE-1'], ['LaMP-5 paper title', 'ROUGE-1'], ['LaMP-7 tweet paraphrase', 'ROUGE-1']];
    var D = {
      user: { cols: ['Base', 'Base + profile', 'FuRA-S', 'FuRA-S + profile'], ours: [2, 3],
        v: [[.528, .665, .515, .681], [.285, .347, .446, .452], [.383, .369, .272, .254], [.093, .123, .165, .182], [.118, .132, .438, .458], [.335, .335, .476, .470]],
        sub: 'LaMP with Llama-3.1-8B-Instruct in the user-based setting: one specialist per task, trained on some users and tested on unseen users, with or without one record retrieved from their profile. FuRA-S trains with forward passes only. Best per row in bold.' },
      time: { cols: ['Base', 'Per-user LoRA (backprop)', 'FuRA-S'], ours: [2],
        v: [[.480, .488, .480], [.296, .491, .541], [.402, .179, .259], [.090, .164, .141], [.145, .493, .476], [.296, .320, .338]],
        sub: 'LaMP with Llama-3.1-8B-Instruct in the time-based setting: each user gets their own specialist, trained on earlier records and tested on later queries, as on the phone. Per-user LoRA is trained by backpropagation; FuRA-S uses forward passes only and stores 4.98 MB per user. Best per row in bold.' }
    };
    var head = host.closest('.pp-widget').querySelector('.pp-widget__head'), sub = head.querySelector('.pp-widget__sub');
    var seg = el('div', 'pp-seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', 'Setting');
    [['user', 'New users'], ['time', 'Per user']].forEach(function (p, i) { var b = el('button', null, p[1]); b.type = 'button'; b.setAttribute('data-value', p[0]); b.setAttribute('aria-pressed', i ? 'false' : 'true'); seg.appendChild(b); });
    head.appendChild(seg);
    function render(key) {
      var d = D[key]; sub.textContent = d.sub; clear(host);
      var t = el('table', 'pp-table pp-table--cs'), th = el('thead'), tr = el('tr');
      tr.appendChild(el('th', null, 'Task')); tr.appendChild(el('th', null, 'Metric'));
      d.cols.forEach(function (c, j) { var x = el('th', d.ours.indexOf(j) >= 0 ? 'col-on' : null, c); tr.appendChild(x); });
      th.appendChild(tr); t.appendChild(th);
      var tb = el('tbody');
      TASKS.forEach(function (r, i) {
        var row = el('tr'), vals = d.v[i], low = i === 2, best = low ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
        row.appendChild(el('td', 'm', key === 'time' && i === 1 ? 'LaMP-2M movie tag' : r[0])); row.appendChild(el('td', 'm', r[1]));
        vals.forEach(function (x, j) { var c = [d.ours.indexOf(j) >= 0 ? 'col-on' : '', x === best ? 'best' : ''].join(' ').trim(); row.appendChild(el('td', c || null, x.toFixed(3))); });
        tb.appendChild(row);
      });
      t.appendChild(tb); host.appendChild(t);
    }
    PP.segmented(seg, render);
    render('user');
  })();

  var ES3D = {"U0":[[-0.3109,0.041,-0.9495],[0.8869,-0.3466,-0.3054],[-0.3416,-0.9371,0.0714]],"s0":[1.4,0.8,0.45],"Ut":[[-0.339,0.0103,-0.9407],[0.6634,-0.7064,-0.2468],[-0.6671,-0.7077,0.2327]],"st":[1.3545,0.8204,0.4609],"block":[{"U":[[-0.311,0.041,-0.95],[0.887,-0.347,-0.305],[-0.342,-0.937,0.071]],"s":[1.4,0.8,0.45],"dist":0.08882,"ang":0.0,"angT":22.83,"spec":0.0,"mem":[[-0.47,1.19,-0.55],[-0.44,1.26,-0.53],[-0.43,1.2,-0.48],[-0.4,1.17,-0.48],[-0.42,1.24,-0.43],[-0.42,1.25,-0.45],[-0.45,1.25,-0.51],[-0.43,1.21,-0.51],[-0.41,1.3,-0.43],[-0.43,1.22,-0.42],[-0.44,1.28,-0.48],[-0.47,1.31,-0.48],[-0.45,1.24,-0.53],[-0.45,1.24,-0.5],[-0.42,1.24,-0.45],[-0.44,1.27,-0.45]]},{"U":[[-0.343,0.032,-0.939],[0.817,-0.483,-0.315],[-0.463,-0.875,0.139]],"s":[1.3743,0.8573,0.4099],"dist":0.03878,"ang":8.26,"angT":14.66,"spec":4.45,"mem":[[-0.47,1.11,-0.64],[-0.49,1.11,-0.64],[-0.47,1.14,-0.66],[-0.48,1.15,-0.63],[-0.46,1.14,-0.59],[-0.47,1.07,-0.72],[-0.47,1.17,-0.67],[-0.49,1.1,-0.7],[-0.47,1.13,-0.64],[-0.46,1.13,-0.63],[-0.47,1.11,-0.61],[-0.46,1.1,-0.64],[-0.49,1.11,-0.69],[-0.48,1.17,-0.56],[-0.47,1.08,-0.61],[-0.46,1.14,-0.58]]},{"U":[[-0.353,0.045,-0.934],[0.742,-0.595,-0.309],[-0.57,-0.803,0.177]],"s":[1.4004,0.891,0.4459],"dist":0.02425,"ang":15.71,"angT":7.23,"spec":5.44,"mem":[[-0.49,1.02,-0.82],[-0.47,1.01,-0.78],[-0.48,1.01,-0.72],[-0.48,0.99,-0.85],[-0.5,1.03,-0.8],[-0.51,1.17,-0.76],[-0.52,1.08,-0.83],[-0.5,1.01,-0.76],[-0.5,1.06,-0.77],[-0.52,1.07,-0.81],[-0.51,1.07,-0.87],[-0.51,1.09,-0.74],[-0.49,1.04,-0.8],[-0.48,0.9,-0.86],[-0.47,1.0,-0.76],[-0.49,1.08,-0.83]]},{"U":[[-0.345,0.058,-0.937],[0.657,-0.698,-0.285],[-0.67,-0.714,0.203]],"s":[1.3347,0.8394,0.4366],"dist":0.0088,"ang":23.24,"angT":0.56,"spec":4.63,"mem":[[-0.46,0.94,-0.9],[-0.47,0.85,-0.92],[-0.45,0.83,-0.9],[-0.46,0.9,-0.9],[-0.45,0.81,-0.92],[-0.47,0.96,-0.92],[-0.46,0.96,-0.83],[-0.45,0.88,-0.88],[-0.47,0.82,-0.89],[-0.45,0.9,-0.87],[-0.48,0.92,-0.9],[-0.46,0.85,-0.89],[-0.47,0.94,-0.87],[-0.45,0.79,-0.87],[-0.46,0.8,-0.96],[-0.47,0.88,-0.91]]},{"U":[[-0.321,-0.041,-0.946],[0.736,-0.639,-0.222],[-0.596,-0.768,0.235]],"s":[1.4583,0.8406,0.4756],"dist":0.01548,"ang":17.01,"angT":5.93,"spec":4.51,"mem":[[-0.48,1.1,-0.88],[-0.48,1.11,-0.91],[-0.48,1.1,-0.88],[-0.48,1.14,-0.87],[-0.46,0.99,-0.9],[-0.47,1.09,-0.85],[-0.47,1.13,-0.86],[-0.48,1.07,-0.86],[-0.45,1.04,-0.86],[-0.46,1.04,-0.82],[-0.45,1.05,-0.86],[-0.46,1.01,-0.87],[-0.48,1.16,-0.84],[-0.47,1.06,-0.88],[-0.46,1.02,-0.88],[-0.46,1.08,-0.87]]},{"U":[[-0.334,-0.011,-0.943],[0.689,-0.685,-0.237],[-0.643,-0.729,0.236]],"s":[1.3403,0.7776,0.4357],"dist":0.00736,"ang":20.79,"angT":2.06,"spec":3.9,"mem":[[-0.45,0.9,-0.86],[-0.47,0.91,-0.91],[-0.47,0.92,-0.93],[-0.45,0.92,-0.88],[-0.46,0.91,-0.92],[-0.46,0.93,-0.88],[-0.45,0.86,-0.91],[-0.44,0.91,-0.88],[-0.45,0.96,-0.86],[-0.42,0.95,-0.81],[-0.43,0.93,-0.79],[-0.44,0.93,-0.84],[-0.43,0.94,-0.8],[-0.44,0.92,-0.84],[-0.45,0.99,-0.82],[-0.46,0.94,-0.84]]},{"U":[[-0.337,-0.031,-0.941],[0.67,-0.71,-0.217],[-0.661,-0.703,0.26]],"s":[1.3835,0.787,0.4709],"dist":0.00593,"ang":22.34,"angT":0.5,"spec":1.77,"mem":[[-0.46,0.93,-0.89],[-0.46,0.94,-0.92],[-0.45,0.98,-0.87],[-0.45,0.94,-0.92],[-0.47,0.92,-0.9],[-0.46,0.86,-0.93],[-0.49,0.92,-0.96],[-0.46,0.96,-0.88],[-0.48,0.92,-0.94],[-0.47,0.91,-0.91],[-0.48,0.87,-0.96],[-0.48,0.92,-0.91],[-0.46,0.94,-0.93],[-0.47,0.99,-0.91],[-0.45,0.93,-0.87],[-0.47,0.89,-0.95]]},{"U":[[-0.322,-0.073,-0.944],[0.675,-0.717,-0.175],[-0.664,-0.693,0.281]],"s":[1.3668,0.7931,0.51],"dist":0.00685,"ang":22.26,"angT":1.17,"spec":4.11,"mem":[[-0.46,0.94,-0.96],[-0.43,0.91,-0.93],[-0.42,0.95,-0.85],[-0.44,0.86,-0.89],[-0.43,0.88,-0.89],[-0.44,0.96,-0.9],[-0.42,0.88,-0.9],[-0.44,0.94,-0.88],[-0.42,0.91,-0.86],[-0.45,0.94,-0.89],[-0.46,0.9,-0.96],[-0.44,0.99,-0.92],[-0.45,0.96,-0.92],[-0.44,0.88,-0.92],[-0.46,0.96,-0.91],[-0.44,0.91,-0.93]]},{"U":[[-0.339,0.013,-0.941],[0.645,-0.724,-0.243],[-0.684,-0.69,0.237]],"s":[1.3023,0.7902,0.4895],"dist":0.00529,"ang":24.26,"angT":1.43,"spec":6.32,"mem":[[-0.42,0.81,-0.84],[-0.44,0.78,-0.92],[-0.45,0.76,-0.91],[-0.44,0.84,-0.86],[-0.43,0.89,-0.9],[-0.43,0.91,-0.84],[-0.44,0.91,-0.86],[-0.44,0.85,-0.86],[-0.47,0.88,-0.94],[-0.44,0.91,-0.86],[-0.44,0.92,-0.87],[-0.44,0.84,-0.92],[-0.45,0.79,-0.89],[-0.45,0.77,-0.95],[-0.45,0.77,-0.93],[-0.45,0.84,-0.92]]},{"U":[[-0.317,-0.045,-0.948],[0.72,-0.662,-0.209],[-0.618,-0.748,0.242]],"s":[1.4123,0.8284,0.4966],"dist":0.01176,"ang":18.6,"angT":4.47,"spec":3.34,"mem":[[-0.45,1.06,-0.83],[-0.45,1.0,-0.88],[-0.45,0.98,-0.92],[-0.45,1.06,-0.82],[-0.44,1.03,-0.91],[-0.45,1.03,-0.87],[-0.45,1.07,-0.89],[-0.45,1.04,-0.82],[-0.45,0.97,-0.92],[-0.45,1.04,-0.86],[-0.45,1.05,-0.83],[-0.45,0.97,-0.93],[-0.45,1.01,-0.84],[-0.45,1.0,-0.87],[-0.45,0.96,-0.85],[-0.45,0.99,-0.92]]},{"U":[[-0.333,0.001,-0.943],[0.706,-0.663,-0.25],[-0.625,-0.749,0.221]],"s":[1.355,0.8167,0.4641],"dist":0.00559,"ang":19.42,"angT":3.42,"spec":2.99,"mem":[[-0.45,0.95,-0.81],[-0.45,0.93,-0.84],[-0.49,0.94,-0.96],[-0.47,0.92,-0.9],[-0.46,1.0,-0.86],[-0.46,1.0,-0.81],[-0.44,0.99,-0.84],[-0.44,1.02,-0.79],[-0.45,0.96,-0.88],[-0.46,0.98,-0.86],[-0.42,0.98,-0.72],[-0.44,1.0,-0.79],[-0.45,0.91,-0.83],[-0.45,0.91,-0.88],[-0.46,0.93,-0.85],[-0.46,0.89,-0.91]]},{"U":[[-0.346,0.004,-0.938],[0.628,-0.742,-0.234],[-0.697,-0.671,0.254]],"s":[1.4025,0.8057,0.4716],"dist":0.00623,"ang":25.46,"angT":2.67,"spec":1.34,"mem":[[-0.47,0.88,-0.96],[-0.45,0.84,-0.92],[-0.49,0.87,-1.03],[-0.48,0.96,-0.92],[-0.49,0.84,-1.06],[-0.5,0.93,-1.0],[-0.49,0.89,-0.99],[-0.47,0.89,-0.96],[-0.5,0.89,-1.0],[-0.52,0.92,-1.04],[-0.48,0.9,-0.92],[-0.49,0.81,-1.03],[-0.49,0.93,-0.89],[-0.47,0.83,-0.95],[-0.48,0.88,-0.96],[-0.5,0.87,-0.99]]},{"U":[[-0.337,0.034,-0.941],[0.674,-0.689,-0.266],[-0.658,-0.724,0.209]],"s":[1.3126,0.8234,0.47],"dist":0.0049,"ang":22.03,"angT":0.82,"spec":5.54,"mem":[[-0.46,0.88,-0.86],[-0.44,0.91,-0.84],[-0.45,0.93,-0.87],[-0.45,0.84,-0.9],[-0.46,0.96,-0.86],[-0.44,0.92,-0.84],[-0.43,0.92,-0.77],[-0.45,0.96,-0.88],[-0.42,0.9,-0.86],[-0.44,0.86,-0.89],[-0.44,0.84,-0.86],[-0.43,0.93,-0.83],[-0.42,0.81,-0.87],[-0.45,0.85,-0.89],[-0.46,0.86,-0.95],[-0.44,0.81,-0.84]]},{"U":[[-0.327,0.005,-0.945],[0.681,-0.692,-0.239],[-0.655,-0.722,0.223]],"s":[1.3827,0.8265,0.4613],"dist":0.00372,"ang":21.64,"angT":1.41,"spec":2.01,"mem":[[-0.46,0.94,-0.9],[-0.45,0.9,-0.96],[-0.47,0.99,-0.92],[-0.46,0.94,-0.88],[-0.46,1.01,-0.88],[-0.46,0.96,-0.96],[-0.46,0.93,-0.96],[-0.44,0.94,-0.9],[-0.44,0.94,-0.92],[-0.45,0.98,-0.85],[-0.43,0.89,-0.89],[-0.45,0.95,-0.93],[-0.44,0.87,-0.93],[-0.45,0.93,-0.85],[-0.44,0.95,-0.85],[-0.46,0.94,-0.91]]},{"U":[[-0.341,0.023,-0.94],[0.695,-0.667,-0.268],[-0.633,-0.745,0.211]],"s":[1.3385,0.8047,0.434],"dist":0.00388,"ang":20.15,"angT":2.68,"spec":3.8,"mem":[[-0.45,0.91,-0.86],[-0.44,0.93,-0.8],[-0.45,0.92,-0.83],[-0.46,0.95,-0.84],[-0.47,0.99,-0.86],[-0.46,0.93,-0.85],[-0.47,0.98,-0.81],[-0.46,0.99,-0.8],[-0.46,0.95,-0.83],[-0.47,0.93,-0.89],[-0.47,0.94,-0.86],[-0.46,0.91,-0.85],[-0.45,0.87,-0.83],[-0.46,0.93,-0.84],[-0.45,0.89,-0.89],[-0.46,0.87,-0.9]]},{"U":[[-0.338,0.026,-0.941],[0.656,-0.71,-0.255],[-0.675,-0.704,0.223]],"s":[1.3556,0.8227,0.4529],"dist":0.0016,"ang":23.41,"angT":0.59,"spec":2.99,"mem":[[-0.45,0.9,-0.9],[-0.47,0.86,-0.94],[-0.43,0.84,-0.86],[-0.46,0.81,-0.98],[-0.46,0.92,-0.92],[-0.46,0.91,-0.94],[-0.47,0.98,-0.88],[-0.47,0.87,-0.96],[-0.47,0.89,-0.93],[-0.45,0.93,-0.89],[-0.48,0.94,-0.97],[-0.46,0.97,-0.85],[-0.46,0.86,-0.91],[-0.45,0.88,-0.89],[-0.45,0.8,-0.95],[-0.45,0.91,-0.87]]},{"U":[[-0.337,0.017,-0.941],[0.673,-0.695,-0.253],[-0.659,-0.719,0.223]],"s":[1.3895,0.834,0.4507],"dist":0.00181,"ang":22.11,"angT":0.73,"spec":2.13,"mem":[[-0.48,0.97,-0.92],[-0.47,0.86,-0.98],[-0.49,0.97,-0.95],[-0.46,1.0,-0.87],[-0.45,0.91,-0.88],[-0.48,1.02,-0.88],[-0.47,0.9,-0.9],[-0.49,1.01,-0.96],[-0.46,0.9,-0.91],[-0.46,1.0,-0.86],[-0.45,0.9,-0.88],[-0.48,0.87,-0.96],[-0.49,0.96,-0.95],[-0.46,0.84,-0.96],[-0.47,0.97,-0.93],[-0.45,0.86,-0.87]]},{"U":[[-0.341,0.023,-0.94],[0.645,-0.722,-0.252],[-0.684,-0.692,0.232]],"s":[1.2875,0.782,0.4587],"dist":0.0035,"ang":24.25,"angT":1.43,"spec":6.82,"mem":[[-0.43,0.87,-0.85],[-0.46,0.84,-0.93],[-0.43,0.75,-0.93],[-0.45,0.72,-0.95],[-0.44,0.92,-0.84],[-0.45,0.89,-0.89],[-0.44,0.81,-0.84],[-0.44,0.84,-0.86],[-0.45,0.79,-0.92],[-0.42,0.82,-0.83],[-0.45,0.91,-0.83],[-0.43,0.95,-0.82],[-0.44,0.74,-0.93],[-0.43,0.78,-0.87],[-0.44,0.87,-0.92],[-0.44,0.82,-0.9]]},{"U":[[-0.329,-0.017,-0.944],[0.703,-0.672,-0.233],[-0.631,-0.74,0.234]],"s":[1.356,0.8034,0.4664],"dist":0.00279,"ang":19.75,"angT":3.13,"spec":2.81,"mem":[[-0.46,0.99,-0.84],[-0.45,0.99,-0.82],[-0.42,0.88,-0.82],[-0.45,0.94,-0.83],[-0.42,0.91,-0.82],[-0.45,0.95,-0.8],[-0.41,0.93,-0.81],[-0.46,1.03,-0.89],[-0.43,0.92,-0.86],[-0.45,0.91,-0.89],[-0.47,1.03,-0.89],[-0.45,0.96,-0.87],[-0.47,1.0,-0.89],[-0.45,0.97,-0.91],[-0.48,0.98,-0.91],[-0.43,0.88,-0.82]]},{"U":[[-0.339,-0.001,-0.941],[0.694,-0.676,-0.249],[-0.635,-0.737,0.23]],"s":[1.322,0.7994,0.4818],"dist":0.00225,"ang":20.32,"angT":2.51,"spec":5.03,"mem":[[-0.44,0.92,-0.81],[-0.45,0.98,-0.83],[-0.44,0.93,-0.82],[-0.44,0.98,-0.81],[-0.43,0.96,-0.79],[-0.47,0.94,-0.89],[-0.44,0.88,-0.85],[-0.44,0.91,-0.77],[-0.46,0.91,-0.87],[-0.45,0.85,-0.85],[-0.46,0.9,-0.86],[-0.46,0.85,-0.87],[-0.46,0.87,-0.89],[-0.43,0.9,-0.79],[-0.45,0.95,-0.83],[-0.46,0.93,-0.9]]},{"U":[[-0.338,-0.007,-0.941],[0.682,-0.691,-0.24],[-0.649,-0.723,0.239]],"s":[1.3664,0.8164,0.4863],"dist":0.00142,"ang":21.36,"angT":1.47,"spec":3.11,"mem":[[-0.45,0.97,-0.81],[-0.45,0.92,-0.85],[-0.48,0.97,-0.94],[-0.46,0.97,-0.85],[-0.47,0.99,-0.89],[-0.46,0.97,-0.84],[-0.46,0.97,-0.83],[-0.45,0.99,-0.89],[-0.48,0.89,-0.97],[-0.48,0.95,-0.93],[-0.44,0.89,-0.83],[-0.47,0.9,-0.92],[-0.45,0.88,-0.89],[-0.47,0.89,-0.93],[-0.46,0.9,-0.93],[-0.47,0.88,-0.89]]},{"U":[[-0.344,0.013,-0.939],[0.663,-0.705,-0.253],[-0.665,-0.709,0.234]],"s":[1.3565,0.8182,0.4768],"dist":0.00127,"ang":22.76,"angT":0.3,"spec":3.24,"mem":[[-0.47,0.89,-0.95],[-0.49,0.93,-0.92],[-0.47,0.94,-0.91],[-0.47,0.9,-0.91],[-0.47,0.86,-0.95],[-0.45,0.8,-0.92],[-0.46,0.95,-0.85],[-0.45,0.83,-0.84],[-0.46,0.92,-0.85],[-0.45,0.88,-0.89],[-0.46,0.86,-0.9],[-0.47,0.9,-0.9],[-0.47,0.94,-0.85],[-0.48,1.01,-0.88],[-0.47,0.85,-0.95],[-0.48,0.97,-0.96]]},{"U":[[-0.339,-0.0,-0.941],[0.671,-0.701,-0.242],[-0.659,-0.713,0.238]],"s":[1.3862,0.8286,0.4802],"dist":0.00117,"ang":22.2,"angT":0.63,"spec":2.62,"mem":[[-0.48,0.96,-0.95],[-0.47,0.9,-0.91],[-0.48,1.03,-0.91],[-0.49,1.02,-0.87],[-0.47,0.95,-0.89],[-0.47,1.0,-0.88],[-0.47,0.97,-0.9],[-0.47,0.94,-0.91],[-0.46,0.9,-0.88],[-0.47,0.96,-0.92],[-0.46,0.84,-0.92],[-0.45,0.84,-0.96],[-0.47,0.91,-0.94],[-0.47,0.86,-0.95],[-0.48,0.9,-0.93],[-0.47,0.92,-0.92]]},{"U":[[-0.342,0.016,-0.94],[0.644,-0.725,-0.246],[-0.685,-0.689,0.237]],"s":[1.3542,0.8161,0.4775],"dist":0.00118,"ang":24.35,"angT":1.53,"spec":3.33,"mem":[[-0.43,0.81,-0.87],[-0.45,0.94,-0.86],[-0.47,0.88,-0.98],[-0.47,0.89,-0.94],[-0.45,0.77,-0.92],[-0.47,0.85,-0.93],[-0.48,0.84,-0.94],[-0.47,0.88,-0.92],[-0.49,0.94,-0.98],[-0.47,0.8,-0.99],[-0.45,0.87,-0.87],[-0.45,0.85,-0.91],[-0.48,0.98,-0.94],[-0.46,0.89,-0.93],[-0.44,0.91,-0.92],[-0.45,0.86,-0.94]]},{"U":[[-0.335,-0.007,-0.942],[0.664,-0.711,-0.231],[-0.668,-0.703,0.242]],"s":[1.3767,0.819,0.4809],"dist":0.00097,"ang":22.84,"angT":0.26,"spec":2.57,"mem":[[-0.43,0.86,-0.89],[-0.46,0.88,-0.95],[-0.46,0.91,-0.94],[-0.47,0.93,-0.9],[-0.45,0.96,-0.91],[-0.45,0.97,-0.89],[-0.49,0.83,-1.0],[-0.47,0.97,-0.93],[-0.49,0.97,-0.95],[-0.46,0.95,-0.89],[-0.46,0.93,-0.9],[-0.46,0.9,-0.94],[-0.47,0.88,-0.93],[-0.47,0.86,-0.96],[-0.43,1.01,-0.83],[-0.46,0.86,-0.91]]},{"U":[[-0.338,0.002,-0.941],[0.656,-0.717,-0.237],[-0.675,-0.698,0.241]],"s":[1.3737,0.8219,0.4814],"dist":0.00082,"ang":23.44,"angT":0.61,"spec":2.77,"mem":[[-0.47,0.93,-0.9],[-0.45,0.76,-0.92],[-0.46,0.88,-0.92],[-0.44,0.87,-0.91],[-0.48,0.94,-0.94],[-0.45,0.84,-0.9],[-0.45,0.8,-0.93],[-0.49,0.96,-0.99],[-0.46,0.88,-0.95],[-0.48,1.04,-0.93],[-0.47,0.92,-0.93],[-0.49,0.93,-0.95],[-0.45,0.86,-0.92],[-0.48,0.96,-0.96],[-0.48,1.0,-0.93],[-0.43,0.85,-0.86]]},{"U":[[-0.338,0.007,-0.941],[0.653,-0.719,-0.24],[-0.678,-0.696,0.238]],"s":[1.3555,0.817,0.4826],"dist":0.00078,"ang":23.7,"angT":0.87,"spec":3.45,"mem":[[-0.47,0.88,-0.93],[-0.46,0.87,-0.94],[-0.46,0.92,-0.9],[-0.46,0.9,-0.93],[-0.48,0.86,-0.99],[-0.47,0.81,-0.99],[-0.44,0.94,-0.9],[-0.47,0.94,-0.93],[-0.45,0.89,-0.91],[-0.46,0.9,-0.9],[-0.45,0.85,-0.94],[-0.46,0.87,-0.91],[-0.44,0.91,-0.85],[-0.45,0.96,-0.85],[-0.48,0.84,-0.94],[-0.45,0.83,-0.9]]},{"U":[[-0.335,-0.002,-0.942],[0.669,-0.705,-0.237],[-0.663,-0.71,0.237]],"s":[1.3623,0.82,0.4754],"dist":0.00064,"ang":22.45,"angT":0.45,"spec":2.97,"mem":[[-0.44,0.88,-0.91],[-0.45,0.91,-0.87],[-0.45,0.82,-0.95],[-0.48,0.93,-0.98],[-0.44,0.88,-0.89],[-0.45,0.94,-0.89],[-0.47,0.9,-0.93],[-0.47,0.83,-0.98],[-0.47,0.94,-0.9],[-0.46,0.92,-0.94],[-0.46,1.0,-0.86],[-0.44,0.9,-0.83],[-0.48,0.95,-0.92],[-0.46,0.89,-0.92],[-0.45,0.93,-0.88],[-0.45,0.99,-0.83]]},{"U":[[-0.338,0.006,-0.941],[0.661,-0.71,-0.242],[-0.669,-0.704,0.236]],"s":[1.3541,0.8162,0.4724],"dist":0.00034,"ang":23.0,"angT":0.18,"spec":3.2,"mem":[[-0.47,0.96,-0.92],[-0.44,0.75,-0.96],[-0.45,0.8,-0.91],[-0.47,0.93,-0.92],[-0.47,0.88,-0.95],[-0.45,0.8,-0.93],[-0.45,0.88,-0.88],[-0.46,0.96,-0.86],[-0.45,0.84,-0.89],[-0.47,1.04,-0.85],[-0.47,0.99,-0.91],[-0.45,0.87,-0.9],[-0.44,0.92,-0.86],[-0.46,0.99,-0.89],[-0.46,0.91,-0.93],[-0.46,0.84,-0.95]]},{"U":[[-0.338,0.006,-0.941],[0.664,-0.707,-0.243],[-0.667,-0.707,0.235]],"s":[1.3582,0.8189,0.4705],"dist":0.0003,"ang":22.81,"angT":0.07,"spec":3.0,"mem":[[-0.45,0.95,-0.83],[-0.47,0.94,-0.98],[-0.44,0.86,-0.9],[-0.46,0.96,-0.94],[-0.46,0.88,-0.87],[-0.46,0.93,-0.9],[-0.47,1.01,-0.89],[-0.46,0.92,-0.86],[-0.47,0.86,-0.98],[-0.45,0.87,-0.83],[-0.47,0.94,-0.91],[-0.46,0.86,-0.87],[-0.46,0.93,-0.94],[-0.46,0.87,-0.92],[-0.45,0.8,-0.92],[-0.46,0.89,-0.95]]},{"U":[[-0.338,0.007,-0.941],[0.663,-0.708,-0.244],[-0.668,-0.706,0.235]],"s":[1.3547,0.8172,0.4699],"dist":0.00029,"ang":22.88,"angT":0.07,"spec":3.13,"mem":[[-0.46,0.88,-0.91],[-0.47,0.88,-0.92],[-0.45,0.88,-0.86],[-0.46,0.94,-0.84],[-0.47,0.86,-0.93],[-0.48,0.83,-0.99],[-0.46,0.97,-0.89],[-0.47,0.94,-0.93],[-0.46,0.91,-0.9],[-0.45,0.92,-0.89],[-0.47,0.92,-0.94],[-0.46,0.86,-0.97],[-0.45,0.95,-0.88],[-0.43,0.97,-0.82],[-0.46,0.83,-0.92],[-0.44,0.86,-0.88]]},{"U":[[-0.338,0.007,-0.941],[0.665,-0.706,-0.244],[-0.666,-0.708,0.234]],"s":[1.3556,0.8179,0.4683],"dist":0.00027,"ang":22.75,"angT":0.11,"spec":3.06,"mem":[[-0.47,0.95,-0.92],[-0.46,0.94,-0.87],[-0.45,0.84,-0.94],[-0.47,0.91,-0.88],[-0.45,0.96,-0.87],[-0.45,0.9,-0.87],[-0.45,0.87,-0.85],[-0.47,0.94,-0.9],[-0.45,0.85,-0.89],[-0.46,0.87,-0.94],[-0.47,0.96,-0.86],[-0.45,0.9,-0.92],[-0.46,0.84,-0.94],[-0.47,0.9,-0.94],[-0.47,0.94,-0.95],[-0.45,0.86,-0.91]]},{"U":[[-0.338,0.007,-0.941],[0.665,-0.706,-0.244],[-0.666,-0.709,0.234]],"s":[1.3548,0.8178,0.4679],"dist":0.00026,"ang":22.71,"angT":0.13,"spec":3.09,"mem":[[-0.44,1.0,-0.87],[-0.46,0.82,-0.96],[-0.45,0.82,-0.89],[-0.5,1.04,-0.92],[-0.46,0.89,-0.89],[-0.45,0.93,-0.91],[-0.45,0.9,-0.88],[-0.46,0.94,-0.87],[-0.47,0.81,-0.94],[-0.46,0.98,-0.85],[-0.47,0.98,-0.91],[-0.41,0.76,-0.89],[-0.46,0.91,-0.91],[-0.47,0.88,-0.9],[-0.46,0.91,-0.92],[-0.46,0.86,-0.94]]},{"U":[[-0.338,0.008,-0.941],[0.665,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3548,0.818,0.4676],"dist":0.00025,"ang":22.74,"angT":0.11,"spec":3.09,"mem":[[-0.47,0.89,-0.92],[-0.46,0.92,-0.9],[-0.48,0.96,-0.91],[-0.44,0.85,-0.87],[-0.46,0.89,-0.91],[-0.45,0.87,-0.94],[-0.46,0.94,-0.89],[-0.45,0.75,-0.99],[-0.45,0.91,-0.88],[-0.45,0.88,-0.9],[-0.43,0.85,-0.9],[-0.47,0.96,-0.93],[-0.46,0.91,-0.9],[-0.47,0.94,-0.87],[-0.45,0.86,-0.91],[-0.47,1.05,-0.82]]},{"U":[[-0.338,0.008,-0.941],[0.665,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3547,0.818,0.4674],"dist":0.00025,"ang":22.74,"angT":0.11,"spec":3.09,"mem":[[-0.47,0.91,-0.95],[-0.46,0.92,-0.89],[-0.46,0.97,-0.91],[-0.47,0.88,-0.96],[-0.43,0.84,-0.88],[-0.44,0.91,-0.9],[-0.44,0.82,-0.88],[-0.46,0.96,-0.85],[-0.44,0.89,-0.85],[-0.46,0.89,-0.91],[-0.45,0.84,-0.9],[-0.45,0.92,-0.84],[-0.48,0.97,-0.92],[-0.47,0.89,-0.9],[-0.48,0.98,-0.92],[-0.46,0.84,-0.95]]},{"U":[[-0.338,0.008,-0.941],[0.664,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3541,0.8177,0.4671],"dist":0.00025,"ang":22.76,"angT":0.09,"spec":3.11,"mem":[[-0.47,0.92,-0.91],[-0.47,0.87,-0.96],[-0.48,1.01,-0.9],[-0.44,0.8,-0.91],[-0.48,0.87,-0.94],[-0.45,0.85,-0.91],[-0.47,0.94,-0.91],[-0.45,0.89,-0.88],[-0.45,0.88,-0.89],[-0.45,0.94,-0.85],[-0.44,0.79,-0.91],[-0.48,1.0,-0.9],[-0.43,0.94,-0.86],[-0.47,0.95,-0.9],[-0.45,0.86,-0.89],[-0.47,0.91,-0.93]]},{"U":[[-0.338,0.009,-0.941],[0.665,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3545,0.818,0.4668],"dist":0.00024,"ang":22.75,"angT":0.09,"spec":3.09,"mem":[[-0.47,0.98,-0.91],[-0.48,0.93,-0.97],[-0.43,0.89,-0.87],[-0.47,0.98,-0.9],[-0.47,0.85,-0.97],[-0.44,0.91,-0.87],[-0.44,0.89,-0.85],[-0.47,0.89,-0.95],[-0.45,0.82,-0.9],[-0.43,0.87,-0.83],[-0.48,0.91,-0.94],[-0.45,0.81,-0.91],[-0.45,0.95,-0.83],[-0.47,0.9,-0.94],[-0.48,0.91,-0.95],[-0.45,0.91,-0.85]]},{"U":[[-0.338,0.009,-0.941],[0.664,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3544,0.818,0.4668],"dist":0.00024,"ang":22.75,"angT":0.09,"spec":3.09,"mem":[[-0.43,0.89,-0.9],[-0.47,0.83,-0.94],[-0.45,0.92,-0.89],[-0.47,0.91,-0.94],[-0.44,0.88,-0.88],[-0.46,0.87,-0.93],[-0.44,0.81,-0.9],[-0.44,0.85,-0.89],[-0.49,0.92,-0.9],[-0.45,0.98,-0.86],[-0.47,0.89,-0.92],[-0.45,0.89,-0.87],[-0.47,0.92,-0.93],[-0.46,0.93,-0.88],[-0.48,0.99,-0.91],[-0.47,0.95,-0.92]]},{"U":[[-0.338,0.009,-0.941],[0.665,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3544,0.818,0.4667],"dist":0.00024,"ang":22.75,"angT":0.09,"spec":3.09,"mem":[[-0.45,0.82,-0.94],[-0.41,0.86,-0.83],[-0.46,0.94,-0.87],[-0.45,0.82,-0.96],[-0.44,0.89,-0.86],[-0.46,0.81,-0.96],[-0.45,0.88,-0.93],[-0.47,0.96,-0.9],[-0.47,0.98,-0.86],[-0.51,0.94,-0.97],[-0.46,0.86,-0.94],[-0.46,0.98,-0.84],[-0.47,0.91,-0.94],[-0.46,0.99,-0.84],[-0.47,0.93,-0.88],[-0.45,0.84,-0.91]]},{"U":[[-0.338,0.009,-0.941],[0.664,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3545,0.818,0.4667],"dist":0.00024,"ang":22.75,"angT":0.09,"spec":3.09,"mem":[[-0.42,0.77,-0.84],[-0.44,0.9,-0.91],[-0.46,0.91,-0.92],[-0.46,0.87,-0.92],[-0.44,0.79,-0.93],[-0.47,0.93,-0.91],[-0.46,0.92,-0.93],[-0.47,0.86,-0.91],[-0.5,1.03,-0.96],[-0.47,0.91,-0.89],[-0.46,0.89,-0.88],[-0.46,0.93,-0.89],[-0.47,1.01,-0.88],[-0.45,0.87,-0.89],[-0.46,0.89,-0.88],[-0.45,0.95,-0.9]]},{"U":[[-0.338,0.009,-0.941],[0.664,-0.706,-0.245],[-0.666,-0.708,0.233]],"s":[1.3545,0.818,0.4667],"dist":0.00024,"ang":22.75,"angT":0.09,"spec":3.09,"mem":[[-0.45,0.92,-0.9],[-0.46,0.9,-0.87],[-0.46,0.84,-0.93],[-0.45,0.94,-0.9],[-0.46,0.94,-0.88],[-0.47,0.91,-0.95],[-0.47,0.95,-0.89],[-0.47,0.96,-0.88],[-0.47,0.89,-0.91],[-0.46,0.91,-0.93],[-0.46,0.96,-0.88],[-0.47,0.87,-0.91],[-0.46,0.86,-0.92],[-0.45,0.9,-0.85],[-0.44,0.85,-0.92],[-0.45,0.84,-0.93]]}],"glob":[{"s":[1.4,0.8,0.45],"dist":0.08882,"spec":0.0},{"s":[0.9731,0.8451,0.4432],"dist":0.10791,"spec":25.65},{"s":[1.3068,0.8037,0.4494],"dist":0.08191,"spec":5.57},{"s":[1.0684,0.8701,0.4662],"dist":0.09227,"spec":20.27},{"s":[1.2989,0.7641,0.4756],"dist":0.08318,"spec":6.59},{"s":[1.1881,0.9281,0.484],"dist":0.08418,"spec":14.93},{"s":[1.2031,0.7856,0.4923],"dist":0.08231,"spec":12.06},{"s":[1.323,0.8391,0.5105],"dist":0.08259,"spec":6.3},{"s":[1.0786,0.8313,0.4763],"dist":0.09079,"spec":19.35},{"s":[1.2784,0.8231,0.511],"dist":0.08117,"spec":8.24},{"s":[1.1132,0.8695,0.5102],"dist":0.08775,"spec":17.99},{"s":[1.3511,0.8469,0.5134],"dist":0.08441,"spec":5.54},{"s":[1.1345,0.8336,0.5154],"dist":0.08577,"spec":16.46},{"s":[1.3062,0.8224,0.5314],"dist":0.08276,"spec":7.54},{"s":[1.1734,0.8086,0.4555],"dist":0.08275,"spec":13.55},{"s":[1.3373,0.8345,0.4417],"dist":0.08305,"spec":4.3},{"s":[1.1801,0.8857,0.4499],"dist":0.08267,"spec":14.1},{"s":[1.3338,0.8915,0.4476],"dist":0.08355,"spec":6.75},{"s":[1.2271,0.8182,0.464],"dist":0.08055,"spec":10.42},{"s":[1.2842,0.8256,0.4731],"dist":0.08062,"spec":7.22},{"s":[1.1845,0.8297,0.4679],"dist":0.08175,"spec":13.04},{"s":[1.3478,0.8585,0.475],"dist":0.08355,"spec":4.92},{"s":[1.2611,0.8493,0.4724],"dist":0.08017,"spec":8.91},{"s":[1.238,0.851,0.4709],"dist":0.0802,"spec":10.22},{"s":[1.2592,0.8351,0.462],"dist":0.08017,"spec":8.7},{"s":[1.2423,0.8529,0.4709],"dist":0.08017,"spec":10.01},{"s":[1.2662,0.8453,0.4663],"dist":0.0802,"spec":8.5},{"s":[1.2381,0.8497,0.4704],"dist":0.08019,"spec":10.19},{"s":[1.2488,0.8484,0.4715],"dist":0.08013,"spec":9.57},{"s":[1.2503,0.8479,0.4715],"dist":0.08012,"spec":9.48},{"s":[1.2513,0.8463,0.4715],"dist":0.08012,"spec":9.39},{"s":[1.2508,0.8457,0.4716],"dist":0.08012,"spec":9.41},{"s":[1.2508,0.8431,0.4702],"dist":0.08011,"spec":9.36},{"s":[1.2511,0.8431,0.4701],"dist":0.08011,"spec":9.34},{"s":[1.251,0.8431,0.4701],"dist":0.08011,"spec":9.34},{"s":[1.2508,0.8431,0.4699],"dist":0.08011,"spec":9.35},{"s":[1.2509,0.8431,0.4699],"dist":0.08011,"spec":9.35},{"s":[1.2509,0.8431,0.4699],"dist":0.08011,"spec":9.35},{"s":[1.2509,0.8431,0.4698],"dist":0.08011,"spec":9.35},{"s":[1.251,0.8431,0.4698],"dist":0.08011,"spec":9.34},{"s":[1.2509,0.8431,0.4698],"dist":0.08011,"spec":9.34}]};

  /* =====================================================================
     9) 二维动画：块奇异值各自缩放 → 整体椭圆的主轴转动
     ===================================================================== */
  (function ellipse2d() {
    var host = document.getElementById('ell-panels'); if (!host) return;
    var D2R = Math.PI / 180, A = 0.3, mode = 'diff', playing = !PP.reduceMotion, t = PP.reduceMotion ? Math.PI / 2 : 0, last = 0, raf = 0;
    var BLK = [{ phi: 12 * D2R, s: [1.0, 0.34], col: C.sel }, { phi: 60 * D2R, s: [0.95, 0.3], col: C.green }];
    function rotM(a) { return [[Math.cos(a), -Math.sin(a)], [Math.sin(a), Math.cos(a)]]; }
    function eig2(M) {
      var a = M[0][0], b = M[0][1], d = M[1][1], tr = (a + d) / 2, df = Math.sqrt(((a - d) / 2) * ((a - d) / 2) + b * b);
      var ang = 0.5 * Math.atan2(2 * b, a - d);
      return { l1: tr + df, l2: tr - df, ang: ang };
    }
    function blockSum(f) {
      var M = [[0, 0], [0, 0]];
      BLK.forEach(function (bk, k) {
        var R = rotM(bk.phi), s1 = bk.s[0] * f[k], s2 = bk.s[1] * f[k];
        var ev = [[R[0][0], R[1][0]], [R[0][1], R[1][1]]];
        [[ev[0], s1], [ev[1], s2]].forEach(function (p) { var v = p[0], q = p[1] * p[1]; M[0][0] += q * v[0] * v[0]; M[0][1] += q * v[0] * v[1]; M[1][0] += q * v[1] * v[0]; M[1][1] += q * v[1] * v[1]; });
      });
      return eig2(M);
    }
    var E0 = blockSum([1, 1]), S0 = [Math.sqrt(E0.l1), Math.sqrt(E0.l2)];
    function state(tt) {
      var d = A * Math.sin(tt);
      var fb = mode === 'diff' ? [1 + d, 1 - d] : [1 + d, 1 + d];
      var e = blockSum(fb), turn = (e.ang - E0.ang) / D2R;
      while (turn > 90) turn -= 180; while (turn < -90) turn += 180;
      var g = { s: [S0[0] * (1 + d), S0[1] * (1 - d)], ang: E0.ang };
      return { fb: fb, blk: { s: [Math.sqrt(e.l1), Math.sqrt(e.l2)], ang: e.ang, turn: turn }, glb: g, d: d };
    }
    var trails = { g: [], b: [] }, panels = [];
    function build() {
      clear(host); panels = [];
      [['g', 'Rescale the global singular values'], ['b', 'Rescale the block singular values']].forEach(function (p) {
        var box = el('div'); box.style.position = 'relative'; host.appendChild(box);
        var W = 360, H = 300, s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': p[1] }, box);
        text(s, 8, 18, p[1], { 'font-size': 13, 'font-weight': 700, fill: C.ink });
        var g = svg('g', { transform: 'translate(' + (W / 2) + ',' + (H / 2 + 8) + ')' }, s);
        panels.push({ key: p[0], s: s, g: g, W: W, H: H });
      });
      draw();
    }
    function ell(g, sx, sy, ang, sc, attrs) {
      return svg('ellipse', Object.assign({ cx: 0, cy: 0, rx: sx * sc, ry: sy * sc, transform: 'rotate(' + (-ang / D2R) + ')' }, attrs), g);
    }
    function draw() {
      var st = state(t), sc = 108;
      panels.forEach(function (P) {
        clear(P.g);
        svg('line', { x1: -150, x2: 150, y1: 0, y2: 0, stroke: C.soft }, P.g); svg('line', { x1: 0, x2: 0, y1: -120, y2: 120, stroke: C.soft }, P.g);
        var cur = P.key === 'b' ? st.blk : st.glb;
        if (P.key === 'b') BLK.forEach(function (bk, k) {
          ell(P.g, bk.s[0] * st.fb[k], bk.s[1] * st.fb[k], bk.phi, sc, { fill: bk.col, 'fill-opacity': .07, stroke: bk.col, 'stroke-opacity': .75, 'stroke-width': 1.3 });
          var ux = Math.cos(bk.phi) * bk.s[0] * st.fb[k] * sc, uy = -Math.sin(bk.phi) * bk.s[0] * st.fb[k] * sc;
          svg('line', { x1: -ux, y1: -uy, x2: ux, y2: uy, stroke: bk.col, 'stroke-opacity': .6, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, P.g);
        });
        ell(P.g, S0[0], S0[1], E0.ang, sc, { fill: 'none', stroke: C.faint, 'stroke-width': 1.2, 'stroke-dasharray': '4 4' });
        var x0 = Math.cos(E0.ang) * S0[0] * sc, y0 = -Math.sin(E0.ang) * S0[0] * sc;
        svg('line', { x1: -x0, y1: -y0, x2: x0, y2: y0, stroke: C.faint, 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }, P.g);
        ell(P.g, cur.s[0], cur.s[1], cur.ang, sc, { fill: C.ours, 'fill-opacity': .1, stroke: C.ours, 'stroke-width': 2.2 });
        /* 主轴尖端的轨迹 */
        var ux = Math.cos(cur.ang) * cur.s[0] * sc, uy = -Math.sin(cur.ang) * cur.s[0] * sc, tr = trails[P.key];
        tr.push([ux, uy]); if (tr.length > 90) tr.shift();
        if (tr.length > 1) svg('path', { d: tr.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(''), fill: 'none', stroke: C.ours, 'stroke-opacity': .35, 'stroke-width': 1.5 }, P.g);
        var vx = Math.cos(cur.ang + Math.PI / 2) * cur.s[1] * sc, vy = -Math.sin(cur.ang + Math.PI / 2) * cur.s[1] * sc;
        svg('line', { x1: -vx, y1: -vy, x2: vx, y2: vy, stroke: C.ours, 'stroke-opacity': .55, 'stroke-width': 1.6 }, P.g);
        svg('line', { x1: -ux, y1: -uy, x2: ux, y2: uy, stroke: C.ours, 'stroke-width': 2.4 }, P.g);
        svg('circle', { cx: ux, cy: uy, r: 4.5, fill: C.ours, stroke: '#fff', 'stroke-width': 1.5 }, P.g);
        text(P.g, ux + (ux >= 0 ? 8 : -8), uy - 6, 'u₁', { 'font-size': 13, 'font-style': 'italic', 'font-weight': 700, fill: C.ours, 'text-anchor': ux >= 0 ? 'start' : 'end' });
        var turn = P.key === 'b' ? cur.turn : 0;
        if (Math.abs(turn) > 0.3) {
          var r = 46, a0 = -E0.ang, a1 = -(E0.ang + turn * D2R);
          svg('path', { d: 'M' + (r * Math.cos(a0)).toFixed(1) + ',' + (r * Math.sin(a0)).toFixed(1) + ' A' + r + ',' + r + ' 0 0 ' + (turn > 0 ? 0 : 1) + ' ' + (r * Math.cos(a1)).toFixed(1) + ',' + (r * Math.sin(a1)).toFixed(1), fill: 'none', stroke: C.ink, 'stroke-width': 1.4 }, P.g);
        }
        var dsp = Math.sqrt(Math.pow(cur.s[0] / S0[0] - 1, 2) + Math.pow(cur.s[1] / S0[1] - 1, 2)) / Math.SQRT2 * 100;
        var Hh = P.H / 2 - 8;
        text(P.g, -P.W / 2 + 8, Hh - 12, 'axes turn ' + Math.abs(turn).toFixed(1) + '°', { 'font-size': 12.5, 'font-weight': 700, fill: Math.abs(turn) > 0.3 ? C.ours : C.muted, 'font-variant-numeric': 'tabular-nums' });
        text(P.g, P.W / 2 - 8, Hh - 12, 'singular values ±' + dsp.toFixed(1) + '%', { 'font-size': 12, fill: C.muted, 'text-anchor': 'end', 'font-variant-numeric': 'tabular-nums' });
      });
      var out = document.getElementById('ell-delta'); if (out) out.textContent = (st.d >= 0 ? '+' : '−') + Math.abs(st.d * 100).toFixed(0) + '%';
    }
    function loop(now) {
      if (!playing) return;
      if (last) t += Math.min(0.05, (now - last) / 1000) * 1.5;
      last = now; draw(); raf = requestAnimationFrame(loop);
    }
    function setPlay(p) {
      playing = p; document.getElementById('ell-play').textContent = p ? 'Pause' : 'Play';
      cancelAnimationFrame(raf); last = 0; if (p) raf = requestAnimationFrame(loop);
    }
    document.getElementById('ell-play').addEventListener('click', function () { setPlay(!playing); });
    PP.segmented(document.getElementById('seg-ell'), function (v) { mode = v; trails.b = []; if (!playing) draw(); });
    build(); onResize(build);
    var w = document.getElementById('w-ellipse');
    PP.whenVisible(w, function () { setPlay(playing); });
    if (!playing) document.getElementById('ell-play').textContent = 'Play';
  })();

  /* =====================================================================
     10) 三维：块空间里的 ES 把输出框架转向目标（玩具 3×12 矩阵，Python 预计算）
     ===================================================================== */
  (function frames3d() {
    var host = document.getElementById('chart-frames3d'); if (!host) return;
    var T = ES3D, mode = 'block', it = 0, playing = false, raf = 0, last = 0, yaw = -0.25, pitch = 0.28, dragged = false, autoRaf = 0;
    var N = T.block.length - 1;
    function col(M, j) { return [M[0][j], M[1][j], M[2][j]]; }
    function lerp(a, b, f) { return a + (b - a) * f; }
    function norm(v) { var n = Math.hypot(v[0], v[1], v[2]); return [v[0] / n, v[1] / n, v[2] / n]; }
    function frameAt(x) {
      if (mode === 'glob') { var i0 = Math.floor(x), f0 = x - i0, a = T.glob[i0], b = T.glob[Math.min(N, i0 + 1)]; return { U: T.U0, s: a.s.map(function (v, k) { return lerp(v, b.s[k], f0); }) }; }
      var i = Math.floor(x), f = x - i, A = T.block[i], B = T.block[Math.min(N, i + 1)], U = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      var cols = [0, 1, 2].map(function (j) { var p = col(A.U, j), q = col(B.U, j); return norm([lerp(p[0], q[0], f), lerp(p[1], q[1], f), lerp(p[2], q[2], f)]); });
      cols.forEach(function (c, j) { U[0][j] = c[0]; U[1][j] = c[1]; U[2][j] = c[2]; });
      return { U: U, s: A.s.map(function (v, k) { return lerp(v, B.s[k], f); }) };
    }
    var u0v = [T.U0[0][0], T.U0[1][0], T.U0[2][0]], utv = [T.Ut[0][0], T.Ut[1][0], T.Ut[2][0]];
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    var bz = norm(cross(u0v, utv)), bx = norm(u0v), by = cross(bz, bx);
    function view(p) {
      p = [bx[0] * p[0] + bx[1] * p[1] + bx[2] * p[2], by[0] * p[0] + by[1] * p[1] + by[2] * p[2], bz[0] * p[0] + bz[1] * p[1] + bz[2] * p[2]];
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var x = cy * p[0] + sy * p[2], z1 = -sy * p[0] + cy * p[2], y = cp * p[1] - sp * z1, z = sp * p[1] + cp * z1;
      return [x, y, z];
    }
    var W = 460, H = 380, SC = 128, s, tip;
    function P(p) { var v = view(p); return [W / 2 + v[0] * SC, H / 2 - v[1] * SC, v[2]]; }
    function mapE(Uf, sf, x) { return [0, 1, 2].map(function (r) { return Uf[r][0] * sf[0] * x[0] + Uf[r][1] * sf[1] * x[1] + Uf[r][2] * sf[2] * x[2]; }); }
    function normalE(Uf, sf, x) { return [0, 1, 2].map(function (r) { return Uf[r][0] / sf[0] * x[0] + Uf[r][1] / sf[1] * x[1] + Uf[r][2] / sf[2] * x[2]; }); }
    function wire(g, Uf, sf, stroke, op, dash) {
      var curves = [];
      [-50, 0, 50].forEach(function (la) { var c = []; for (var k = 0; k <= 48; k++) { var th = k / 48 * 2 * Math.PI, ph = la * Math.PI / 180; c.push([Math.cos(th) * Math.cos(ph), Math.sin(th) * Math.cos(ph), Math.sin(ph)]); } curves.push(c); });
      for (var lo = 0; lo < 180; lo += 45) { var c = []; for (var k = 0; k <= 48; k++) { var ph = k / 48 * 2 * Math.PI - Math.PI, th = lo * Math.PI / 180; c.push([Math.cos(th) * Math.cos(ph), Math.sin(th) * Math.cos(ph), Math.sin(ph)]); } curves.push(c); }
      var front = '', back = '';
      curves.forEach(function (c) {
        for (var k = 0; k < c.length - 1; k++) {
          var a = P(mapE(Uf, sf, c[k])), b = P(mapE(Uf, sf, c[k + 1])), n = view(normalE(Uf, sf, c[k]));
          var seg = 'M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ',' + b[1].toFixed(1);
          if (n[2] >= 0) front += seg; else back += seg;
        }
      });
      svg('path', { d: back, fill: 'none', stroke: stroke, 'stroke-opacity': op * 0.35, 'stroke-width': 0.9, 'stroke-dasharray': dash || null }, g);
      return function () { svg('path', { d: front, fill: 'none', stroke: stroke, 'stroke-opacity': op, 'stroke-width': 1, 'stroke-dasharray': dash || null }, g); };
    }
    function silhouette(g, Uf, sf, attrs) {
      /* 椭球的正交投影是椭圆：由 2×3 投影矩阵 M 的 M Mᵀ 给出 */
      var a = 0, b = 0, d = 0;
      for (var j = 0; j < 3; j++) { var v = view([Uf[0][j] * sf[j], Uf[1][j] * sf[j], Uf[2][j] * sf[j]]); a += v[0] * v[0]; b += v[0] * v[1]; d += v[1] * v[1]; }
      var tr = (a + d) / 2, df = Math.sqrt((a - d) * (a - d) / 4 + b * b), ang = 0.5 * Math.atan2(2 * b, a - d);
      return svg('ellipse', Object.assign({ cx: W / 2, cy: H / 2, rx: Math.sqrt(tr + df) * SC, ry: Math.sqrt(Math.max(0, tr - df)) * SC, transform: 'rotate(' + (-ang * 180 / Math.PI) + ' ' + (W / 2) + ' ' + (H / 2) + ')' }, attrs), g);
    }
    function star(g, x, y, r, attrs) {
      var d = ''; for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; d += (k ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ',' + (y + rr * Math.sin(a)).toFixed(1); }
      return svg('path', Object.assign({ d: d + 'Z' }, attrs), g);
    }
    function render() {
      clear(host);
      s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Output frame of a toy weight matrix during ES', style: 'cursor:grab;touch-action:none' }, host);
      tip = null; draw3d(); bindDrag();
    }
    function draw3d() {
      while (s.firstChild) s.removeChild(s.firstChild);
      var g = svg('g', {}, s), F = frameAt(it), U0 = T.U0, s0 = T.s0;
      /* 初始椭球（虚线）与当前椭球（蓝色线框） */
      silhouette(g, U0, s0, { fill: 'none', stroke: C.faint, 'stroke-width': 1.1, 'stroke-dasharray': '4 4' });
      silhouette(g, F.U, F.s, { fill: C.ours, 'fill-opacity': .07, stroke: C.ours, 'stroke-opacity': .5, 'stroke-width': 1.2 });
      var front = wire(g, F.U, F.s, C.ours, .45);
      /* 坐标轴：±σ_i u_i */
      var axCol = [C.ours, '#7d9bc8', '#a9bedb'];
      [2, 1, 0].forEach(function (j) {
        var a = P(mapE(F.U, F.s, [j === 0 ? -1 : 0, j === 1 ? -1 : 0, j === 2 ? -1 : 0])), b = P(mapE(F.U, F.s, [j === 0 ? 1 : 0, j === 1 ? 1 : 0, j === 2 ? 1 : 0]));
        svg('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: axCol[j], 'stroke-width': j ? 1.6 : 2.4 }, g);
      });
      var u0 = P([U0[0][0] * s0[0], U0[1][0] * s0[0], U0[2][0] * s0[0]]), c0 = P([0, 0, 0]);
      svg('line', { x1: c0[0], y1: c0[1], x2: u0[0], y2: u0[1], stroke: C.faint, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, g);
      /* 目标 ★ */
      var tg = P([T.Ut[0][0] * T.st[0], T.Ut[1][0] * T.st[0], T.Ut[2][0] * T.st[0]]);
      /* 轨迹：每一轮的 σ₁u₁ 尖端 */
      var pts = [], upto = Math.floor(it);
      for (var k = 0; k <= upto; k++) {
        var Fk = mode === 'block' ? T.block[k] : { U: U0, s: T.glob[k].s };
        pts.push(P([Fk.U[0][0] * Fk.s[0], Fk.U[1][0] * Fk.s[0], Fk.U[2][0] * Fk.s[0]]));
      }
      var cur = P(mapE(F.U, F.s, [1, 0, 0])); pts.push(cur);
      /* 当前一轮的 16 个扰动成员 */
      if (playing || it > 0) {
        var mem = mode === 'block' ? T.block[Math.min(N, Math.round(it))].mem : null;
        if (mem) mem.forEach(function (m) { var q = P(m); svg('circle', { cx: q[0], cy: q[1], r: 2.6, fill: C.sel, 'fill-opacity': .55 }, g); });
        else { var rr = mul(Math.round(it) + 3); for (var j = 0; j < 16; j++) { var f = 1 + 0.04 * gs(rr), q2 = P(mapE(F.U, F.s, [f, 0, 0])); svg('circle', { cx: q2[0], cy: q2[1], r: 2.6, fill: C.sel, 'fill-opacity': .55 }, g); } }
      }
      front();
      if (pts.length > 1) svg('path', { d: pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(''), fill: 'none', stroke: C.ink, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' }, g);
      pts.slice(0, -1).forEach(function (q, k) { if (k % 4 === 0) svg('circle', { cx: q[0], cy: q[1], r: 3, fill: C.ink }, g); });
      text(g, cur[0] + 9, cur[1] + 16, 'u₁', { 'font-size': 13, 'font-style': 'italic', 'font-weight': 700, fill: C.ours, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
      svg('circle', { cx: u0[0], cy: u0[1], r: 5, fill: '#fff', stroke: C.faint, 'stroke-width': 1.6 }, g);
      text(g, u0[0] + 8, u0[1] + 14, 'U₀', { 'font-size': 12.5, 'font-style': 'italic', fill: C.muted, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
      text(g, tg[0] + 10, tg[1] - 8, 'target', { 'font-size': 11.5, fill: C.ink, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
      svg('circle', { cx: cur[0], cy: cur[1], r: 5, fill: C.ours, stroke: '#fff', 'stroke-width': 1.6 }, g);
      star(g, tg[0], tg[1], 9, { fill: '#e2a33b', 'fill-opacity': .9, stroke: '#fff', 'stroke-width': 1.2 });
      text(g, 10, H - 12, 'drag to rotate', { 'font-size': 11, fill: C.faint });
      stats();
    }
    var stEl = {};
    ['it', 'ang', 'spec', 'dist'].forEach(function (k) { stEl[k] = document.getElementById('fr-' + k); });
    function stats() {
      var i = Math.min(N, Math.round(it)), d0 = T.block[0].dist;
      var r = mode === 'block' ? T.block[i] : { ang: 0, spec: T.glob[i].spec, dist: T.glob[i].dist };
      stEl.it.textContent = i + ' / ' + N;
      stEl.ang.textContent = r.ang.toFixed(1) + '°';
      stEl.spec.textContent = r.spec.toFixed(1) + '%';
      stEl.dist.textContent = (r.dist / d0 * 100).toFixed(r.dist / d0 < 0.1 ? 1 : 0) + '%';
      mini();
    }
    var mhost = document.getElementById('chart-frames-dist');
    function mini() {
      clear(mhost);
      var Wm = 260, Hm = 130, m = { l: 34, r: 8, t: 10, b: 22 }, ms = svg('svg', { viewBox: '0 0 ' + Wm + ' ' + Hm, role: 'img', 'aria-label': 'Distance to the target over iterations' }, mhost);
      var X = function (k) { return m.l + k / N * (Wm - m.l - m.r); }, Y = function (v) { return Hm - m.b - v * (Hm - m.t - m.b); }, d0 = T.block[0].dist;
      [0, 0.5, 1].forEach(function (v) { svg('line', { x1: m.l, x2: Wm - m.r, y1: Y(v), y2: Y(v), stroke: C.soft }, ms); text(ms, m.l - 5, Y(v) + 3.5, (v * 100) + '%', { 'text-anchor': 'end', 'font-size': 9.5, fill: C.muted }); });
      text(ms, X(0), Hm - 6, '0', { 'text-anchor': 'middle', 'font-size': 9.5, fill: C.muted }); text(ms, X(N), Hm - 6, N, { 'text-anchor': 'middle', 'font-size': 9.5, fill: C.muted });
      [['glob', C.faint], ['block', C.ours]].forEach(function (p) {
        var arr = p[0] === 'block' ? T.block : T.glob, on = p[0] === mode;
        svg('path', { d: arr.map(function (r, k) { return (k ? 'L' : 'M') + X(k).toFixed(1) + ',' + Y(r.dist / d0).toFixed(1); }).join(''), fill: 'none', stroke: p[1], 'stroke-width': on ? 2.2 : 1.4, 'stroke-opacity': on ? 1 : .7 }, ms);
      });
      var i = Math.min(N, Math.round(it)), arr2 = mode === 'block' ? T.block : T.glob;
      svg('circle', { cx: X(i), cy: Y(arr2[i].dist / d0), r: 3.8, fill: mode === 'block' ? C.ours : C.faint, stroke: '#fff', 'stroke-width': 1.3 }, ms);
    }
    function loop(now) {
      if (!playing) return;
      if (last) it = Math.min(N, it + (now - last) / 1000 * 5);
      last = now; if (!dragged && !PP.reduceMotion) yaw += 0.0035;
      draw3d();
      if (it >= N) { setPlay(false); return; }
      raf = requestAnimationFrame(loop);
    }
    var playBtn = document.getElementById('fr-play');
    function setPlay(p) {
      playing = p; playBtn.textContent = p ? 'Pause' : (it >= N ? 'Replay' : 'Run ES');
      cancelAnimationFrame(raf); last = 0;
      if (p) { if (it >= N) it = 0; if (PP.reduceMotion) { it = N; draw3d(); setPlay(false); return; } raf = requestAnimationFrame(loop); }
    }
    playBtn.addEventListener('click', function () { setPlay(!playing); });
    document.getElementById('fr-reset').addEventListener('click', function () { setPlay(false); it = 0; draw3d(); playBtn.textContent = 'Run ES'; });
    PP.segmented(document.getElementById('seg-frames'), function (v) { mode = v; it = 0; setPlay(true); });
    function bindDrag() {
      var sx = 0, sy = 0, y0 = 0, p0 = 0, down = false;
      s.addEventListener('pointerdown', function (e) { down = true; dragged = true; sx = e.clientX; sy = e.clientY; y0 = yaw; p0 = pitch; s.setPointerCapture(e.pointerId); s.style.cursor = 'grabbing'; });
      s.addEventListener('pointermove', function (e) { if (!down) return; yaw = y0 + (e.clientX - sx) * 0.01; pitch = Math.max(-1.2, Math.min(1.2, p0 + (e.clientY - sy) * 0.01)); if (!playing) draw3d(); });
      s.addEventListener('pointerup', function () { down = false; s.style.cursor = 'grab'; });
    }
    /* 空闲时缓慢自转 */
    function idle() { if (!playing && !dragged && !PP.reduceMotion) { yaw += 0.003; draw3d(); } autoRaf = requestAnimationFrame(idle); }
    render(); onResize(render);
    PP.whenVisible(document.getElementById('w-frames'), function () { if (!PP.reduceMotion) autoRaf = requestAnimationFrame(idle); setPlay(true); });

    /* 真实权重上的转角（论文附录：8 个 Qwen2.5-1.5B 矩阵，Countdown 学到的更新幅度） */
    var rh = document.getElementById('chart-frames-real');
    function real() {
      clear(rh);
      var R = [['Global singular values', 0, '#c3cbd6', 'Global|Σ'], ['Random dense update', 10, '#9aa6b6', 'Random|dense'], ['Random block rescaling', 33, '#9db8dc', 'Random|block Σ'], ['Learned FuRA-S update', 37, C.ours, 'Learned|FuRA-S']];
      var Wr = width(rh, 760), narrow = Wr < 560, Hr = 190, m = { l: 34, r: 8, t: 16, b: narrow ? 36 : 24 }, rs = svg('svg', { viewBox: '0 0 ' + Wr + ' ' + Hr, role: 'img', 'aria-label': 'Measured rotation on real weights' }, rh);
      var cw = (Wr - m.l - m.r) / R.length, Y = function (v) { return Hr - m.b - v / 40 * (Hr - m.t - m.b); };
      [0, 20, 40].forEach(function (v) { svg('line', { x1: m.l, x2: Wr - m.r, y1: Y(v), y2: Y(v), stroke: C.soft }, rs); text(rs, m.l - 6, Y(v) + 4, v + '°', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
      R.forEach(function (r, i) {
        var cx = m.l + cw * (i + .5), bw = Math.min(70, cw * .5);
        svg('rect', { x: cx - bw / 2, y: Y(Math.max(r[1], 0.4)), width: bw, height: Hr - m.b - Y(Math.max(r[1], 0.4)), rx: 4, fill: r[2] }, rs);
        text(rs, cx, Y(r[1]) - 6, r[1] + '°', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: C.ink });
        var two = r[3].split('|');
        if (narrow) { text(rs, cx, Hr - m.b + 14, two[0], { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.text }); text(rs, cx, Hr - m.b + 27, two[1], { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.text }); }
        else text(rs, cx, Hr - m.b + 16, r[0], { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.text });
      });
    }
    real(); onResize(real);
  })();

  /* =====================================================================
     11) 换回预训练谱：训练后的框架 + 预训练的奇异值（论文干预实验）
     ===================================================================== */
  (function rebase() {
    var host = document.getElementById('chart-rebase'); if (!host) return;
    /* MATH：Qwen2.5-Math-7B，MATH500/Minerva/OlympiadBench 平均；Countdown：Qwen2.5-1.5B-Instruct，两个种子平均 */
    var D = [
      { name: 'MATH', base: 25.17, trained: 44.20, a: [43.27, 43.07, 44.20], mirror: 28.04 },
      { name: 'Countdown', base: 1.8, trained: 37.4, a: [35.9, 36.8, 37.4], mirror: 0.5 }
    ];
    var mode = 'trained', k = 0, shown = null;
    var sumEl = document.getElementById('rebase-summary'), slider = document.getElementById('rebase-alpha'), out = document.getElementById('rebase-alpha-out');
    function val(d) { return mode === 'mirror' ? d.mirror : d.a[k]; }
    function render() {
      clear(host);
      var W = width(host, 760), H = 280, m = { l: 40, r: 10, t: 22, b: 30 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Accuracy after swapping the spectrum' }, host), tip = PP.tooltip(host);
      var cw = (W - m.l - m.r) / D.length, Y = function (v) { return H - m.b - v / 50 * (H - m.t - m.b); };
      [0, 10, 20, 30, 40, 50].forEach(function (v) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: C.soft }, s); text(s, m.l - 8, Y(v) + 4, v + '%', { 'text-anchor': 'end', 'font-size': 10.5, fill: C.muted }); });
      D.forEach(function (d, i) {
        var cx = m.l + cw * (i + .5), bw = Math.min(110, cw * .42), v = shown ? shown[i] : val(d), kept = (v - d.base) / (d.trained - d.base) * 100, g = svg('g', {}, s);
        svg('rect', { x: cx - bw / 2, y: Y(Math.max(v, 0.3)), width: bw, height: H - m.b - Y(Math.max(v, 0.3)), rx: 5, fill: mode === 'mirror' ? '#9aa6b6' : C.ours, 'fill-opacity': .9 }, g);
        [[d.base, C.faint, 'pretrained'], [d.trained, C.ink, 'trained']].forEach(function (q) {
          svg('line', { x1: cx - bw / 2 - 14, x2: cx + bw / 2 + 14, y1: Y(q[0]), y2: Y(q[0]), stroke: q[1], 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, g);
          if (W >= 560) text(g, cx + bw / 2 + 18, Y(q[0]) + 4, q[2] + ' ' + q[0].toFixed(1), { 'font-size': 10.5, fill: C.muted, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' });
        });
        var inside = H - m.b - Y(v) > 30;
        text(g, cx, inside ? Y(v) + 20 : Y(v) - 8, v.toFixed(1) + '%', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: inside ? '#fff' : C.ink });
        text(g, cx, H - m.b + 18, d.name, { 'text-anchor': 'middle', 'font-size': 12, fill: C.text });
        svg('rect', { x: cx - cw / 2 + 4, y: m.t, width: cw - 8, height: H - m.t - m.b, fill: 'transparent' }, g);
        hoverTip(s, W, g, cx, Y(v), d.name, [{ color: C.faint, value: d.base.toFixed(1) + '%', label: 'pretrained model' }, { color: C.ours, value: v.toFixed(1) + '%', label: 'this combination · ' + Math.max(0, kept).toFixed(1) + '% of the gain' }, { color: C.ink, value: d.trained.toFixed(1) + '%', label: 'trained model' }], tip);
      });
      var kp = D.map(function (d) { return Math.max(0, (val(d) - d.base) / (d.trained - d.base) * 100); });
      sumEl.textContent = mode === 'mirror'
        ? 'Pretrained frames with the trained spectrum: ' + kp[0].toFixed(0) + '% of the gain on MATH and ' + kp[1].toFixed(0) + '% on Countdown. The spectrum alone carries almost none of what was learned.'
        : (k === 2 ? 'The trained model: trained frames with the trained spectrum.' : 'Trained frames with ' + (k === 0 ? 'the pretrained spectrum' : 'a half-way spectrum') + ': ' + kp[0].toFixed(1) + '% of the gain on MATH and ' + kp[1].toFixed(1) + '% on Countdown.');
    }
    var STOPS = [0, 0.5, 1];
    PP.slider(slider, out, function (x) { return 'α = ' + STOPS[x]; }, function (x) { k = x; if (shown === null) render(); });
    PP.segmented(document.getElementById('seg-rebase'), function (v) { mode = v; slider.disabled = v === 'mirror'; render(); });
    document.getElementById('rebase-sweep').addEventListener('click', function () {
      if (mode === 'mirror') { mode = 'trained'; [].forEach.call(document.querySelectorAll('#seg-rebase button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-value') === 'trained' ? 'true' : 'false'); }); slider.disabled = false; }
      var seq = [2, 1, 0], step = 0;
      (function next() {
        slider.value = seq[step]; slider.dispatchEvent(new Event('input'));
        step++; if (step < seq.length) setTimeout(next, PP.reduceMotion ? 0 : 900);
      })();
    });
    render(); onResize(render);
  })();
})();
