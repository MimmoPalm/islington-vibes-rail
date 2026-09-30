/* Islington Vibes — The Rail */
(function () {
  'use strict';

  var products = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
  var $ = function (id) { return document.getElementById(id); };

  var track = $('track');
  var view = $('product');
  var stageImg = $('p-img');
  var background = [$('masthead'), $('rail'), $('colophon')];

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  var BASE_TITLE = document.title;

  /* ---------- garment kinds ----------
     w    = hung width relative to an adult tee
     drop = length of wire between hook and garment, in tee-widths
     top  = hangs on a shouldered hanger (otherwise a clip)
     tuck = how far the garment is pulled up over the hanger arms */
  var KINDS = {
    tee:    { w: 1.00, drop: 0.035, top: true, tuck: -0.085 },
    jumper: { w: 1.10, drop: 0.035, top: true, tuck: -0.075 },
    hoodie: { w: 0.92, drop: 0.035 },
    kids:   { w: 0.66, drop: 0.035, top: true, tuck: -0.085 },
    tote:   { w: 0.70, drop: 0.19, clip: true },
    cap:    { w: 0.50, drop: 0.09, clip: true },
    beanie: { w: 0.42, drop: 0.11, clip: true }
  };

  function kindOf(p) {
    var t = (p.type + ' ' + p.title).toLowerCase();
    if (/hoodie/.test(t)) return 'hoodie';
    if (/jumper|sweatshirt/.test(t)) return 'jumper';
    if (/kids|mini/.test(t)) return 'kids';
    if (/tote/.test(t)) return 'tote';
    if (/beanie/.test(t)) return 'beanie';
    if (/hat|cap|cord/.test(t)) return 'cap';
    return 'tee';
  }

  // cut PNG dimensions, filled in on load; the ratio is reserved up front
  var DIMS = {
    'cally-tote': [832, 1200], 'camden-passage-tote': [832, 1200], 'canonbury-overground-tote': [832, 1200],
    'eco-tote-bag': [832, 1200], 'finsbury-park-station-tote': [832, 1200], 'fire-brigade-tote': [832, 1200],
    'islington_vibes_original': [1200, 1167], 'n1-corduroy-cap': [1200, 1061], 'north-london-club-hat': [1200, 1062],
    'north-london-club-hoodie': [957, 1200], 'the-73-mini-tee': [1200, 950], 'the-73-premium-tee': [920, 967],
    'the-angel-beanie': [1200, 1200], 'the-angel-clock-tower-tee': [1200, 1152], 'the-annette-crescent-tee': [1200, 1150],
    'the-camden-passage-mini-tee': [1200, 950], 'the-camden-passage-tee': [1200, 1150],
    'the-canonbury-overground-tee': [1200, 1150], 'the-chapel-market-shopping-tote': [832, 1200],
    'the-fields-crewneck-jumper': [1200, 1059], 'the-fields-mini-tee': [1200, 950], 'the-fire-station-tee': [1200, 1150],
    'the-highbury-station-tee': [1200, 1152], 'the-hornsey-road-baths-laundry-jumper': [1200, 1059],
    'the-mildmay-cord': [1200, 1061], 'the-newington-green-cap': [1069, 1200],
    'the-passage-crewneck-sweatshirt': [1200, 1059], 'unisex-classic-tee': [1200, 1152]
  };

  function src(p) { return 'assets/img/' + p.cut.split('/').pop(); }

  function money(n) { return '£' + Number(n).toFixed(2); }

  function priceText(p) {
    return (p.price_max > p.price ? 'From ' : '') + money(p.price);
  }

  // The harvest has size and colour options in either field, so sort by value.
  var SIZE = /^(\d*X{0,3}[SML]|\d+XL|\d+\s?M|\d+-\d+\s?[MY]|one size|os)$/i;
  function options(p) {
    var all = (p.sizes || []).concat(p.colours || []);
    return {
      sizes: all.filter(function (v) { return SIZE.test(v.trim()); }),
      colours: all.filter(function (v) { return !SIZE.test(v.trim()); })
    };
  }

  // Descriptions are clipped at 400 characters: keep the whole sentences only.
  function blurb(p) {
    var text = (p.description || '').split(' • ')[0];
    var end = Math.max(text.lastIndexOf('. '), text.lastIndexOf('.” '));
    if (!/[.!?]$/.test(text.trim())) text = end > 0 ? text.slice(0, end + 1) : '';
    var cut = text.search(/\.\s+\d+%/);           // spec list run into the prose
    if (cut > 0) text = text.slice(0, cut + 1);
    return text.trim();
  }

  /* ---------- build the rail ---------- */

  var HOOK = '<svg class="hanger-hook" viewBox="0 0 28 34" aria-hidden="true">' +
    '<path d="M14 34v-8c0-7 11-8 11-14A11 11 0 1 0 3 12"/></svg>';
  var ARMS = '<svg class="hanger-arms" viewBox="0 0 200 38" aria-hidden="true">' +
    '<path d="M100 1 8 31q-7 5 2 5h180q9 0 2-5Z"/></svg>';

  var slots = products.map(function (p, i) {
    var kind = KINDS[kindOf(p)];
    var dim = DIMS[p.handle] || [1200, 1200];

    var li = document.createElement('li');
    li.className = 'slot';
    li.style.setProperty('--w', kind.w);
    li.style.setProperty('--drop', kind.drop);
    if (kind.tuck) li.style.setProperty('--tuck', kind.tuck);

    var a = document.createElement('a');
    a.className = 'garment';
    a.href = '#/product/' + encodeURIComponent(p.handle);
    a.setAttribute('aria-label', p.title + ', ' + priceText(p));
    a.draggable = false;
    a.innerHTML =
      '<span class="hang">' + HOOK + '<span class="hanger-stem"></span>' +
      '<span class="lift">' + (kind.top ? ARMS : '') + (kind.clip ? '<span class="hanger-clip"></span>' : '') +
      '</span></span>';

    var img = document.createElement('img');
    img.className = 'garment-img';
    img.alt = '';
    img.width = dim[0];
    img.height = dim[1];
    img.draggable = false;
    img.decoding = 'async';
    if (i < 6) { img.loading = 'eager'; } else { img.loading = 'lazy'; }
    img.src = src(p);
    a.querySelector('.lift').appendChild(img);

    li.appendChild(a);
    track.appendChild(li);

    return {
      p: p, li: li, a: a, img: img, hang: a.querySelector('.hang'),
      // pendulum: longer, heavier pieces swing slower
      k: 52 - 16 * kind.w * (dim[1] / dim[0]) + (i % 3) * 2,
      c: 3.4 + (i % 4) * 0.15,
      angle: 0, vel: 0, turn: 0
    };
  });

  var byHandle = {};
  slots.forEach(function (s) { byHandle[s.p.handle] = s; });

  /* ---------- caption ---------- */

  var nowTitle = $('now-title'), nowPrice = $('now-price'), count = $('count');
  var shown = null, pinned = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function caption(s) {
    if (!s || s === shown) return;
    shown = s;
    nowTitle.textContent = s.p.title;
    nowPrice.textContent = priceText(s.p);
    count.textContent = pad(slots.indexOf(s) + 1) + ' / ' + pad(slots.length);
  }

  function nearest() {
    var mid = track.scrollLeft + track.clientWidth / 2;
    var best = null, dist = Infinity;
    slots.forEach(function (s) {
      var d = Math.abs(s.li.offsetLeft + s.li.offsetWidth / 2 - mid);
      if (d < dist) { dist = d; best = s; }
    });
    return best;
  }

  function refreshCaption() { caption(pinned || nearest()); }

  slots.forEach(function (s) {
    s.a.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { pinned = s; applyTurns(); refreshCaption(); }
    });
    s.a.addEventListener('pointerleave', function () { pinned = null; applyTurns(); refreshCaption(); });
    s.a.addEventListener('focus', function () {
      pinned = s;
      applyTurns();
      refreshCaption();
      if (s.a.matches(':focus-visible')) centre(s, true);
    });
    s.a.addEventListener('blur', function () { pinned = null; applyTurns(); refreshCaption(); });
  });

  /* ---------- moving the rail ---------- */

  function centre(s, smooth) {
    var left = s.li.offsetLeft + s.li.offsetWidth / 2 - track.clientWidth / 2;
    track.scrollTo({ left: left, behavior: smooth && !reduced.matches ? 'smooth' : 'auto' });
  }

  function step(dir) {
    // skip garments whose centred position is past the end of the rail
    var max = track.scrollWidth - track.clientWidth;
    for (var i = slots.indexOf(nearest()) + dir; i >= 0 && i < slots.length; i += dir) {
      var li = slots[i].li;
      var left = Math.max(0, Math.min(max, li.offsetLeft + li.offsetWidth / 2 - track.clientWidth / 2));
      if (Math.abs(left - track.scrollLeft) > 2) { centre(slots[i], true); return; }
    }
  }

  var hint = $('hint');
  function used() { hint.classList.add('is-used'); }

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (current) {
      if (e.key === 'Escape') back();
      return;
    }
    if (e.key === 'ArrowRight') { step(1); used(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { step(-1); used(); e.preventDefault(); }
    else if (e.key === 'Home') { centre(slots[0], true); e.preventDefault(); }
    else if (e.key === 'End') { centre(slots[slots.length - 1], true); e.preventDefault(); }
  });

  // a vertical wheel moves the rail, unless the page itself needs to scroll
  track.addEventListener('wheel', function (e) {
    if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    var doc = document.documentElement;
    if (doc.scrollHeight > doc.clientHeight + 1) return;
    track.scrollLeft += e.deltaY * (e.deltaMode === 1 ? 32 : 1);
    used();
    e.preventDefault();
  }, { passive: false });

  // mouse drag (touch uses native scrolling)
  var drag = null, glide = 0, suppressClick = false;

  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    glide = 0;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      track.classList.add('is-dragging');
      used();
    }
    track.scrollLeft = drag.left - dx;
    var dt = e.timeStamp - drag.lastT;
    if (dt > 0) drag.v = 0.7 * drag.v + 0.3 * ((drag.lastX - e.clientX) / dt * 1000);
    drag.lastX = e.clientX;
    drag.lastT = e.timeStamp;
  });
  function endDrag(e) {
    if (!drag) return;
    if (drag.moved) {
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 0);
      track.classList.remove('is-dragging');
      if (!reduced.matches && e.timeStamp - drag.lastT < 80) { glide = drag.v; wake(); }
    }
    drag = null;
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  track.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ---------- weight: the garments swing as the rail moves ---------- */

  /* the rack turn: a piece comes round to face you as it reaches the middle,
     and stands at an angle the further out it sits — like clothes on a rack. */
  var TURN_MAX = 58;        // degrees at the outer edge of the rail
  var TURN_SPAN = 1.12;     // how far off centre a piece must be for full turn

  function paint(s) {
    s.hang.style.transform = 'perspective(1700px) rotate(' + s.angle.toFixed(3) +
      'deg) rotateY(' + s.turn.toFixed(2) + 'deg)';
    s.a.style.opacity = (1 - 0.42 * Math.abs(s.turn) / TURN_MAX).toFixed(3);
  }

  function applyTurns() {
    var half = Math.max(1, track.clientWidth / 2);
    // the piece in the middle faces you dead-on; the rest fan out from it
    var anchor = pinned || nearest();
    var ac = anchor.li.offsetLeft + anchor.li.offsetWidth / 2;
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      var c = s.li.offsetLeft + s.li.offsetWidth / 2;
      var t = Math.max(-1, Math.min(1, ((c - ac) / half) / TURN_SPAN));
      s.turn = t * TURN_MAX;
      if (!s.angle && !s.vel) paint(s);
    }
  }

  var running = false, lastT = 0, lastLeft = 0, lastV = 0, quiet = 0;

  function wake() {
    if (running || reduced.matches) return;
    running = true;
    lastT = performance.now();
    lastLeft = track.scrollLeft;
    lastV = 0;
    quiet = 0;
    requestAnimationFrame(tick);
  }

  function tick(now) {
    var dt = Math.min(0.034, (now - lastT) / 1000) || 0.016;
    lastT = now;

    if (glide) {
      track.scrollLeft += glide * dt;
      glide *= Math.exp(-3.2 * dt);
      if (Math.abs(glide) < 12) glide = 0;
    }

    var left = track.scrollLeft;
    var v = (left - lastLeft) / dt;
    var kick = Math.max(-900, Math.min(900, v - lastV)) * 0.011;
    lastLeft = left;
    lastV = v;

    var min = left - 300, max = left + track.clientWidth + 300;
    var energy = Math.abs(v) > 1 || glide ? 1 : 0;

    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      var x = s.li.offsetLeft;
      if (x + s.li.offsetWidth < min || x > max) {
        if (s.angle || s.vel) rest(s);
        continue;
      }
      s.vel += (kick - s.k * s.angle - s.c * s.vel) * dt;
      s.angle += s.vel * dt;
      if (s.angle > 4.5) { s.angle = 4.5; s.vel = 0; }
      if (s.angle < -4.5) { s.angle = -4.5; s.vel = 0; }
      if (Math.abs(s.angle) > 0.015 || Math.abs(s.vel) > 0.05) {
        energy = 1;
        s.hang.classList.add('is-swinging');
        paint(s);
      } else if (s.angle || s.vel) {
        rest(s);
      }
    }

    quiet = energy ? 0 : quiet + 1;
    if (quiet > 8) { running = false; return; }
    requestAnimationFrame(tick);
  }

  function rest(s) {
    s.angle = 0;
    s.vel = 0;
    paint(s);
    s.hang.classList.remove('is-swinging');
  }

  var captionQueued = false;
  track.addEventListener('scroll', function () {
    wake();
    applyTurns();
    if (captionQueued) return;
    captionQueued = true;
    requestAnimationFrame(function () { captionQueued = false; refreshCaption(); });
  }, { passive: true });
  track.addEventListener('touchstart', used, { passive: true });
  window.addEventListener('resize', function () { applyTurns(); refreshCaption(); });

  /* ---------- product page ---------- */

  var current = null;      // handle of the open product
  var moving = [];         // running morph animations
  var cleanup = null;      // what to do when the closing morph lands

  function list(ul, values) {
    ul.textContent = '';
    values.forEach(function (v) {
      var li = document.createElement('li');
      li.textContent = v;
      ul.appendChild(li);
    });
    ul.parentNode.hidden = !values.length;
  }

  function fill(p) {
    var dim = DIMS[p.handle] || [1200, 1200];
    var opts = options(p);

    stageImg.width = dim[0];
    stageImg.height = dim[1];
    stageImg.src = src(p);
    stageImg.alt = p.title;

    $('p-type').textContent = p.type + (p.available ? '' : (p.type ? ' · ' : '') + 'Sold out');
    $('p-title').textContent = p.title;
    var price = $('p-price');
    price.textContent = priceText(p);
    if (p.compare_at && p.compare_at > p.price) {
      var was = document.createElement('s');
      was.textContent = money(p.compare_at);
      price.appendChild(was);
    }
    $('p-desc').textContent = blurb(p);
    list($('p-sizes'), opts.sizes);
    list($('p-colours'), opts.colours);
    $('p-shop').href = p.url;

    Array.prototype.forEach.call($('p-info').children, function (el, i) {
      el.style.setProperty('--i', i);
    });
  }

  function settle() {
    moving.forEach(function (a) { a.cancel(); });
    moving = [];
    stageImg.classList.remove('is-moving');
    if (cleanup) { var fn = cleanup; cleanup = null; fn(); }
  }

  // transform that lays the stage image exactly over the garment on the rail
  function overRail(s) {
    var from = s.img.getBoundingClientRect();
    var to = stageImg.getBoundingClientRect();
    if (!to.width || !from.width) return null;
    return 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + (from.width / to.width) + ')';
  }

  function openProduct(handle, animate) {
    var s = byHandle[handle];
    settle();
    current = handle;
    pinned = null;
    rest(s);
    fill(s.p);

    // the morph measures the flat box, so bring the piece face-on first
    s.turn = 0;
    paint(s);

    view.hidden = false;
    view.scrollTop = 0;
    document.body.classList.add('is-product');
    background.forEach(function (el) { el.inert = true; });
    document.title = s.p.title + ' · Islington Vibes';

    var start = animate && !reduced.matches ? overRail(s) : null;
    s.img.style.visibility = 'hidden';

    if (start) {
      stageImg.classList.add('is-moving');
      var fly = stageImg.animate([{ transform: start }, { transform: 'none' }],
        { duration: 760, easing: EASE });
      moving = [fly];
      fly.onfinish = function () { moving = []; stageImg.classList.remove('is-moving'); };
      view.offsetWidth;                       // commit the closed state before opening
    }
    view.classList.add('is-open');
    if (animate) $('p-back').focus({ preventScroll: true });
  }

  function closeProduct(animate) {
    var s = byHandle[current];
    settle();
    current = null;
    document.title = BASE_TITLE;

    // make sure the slot it returns to is on screen
    var box = s.li.getBoundingClientRect();
    if (box.left < 0 || box.right > window.innerWidth) centre(s, false);
    refreshCaption();

    cleanup = function () {
      view.hidden = true;
      view.classList.remove('is-open');
      document.body.classList.remove('is-product');
      background.forEach(function (el) { el.inert = false; });
      s.img.style.visibility = '';
      s.a.focus({ preventScroll: true });
      pinned = null;
      applyTurns();
      refreshCaption();
    };

    var end = animate && !reduced.matches ? overRail(s) : null;
    view.classList.remove('is-open');
    if (!end) { settle(); return; }

    stageImg.classList.add('is-moving');
    var fly = stageImg.animate([{ transform: 'none' }, { transform: end }],
      { duration: 620, easing: EASE, fill: 'forwards' });
    moving = [fly];
    fly.onfinish = function () {
      settle();
      // the garment lands with a little weight
      if (!reduced.matches) { s.vel = 9; wake(); }
    };
  }

  /* ---------- routing: #/product/<handle> ---------- */

  function handleFromHash() {
    var m = location.hash.match(/^#\/product\/([^/?#]+)/);
    if (!m) return null;
    var h;
    try { h = decodeURIComponent(m[1]); } catch (err) { return null; }
    return byHandle[h] ? h : null;
  }

  function route(animate) {
    var h = handleFromHash();
    if (h === current) return;
    if (current && h) { closeProduct(false); openProduct(h, false); }
    else if (h) openProduct(h, animate);
    else closeProduct(animate);
  }

  function back() {
    if (history.state && history.state.rail) { history.back(); return; }
    // arrived by a direct link: there is no rail entry to go back to
    history.replaceState(null, '', location.pathname + location.search + '#/');
    route(true);
  }

  track.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('.garment') : null;
    if (!a) return;
    if (suppressClick) { e.preventDefault(); return; }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    history.pushState({ rail: true }, '', a.getAttribute('href'));
    route(true);
  });

  $('p-back').addEventListener('click', back);
  window.addEventListener('popstate', function () { route(true); });
  window.addEventListener('hashchange', function () { route(true); });

  /* ---------- start ---------- */

  applyTurns();
  refreshCaption();

  var initial = handleFromHash();
  if (initial) {
    centre(byHandle[initial], false);
    openProduct(initial, false);
  } else if (!reduced.matches) {
    // the rail has just been hung: let it settle
    slots.forEach(function (s, i) { s.vel = (i % 2 ? -1 : 1) * (5 + (i % 3) * 2); });
    wake();
  }
})();
