/* ZO-MC-SGD 项目页的交互图表。产率曲线、表格数值取自论文（arXiv:2609.30678）及其作图脚本中的五种子均值；玩具模型除外。 */
(function () {
  'use strict';
  var PP = window.PP, svg = PP.svg, text = PP.text;
  var css = getComputedStyle(document.documentElement);
  function v(n) { return css.getPropertyValue(n).trim(); }
  var C = { ours: v('--s-ours'), sel: v('--s-mezo'), ink: v('--ink'), text: v('--text'), muted: v('--muted'), faint: v('--faint'),
            line: v('--line'), soft: v('--line-soft'), base: '#aab4c3', dot: '#8f9bad', surface: '#ffffff' };
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function width(el, max) { return Math.max(260, Math.min(max || 760, Math.round(el.clientWidth || max || 760))); }
  var renders = [];
  function onResize(fn) { renders.push(fn); }
  var rt = 0, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastW) < 8) return; lastW = window.innerWidth;
    clearTimeout(rt); rt = setTimeout(function () { renders.forEach(function (f) { f(); }); }, 150);
  });
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function fmtB(b) { return b >= 1000 ? (b / 1000).toFixed(1).replace('.0', '') + 'k' : String(b); }

  /* =====================================================================
     1) 玩具：固定样本下的产率估计是阶梯函数，softplus 裕量损失是光滑的
     ===================================================================== */
  (function flat() {
    var root = document.getElementById('w-flat'); if (!root) return;
    var N = 10, alpha = 6, seed = 3, xi = [], cursor = 0.38, SIG = 0.35, GRID = 401;
    function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function draw() { var r = mulberry(seed * 131 + 7); xi = []; for (var i = 0; i < 1000; i++) { var u = 0, w = 0; while (u === 0) u = r(); while (w === 0) w = r(); var R = Math.sqrt(-2 * Math.log(u)); xi.push([R * Math.cos(2 * Math.PI * w), R * Math.sin(2 * Math.PI * w)]); } }
    /* 两个规格裕量：增益随 x 变好、功耗随 x 变差；>=0 为通过 */
    function m1(x, e) { return 3.2 * (x - 0.28) + SIG * e; }
    function m2(x, e) { return 3.2 * (0.78 - x) + SIG * e; }
    function Phi(z) { var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
    function trueY(x) { return Phi(3.2 * (x - 0.28) / SIG) * Phi(3.2 * (0.78 - x) / SIG); }
    function yhat(x) { var c = 0; for (var i = 0; i < N; i++) if (m1(x, xi[i][0]) >= 0 && m2(x, xi[i][1]) >= 0) c++; return c / N; }
    function sp(d) { return d * alpha > 30 ? d : Math.log(1 + Math.exp(alpha * d)) / alpha; }
    function loss(x) { var s = 0; for (var i = 0; i < N; i++) s += sp(-m1(x, xi[i][0])) + sp(-m2(x, xi[i][1])); return s / N; }
    function ranks(a) { var idx = a.map(function (v, i) { return i; }).sort(function (p, q) { return a[p] - a[q]; }), r = new Array(a.length), i = 0; while (i < idx.length) { var j = i; while (j + 1 < idx.length && a[idx[j + 1]] === a[idx[i]]) j++; for (var k = i; k <= j; k++) r[idx[k]] = (i + j) / 2; i = j + 1; } return r; }
    function spearman(a, b) { var ra = ranks(a), rb = ranks(b), n = a.length, ma = 0, mb = 0, i; for (i = 0; i < n; i++) { ma += ra[i] / n; mb += rb[i] / n; } var sab = 0, saa = 0, sbb = 0; for (i = 0; i < n; i++) { sab += (ra[i] - ma) * (rb[i] - mb); saa += (ra[i] - ma) * (ra[i] - ma); sbb += (rb[i] - mb) * (rb[i] - mb); } return sab / Math.sqrt(saa * sbb); }
    var hy = document.getElementById('chart-yield'), hl = document.getElementById('chart-loss'), Y = [], L = [], T = [], parts = {};
    function compute() {
      Y = []; L = []; T = [];
      for (var i = 0; i < GRID; i++) { var x = i / (GRID - 1); Y.push(yhat(x)); L.push(loss(x)); T.push(trueY(x)); }
      /* 校准式秩检验：在 81 个设计点上比较平均损失与经验产率 */
      var ls = [], ys = []; for (var k = 0; k <= 80; k++) { var x2 = 0.05 + 0.9 * k / 80; ls.push(loss(x2)); ys.push(yhat(x2)); }
      var rho = spearman(ls, ys);
      var re = document.getElementById('flat-rho'); re.textContent = (isNaN(rho) ? '–' : (rho < 0 ? '−' : '') + Math.abs(rho).toFixed(2) + (rho <= -0.7 ? ' ✓' : ''));
    }
    function panel(host, kind) {
      clear(host);
      var W = width(host, 640), H = kind === 'y' ? 170 : 150, m = { l: 40, r: 12, t: 8, b: kind === 'y' ? 10 : 30 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': kind === 'y' ? 'Yield estimate across the design knob' : 'Softplus loss across the design knob' }, host);
      var X = function (x) { return m.l + x * (W - m.l - m.r); };
      var arr = kind === 'y' ? Y : L, lo = 0, hi = kind === 'y' ? 1 : Math.max.apply(null, L) * 1.05;
      var Yp = function (val) { return H - m.b - (val - lo) / (hi - lo) * (H - m.t - m.b); };
      (kind === 'y' ? [0, 0.5, 1] : [0, hi / 2, hi]).forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Yp(t), y2: Yp(t), stroke: C.soft }, s); text(s, m.l - 6, Yp(t) + 4, kind === 'y' ? String(t) : t.toFixed(1), { 'text-anchor': 'end', 'font-size': 11, fill: C.muted }); });
      if (kind !== 'y') { [0, 0.25, 0.5, 0.75, 1].forEach(function (t) { text(s, X(t), H - m.b + 16, String(t), { 'text-anchor': 'middle', 'font-size': 11, fill: C.muted }); }); text(s, W - m.r, H - 2, 'design knob x', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted }); }
      if (kind === 'y') {
        var dT = T.map(function (val, i) { return (i ? 'L' : 'M') + X(i / (GRID - 1)).toFixed(1) + ',' + Yp(val).toFixed(1); }).join('');
        svg('path', { d: dT, fill: 'none', stroke: C.faint, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, s);
        /* 阶梯：水平段 + 竖直跳变 */
        var d = 'M' + X(0) + ',' + Yp(arr[0]);
        for (var i = 1; i < GRID; i++) { var xx = X(i / (GRID - 1)); if (arr[i] !== arr[i - 1]) d += 'L' + xx.toFixed(1) + ',' + Yp(arr[i - 1]).toFixed(1); d += 'L' + xx.toFixed(1) + ',' + Yp(arr[i]).toFixed(1); }
        svg('path', { d: d, fill: 'none', stroke: C.sel, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, s);
        text(s, W - m.r - 4, m.t + 12, 'dashed: true yield', { 'text-anchor': 'end', 'font-size': 11, fill: C.faint });
      } else {
        var dl = arr.map(function (val, i) { return (i ? 'L' : 'M') + X(i / (GRID - 1)).toFixed(1) + ',' + Yp(val).toFixed(1); }).join('');
        svg('path', { d: dl, fill: 'none', stroke: C.ours, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, s);
      }
      var cur = svg('line', { y1: m.t, y2: H - m.b, stroke: C.ink, 'stroke-opacity': .4 }, s);
      var dot = svg('circle', { r: 5, fill: kind === 'y' ? C.sel : C.ours, stroke: C.surface, 'stroke-width': 2 }, s);
      var tan = svg('line', { stroke: C.ink, 'stroke-width': 1.6, 'stroke-dasharray': '5 3' }, s);
      var hit = svg('rect', { x: m.l, y: 0, width: W - m.l - m.r, height: H, fill: 'transparent', style: 'cursor:crosshair' }, s);
      function move(ev) { var r = s.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width; cursor = Math.max(0.01, Math.min(0.99, (px - m.l) / (W - m.l - m.r))); update(); }
      hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
      parts[kind] = { X: X, Y: Yp, cur: cur, dot: dot, tan: tan, arr: arr };
    }
    function slope(arr, x) { var i = Math.round(x * (GRID - 1)), a = Math.max(0, i - 2), b = Math.min(GRID - 1, i + 2); return (arr[b] - arr[a]) / ((b - a) / (GRID - 1)); }
    function update() {
      var i = Math.round(cursor * (GRID - 1));
      ['y', 'l'].forEach(function (k) {
        var p = parts[k]; if (!p) return; var x = p.X(cursor), val = p.arr[i], sl = slope(p.arr, cursor);
        p.cur.setAttribute('x1', x); p.cur.setAttribute('x2', x);
        p.dot.setAttribute('cx', x); p.dot.setAttribute('cy', p.Y(val));
        var dx = 0.08; p.tan.setAttribute('x1', p.X(cursor - dx)); p.tan.setAttribute('x2', p.X(cursor + dx)); p.tan.setAttribute('y1', p.Y(val - sl * dx)); p.tan.setAttribute('y2', p.Y(val + sl * dx));
      });
      document.getElementById('flat-x').textContent = cursor.toFixed(2);
      document.getElementById('flat-y').textContent = Y[i].toFixed(N >= 1000 ? 3 : 2);
      var sy = slope(Y, cursor), sl = slope(L, cursor);
      document.getElementById('flat-dy').textContent = Math.abs(sy) < 1e-9 ? '0 (flat)' : 'a jump';
      document.getElementById('flat-dl').textContent = (sl < 0 ? '→ ' : '← ') + (sl > 0 ? '+' : '−') + Math.abs(sl).toFixed(2);
    }
    function render() { compute(); panel(hy, 'y'); panel(hl, 'l'); update(); }
    PP.segmented(document.getElementById('seg-n'), function (k) { N = +k; render(); });
    PP.slider(document.getElementById('flat-a'), document.getElementById('flat-a-out'), null, function (a) { alpha = a; if (xi.length) render(); });
    document.getElementById('flat-resample').addEventListener('click', function () { seed++; draw(); render(); });
    draw(); render(); onResize(render);
  })();

  /* =====================================================================
     2) 主结果：五种子平均产率 vs SPICE 预算（与论文图相同，取预算上的累计最优）
     ===================================================================== */
  var BUD = [25, 50, 100, 200, 400, 800, 1600, 3200];
  var METH = ['ZO-MC-SGD', 'BO', 'CMA-ES', 'PSO', 'TuRBO', 'RobustAnalog'];
  var CIRC = {
    cs1: { name: '1-stage csamp', short: 'CS ×1', init: 0.2375, ymin: 0, raw: [[0.547, 0.790, 0.920, 0.950, 0.950, 0.950, 0.950, 0.950], [0.237, 0.517, 0.665, 0.950, 0.950, 0.950, 0.950, 0.950], [0.042, 0.283, 0.610, 0.760, 0.760, 0.950, 0.950, 0.755], [0.237, 0.237, 0.237, 0.380, 0.950, 0.950, 0.940, 0.950], [0.237, 0.237, 0.440, 0.807, 0.950, 0.950, 0.950, 0.950], [0.237, 0.237, 0.237, 0.237, 0.522, 0.522, 0.950, 0.950]] },
    cs3: { name: '3-stage csamp', short: 'CS ×3', init: 0.2000, ymin: 0, raw: [[0.390, 0.430, 0.853, 0.965, 1.000, 1.000, 1.000, 1.000], [0.200, 0.200, 0.315, 0.520, 0.828, 0.872, 0.978, 0.980], [0.208, 0.277, 0.267, 0.745, 0.778, 0.780, 0.390, 0.780], [0.200, 0.200, 0.200, 0.275, 0.943, 0.955, 0.975, 0.965], [0.200, 0.200, 0.355, 0.360, 0.405, 0.965, 0.993, 0.992], [0.200, 0.200, 0.200, 0.515, 0.515, 0.515, 0.793, 0.793]] },
    cs5: { name: '5-stage csamp', short: 'CS ×5', init: 0.3375, ymin: 0, raw: [[0.338, 0.537, 1.000, 0.800, 1.000, 1.000, 1.000, 0.800], [0.338, 0.338, 0.338, 0.603, 0.338, 0.338, 0.602, 1.000], [0.000, 0.135, 0.403, 0.467, 0.742, 1.000, 0.600, 0.800], [0.338, 0.338, 0.338, 0.338, 0.868, 0.705, 1.000, 1.000], [0.338, 0.338, 0.338, 0.338, 0.470, 1.000, 1.000, 1.000], [0.338, 0.338, 0.338, 0.338, 0.338, 0.338, 0.800, 0.800]] },
    m2: { name: '2-stage csmiller', short: 'Miller ×2', init: 0.6375, ymin: 0.5, raw: [[0.930, 0.792, 0.988, 1.000, 1.000, 0.823, 1.000, 1.000], [0.637, 0.710, 0.855, 0.927, 1.000, 1.000, 1.000, 1.000], [0.200, 0.655, 1.000, 1.000, 1.000, 1.000, 0.990, 1.000], [0.637, 0.710, 0.637, 0.855, 1.000, 1.000, 1.000, 0.995], [0.637, 0.710, 0.710, 0.927, 1.000, 1.000, 1.000, 1.000], [0.637, 0.637, 0.637, 0.693, 0.693, 0.693, 0.765, 0.765]] },
    m3: { name: '3-stage csmiller', short: 'Miller ×3', init: 0.6625, ymin: 0.5, raw: [[0.838, 1.000, 0.760, 0.912, 0.835, 1.000, 1.000, 1.000], [0.662, 0.662, 0.840, 1.000, 1.000, 1.000, 1.000, 0.957], [0.600, 0.718, 0.918, 0.903, 0.985, 1.000, 1.000, 1.000], [0.662, 0.730, 0.730, 0.730, 1.000, 1.000, 1.000, 0.997], [0.662, 0.630, 0.718, 0.850, 0.792, 1.000, 1.000, 1.000], [0.662, 0.662, 0.730, 0.865, 0.932, 0.932, 1.000, 1.000]] }
  };
  /* 累计最优（含初始设计），与论文作图一致 */
  Object.keys(CIRC).forEach(function (k) {
    var c = CIRC[k];
    c.best = c.raw.map(function (r) { var m = c.init; return r.map(function (val) { m = Math.max(m, val); return m; }); });
    c.hit = c.best.map(function (r) { for (var i = 0; i < r.length; i++) if (r[i] >= 0.95 - 1e-9) return BUD[i]; return null; });
  });

  (function yieldChart() {
    var host = document.getElementById('chart-yieldb'); if (!host) return;
    var key = 'cs3', sel = null, cursor = null;
    var read = document.getElementById('yield-read'), summary = document.getElementById('yield-summary');
    function bestBase(c) { var b = null; for (var i = 1; i < METH.length; i++) { var h = c.hit[i]; if (h !== null && (b === null || h < c.hit[b])) b = i; } return b === null ? 1 : b; }
    function ratio(c, i) { var z = c.hit[0], h = c.hit[i]; if (h === null) return '> ' + (3200 / z) + '×'; if (h === z) return 'tie'; return (h / z) + '× more'; }
    function renderSummary(c) {
      clear(summary);
      var b = bestBase(c), z = c.hit[0], h = c.hit[b];
      summary.appendChild(el('b', null, 'ZO-MC-SGD reaches 0.95 with ' + z + ' SPICE runs'));
      summary.appendChild(document.createTextNode(h === z ? '; the best baseline, ' + METH[b] + ', ties at ' + h + '.' : '; the best baseline, ' + METH[b] + ', needs ' + h + ' (' + (h / z) + '× more).'));
    }
    function renderRead(c, j) {
      clear(read);
      read.appendChild(el('p', 'pp-conv__at', j < 0 ? 'At the initial design' : 'At ' + BUD[j].toLocaleString('en-US') + ' SPICE runs'));
      var tab = el('div', 'pp-ctab'), hd = el('div', 'pp-ctab__row pp-ctab__head');
      hd.appendChild(el('span', null, 'Method')); hd.appendChild(el('span', null, 'yield')); hd.appendChild(el('span', null, 'to 0.95')); tab.appendChild(hd);
      METH.forEach(function (n, i) {
        var row = el('div', 'pp-ctab__row' + (i === sel ? ' is-sel' : '') + (i === 0 ? ' is-ours' : ''));
        var name = el('span', 'pp-ctab__name'), key2 = el('i'); key2.style.background = i === 0 ? C.ours : i === sel ? C.sel : C.base; name.appendChild(key2); name.appendChild(document.createTextNode(n === 'RobustAnalog' ? 'RobustAn.' : n)); row.appendChild(name);
        row.appendChild(el('b', null, (j < 0 ? c.init : c.best[i][j]).toFixed(2)));
        var h = c.hit[i];
        row.appendChild(el('span', h === null ? 'dim' : null, h === null ? '> 3.2k' : fmtB(h) + (i === 0 ? '' : ' · ' + ratio(c, i).replace(' more', ''))));
        if (i > 0) {
          row.setAttribute('role', 'button'); row.tabIndex = 0; row.title = 'Highlight ' + n;
          var pick = function () { sel = i; render(); };
          row.addEventListener('click', pick); row.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
        }
        tab.appendChild(row);
      });
      read.appendChild(tab);
      read.appendChild(el('p', 'pp-conv__note', '“to 0.95” is the smallest tested budget at which the five-seed mean yield reaches the target; the ratio compares it with ZO-MC-SGD. Click a row to highlight it.'));
    }
    var first = true;
    function render() {
      clear(host);
      var c = CIRC[key]; if (sel === null) sel = bestBase(c);
      document.getElementById('yield-sel-name').textContent = METH[sel];
      var W = width(host, 700), H = W < 560 ? 280 : 330, m = { l: 46, r: 14, t: 12, b: 40 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Mean yield versus SPICE budget on ' + c.name }, host);
      var XS = [12.5].concat(BUD), X = function (b) { return m.l + (Math.log2(b) - Math.log2(12.5)) / (Math.log2(3200) - Math.log2(12.5)) * (W - m.l - m.r); };
      var Y = function (val) { return H - m.b - (val - c.ymin) / (1 - c.ymin) * (H - m.t - m.b); };
      var yt = c.ymin === 0 ? [0, 0.25, 0.5, 0.75, 1] : [0.5, 0.6, 0.7, 0.8, 0.9, 1];
      yt.forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft }, s); text(s, m.l - 8, Y(t) + 4, String(t), { 'text-anchor': 'end', 'font-size': 11.5, fill: C.muted }); });
      XS.forEach(function (b, i) { if (W < 470 && (i % 2 === 1) && i !== 0) return; text(s, X(b), H - m.b + 18, i === 0 ? '0' : fmtB(b), { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.muted }); });
      text(s, (m.l + W - m.r) / 2, H - 4, 'SPICE budget per run (log)', { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.muted });
      svg('line', { x1: m.l, x2: W - m.r, y1: Y(0.95), y2: Y(0.95), stroke: C.ink, 'stroke-opacity': .55, 'stroke-dasharray': '5 4' }, s);
      text(s, W - m.r - 2, Y(0.95) + 14, 'target 0.95', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted });
      function path(i) { return [c.init].concat(c.best[i]).map(function (val, k) { return (k ? 'L' : 'M') + X(XS[k]).toFixed(1) + ',' + Y(val).toFixed(1); }).join(''); }
      for (var i = 1; i < METH.length; i++) if (i !== sel) svg('path', { d: path(i), fill: 'none', stroke: C.base, 'stroke-width': 1.4 }, s);
      svg('path', { d: path(sel), fill: 'none', stroke: C.sel, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, s);
      c.best[sel].forEach(function (val, k) { svg('circle', { cx: X(BUD[k]), cy: Y(val), r: 3.5, fill: C.sel, stroke: C.surface, 'stroke-width': 1.5 }, s); });
      var zp = svg('path', { d: path(0), fill: 'none', stroke: C.ours, 'stroke-width': 3, 'stroke-linejoin': 'round' }, s);
      c.best[0].forEach(function (val, k) { svg('circle', { cx: X(BUD[k]), cy: Y(val), r: 4.5, fill: C.ours, stroke: C.surface, 'stroke-width': 1.5 }, s); });
      if (first && !PP.reduceMotion && zp.getTotalLength) { var len = zp.getTotalLength(); zp.style.strokeDasharray = len; zp.style.strokeDashoffset = len; PP.whenVisible(host, function () { zp.style.transition = 'stroke-dashoffset 1.2s ease'; zp.style.strokeDashoffset = 0; }); }
      first = false;
      /* 标出两者首次达标的位置 */
      [[0, C.ours], [sel, C.sel]].forEach(function (a) {
        var h = c.hit[a[0]]; if (h === null) return;
        svg('circle', { cx: X(h), cy: Y(0.95), r: 7.5, fill: 'none', stroke: a[1], 'stroke-width': 2.2 }, s);
      });
      var cross = svg('line', { y1: m.t, y2: H - m.b, stroke: C.ink, 'stroke-opacity': .4, opacity: 0 }, s);
      var hit = svg('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent', style: 'cursor:crosshair' }, s);
      function at(j) { cursor = j; var b = j < 0 ? 12.5 : BUD[j]; cross.setAttribute('x1', X(b)); cross.setAttribute('x2', X(b)); cross.setAttribute('opacity', 1); renderRead(c, j); }
      function move(ev) {
        var r = s.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width, best = -1, bd = Infinity;
        XS.forEach(function (b, k) { var d = Math.abs(X(b) - px); if (d < bd) { bd = d; best = k - 1; } });
        at(best);
      }
      hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
      renderSummary(c); at(cursor === null ? BUD.indexOf(c.hit[0]) : cursor);
    }
    PP.segmented(document.getElementById('seg-circ'), function (k) { key = k; sel = null; cursor = null; render(); });
    render(); onResize(render);
  })();

  /* =====================================================================
     3) 达标预算：哑铃图（论文表 3）
     ===================================================================== */
  (function target() {
    var host = document.getElementById('chart-target'); if (!host) return;
    var KEYS = ['cs1', 'cs3', 'cs5', 'm2', 'm3'];
    function render() {
      clear(host);
      var W = width(host, 760), narrow = W < 560, rowH = 46, m = { l: narrow ? 74 : 132, r: narrow ? 46 : 70, t: 24, b: 34 }, H = m.t + KEYS.length * rowH + m.b - 10;
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'SPICE budget needed to reach 0.95 mean yield' }, host);
      var tip = PP.tooltip(host);
      var NEVER = 6400, X = function (b) { return m.l + (Math.log2(b) - Math.log2(25)) / (Math.log2(NEVER) - Math.log2(25)) * (W - m.l - m.r); };
      BUD.concat([NEVER]).forEach(function (b, i) {
        svg('line', { x1: X(b), x2: X(b), y1: m.t - 6, y2: H - m.b + 4, stroke: C.soft, 'stroke-dasharray': b === NEVER ? '3 3' : null }, s);
        if (!narrow || i % 2 === 0 || b === NEVER) text(s, X(b), H - m.b + 20, b === NEVER ? 'never' : fmtB(b), { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.muted });
      });
      text(s, m.l, m.t - 10, 'SPICE runs to reach 0.95 (log) · fewer is better', { 'font-size': 11, fill: C.muted });
      KEYS.forEach(function (k, r) {
        var c = CIRC[k], y = m.t + r * rowH + rowH / 2, g = svg('g', {}, s);
        text(g, m.l - 12, y + 4, narrow ? c.short : c.name, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.text });
        var bi = null; for (var i = 1; i < METH.length; i++) { var h = c.hit[i]; if (h !== null && (bi === null || h < c.hit[bi])) bi = i; }
        var hz = c.hit[0], hb = c.hit[bi];
        /* 同一预算的点上下错开 */
        var stack = {};
        function off(b) { stack[b] = (stack[b] || 0) + 1; return (stack[b] - 1); }
        for (i = 1; i < METH.length; i++) {
          if (i === bi) continue;
          var b = c.hit[i] === null ? NEVER : c.hit[i], o = off(b), yy = y + (o % 2 ? 1 : -1) * Math.ceil(o / 2) * 7;
          var dot = svg('circle', { cx: X(b), cy: yy, r: 4, fill: C.base, stroke: C.surface, 'stroke-width': 1.2 }, g);
          (function (name, b2, d) { d.addEventListener('pointermove', function () { var bb = s.getBoundingClientRect(), kk = bb.width / W; tip.show(X(b2) * kk, (y - 10) * kk, c.name, [{ color: C.base, value: b2 === NEVER ? '> 3,200' : b2.toLocaleString('en-US'), label: name }]); }); d.addEventListener('pointerleave', function () { tip.hide(); }); })(METH[i], b, dot);
        }
        svg('line', { x1: X(hz), x2: X(hb), y1: y, y2: y, stroke: C.ours, 'stroke-opacity': .35, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
        var db = svg('circle', { cx: X(hb), cy: hb === hz ? y + 9 : y, r: 6, fill: C.sel, stroke: C.surface, 'stroke-width': 2 }, g);
        var dz = svg('circle', { cx: X(hz), cy: hb === hz ? y - 9 : y, r: 7, fill: C.ours, stroke: C.surface, 'stroke-width': 2 }, g);
        text(g, W - m.r + 10, y + 4, hb === hz ? 'tie' : (hb / hz) + '×', { 'font-size': 13, 'font-weight': 700, fill: hb === hz ? C.muted : C.ink });
        [[db, METH[bi] + ' (best baseline)', hb, C.sel], [dz, 'ZO-MC-SGD', hz, C.ours]].forEach(function (a) {
          a[0].addEventListener('pointermove', function () { var bb = s.getBoundingClientRect(), kk = bb.width / W; tip.show(X(a[2]) * kk, (y - 12) * kk, c.name, [{ color: a[3], value: a[2].toLocaleString('en-US'), label: a[1] }]); });
          a[0].addEventListener('pointerleave', function () { tip.hide(); });
        });
      });
    }
    render(); onResize(render);
  })();

  /* =====================================================================
     4) 三个检验：秩相关、1000 新样本复评、基线目标消融
     ===================================================================== */
  (function checks() {
    var NAMES = ['CS ×1', 'CS ×3', 'CS ×5', 'Miller ×2', 'Miller ×3'];
    function frame(host, H) { clear(host); var W = width(host, 360); return { W: W, s: svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, host), tip: PP.tooltip(host) }; }
    function rows(f, H, m, lo, hi, ticks, fmt, data, thr, thrLab) {
      var s = f.s, W = f.W, rowH = (H - m.t - m.b) / data.length;
      var X = function (val) { return m.l + (val - lo) / (hi - lo) * (W - m.l - m.r); };
      ticks.forEach(function (t) { svg('line', { x1: X(t), x2: X(t), y1: m.t, y2: H - m.b, stroke: C.soft }, s); text(s, X(t), H - m.b + 16, fmt(t), { 'text-anchor': 'middle', 'font-size': 11, fill: C.muted }); });
      if (thr !== undefined) { svg('line', { x1: X(thr), x2: X(thr), y1: m.t - 4, y2: H - m.b, stroke: C.ink, 'stroke-opacity': .55, 'stroke-dasharray': '4 3' }, s); text(s, X(thr), m.t - 7, thrLab, { 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted }); }
      return { X: X, rowH: rowH };
    }
    function rho() {
      var host = document.getElementById('chart-rho'); if (!host) return;
      var D = [-0.977, -0.873, -0.915, -0.876, -0.953], H = 200, m = { l: 70, r: 14, t: 18, b: 24 }, f = frame(host, H);
      var g = rows(f, H, m, -1, -0.6, [-1, -0.9, -0.8, -0.7, -0.6], function (t) { return t.toFixed(1).replace('-', '−'); }, D, -0.7, 'threshold');
      D.forEach(function (val, i) {
        var y = m.t + g.rowH * (i + 0.5);
        text(f.s, m.l - 8, y + 4, NAMES[i], { 'text-anchor': 'end', 'font-size': 11.5, fill: C.text });
        svg('line', { x1: g.X(-0.7), x2: g.X(val), y1: y, y2: y, stroke: C.ours, 'stroke-opacity': .3, 'stroke-width': 3 }, f.s);
        var d = svg('circle', { cx: g.X(val), cy: y, r: 5.5, fill: C.ours, stroke: C.surface, 'stroke-width': 2 }, f.s);
        d.addEventListener('pointermove', function () { var b = f.s.getBoundingClientRect(), k = b.width / f.W; f.tip.show(g.X(val) * k, (y - 10) * k, NAMES[i], [{ color: C.ours, value: val.toFixed(3).replace('-', '−'), label: 'Spearman ρ' }]); });
        d.addEventListener('pointerleave', function () { f.tip.hide(); });
      });
    }
    function fresh() {
      var host = document.getElementById('chart-fresh'); if (!host) return;
      var D = [[0.934, 0.934, 0.934, 200], [0.976, 0.973, 0.985, 200], [1.000, 1.000, 1.000, 100], [0.976, 0.878, 1.000, 100], [1.000, 1.000, 1.000, 50]];
      var H = 200, m = { l: 70, r: 14, t: 18, b: 24 }, f = frame(host, H);
      var g = rows(f, H, m, 0.86, 1.0, [0.86, 0.9, 0.95, 1.0], function (t) { return String(t); }, D, 0.95, 'target');
      D.forEach(function (r, i) {
        var y = m.t + g.rowH * (i + 0.5);
        text(f.s, m.l - 8, y + 4, NAMES[i], { 'text-anchor': 'end', 'font-size': 11.5, fill: C.text });
        svg('line', { x1: g.X(r[1]), x2: g.X(r[2]), y1: y, y2: y, stroke: C.ours, 'stroke-opacity': .35, 'stroke-width': 5, 'stroke-linecap': 'round' }, f.s);
        var d = svg('circle', { cx: g.X(r[0]), cy: y, r: 5.5, fill: r[0] >= 0.95 ? C.ours : C.surface, stroke: C.ours, 'stroke-width': 2 }, f.s);
        d.addEventListener('pointermove', function () { var b = f.s.getBoundingClientRect(), k = b.width / f.W; f.tip.show(g.X(r[0]) * k, (y - 10) * k, NAMES[i] + ' · B = ' + r[3], [{ color: C.ours, value: r[0].toFixed(3), label: 'five-seed mean' }, { color: C.faint, value: r[1].toFixed(3) + ' – ' + r[2].toFixed(3), label: 'per-seed range' }].concat(i === 0 ? [{ color: C.faint, value: '[0.917, 0.949]', label: '95% interval' }] : [])); });
        d.addEventListener('pointerleave', function () { f.tip.hide(); });
      });
    }
    function abl() {
      var host = document.getElementById('chart-abl'); if (!host) return;
      var B = ['BO', 'CMA-ES', 'PSO', 'TuRBO'], AVG = [0.37, 0.24, 0.37, 0.41];
      var PER = [[0.25, 0.29, 0.39, 0.35, 0.58], [0.13, 0.14, 0.27, 0.40, 0.27], [0.16, 0.32, 0.44, 0.37, 0.56], [0.34, 0.19, 0.36, 0.55, 0.62]];
      var H = 200, m = { l: 70, r: 48, t: 18, b: 24 }, f = frame(host, H);
      var g = rows(f, H, m, 0, 0.65, [0, 0.2, 0.4, 0.6], function (t) { return t === 0 ? '0' : '+' + t.toFixed(1); }, B);
      B.forEach(function (n, i) {
        var y = m.t + g.rowH * (i + 0.5), gg = svg('g', {}, f.s);
        text(gg, m.l - 8, y + 4, n, { 'text-anchor': 'end', 'font-size': 11.5, fill: C.text });
        svg('rect', { x: g.X(0), y: y - 9, width: g.X(AVG[i]) - g.X(0), height: 18, rx: 4, fill: C.dot, 'fill-opacity': .55 }, gg);
        PER[i].forEach(function (p) { svg('circle', { cx: g.X(p), cy: y, r: 2.6, fill: C.ink, 'fill-opacity': .55 }, gg); });
        text(gg, f.W - 4, y + 4, '+' + AVG[i].toFixed(2), { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 600, fill: C.ink });
        svg('rect', { x: 0, y: y - g.rowH / 2, width: f.W, height: g.rowH, fill: 'transparent' }, gg);
        gg.addEventListener('pointermove', function () { var b = f.s.getBoundingClientRect(), k = b.width / f.W; f.tip.show(g.X(AVG[i]) * k, (y - 12) * k, n + ' · direct yield − softplus', NAMES.map(function (c, j) { return { color: C.dot, value: '+' + PER[i][j].toFixed(2), label: c }; })); });
        gg.addEventListener('pointerleave', function () { f.tip.hide(); });
      });
    }
    function all() { rho(); fresh(); abl(); }
    all(); onResize(all);
  })();

  /* =====================================================================
     5) 优化器开销（论文附录表）
     ===================================================================== */
  (function overhead() {
    var host = document.getElementById('chart-overhead'); if (!host) return;
    var M = [['ZO-MC-SGD', [0.040, 0.043, 0.048]], ['PSO', [0.004, 0.005, 0.005]], ['CMA-ES', [0.54, 0.55, 0.50]], ['RobustAnalog', [5.5, 5.9, 6.0]], ['TuRBO', [62, 174, 251]], ['BO', [121, 255, 464]]];
    var SPICE = 350, dim = 2;
    function fmtT(t) { return t < 1 ? Math.round(t * 1000) + ' ms' : t < 10 ? t.toFixed(1) + ' s' : Math.round(t) + ' s'; }
    function render() {
      clear(host);
      var W = width(host, 760), narrow = W < 560, rowH = 36, m = { l: narrow ? 92 : 110, r: narrow ? 70 : 120, t: 10, b: 34 }, H = m.t + M.length * rowH + m.b;
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Wall-clock time split into SPICE and optimizer overhead' }, host);
      var X = function (t) { return m.l + t / 850 * (W - m.l - m.r); };
      [0, 200, 400, 600, 800].forEach(function (t) { svg('line', { x1: X(t), x2: X(t), y1: m.t, y2: H - m.b, stroke: C.soft }, s); text(s, X(t), H - m.b + 18, t + ' s', { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.muted }); });
      M.forEach(function (r, i) {
        var y = m.t + i * rowH + rowH / 2, ours = i === 0, o = r[1][dim];
        text(s, m.l - 10, y + 4, r[0], { 'text-anchor': 'end', 'font-size': 12.5, fill: ours ? C.ink : C.text, 'font-weight': ours ? 600 : 400 });
        svg('rect', { x: X(0), y: y - 10, width: X(SPICE) - X(0), height: 20, rx: 4, fill: '#dfe5ee' }, s);
        if (X(SPICE + o) - X(SPICE) > 0.5) svg('rect', { x: X(SPICE) + 2, y: y - 10, width: Math.max(0, X(SPICE + o) - X(SPICE) - 2), height: 20, rx: 4, fill: ours ? C.ours : C.sel }, s);
        text(s, X(SPICE + o) + 8, y + 4, '+' + fmtT(o), { 'font-size': 12, 'font-weight': ours ? 700 : 600, fill: C.ink });
        if (!narrow) text(s, W - 4, y + 4, (o / (SPICE + o) * 100 < 0.1 ? '<0.1' : (o / (SPICE + o) * 100).toFixed(o > 10 ? 0 : 1)) + '% of total', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted });
      });
      text(s, X(SPICE / 2), m.t + rowH / 2 + 4, 'SPICE ≈ 350 s', { 'text-anchor': 'middle', 'font-size': 11, fill: C.muted });
    }
    PP.segmented(document.getElementById('seg-dim'), function (k) { dim = +k; render(); });
    render(); onResize(render);
  })();

  /* =====================================================================
     6) 估计器误差随 M 的衰减（论文图：合成问题 S1 / S2）
     ===================================================================== */
  (function estimator() {
    var MS = [2000, 8000, 32000, 128000];
    var D = { s1: { b: [14.36, 4.97, 1.59, 1.05], lo: [9.57, 3.25, 1.29, 0.77], hi: [24.04, 9.92, 4.26, 2.34] },
              s2: { b: [7.05, 2.11, 0.43, 0.57], lo: [4.19, 1.48, 0.54, 0.37], hi: [11.88, 4.73, 1.89, 1.22] } };
    function draw(id, d) {
      var host = document.getElementById(id); if (!host) return; clear(host);
      var W = width(host, 380), H = 230, m = { l: 46, r: 12, t: 10, b: 38 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Normalized error versus number of estimates' }, host);
      var tip = PP.tooltip(host);
      var X = function (M) { return m.l + (Math.log10(M) - Math.log10(1300)) / (Math.log10(200000) - Math.log10(1300)) * (W - m.l - m.r); };
      var Y = function (p) { return H - m.b - (Math.log10(p) - Math.log10(0.25)) / (Math.log10(30) - Math.log10(0.25)) * (H - m.t - m.b); };
      [0.3, 1, 3, 10, 30].forEach(function (t) { svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft }, s); text(s, m.l - 6, Y(t) + 4, t + '%', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted }); });
      [[2000, '2k'], [8000, '8k'], [32000, '32k'], [128000, '128k']].forEach(function (a) { text(s, X(a[0]), H - m.b + 16, a[1], { 'text-anchor': 'middle', 'font-size': 11, fill: C.muted }); });
      text(s, (m.l + W - m.r) / 2, H - 4, 'number of estimates M (log)', { 'text-anchor': 'middle', 'font-size': 11, fill: C.muted });
      var g0 = d.b[0];
      svg('line', { x1: X(1500), x2: X(170000), y1: Y(g0 * Math.sqrt(2000 / 1500)), y2: Y(g0 * Math.sqrt(2000 / 170000)), stroke: C.muted, 'stroke-dasharray': '6 4', 'stroke-width': 1.2 }, s);
      svg('path', { d: d.b.map(function (p, i) { return (i ? 'L' : 'M') + X(MS[i]) + ',' + Y(p); }).join(''), fill: 'none', stroke: C.ours, 'stroke-width': 2.2 }, s);
      d.b.forEach(function (p, i) {
        var x = X(MS[i]);
        svg('line', { x1: x, x2: x, y1: Y(d.lo[i]), y2: Y(d.hi[i]), stroke: C.ours, 'stroke-width': 1.4 }, s);
        [d.lo[i], d.hi[i]].forEach(function (q) { svg('line', { x1: x - 4, x2: x + 4, y1: Y(q), y2: Y(q), stroke: C.ours, 'stroke-width': 1.4 }, s); });
        var c = svg('circle', { cx: x, cy: Y(p), r: 5, fill: C.ours, stroke: C.surface, 'stroke-width': 2 }, s);
        var hit = svg('circle', { cx: x, cy: Y(p), r: 14, fill: 'transparent' }, s);
        hit.addEventListener('pointermove', function () { var b = s.getBoundingClientRect(), k = b.width / W; tip.show(x * k, (Y(p) - 10) * k, 'M = ' + MS[i].toLocaleString('en-US'), [{ color: C.ours, value: p.toFixed(2) + '%', label: 'normalized error' }, { color: C.faint, value: d.lo[i] + '–' + d.hi[i] + '%', label: '95% bootstrap' }]); });
        hit.addEventListener('pointerleave', function () { tip.hide(); });
      });
    }
    function all() { draw('chart-s1', D.s1); draw('chart-s2', D.s2); }
    all(); onResize(all);
  })();
})();
