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
      var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H * 0.9, R = Math.min(H * 0.72, W * 0.42);
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
    var W = width(host, 660), H = W < 560 ? 240 : 250, m = { l: 52, r: 88, t: 16, b: 42 };
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
     3) 主结果：竖向点图（x = 数据集，y = 准确率）；MeZO → GRZO 连线，FZOO 点，Adam 横向短线
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
    var model = 'llama', first = true;

    function render() {
      clear(host); var tip = PP.tooltip(host);
      var d = D[model], cols = tasks.concat(['Average']), n = cols.length;
      var get = function (k, i) { return i < tasks.length ? d[k][i] : avg(d[k]); };
      var W = width(host), narrow = W < 620, H = narrow ? 330 : 360;
      var m = { l: 44, r: 10, t: narrow ? 52 : 40, b: narrow ? 62 : 44 };
      var all = [].concat(d.Adam, d.MeZO, d.FZOO, d.GRZO), lo = Math.floor((Math.min.apply(null, all) - 4) / 10) * 10, hi = 100;
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Accuracy by task' }, host);
      var band = (W - m.l - m.r) / n;
      var cx = function (i) { return m.l + band * (i + .5); };
      var y = function (val) { return m.t + (hi - val) / (hi - lo) * (H - m.t - m.b); };
      for (var t = lo; t <= hi; t += 10) {
        svg('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: C.soft, 'stroke-width': 1 }, s);
        text(s, m.l - 8, y(t) + 4, String(t), { 'text-anchor': 'end', 'font-size': 12, fill: C.muted });
      }
      text(s, m.l - 8, m.t - 22, 'Δ', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted });
      svg('line', { x1: m.l + band * (n - 1), x2: m.l + band * (n - 1), y1: m.t - 30, y2: H - m.b + 6, stroke: C.line, 'stroke-width': 1 }, s);
      cols.forEach(function (name, i) {
        var x = cx(i), isAvg = i === n - 1;
        var mz = get('MeZO', i), fz = get('FZOO', i), gr = get('GRZO', i), ad = get('Adam', i), dlt = gr - mz;
        var g = svg('g', {}, s);
        svg('rect', { x: x - band / 2, y: m.t - 34, width: band, height: H - m.t - m.b + 40, fill: 'transparent' }, g);
        text(g, x, narrow ? m.t - (i % 2 ? 14 : 30) : m.t - 22, sgn(dlt), { 'text-anchor': 'middle', 'font-size': narrow ? 11 : 12.5, 'font-weight': 600, fill: dlt >= 0 ? C.ink : C.muted });
        var ln = svg('line', { x1: x, x2: x, y1: y(mz), y2: first && !PP.reduceMotion ? y(mz) : y(gr), stroke: C.ours, 'stroke-opacity': .35, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
        svg('line', { x1: x - 10, x2: x + 10, y1: y(ad), y2: y(ad), stroke: C.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
        svg('circle', { cx: x, cy: y(fz), r: 4.5, fill: C.fzoo, stroke: C.surface, 'stroke-width': 2 }, g);
        svg('circle', { cx: x, cy: y(mz), r: 5, fill: C.mezo, stroke: C.surface, 'stroke-width': 2 }, g);
        var dot = svg('circle', { cx: x, cy: first && !PP.reduceMotion ? y(mz) : y(gr), r: 6.5, fill: C.ours, stroke: C.surface, 'stroke-width': 2 }, g);
        if (first && !PP.reduceMotion) {
          PP.whenVisible(host, function () {
            ln.style.transition = dot.style.transition = 'all .8s cubic-bezier(.2,.7,.2,1) ' + (i * .05) + 's';
            ln.setAttribute('y2', y(gr)); dot.setAttribute('cy', y(gr));
          });
        }
        var lab = text(g, x, H - m.b + 18, name, { 'text-anchor': narrow ? 'end' : 'middle', 'font-size': 12, fill: isAvg ? C.ink : C.text, 'font-weight': isAvg ? 600 : 400 });
        if (narrow) lab.setAttribute('transform', 'rotate(-40 ' + x + ' ' + (H - m.b + 18) + ')');
        g.addEventListener('pointermove', function () {
          var r = s.getBoundingClientRect(), k = r.width / W;
          tip.show(x * k, (y(Math.max(gr, ad, mz, fz)) - 10) * k, name + (model === 'llama' ? ' · Llama3-8B' : ' · OPT-13B'), [
            { color: C.ours, value: fmt(gr), label: 'GRZO' }, { color: C.fzoo, value: fmt(fz), label: 'FZOO' },
            { color: C.mezo, value: fmt(mz), label: 'MeZO' }, { color: C.ink, value: fmt(ad), label: 'Adam (FO)' }]);
        });
        g.addEventListener('pointerleave', function () { tip.hide(); });
      });
      first = false;
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
    PP.segmented(document.getElementById('seg-model'), function (val) { model = val; first = true; render(); });
    render(); onResize(render);
  })();

  /* =====================================================================
     3b) 收敛曲线：悬停看当前损失，以及基线追到同一损失要多花多少步/时间
         数据从论文 Fig.（all_tasks_loss.pdf）的矢量曲线数字化而来，平滑程度与论文图一致
     ===================================================================== */
  (function convergence() {
    var host = document.getElementById('chart-conv'); if (!host) return;
    var DATA = {"multirc":{"label":"Llama3-8B \u00b7 MultiRC","x":"time","xmax":72857,"ymin":0.4,"ymax":0.75,"yticks":[0.4,0.5,0.6,0.7],"series":{"MeZO":[[4,0.6753],[1871,0.6771],[3739,0.6768],[5607,0.6786],[7475,0.6801],[9343,0.6829],[11210,0.6825],[13078,0.6817],[14946,0.6824],[16814,0.6822],[18682,0.6814],[20550,0.68],[22417,0.6808],[24285,0.6826],[26153,0.6839],[28021,0.6826],[29888,0.6808],[31756,0.6772],[33624,0.6775],[35492,0.6779],[37360,0.6765],[39228,0.6757],[41095,0.6752],[42963,0.6791],[44831,0.6846],[46699,0.6874],[48567,0.688],[50434,0.6843],[52302,0.6816],[54170,0.6798],[56038,0.6789],[57906,0.6796],[59773,0.6816],[61641,0.6827],[63509,0.6845],[65377,0.6843],[67245,0.6863],[69112,0.6856],[70980,0.6871],[72848,0.6871]],"FZOO":[[4,0.6932],[2358,0.6909],[4712,0.6878],[7066,0.6827],[9420,0.6765],[11774,0.6708],[14128,0.6663],[16482,0.6635],[18836,0.6613],[21190,0.6591],[23544,0.6565],[25898,0.6541],[28252,0.6482],[30606,0.6426],[32959,0.6343],[35313,0.6279],[37667,0.6211],[40021,0.615],[42375,0.6072],[44729,0.5985],[47083,0.5866],[49437,0.5741],[51791,0.5599],[54145,0.5475],[56499,0.5362],[58853,0.5263],[61207,0.5157],[63561,0.5046],[65915,0.4957],[68269,0.488],[70623,0.48]],"GRZO":[[4,0.6324],[2821,0.6245],[5638,0.6421],[8455,0.6424],[11272,0.6405],[14089,0.6165],[16906,0.6068],[19723,0.5991],[22540,0.5887],[25357,0.5737],[28174,0.5574],[30992,0.5409],[33809,0.5267],[36626,0.5169],[39443,0.5094],[42260,0.5019],[45077,0.4938],[47894,0.4853],[50711,0.4761],[53528,0.467],[56346,0.4595],[59163,0.4538],[61980,0.4498],[64797,0.4457],[67614,0.4433],[70431,0.4426]]}},"rte":{"label":"Llama3-8B \u00b7 RTE","x":"steps","xmax":20006,"ymin":0.4,"ymax":0.75,"yticks":[0.4,0.5,0.6,0.7],"series":{"MeZO":[[501,0.6952],[1001,0.6931],[1501,0.6914],[2001,0.6914],[2501,0.6929],[3001,0.6936],[3501,0.6916],[4001,0.6896],[4501,0.6896],[5001,0.6905],[5501,0.6925],[6001,0.6949],[6501,0.6961],[7001,0.6942],[7501,0.6923],[8001,0.6908],[8501,0.6906],[9001,0.6911],[9501,0.6913],[10001,0.6929],[10501,0.6946],[11002,0.6963],[11502,0.6957],[12002,0.6944],[12502,0.6922],[13002,0.6913],[13502,0.6905],[14002,0.6928],[14502,0.696],[15002,0.6986],[15502,0.6992],[16002,0.699],[16502,0.6972],[17002,0.6971],[17502,0.6996],[18002,0.7027],[18502,0.7061],[19002,0.7067],[19502,0.7074],[20002,0.706]],"FZOO":[[501,0.7414],[1001,0.6987],[1501,0.6833],[2001,0.6503],[2501,0.6599],[3001,0.6683],[3501,0.6714],[4001,0.6548],[4501,0.6389],[5001,0.6378],[5501,0.6373],[6001,0.6367],[6501,0.6282],[7001,0.6233],[7501,0.6184],[8001,0.6136],[8501,0.6084],[9001,0.6029],[9501,0.5971],[10001,0.5914],[10501,0.5863],[11002,0.582],[11502,0.5784],[12002,0.5748],[12502,0.5712],[13002,0.5675],[13502,0.5637],[14002,0.5599],[14502,0.5558],[15002,0.5514],[15502,0.5467],[16002,0.542],[16502,0.5371],[17002,0.5321],[17502,0.527],[18002,0.5218],[18502,0.5174],[19002,0.5138],[19502,0.5111],[20002,0.5083]],"GRZO":[[501,0.6917],[1001,0.6895],[1501,0.6877],[2001,0.6832],[2501,0.6786],[3001,0.6729],[3501,0.6677],[4001,0.6626],[4501,0.6581],[5001,0.6533],[5501,0.6489],[6001,0.6453],[6501,0.6415],[7001,0.6378],[7501,0.6344],[8001,0.6316],[8501,0.629],[9001,0.6252],[9501,0.6206],[10001,0.616],[10501,0.6127],[11002,0.6085],[11502,0.6031],[12002,0.5956],[12502,0.5878],[13002,0.5813],[13502,0.5733],[14002,0.5663],[14502,0.5576],[15002,0.5474],[15502,0.5354],[16002,0.5235],[16502,0.5099],[17002,0.4951],[17502,0.4806],[18002,0.4718],[18502,0.4644],[19002,0.4565],[19502,0.4481],[20002,0.4426]]}},"drop":{"label":"OPT-13B \u00b7 DROP","x":"time","xmax":30250,"ymin":1.0,"ymax":6.0,"yticks":[2.0,3.0,4.0,5.0,6.0],"series":{"MeZO":[[2,4.0695],[777,4.0695],[1552,4.0695],[2328,4.0695],[3103,3.9969],[3879,3.8518],[4654,3.6342],[5430,3.4165],[6205,3.2549],[6980,3.1495],[7756,3.1001],[8531,3.0507],[9307,3.0242],[10082,3.0206],[10857,3.0398],[11633,3.059],[12408,3.2586],[13184,3.6386],[13959,4.199],[14734,4.7594],[15510,5.393],[16285,6.0998],[17061,6.8798],[17836,7.6598],[18121,7.8762]],"FZOO":[[2,2.2681],[1386,2.2681],[2771,2.2681],[4156,2.2681],[5540,2.2288],[6925,2.1502],[8310,2.0323],[9694,1.9144],[11079,1.8278],[12464,1.7725],[13848,1.7485],[15233,1.7245],[16618,1.7043],[18002,1.6879],[19387,1.6752],[20772,1.6625],[22156,1.6548],[23541,1.6518],[24926,1.6538],[26310,1.6558],[27695,1.6565],[29080,1.6559]],"GRZO":[[2,2.6886],[998,2.4664],[1995,2.3296],[2992,2.0826],[3989,1.9651],[4986,1.8981],[5983,1.8589],[6980,1.8328],[7977,1.8106],[8974,1.7934],[9971,1.773],[10968,1.7591],[11965,1.7435],[12962,1.7315],[13959,1.7159],[14956,1.7025],[15953,1.6896],[16950,1.6802],[17947,1.6718],[18944,1.6617],[19941,1.6488],[20938,1.6371],[21935,1.6267],[22932,1.6185],[23929,1.6089],[24926,1.5992],[25923,1.5928],[26920,1.5851],[27917,1.5804],[28914,1.5742],[29911,1.5676]]}},"squad":{"label":"OPT-13B \u00b7 SQuAD","x":"steps","xmax":20008,"ymin":0.3,"ymax":1.05,"yticks":[0.4,0.6,0.8,1.0],"series":{"MeZO":[[501,0.9218],[1001,0.9229],[1501,0.9264],[2001,0.9296],[2501,0.9215],[3001,0.9009],[3501,0.8814],[4001,0.8709],[4501,0.8678],[5001,0.8599],[5501,0.8536],[6001,0.8502],[6501,0.8526],[7001,0.855],[7501,0.8563],[8001,0.8527],[8501,0.8482],[9001,0.8411],[9501,0.8402],[10001,0.8373],[10501,0.8373],[11002,0.8348],[11502,0.8354],[12002,0.8324],[12502,0.8303],[13002,0.8256],[13502,0.8228],[14002,0.8194],[14502,0.8202],[15002,0.8206],[15502,0.8177],[16002,0.8123],[16502,0.8058],[17002,0.8039],[17502,0.8068],[18002,0.8187],[18502,0.83],[19002,0.8474],[19502,0.8607],[20002,0.8683]],"FZOO":[[501,0.8806],[1001,0.8806],[1501,0.8806],[2001,0.8806],[2501,0.8666],[3001,0.8387],[3501,0.7967],[4001,0.7548],[4501,0.718],[5001,0.6864],[5501,0.66],[6001,0.6337],[6501,0.6112],[7001,0.5928],[7501,0.5782],[8001,0.5637],[8501,0.5506],[9001,0.5389],[9501,0.5286],[10001,0.5183],[10501,0.5095],[11002,0.5022],[11502,0.4964],[12002,0.4907],[12502,0.4853],[13002,0.4803],[13502,0.4756],[14002,0.471],[14502,0.4667],[15002,0.4627],[15502,0.4589],[16002,0.4551],[16502,0.452],[17002,0.4494],[17502,0.4475],[18002,0.4457],[18502,0.4436],[19002,0.4414],[19502,0.4391],[20002,0.4367]],"GRZO":[[501,1.1371],[1501,0.7302],[2501,0.5815],[3501,0.5102],[4501,0.4736],[5501,0.4535],[6501,0.4419],[7501,0.426],[8501,0.419],[9501,0.414],[10501,0.4117],[11502,0.4083],[12502,0.4079],[13502,0.4097],[14502,0.4121],[15502,0.4046],[16502,0.4084],[17502,0.4022],[18502,0.4023],[19502,0.403]]}}};
    /* RTE 上 FZOO 原图锯齿明显：二项式核 [1,4,6,4,1] 平滑两遍 */
    function smooth(p, passes) {
      var w = [1, 4, 6, 4, 1];
      for (var k = 0; k < passes; k++) {
        p = p.map(function (q, i) {
          var sum = 0, ws = 0;
          for (var j = -2; j <= 2; j++) { var r = p[i + j]; if (r) { sum += w[j + 2] * r[1]; ws += w[j + 2]; } }
          return [q[0], +(sum / ws).toFixed(4)];
        });
      }
      return p;
    }
    DATA.rte.series.FZOO = smooth(DATA.rte.series.FZOO, 2);
    /* 单调三次插值（Fritsch–Carlson）画平滑曲线，经过每个数据点、不会过冲 */
    function curve(pts) {
      var n = pts.length; if (n < 3) return pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('');
      var dx = [], dy = [], m = [], t = [];
      for (var i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; dy[i] = pts[i + 1][1] - pts[i][1]; m[i] = dx[i] ? dy[i] / dx[i] : 0; }
      t[0] = m[0]; t[n - 1] = m[n - 2];
      for (i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : 3 * (dx[i - 1] + dx[i]) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
      var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
      for (i = 0; i < n - 1; i++) {
        var h = dx[i] / 3;
        d += 'C' + (pts[i][0] + h).toFixed(1) + ',' + (pts[i][1] + t[i] * h).toFixed(1) + ' ' + (pts[i + 1][0] - h).toFixed(1) + ',' + (pts[i + 1][1] - t[i + 1] * h).toFixed(1) + ' ' + pts[i + 1][0].toFixed(1) + ',' + pts[i + 1][1].toFixed(1);
      }
      return d;
    }
    var NAMES = ['GRZO', 'FZOO', 'MeZO'], COL = { GRZO: C.ours, FZOO: C.fzoo, MeZO: C.mezo };
    var key = 'rte', cursorX = null;
    var read = document.getElementById('conv-read'), summary = document.getElementById('conv-summary');

    function at(p, x) {
      if (x < p[0][0] || x > p[p.length - 1][0]) return null;
      for (var i = 1; i < p.length; i++) if (p[i][0] >= x) {
        var a = p[i - 1], b = p[i], t = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]);
        return a[1] + t * (b[1] - a[1]);
      }
      return null;
    }
    function reach(p, L) {
      for (var i = 0; i < p.length; i++) if (p[i][1] <= L) {
        if (i === 0) return p[0][0];
        var a = p[i - 1], b = p[i];
        return a[0] + (L - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
      }
      return null;
    }
    function best(p) { return Math.min.apply(null, p.map(function (q) { return q[1]; })); }
    function fx(v, d) {
      if (d.x === 'steps') return (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)) + ' steps';
      return (v / 3600).toFixed(1) + ' h';
    }
    function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }

    function renderSummary(d) {
      clear(summary);
      var S = d.series, Lf = best(S.FZOO), xf = reach(S.FZOO, Lf), xg = reach(S.GRZO, Lf);
      var b = el('b', null, 'GRZO reaches FZOO’s best loss (' + Lf.toFixed(3) + ') ' + (xf / xg).toFixed(1) + '× sooner');
      summary.appendChild(b);
      summary.appendChild(document.createTextNode(' — ' + fx(xg, d) + ' vs ' + fx(xf, d) + '. MeZO bottoms out at ' + best(S.MeZO).toFixed(2) + ' in this window.'));
      return xg;
    }

    function render() {
      clear(host);
      var d = DATA[key], S = d.series;
      var W = width(host, 720), H = W < 560 ? 260 : 320, m = { l: 46, r: 14, t: 14, b: 40 };
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': d.label + ' training loss' }, host);
      var X = function (v) { return m.l + v / d.xmax * (W - m.l - m.r); };
      var Y = function (v) { return m.t + (d.ymax - v) / (d.ymax - d.ymin) * (H - m.t - m.b); };
      var invX = function (px) { return (px - m.l) / (W - m.l - m.r) * d.xmax; };
      d.yticks.forEach(function (t) {
        svg('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: C.soft, 'stroke-width': 1 }, s);
        text(s, m.l - 8, Y(t) + 4, String(t), { 'text-anchor': 'end', 'font-size': 11.5, fill: C.muted });
      });
      var hrs = d.xmax / 3600, step = d.x === 'steps' ? 5000 : 3600 * (hrs <= 10 ? 2 : hrs <= 30 ? 5 : 10), lim = d.xmax;
      for (var t = 0; t <= lim + 1; t += step) {
        text(s, X(t), H - m.b + 18, d.x === 'steps' ? (t ? (t / 1000) + 'k' : '0') : String(Math.round(t / 3600)), { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.muted });
      }
      text(s, (m.l + W - m.r) / 2, H - 6, d.x === 'steps' ? 'training steps' : 'wall-clock time (h)', { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.muted });
      text(s, 12, (m.t + H - m.b) / 2, 'training loss', { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.muted, transform: 'rotate(-90 12 ' + ((m.t + H - m.b) / 2) + ')' });
      var cid = 'clip-' + key;
      var cp = svg('clipPath', { id: cid }, svg('defs', {}, s));
      svg('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b }, cp);
      var plot = svg('g', { 'clip-path': 'url(#' + cid + ')' }, s);
      ['MeZO', 'FZOO', 'GRZO'].forEach(function (n) {
        var dd = curve(S[n].map(function (q) { return [X(q[0]), Y(q[1])]; }));
        svg('path', { d: dd, fill: 'none', stroke: COL[n], 'stroke-width': n === 'GRZO' ? 2.6 : 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, plot);
      });
      /* 光标层 */
      var cur = svg('g', {}, s);
      var vline = svg('line', { y1: m.t, y2: H - m.b, stroke: C.ink, 'stroke-width': 1, 'stroke-opacity': .5 }, cur);
      var hline = svg('line', { x1: m.l, x2: W - m.r, stroke: C.ours, 'stroke-width': 1, 'stroke-dasharray': '4 4' }, cur);
      var marks = {};
      NAMES.forEach(function (n) {
        marks[n] = { drop: svg('line', { stroke: COL[n], 'stroke-width': 1, 'stroke-dasharray': '2 3' }, cur),
                     dot: svg('circle', { r: n === 'GRZO' ? 6 : 5, fill: n === 'GRZO' ? COL[n] : C.surface, stroke: COL[n], 'stroke-width': n === 'GRZO' ? 2 : 2.2 }, cur) };
      });

      function update(xv) {
        xv = Math.max(0, Math.min(d.xmax, xv)); cursorX = xv;
        var L = at(S.GRZO, xv);
        vline.setAttribute('x1', X(xv)); vline.setAttribute('x2', X(xv));
        clear(read);
        read.appendChild(el('p', 'pp-conv__at', 'At ' + fx(xv, d)));
        var lossList = el('div', 'pp-conv__rows');
        NAMES.forEach(function (n) {
          var v = at(S[n], xv), row = el('div', 'pp-conv__row');
          var k = el('i'); k.style.background = COL[n]; row.appendChild(k);
          row.appendChild(el('span', null, n));
          row.appendChild(el('b', null, v === null ? '—' : v.toFixed(3)));
          lossList.appendChild(row);
        });
        read.appendChild(el('span', 'pp-conv__k', 'Training loss')); read.appendChild(lossList);
        if (L === null) { hline.setAttribute('opacity', 0); NAMES.forEach(function (n) { marks[n].dot.setAttribute('opacity', 0); marks[n].drop.setAttribute('opacity', 0); }); return; }
        hline.setAttribute('y1', Y(L)); hline.setAttribute('y2', Y(L)); hline.setAttribute('opacity', 1);
        read.appendChild(el('span', 'pp-conv__k', 'Time to reach GRZO’s loss ' + L.toFixed(3)));
        var reachList = el('div', 'pp-conv__rows');
        NAMES.forEach(function (n) {
          var xr = n === 'GRZO' ? xv : reach(S[n], L), row = el('div', 'pp-conv__row'), mk = marks[n];
          var k = el('i'); k.style.background = COL[n]; row.appendChild(k);
          row.appendChild(el('span', null, n));
          if (xr === null || xr > d.xmax) {
            row.appendChild(el('b', 'dim', 'not reached'));
            mk.dot.setAttribute('opacity', 0); mk.drop.setAttribute('opacity', 0);
          } else {
            var txt = fx(xr, d);
            if (n !== 'GRZO' && xv > d.xmax * 0.04) {
              var ratio = xr / xv; txt += '  ·  ' + ratio.toFixed(1) + '×';
            }
            row.appendChild(el('b', null, txt));
            mk.dot.setAttribute('cx', X(xr)); mk.dot.setAttribute('cy', Y(L)); mk.dot.setAttribute('opacity', 1);
            mk.drop.setAttribute('x1', X(xr)); mk.drop.setAttribute('x2', X(xr)); mk.drop.setAttribute('y1', Y(L)); mk.drop.setAttribute('y2', H - m.b);
            mk.drop.setAttribute('opacity', n === 'GRZO' ? 0 : .8);
          }
          reachList.appendChild(row);
        });
        read.appendChild(reachList);
        read.appendChild(el('p', 'pp-conv__note', '× = how many times longer the baseline needs to get as low as GRZO is at the cursor.'));
      }
      var hit = svg('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent', style: 'cursor:crosshair;touch-action:pan-y' }, s);
      function fromEvt(e) { var r = s.getBoundingClientRect(); return invX((e.clientX - r.left) / r.width * W); }
      hit.addEventListener('pointermove', function (e) { update(fromEvt(e)); });
      hit.addEventListener('pointerdown', function (e) { update(fromEvt(e)); });
      var x0 = renderSummary(d);
      update(cursorX === null ? x0 : cursorX);
    }
    PP.segmented(document.getElementById('seg-conv'), function (k) { key = k; cursorX = null; render(); });
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
     5) Drop-in：竖向哑铃图（x = 任务，y = 准确率），变体原版 → 换上 GRZO 核心
     ===================================================================== */
  (function dropin() {
    var host = document.getElementById('chart-dropin'); if (!host) return;
    var tasks = ['BoolQ', 'RTE', 'COPA', 'SQuAD', 'DROP'], vanilla = [81.4, 81.6, 89.0, 86.2, 65.0];
    var V = {
      sparse: { base: 'Sparse-MeZO', ours: 'Sparse-GRZO', b: [80.5, 73.4, 83.0, 87.5, 48.4], g: [85.1, 79.4, 88.0, 89.0, 59.3] },
      lozo:   { base: 'LOZO', ours: 'LO-GRZO', b: [79.4, 72.1, 84.0, 89.0, 65.4], g: [84.4, 75.1, 90.0, 88.4, 65.5] },
      quant:  { base: 'QuZO (int8)', ours: 'Qu-GRZO (int8)', b: [76.8, 75.2, 87.0, 80.6, 52.3], g: [79.3, 80.5, 91.0, 88.6, 63.9] }
    };
    var legend = document.getElementById('legend-dropin'), curV = 'sparse', first = true;
    function avg(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
    function render() {
      clear(host); var tip = PP.tooltip(host), d = V[curV];
      clear(legend);
      [[C.mezo, d.base], [C.ours, d.ours]].forEach(function (l) { var sp = document.createElement('span'); var ic = document.createElement('i'); ic.style.background = l[0]; sp.appendChild(ic); sp.appendChild(document.createTextNode(l[1])); legend.appendChild(sp); });
      var sp = document.createElement('span'); var ic = document.createElement('i'); ic.style.cssText = 'background:transparent;box-shadow:inset 0 0 0 1.5px ' + C.ink; sp.appendChild(ic); sp.appendChild(document.createTextNode('vanilla GRZO')); legend.appendChild(sp);

      var cols = tasks.concat(['Average']), n = cols.length;
      var W = width(host, 760), H = W < 560 ? 300 : 330, m = { l: 44, r: 10, t: 40, b: 40 }, lo = 40, hi = 95;
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Variant before and after swapping in the GRZO core' }, host);
      var band = (W - m.l - m.r) / n, cx = function (i) { return m.l + band * (i + .5); };
      var y = function (val) { return m.t + (hi - val) / (hi - lo) * (H - m.t - m.b); };
      for (var t = 40; t <= 90; t += 10) {
        svg('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), stroke: C.soft, 'stroke-width': 1 }, s);
        text(s, m.l - 8, y(t) + 4, String(t), { 'text-anchor': 'end', 'font-size': 12, fill: C.muted });
      }
      text(s, m.l - 8, m.t - 22, 'Δ', { 'text-anchor': 'end', 'font-size': 11, fill: C.muted });
      svg('line', { x1: m.l + band * (n - 1), x2: m.l + band * (n - 1), y1: m.t - 30, y2: H - m.b + 6, stroke: C.line, 'stroke-width': 1 }, s);
      cols.forEach(function (name, i) {
        var isAvg = i === n - 1, x = cx(i);
        var b = isAvg ? avg(d.b) : d.b[i], g = isAvg ? avg(d.g) : d.g[i], va = isAvg ? avg(vanilla) : vanilla[i];
        var gg = svg('g', {}, s);
        svg('rect', { x: x - band / 2, y: m.t - 34, width: band, height: H - m.t - m.b + 40, fill: 'transparent' }, gg);
        text(gg, x, m.t - 22, sgn(g - b), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, fill: g >= b ? C.ink : C.muted });
        svg('circle', { cx: x + 14, cy: y(va), r: 5.5, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-opacity': .5 }, gg);
        var anim = !PP.reduceMotion;
        var ln = svg('line', { x1: x, x2: x, y1: y(b), y2: anim ? y(b) : y(g), stroke: g >= b ? C.ours : C.muted, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-opacity': .5 }, gg);
        svg('circle', { cx: x, cy: y(b), r: 5.5, fill: C.mezo, stroke: C.surface, 'stroke-width': 2 }, gg);
        var dot = svg('circle', { cx: x, cy: anim ? y(b) : y(g), r: 6.5, fill: C.ours, stroke: C.surface, 'stroke-width': 2 }, gg);
        if (anim) {
          var go = function () { ln.style.transition = dot.style.transition = 'all .8s cubic-bezier(.2,.7,.2,1) ' + (i * .06) + 's'; ln.setAttribute('y2', y(g)); dot.setAttribute('cy', y(g)); };
          if (first) PP.whenVisible(host, go); else requestAnimationFrame(function () { requestAnimationFrame(go); });
        }
        text(gg, x, H - m.b + 20, name, { 'text-anchor': 'middle', 'font-size': 12, fill: isAvg ? C.ink : C.text, 'font-weight': isAvg ? 600 : 400 });
        gg.addEventListener('pointermove', function () {
          var r = s.getBoundingClientRect(), k = r.width / W;
          tip.show(x * k, (y(Math.max(b, g, va)) - 12) * k, name, [{ color: C.ours, value: fmt(g), label: d.ours }, { color: C.mezo, value: fmt(b), label: d.base }, { color: C.ink, value: fmt(va), label: 'vanilla GRZO' }]);
        });
        gg.addEventListener('pointerleave', function () { tip.hide(); });
      });
      first = false;
    }
    PP.segmented(document.getElementById('seg-var'), function (k) { curV = k; render(); });
    render(); onResize(render);
  })();
})();
