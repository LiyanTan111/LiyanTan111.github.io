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
})();
