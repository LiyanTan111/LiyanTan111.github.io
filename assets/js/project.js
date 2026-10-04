/* 论文项目页通用脚本：导航高亮、滚动入场、数字滚动、BibTeX 复制、图表小工具 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 外链新标签打开 */
  document.querySelectorAll('a[href]').forEach(function (a) {
    if (a.hostname && a.hostname !== location.hostname) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  });

  /* 导航高亮（scroll spy） */
  var links = [].slice.call(document.querySelectorAll('.pp-nav__links a'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  function spy() {
    var y = window.scrollY + 120, cur = -1;
    targets.forEach(function (t, i) { if (t && t.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  window.addEventListener('scroll', spy, { passive: true }); spy();

  /* 入场动画 + 进入视口时触发的回调 */
  var onVisible = [];
  function whenVisible(el, fn) { onVisible.push([el, fn]); if (io) io.observe(el); else fn(); }
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      onVisible.forEach(function (p) { if (p[0] === e.target && !p[2]) { p[2] = true; p[1](); } });
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.reveal').forEach(function (el) { if (io) io.observe(el); else el.classList.add('is-in'); });

  /* 数字滚动：只处理 “前缀 + 数字 + 后缀” 形式，如 +3.0 / 0.5% / 16× */
  document.querySelectorAll('[data-countup]').forEach(function (el) {
    var m = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec(el.getAttribute('data-countup'));
    if (!m || reduce) return;
    var pre = m[1], num = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length, post = m[3];
    el.textContent = pre + (0).toFixed(dec) + post;
    whenVisible(el, function () {
      var t0 = null, dur = 1100;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + (num * e).toFixed(dec) + post;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  });

  /* BibTeX 复制 */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pp-copy');
    if (!b) return;
    var el = document.getElementById(b.getAttribute('data-copy'));
    if (!el || !navigator.clipboard) return;
    navigator.clipboard.writeText(el.innerText).then(function () {
      b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500);
    });
  });

  /* ---------- 图表小工具，供各论文页脚本使用 ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function text(parent, x, y, str, attrs) {
    var t = svg('text', Object.assign({ x: x, y: y }, attrs || {}), parent);
    t.textContent = str; return t;
  }
  /* 提示框：内容一律用 textContent 写入 */
  function tooltip(container) {
    var tip = document.createElement('div'); tip.className = 'pp-tip'; container.appendChild(tip);
    return {
      show: function (x, y, title, rows) {
        tip.innerHTML = '';
        var h = document.createElement('div'); h.className = 'dim'; h.textContent = title; tip.appendChild(h);
        rows.forEach(function (r) {
          var row = document.createElement('div'); row.className = 'row';
          var k = document.createElement('span'); k.className = 'key'; k.style.background = r.color || '#fff'; row.appendChild(k);
          var v = document.createElement('b'); v.textContent = r.value; row.appendChild(v);
          var l = document.createElement('span'); l.className = 'dim'; l.textContent = r.label; row.appendChild(l);
          tip.appendChild(row);
        });
        tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('is-on');
      },
      hide: function () { tip.classList.remove('is-on'); }
    };
  }
  /* 分段按钮 */
  function segmented(root, onChange) {
    var btns = [].slice.call(root.querySelectorAll('button'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        onChange(b.getAttribute('data-value'));
      });
    });
  }
  /* 滑块：同步 output 与填充色 */
  function slider(input, out, fmt, onInput) {
    function upd() {
      var p = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--p', p + '%');
      if (out) out.textContent = fmt ? fmt(+input.value) : input.value;
      onInput(+input.value);
    }
    input.addEventListener('input', upd); upd();
  }
  window.PP = { svg: svg, text: text, tooltip: tooltip, segmented: segmented, slider: slider, whenVisible: whenVisible, reduceMotion: reduce };
})();
