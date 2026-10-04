/* GRZO 项目页的交互图表。所有数值取自论文表格（arXiv:2606.02857），玩具模拟除外。 */
(function () {
  'use strict';
  var PP = window.PP, svg = PP.svg, text = PP.text;
  var css = getComputedStyle(document.documentElement);
  function v(n) { return css.getPropertyValue(n).trim(); }
  var C = { mezo: v('--s-mezo'), fzoo: v('--s-fzoo'), ours: v('--s-ours'), ink: v('--ink'), text: v('--text'),
            muted: v('--muted'), faint: v('--faint'), line: v('--line'), soft: v('--line-soft'), surface: '#ffffff' };
  function fmt(x, d) { return x.toFixed(d === undefined ? 1 : d); }
  function sgn(x, d) { return (x > 0 ? '+' : x < 0 ? '−' : '±') + Math.abs(x).toFixed(d === undefined ? 1 : d); }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function width(el, max) { return Math.max(320, Math.min(max || 760, Math.round(el.clientWidth || max || 760))); }
  var renders = [];
  function onResize(fn) { renders.push(fn); }
  var rt = 0, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastW) < 8) return; lastW = window.innerWidth;
    clearTimeout(rt); rt = setTimeout(function () { renders.forEach(function (f) { f(); }); }, 150);
  });

  /* =====================================================================
     1) 玩具模拟：MeZO 与 GRZO 的单步梯度估计与真实梯度的夹角
     ===================================================================== */
  (function toy() {
    var root = document.getElementById('w-toy'); if (!root) return;
    var D = 32, B = 16, c = 0.83, running = false, raf = 0, last = 0;
    var cm = document.getElementById('toy-mezo'), cg = document.getElementById('toy-grzo');
    var trails = { m: [], g: [] }, cosHist = { m: [], g: [] };
    function randn() { var u = 0, w = 0; while (u === 0) u = Math.random(); while (w === 0) w = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); }
    function vec() { var a = new Float64Array(D); for (var i = 0; i < D; i++) a[i] = randn(); return a; }
    function dot(a, b) { var s = 0; for (var i = 0; i < D; i++) s += a[i] * b[i]; return s; }
    function norm(a) { return Math.sqrt(dot(a, a)); }
    var u = new Float64Array(D); u[0] = 1;               /* 各样本梯度的公共方向 */

    function sample() {
      /* 每个样本的梯度 g_i = sqrt(c)·u + sqrt(1−c)·n_i，两两余弦约为 c */
      var gs = [], gbar = new Float64Array(D), i, k;
      for (i = 0; i < B; i++) {
        var n = vec(), nn = norm(n), g = new Float64Array(D);
        for (k = 0; k < D; k++) g[k] = Math.sqrt(c) * u[k] + Math.sqrt(1 - c) * n[k] / nn;
        gs.push(g); for (k = 0; k < D; k++) gbar[k] += g[k] / B;
      }
      /* MeZO：整个 batch 共享一个扰动 z → (z·ḡ) z */
      var z = vec(), a = dot(z, gbar), em = new Float64Array(D);
      for (k = 0; k < D; k++) em[k] = a * z[k];
      /* GRZO：每个样本一个扰动 z_i → (1/B) Σ (z_i·g_i) z_i */
      var eg = new Float64Array(D);
      for (i = 0; i < B; i++) { var zi = vec(), ai = dot(zi, gs[i]); for (k = 0; k < D; k++) eg[k] += ai * zi[k] / B; }
      var nb = norm(gbar);
      return { m: dot(em, gbar) / (norm(em) * nb || 1), g: dot(eg, gbar) / (norm(eg) * nb || 1) };
    }

    function push(key, cos) {
      var side = Math.random() < 0.5 ? -1 : 1;
      trails[key].push({ a: side * Math.acos(Math.max(-1, Math.min(1, cos))) });
      if (trails[key].length > 36) trails[key].shift();
      cosHist[key].push(cos); if (cosHist[key].length > 400) cosHist[key].shift();
    }

    function draw(cv, key, color) {
      var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.86, R = H * 0.74;
      ctx.clearRect(0, 0, W, H);
      /* 角度刻度：0°, ±45°, ±90° */
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - R - 8, cy); ctx.lineTo(cx + R + 8, cy); ctx.stroke();
      ctx.fillStyle = C.faint; ctx.font = '500 20px Inter, sans-serif'; ctx.textAlign = 'center';
      [[-90, '90°'], [-45, '45°'], [45, '45°'], [90, '90°']].forEach(function (t) {
        var r = t[0] * Math.PI / 180; ctx.fillText(t[1], cx + Math.sin(r) * (R + 22), cy - Math.cos(r) * (R + 22) + 6);
      });
      /* 估计方向的轨迹 */
      var tr = trails[key];
      tr.forEach(function (p, i) {
        var alpha = (i + 1) / tr.length, last = i === tr.length - 1;
        ctx.strokeStyle = color; ctx.globalAlpha = last ? 1 : 0.08 + 0.32 * alpha; ctx.lineWidth = last ? 4 : 2; ctx.lineCap = 'round';
        var x = cx + Math.sin(p.a) * R * 0.94, y = cy - Math.cos(p.a) * R * 0.94;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        if (last) { ctx.beginPath(); ctx.fillStyle = color; ctx.arc(x, y, 7, 0, 2 * Math.PI); ctx.fill(); }
      });
      ctx.globalAlpha = 1;
      /* 真实梯度：竖直向上 */
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - R); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.font = '600 20px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('exact gradient', cx, cy - R - 14);
    }

    function mean(a) { if (!a.length) return 0; var s = 0; a.forEach(function (x) { s += x; }); return s / a.length; }
    function readouts() {
      document.getElementById('toy-cos-m').textContent = fmt(mean(cosHist.m), 2);
      document.getElementById('toy-cos-g').textContent = fmt(mean(cosHist.g), 2);
      document.getElementById('toy-beff').textContent = fmt(c * B + (1 - c), 1);
      document.getElementById('toy-dirs').textContent = B + (B === 1 ? ' direction / step' : ' directions / step');
    }
    function tick(t) {
      if (!running) return;
      if (t - last > 140) { last = t; var s = sample(); push('m', s.m); push('g', s.g); draw(cm, 'm', C.mezo); draw(cg, 'g', C.ours); readouts(); }
      raf = requestAnimationFrame(tick);
    }
    function reset() {
      trails = { m: [], g: [] }; cosHist = { m: [], g: [] };
      for (var i = 0; i < 60; i++) { var s = sample(); push('m', s.m); push('g', s.g); }
      draw(cm, 'm', C.mezo); draw(cg, 'g', C.ours); readouts();
    }
    PP.slider(document.getElementById('toy-b'), document.getElementById('toy-b-out'), null, function (x) { B = x; reset(); });
    PP.slider(document.getElementById('toy-c'), document.getElementById('toy-c-out'), function (x) { return x.toFixed(2); }, function (x) { c = x; reset(); });
    reset();
    if (!PP.reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { running = e.isIntersecting; if (running) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); });
      }).observe(root);
    }
  })();

  /* =====================================================================
     2) 实测：单次估计与反传梯度的余弦（×1e-5）随 B 的变化
     ===================================================================== */
  (function cosChart() {
    var host = document.getElementById('chart-cos'); if (!host) return;
    var Bs = [1, 4, 8, 16, 32];
    var grzo = [5.280, 11.87, 17.21, 24.51, 34.80], mezo = [5.420, 5.330, 5.329, 5.346, 5.339];
    var first = true;
    function render() {
    clear(host);
    var W = width(host), H = W < 560 ? 260 : 300, m = { l: 56, r: 92, t: 18, b: 44 };
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Cosine to the exact gradient versus batch size' }, host);
    var tip = PP.tooltip(host);
    var x = function (b) { return m.l + (Math.log2(b) / 5) * (W - m.l - m.r); };
    var y = function (val) { return H - m.b - (val / 40) * (H - m.t - m.b); };
    [0, 10, 20, 30, 40].forEach(function (t) {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: C.soft, 'stroke-width': 1 }, s);
      text(s, m.l - 10, y(t) + 4, String(t), { 'text-anchor': 'end', 'font-size': 12, fill: C.muted });
    });
    Bs.forEach(function (b) { text(s, x(b), H - m.b + 22, String(b), { 'text-anchor': 'middle', 'font-size': 12, fill: C.muted }); });
    text(s, (m.l + W - m.r) / 2, H - 6, 'batch size B', { 'text-anchor': 'middle', 'font-size': 12, fill: C.muted });
    text(s, 14, (m.t + H - m.b) / 2, 'cosine (×10⁻⁵)', { 'text-anchor': 'middle', 'font-size': 12, fill: C.muted, transform: 'rotate(-90 14 ' + ((m.t + H - m.b) / 2) + ')' });

    function line(vals, color) {
      var d = vals.map(function (val, i) { return (i ? 'L' : 'M') + x(Bs[i]) + ',' + y(val); }).join('');
      var p = svg('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, s);
      var len = p.getTotalLength ? p.getTotalLength() : 0;
      if (len && first && !PP.reduceMotion) { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; PP.whenVisible(host, function () { p.style.transition = 'stroke-dashoffset 1.4s ease'; p.style.strokeDashoffset = 0; }); }
      vals.forEach(function (val, i) { svg('circle', { cx: x(Bs[i]), cy: y(val), r: 5, fill: color, stroke: C.surface, 'stroke-width': 2 }, s); });
    }
    line(mezo, C.mezo); line(grzo, C.ours);
    text(s, x(32) + 12, y(34.80) + 4, 'GRZO 34.8', { 'font-size': 13, 'font-weight': 600, fill: C.ink });
    text(s, x(32) + 12, y(5.339) + 4, 'MeZO 5.3', { 'font-size': 13, 'font-weight': 600, fill: C.ink });
    /* 标注 B=16 处的比值 */
    svg('line', { x1: x(16), x2: x(16), y1: y(24.51) + 9, y2: y(5.346) - 9, stroke: C.faint, 'stroke-width': 1 }, s);
    text(s, x(16) + 8, (y(24.51) + y(5.346)) / 2 + 4, '×4.6 at B = 16', { 'font-size': 12.5, fill: C.text, 'font-weight': 600 });

    /* 十字线 + 提示框 */
    var cross = svg('line', { y1: m.t, y2: H - m.b, stroke: C.faint, 'stroke-width': 1, opacity: 0 }, s);
    var hit = svg('rect', { x: m.l - 20, y: m.t, width: W - m.l - m.r + 40, height: H - m.t - m.b, fill: 'transparent' }, s);
    function near(evt) {
      var r = s.getBoundingClientRect(), px = (evt.clientX - r.left) / r.width * W, best = 0;
      Bs.forEach(function (b, i) { if (Math.abs(x(b) - px) < Math.abs(x(Bs[best]) - px)) best = i; });
      return best;
    }
    hit.addEventListener('pointermove', function (e) {
      var i = near(e), r = s.getBoundingClientRect(), k = r.width / W;
      cross.setAttribute('x1', x(Bs[i])); cross.setAttribute('x2', x(Bs[i])); cross.setAttribute('opacity', 1);
      tip.show(x(Bs[i]) * k, y(grzo[i]) * k, 'B = ' + Bs[i] + ' · ratio ' + fmt(grzo[i] / mezo[i], 2) + '×',
        [{ color: C.ours, value: fmt(grzo[i], 2), label: 'GRZO' }, { color: C.mezo, value: fmt(mezo[i], 2), label: 'MeZO' }]);
    });
    hit.addEventListener('pointerleave', function () { cross.setAttribute('opacity', 0); tip.hide(); });
    first = false;
    }
    render(); onResize(render);
  })();

  /* =====================================================================
     3) 主结果：按任务的点图（MeZO → GRZO，FZOO，Adam 参考线）
     ===================================================================== */
  (function results() {
    var host = document.getElementById('chart-results'); if (!host) return;
    var tasks = ['SST-2', 'RTE', 'CB', 'BoolQ', 'WiC', 'MultiRC', 'COPA', 'SQuAD', 'DROP'];
    var D = {
      llama: { Adam: [96.0, 92.0, 92.0, 86.6, 72.6, 84.7, 89.0, 90.4, 59.4], LoRA: [95.0, 80.9, 73.2, 86.4, 70.7, 82.4, 89.0, 89.4, 58.2],
               MeZO: [92.2, 74.4, 69.6, 76.7, 57.8, 77.6, 88.0, 86.7, 57.1], FZOO: [93.0, 76.6, 68.6, 81.2, 59.4, 77.6, 89.0, 86.0, 57.4],
               GRZO: [93.4, 81.6, 72.0, 81.4, 59.8, 78.6, 89.0, 86.2, 65.0] },
      opt:   { Adam: [95.3, 80.9, 94.6, 83.5, 66.3, 76.2, 88.0, 89.5, 31.3], LoRA: [94.8, 78.3, 69.6, 80.2, 64.3, 69.4, 89.0, 88.0, 30.9],
               MeZO: [91.4, 66.1, 66.0, 67.6, 59.4, 57.3, 88.0, 84.7, 30.9], FZOO: [93.8, 76.8, 69.6, 72.2, 59.4, 57.6, 87.0, 84.8, 28.7],
               GRZO: [93.4, 78.0, 70.2, 70.4, 58.6, 57.8, 88.0, 85.2, 32.8] }
    };
    function avg(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
    var tip = null, model = 'llama';
    var rowH = 34, m = { l: 92, r: 70, t: 26, b: 34 }, W;

    function render() {
      clear(host); tip = PP.tooltip(host); W = width(host);
      var d = D[model], rows = tasks.concat(['Average']);
      var get = function (k, i) { return i < tasks.length ? d[k][i] : avg(d[k]); };
      var all = [].concat(d.Adam, d.MeZO, d.FZOO, d.GRZO), lo = Math.floor((Math.min.apply(null, all) - 4) / 10) * 10, hi = 100;
      var H = m.t + rows.length * rowH + m.b;
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Accuracy by task' }, host);
      var x = function (val) { return m.l + (val - lo) / (hi - lo) * (W - m.l - m.r); };
      for (var t = lo; t <= hi; t += 10) {
        svg('line', { x1: x(t), x2: x(t), y1: m.t - 6, y2: H - m.b, stroke: C.soft, 'stroke-width': 1 }, s);
        text(s, x(t), H - m.b + 20, String(t), { 'text-anchor': 'middle', 'font-size': 12, fill: C.muted });
      }
      text(s, W - m.r + 12, m.t - 8, 'Δ vs MeZO', { 'font-size': 11.5, fill: C.muted });
      rows.forEach(function (name, i) {
        var cy = m.t + i * rowH + rowH / 2, isAvg = name === 'Average';
        if (isAvg) svg('line', { x1: 0, x2: W, y1: cy - rowH / 2, y2: cy - rowH / 2, stroke: C.line, 'stroke-width': 1 }, s);
        var g = svg('g', { class: 'row' }, s);
        svg('rect', { x: 0, y: cy - rowH / 2, width: W, height: rowH, fill: 'transparent' }, g);
        text(g, m.l - 14, cy + 4, name, { 'text-anchor': 'end', 'font-size': 13, fill: isAvg ? C.ink : C.text, 'font-weight': isAvg ? 600 : 400 });
        var mz = get('MeZO', i), fz = get('FZOO', i), gr = get('GRZO', i), ad = get('Adam', i);
        svg('line', { x1: x(mz), x2: x(gr), y1: cy, y2: cy, stroke: C.ours, 'stroke-opacity': .35, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
        svg('line', { x1: x(ad), x2: x(ad), y1: cy - 9, y2: cy + 9, stroke: C.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
        [[fz, C.fzoo, 4.5], [mz, C.mezo, 5], [gr, C.ours, 6.5]].forEach(function (p) {
          var dot = svg('circle', { cx: x(p[0]), cy: cy, r: p[2], fill: p[1], stroke: C.surface, 'stroke-width': 2 }, g);
          if (!PP.reduceMotion) { dot.style.transition = 'cx .6s ease'; }
        });
        var dlt = gr - mz;
        text(g, W - m.r + 12, cy + 4, sgn(dlt), { 'font-size': 13, 'font-weight': 600, fill: dlt >= 0 ? C.ink : C.muted });
        g.addEventListener('pointermove', function (e) {
          var r = s.getBoundingClientRect(), k = r.width / W;
          tip.show(x(gr) * k, (cy - 10) * k, name + (model === 'llama' ? ' · Llama3-8B' : ' · OPT-13B'), [
            { color: C.ours, value: fmt(gr), label: 'GRZO' }, { color: C.fzoo, value: fmt(fz), label: 'FZOO' },
            { color: C.mezo, value: fmt(mz), label: 'MeZO' }, { color: C.ink, value: fmt(ad), label: 'Adam (FO)' }]);
        });
        g.addEventListener('pointerleave', function () { tip.hide(); });
      });
      table(d);
    }
    function table(d) {
      var wrap = document.getElementById('table-results'); clear(wrap);
      var t = document.createElement('table'); t.className = 'pp-table';
      var thead = t.createTHead().insertRow(); ['Method'].concat(tasks, ['Avg']).forEach(function (h) { var th = document.createElement('th'); th.textContent = h; thead.appendChild(th); });
      var tb = t.createTBody();
      [['Adam', 'fo'], ['LoRA', 'fo'], ['MeZO', ''], ['FZOO', ''], ['GRZO', 'ours']].forEach(function (r) {
        var tr = tb.insertRow(); if (r[1]) tr.className = r[1];
        var c0 = tr.insertCell(); c0.textContent = r[0] === 'GRZO' ? 'GRZO (ours)' : r[0];
        d[r[0]].concat([avg(d[r[0]])]).forEach(function (val) { tr.insertCell().textContent = fmt(val); });
      });
      wrap.appendChild(t);
    }
    PP.segmented(document.getElementById('seg-model'), function (val) { model = val; render(); });
    render(); onResize(render);
  })();

  /* =====================================================================
     4) 成本：峰值显存 + 每步耗时（堆叠）
     ===================================================================== */
  (function cost() {
    var hm = document.getElementById('chart-mem'), ht = document.getElementById('chart-time'); if (!hm) return;
    var P = {
      vanilla: { names: ['MeZO', 'GRZO'], mem: [17.74, 17.82], time: [[243, 318, 229, 0.1], [712, 50, 82, 129]] },
      lozo:    { names: ['LOZO', 'LO-GRZO'], mem: [17.78, 17.86], time: [[243, 421, 268, 0.1], [713, 61, 82, 134]] },
      sparse:  { names: ['Sparse-MeZO', 'Sparse-GRZO'], mem: [24.64, 24.31], time: [[216, 520, 292, 0.1], [702, 170, 82, 235]] },
      quant:   { names: ['QuZO', 'Qu-GRZO'], mem: [20.66, 19.14], time: [[243, 1203, 538, 0.1], [709, 208, 82, 1567]] }
    };
    var parts = ['Forward', 'Perturb / setup', 'Update', 'Other'];
    var ramp = ['#2a4e86', '#5b80b8', '#9bb4d6', '#cfdcec'];
    var notes = {
      vanilla: 'Vanilla: GRZO costs +0.08 GB (0.5%) over the floor and +23% per step (973 vs 790 ms); the fused forward is slower, the sign-vector update is faster (82 vs 229 ms).',
      lozo: 'Low-rank: the same +0.08 GB for the extra directions (LO-GRZO 17.86 vs LOZO 17.78 GB), and +6% per step.',
      sparse: 'Sparse: memory is dominated by the variant’s own mask, common to both; Sparse-GRZO is 0.33 GB cheaper than Sparse-MeZO.',
      quant: '*Quantized rows are fake-quant simulation in fp16 (as in the public QuZO code), not true low-bit kernels; read them as relative, not as deployment numbers.'
    };
    var legend = document.getElementById('legend-time');
    parts.forEach(function (p, i) { var sp = document.createElement('span'); var ic = document.createElement('i'); ic.className = 'bar'; ic.style.background = ramp[i]; sp.appendChild(ic); sp.appendChild(document.createTextNode(p)); legend.appendChild(sp); });

    function bars(host, opts) {
      clear(host); var tip = PP.tooltip(host);
      var W = width(host, 440), m = { l: 92, r: 86, t: 24, b: 30 }, rowH = 44, H = m.t + opts.rows.length * rowH + m.b - 6;
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.label }, host);
      var x = function (val) { return m.l + val / opts.max * (W - m.l - m.r); };
      opts.ticks.forEach(function (t) {
        svg('line', { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b, stroke: C.soft, 'stroke-width': 1 }, s);
        text(s, x(t), H - m.b + 18, String(t), { 'text-anchor': 'middle', 'font-size': 11, fill: C.muted });
      });
      opts.rows.forEach(function (row, i) {
        var cy = m.t + 14 + i * rowH;
        text(s, m.l - 10, cy + 4, row.name, { 'text-anchor': 'end', 'font-size': 12, fill: i ? C.ink : C.text, 'font-weight': i ? 600 : 400 });
        var acc = 0;
        row.segs.forEach(function (seg, j) {
          var w = Math.max(0, x(acc + seg.v) - x(acc) - (j < row.segs.length - 1 ? 2 : 0));
          var rect = svg('rect', { x: x(acc), y: cy - 11, width: PP.reduceMotion ? w : 0, height: 22, rx: j === row.segs.length - 1 ? 4 : 0, fill: seg.c }, s);
          if (!PP.reduceMotion) { rect.style.transition = 'width .7s ease ' + (j * .08) + 's'; requestAnimationFrame(function () { requestAnimationFrame(function () { rect.setAttribute('width', w); }); }); }
          var hit = svg('rect', { x: x(acc), y: cy - 16, width: Math.max(w, 6), height: 32, fill: 'transparent' }, s);
          hit.addEventListener('pointermove', function () { var r = s.getBoundingClientRect(), k = r.width / W; tip.show((x(acc) + w / 2) * k, (cy - 12) * k, row.name, [{ color: seg.c, value: seg.fmt, label: seg.label }]); });
          hit.addEventListener('pointerleave', function () { tip.hide(); });
          acc += seg.v;
        });
        text(s, x(acc) + 8, cy + 4, row.total, { 'font-size': 12, 'font-weight': 600, fill: C.ink });
      });
      if (opts.floor) {
        svg('line', { x1: x(opts.floor), x2: x(opts.floor), y1: m.t - 4, y2: H - m.b + 2, stroke: C.ink, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, s);
        text(s, x(opts.floor), m.t - 10, 'inference floor', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: C.ink });
      }
    }
    function render(key) {
      var p = P[key];
      bars(hm, { label: 'Peak memory', max: 26, ticks: [0, 10, 20], floor: 17.74,
        rows: p.mem.map(function (g, i) {
          var over = g - 17.74;
          return { name: p.names[i], total: fmt(g, 2) + ' (' + (over >= 0 ? '+' : '−') + fmt(Math.abs(over), 2) + ')',
                   segs: [{ v: g, c: i ? C.ours : C.mezo, fmt: fmt(g, 2) + ' GB', label: (over >= 0 ? '+' : '−') + fmt(Math.abs(over), 2) + ' GB vs floor' }] };
        }) });
      bars(ht, { label: 'Per-step time', max: 2700, ticks: [0, 1000, 2000],
        rows: p.time.map(function (arr, i) {
          var tot = arr.reduce(function (a, b) { return a + b; }, 0);
          var pct = i ? ' (' + sgn((tot / p.time[0].reduce(function (a, b) { return a + b; }, 0) - 1) * 100, 0) + '%)' : '';
          return { name: p.names[i], total: Math.round(tot) + ' ms' + pct,
                   segs: arr.map(function (val, j) { return { v: val, c: ramp[j], fmt: (val < 1 ? '<1' : Math.round(val)) + ' ms', label: parts[j] }; }) };
        }) });
      document.getElementById('cost-note').textContent = notes[key];
    }
    var cur = 'vanilla';
    PP.segmented(document.getElementById('seg-pair'), function (k) { cur = k; render(k); });
    render(cur); onResize(function () { render(cur); });
  })();

  /* =====================================================================
     5) Drop-in：变体（原版）→ 变体（GRZO 核心）的哑铃图
     ===================================================================== */
  (function dropin() {
    var host = document.getElementById('chart-dropin'); if (!host) return;
    var tasks = ['BoolQ', 'RTE', 'COPA', 'SQuAD', 'DROP'], vanilla = [81.4, 81.6, 89.0, 86.2, 65.0];
    var V = {
      sparse: { base: 'Sparse-MeZO', ours: 'Sparse-GRZO', b: [80.5, 73.4, 83.0, 87.5, 48.4], g: [85.1, 79.4, 88.0, 89.0, 59.3] },
      lozo:   { base: 'LOZO', ours: 'LO-GRZO', b: [79.4, 72.1, 84.0, 89.0, 65.4], g: [84.4, 75.1, 90.0, 88.4, 65.5] },
      quant:  { base: 'QuZO (int8)', ours: 'Qu-GRZO (int8)', b: [76.8, 75.2, 87.0, 80.6, 52.3], g: [79.3, 80.5, 91.0, 88.6, 63.9] }
    };
    var legend = document.getElementById('legend-dropin');
    function avg(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
    function render(key) {
      clear(host); var tip = PP.tooltip(host), d = V[key];
      clear(legend);
      [[C.mezo, d.base], [C.ours, d.ours]].forEach(function (l) { var sp = document.createElement('span'); var ic = document.createElement('i'); ic.style.background = l[0]; sp.appendChild(ic); sp.appendChild(document.createTextNode(l[1])); legend.appendChild(sp); });
      var sp = document.createElement('span'); var ic = document.createElement('i'); ic.style.cssText = 'background:transparent;box-shadow:inset 0 0 0 1.5px ' + C.ink; sp.appendChild(ic); sp.appendChild(document.createTextNode('vanilla GRZO')); legend.appendChild(sp);

      var rows = tasks.concat(['Average']), W = width(host), rowH = 38, m = { l: 92, r: 70, t: 26, b: 34 }, lo = 40, hi = 95;
      var H = m.t + rows.length * rowH + m.b;
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Variant before and after swapping in the GRZO core' }, host);
      var x = function (val) { return m.l + (val - lo) / (hi - lo) * (W - m.l - m.r); };
      for (var t = 40; t <= 90; t += 10) {
        svg('line', { x1: x(t), x2: x(t), y1: m.t - 6, y2: H - m.b, stroke: C.soft, 'stroke-width': 1 }, s);
        text(s, x(t), H - m.b + 20, String(t), { 'text-anchor': 'middle', 'font-size': 12, fill: C.muted });
      }
      text(s, W - m.r + 12, m.t - 8, 'Δ', { 'font-size': 11.5, fill: C.muted });
      rows.forEach(function (name, i) {
        var isAvg = i === tasks.length, cy = m.t + i * rowH + rowH / 2;
        var b = isAvg ? avg(d.b) : d.b[i], g = isAvg ? avg(d.g) : d.g[i], va = isAvg ? avg(vanilla) : vanilla[i];
        if (isAvg) svg('line', { x1: 0, x2: W, y1: cy - rowH / 2, y2: cy - rowH / 2, stroke: C.line, 'stroke-width': 1 }, s);
        var gg = svg('g', {}, s);
        svg('rect', { x: 0, y: cy - rowH / 2, width: W, height: rowH, fill: 'transparent' }, gg);
        text(gg, m.l - 14, cy + 4, name, { 'text-anchor': 'end', 'font-size': 13, fill: isAvg ? C.ink : C.text, 'font-weight': isAvg ? 600 : 400 });
        svg('circle', { cx: x(va), cy: cy, r: 6, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-opacity': .55 }, gg);
        var ln = svg('line', { x1: x(b), x2: PP.reduceMotion ? x(g) : x(b), y1: cy, y2: cy, stroke: g >= b ? C.ours : C.muted, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-opacity': .55 }, gg);
        svg('circle', { cx: x(b), cy: cy, r: 5.5, fill: C.mezo, stroke: C.surface, 'stroke-width': 2 }, gg);
        var dot = svg('circle', { cx: PP.reduceMotion ? x(g) : x(b), cy: cy, r: 6.5, fill: C.ours, stroke: C.surface, 'stroke-width': 2 }, gg);
        if (!PP.reduceMotion) {
          ln.style.transition = 'all .7s ease ' + (i * .06) + 's'; dot.style.transition = 'all .7s ease ' + (i * .06) + 's';
          requestAnimationFrame(function () { requestAnimationFrame(function () { ln.setAttribute('x2', x(g)); dot.setAttribute('cx', x(g)); }); });
        }
        text(gg, W - m.r + 12, cy + 4, sgn(g - b), { 'font-size': 13, 'font-weight': 600, fill: g >= b ? C.ink : C.muted });
        gg.addEventListener('pointermove', function () {
          var r = s.getBoundingClientRect(), k = r.width / W;
          tip.show(x(g) * k, (cy - 10) * k, name, [{ color: C.ours, value: fmt(g), label: d.ours }, { color: C.mezo, value: fmt(b), label: d.base }, { color: C.ink, value: fmt(va), label: 'vanilla GRZO' }]);
        });
        gg.addEventListener('pointerleave', function () { tip.hide(); });
      });
    }
    var curV = 'sparse';
    PP.segmented(document.getElementById('seg-var'), function (k) { curV = k; render(k); });
    render(curV); onResize(function () { render(curV); });
  })();
})();
