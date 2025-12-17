/* ==========================================================
   landing-page-solar-system.js
   - Scroll reveal (replays on scroll up/down)
   - Optional: adjust initial hash scroll for fixed header
   - Optional: smooth scroll for [data-scroll-to] anchors
   ========================================================== */

/* ===== CONFIG ===== */
const SOLAR = {
  revealSelector: '.reveal-solar-system',
  inViewClass: 'in-view-solar-system',
  headerSelector: '.header',
  anchorSelector: '[data-scroll-to]'
};

/* ===== Helpers ===== */
function getHeaderOffset() {
  const header = document.querySelector(SOLAR.headerSelector);
  return header ? header.offsetHeight : 0;
}

function smoothScrollTo(targetSelector) {
  if (!targetSelector || !targetSelector.startsWith('#')) return;
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const y = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/* ===== Scroll Reveal that re-triggers on leave ===== */
(function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll(SOLAR.revealSelector).forEach(el => el.classList.add(SOLAR.inViewClass));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add(SOLAR.inViewClass);
      } else {
        // Remove when leaving viewport so it can animate again on return
        el.classList.remove(SOLAR.inViewClass);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(SOLAR.revealSelector).forEach(el => io.observe(el));
})();

/* ===== Smooth in-page scrolling for elements with [data-scroll-to] ===== */
(function initSmoothAnchors() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(SOLAR.anchorSelector);
    if (!trigger) return;

    const href = trigger.getAttribute('href');
    const dataTarget = trigger.getAttribute('data-target');
    const targetSelector = dataTarget || href;

    if (targetSelector && targetSelector.startsWith('#')) {
      e.preventDefault();
      smoothScrollTo(targetSelector);
    }
  });

  // If the page loads with a hash, fix initial position for fixed header
  window.addEventListener('load', () => {
    if (window.location.hash) {
      // Wait a tick so layout is ready
      setTimeout(() => smoothScrollTo(window.location.hash), 0);
    }
  });
})();

/* ==========================================================
   Logos pager (dots) + continuous marquee coexist (robust)
   ========================================================== */
(function initLogosPager() {
  const wrap = document.querySelector('.logos-wrap-solar-system');
  const track = document.getElementById('logos-track-solar-system');
  const dotsWrap = document.getElementById('dots-solar-system');
  if (!wrap || !track || !dotsWrap) return;

  const dots = Array.from(dotsWrap.querySelectorAll('.dot-solar-system'));
  const RESUME_DELAY = 3500; // ms after click before continuous scroll resumes
  let resumeTimer = null;

  // set active dot helper
  function setActiveDot(idx) {
    dots.forEach((d, i) => d.classList.toggle('is-active-solar-system', i === idx));
  }
  setActiveDot(0);

  // compute page width (use visible viewport of the logos)
  function pageWidth() { return wrap.clientWidth; }

  // Fully disable CSS animation and let us control transform
  function enterManualMode() {
    track.classList.add('manual-solar-system');
    track.style.animationPlayState = 'paused';
  }

  // Resume CSS animation from the start smoothly
  function resumeContinuous() {
    // remove manual transform + class and restart animation cleanly
    track.style.transform = '';
    track.classList.remove('manual-solar-system');

    // Restart the CSS animation reliably (toggle to 'none' then back)
    const prevAnim = getComputedStyle(track).animation;
    track.style.animation = 'none';
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    track.offsetHeight;
    // restore whatever animation was in CSS
    track.style.animation = prevAnim;
    track.style.animationPlayState = 'running';
  }

  // Jump to page n by translating the track
  function goToPage(n) {
    const idx = Math.max(0, Math.min(n, dots.length - 1));
    setActiveDot(idx);

    enterManualMode();

    const offset = -idx * pageWidth();
    track.style.transform = `translateX(${offset}px)`;

    // schedule resume
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(resumeContinuous, RESUME_DELAY);
  }

  // Click handlers on dots
  dots.forEach(d => {
    d.addEventListener('click', () => {
      const n = parseInt(d.getAttribute('data-page') || '0', 10);
      goToPage(n);
    });
  });

  // Maintain the same page on resize while paused
  const ro = new ResizeObserver(() => {
    const active = dots.findIndex(el => el.classList.contains('is-active-solar-system'));
    if (active > -1 && track.classList.contains('manual-solar-system')) {
      track.style.transform = `translateX(${-active * pageWidth()}px)`;
    }
  });
  ro.observe(wwrap = wrap); // observe container width changes

  // Also pause marquee on hover (optional, keeps prior UX)
  wrap.addEventListener('mouseenter', () => {
    if (!track.classList.contains('manual-solar-system')) {
      track.style.animationPlayState = 'paused';
    }
  });
  wrap.addEventListener('mouseleave', () => {
    if (!track.classList.contains('manual-solar-system')) {
      track.style.animationPlayState = 'running';
    }
  });
})();


/* ==========================================================
   Count-up animation for Impact stats
   ========================================================== */
(function initImpactCounters() {
  const items = document.querySelectorAll('.stat-value-solar-system-impact');
  if (!items.length) return;

  function countTo(el) {
    const end = parseFloat(el.getAttribute('data-count-to')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400; // ms (slow & smooth)
    const startTime = performance.now();

    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      // easeOutCubic for a nice finish
      const eased = 1 - Math.pow(1 - p, 3);
      let val = end * eased;

      // If the end has decimals, keep one decimal, else integer
      const hasDecimal = String(end).includes('.');
      el.textContent = prefix + (hasDecimal ? val.toFixed(1) : Math.round(val)) + suffix;

      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (hasDecimal ? end.toFixed(1) : Math.round(end)) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // start counting when visible
        countTo(el);
      } else {
        // reset so it can play again on re-enter
        el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
      }
    });
  }, { threshold: 0.35 });

  items.forEach(el => {
    // initialize to 0 with prefix/suffix
    el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
    io.observe(el);
  });
})();
/* ==========================================================
   Solutions: "View All Solutions" toggle
   ========================================================== */
(function initSolutionsToggle() {
  const grid = document.getElementById('solutions-grid-solar-system-solution');
  const btn = document.getElementById('solutions-toggle-btn-solar-system-solution');
  if (!grid || !btn) return;

  function setState(expanded) {
    grid.classList.toggle('is-collapsed-solar-system-solution', !expanded);
    btn.setAttribute('aria-expanded', String(expanded));
    btn.textContent = expanded ? 'View Fewer' : 'View All Solutions';

    // Nudge IntersectionObserver so reveal animations can trigger for newly shown cards
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  }

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    setState(!expanded);
  });

  // default collapsed on load
  setState(false);
})();
/* ==========================================================
   Solar App: lightweight tilt/parallax for media cards
   Targets elements with [data-tilt]
   ========================================================== */
(function initSolarAppTilt() {
  const els = document.querySelectorAll('[data-tilt]');
  if (!els.length) return;

  const MAX_TILT = 8;         // degrees
  const MAX_TRANS = 10;       // px translate for parallax feel
  const EASE = 'cubic-bezier(.2,.65,.2,1)';

  function applyTilt(el, e) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = (+dy * MAX_TILT).toFixed(2);
    const rotY = (-dx * MAX_TILT).toFixed(2);
    const tx = (-dx * MAX_TRANS).toFixed(2);
    const ty = (-dy * MAX_TRANS).toFixed(2);

    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${tx}px, ${ty}px)`;
    el.style.transition = 'transform .08s';
  }

  function resetTilt(el) {
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translate(0,0)';
    el.style.transition = `transform .5s ${EASE}`;
  }

  els.forEach(el => {
    el.addEventListener('pointermove', (e) => applyTilt(el, e));
    el.addEventListener('pointerleave', () => resetTilt(el));
    el.addEventListener('pointerdown', () => resetTilt(el)); // prevent sticky tilt on touch
  });
})();


/* ==========================================================
   Projects carousel: arrows scroll by one full "page"
   ========================================================== */
(function initProjectsCarousel() {
  const viewport = document.getElementById('projects-viewport-solar-system-projects');
  const prevBtn = document.querySelector('.prev-solar-system-projects');
  const nextBtn = document.querySelector('.next-solar-system-projects');
  if (!viewport || !prevBtn || !nextBtn) return;

  function updateButtons() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= 0;
    const atEnd = viewport.scrollLeft >= maxScroll - 1;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
  }

  function scrollPage(dir) {
    const distance = viewport.clientWidth; // page = visible width
    viewport.scrollBy({ left: dir * distance, behavior: 'smooth' });
    // optimistic button state; will correct on 'scroll' event
    setTimeout(updateButtons, 350);
  }

  prevBtn.addEventListener('click', () => scrollPage(-1));
  nextBtn.addEventListener('click', () => scrollPage(1));

  // keep buttons in sync
  viewport.addEventListener('scroll', () => {
    // debounced update
    window.clearTimeout(viewport._btnTimer);
    viewport._btnTimer = setTimeout(updateButtons, 80);
  });
  window.addEventListener('resize', updateButtons);

  // init
  updateButtons();
})();
// 
/* ==========================================================
   Types tabs: click/keyboard + hash support
   ========================================================== */
(function initSolarTypes() {
  const tabs = Array.from(document.querySelectorAll('.tab-btn-solar-system-types'));
  const panels = {
    'on-grid': document.getElementById('panel-on-grid-solar-system-types'),
    'off-grid': document.getElementById('panel-off-grid-solar-system-types'),
    'hybrid': document.getElementById('panel-hybrid-solar-system-types')
  };
  if (!tabs.length) return;

  function activate(type) {
    // tabs
    tabs.forEach(btn => {
      const isActive = btn.dataset.type === type;
      btn.classList.toggle('is-active-solar-system-types', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      // tabindex for roving focus
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    // panels
    Object.entries(panels).forEach(([key, el]) => {
      const show = key === type;
      if (!el) return;
      el.classList.toggle('is-active-solar-system-types', show);
      el.hidden = !show;
      if (show) {
        // restart small fade-in animation
        el.style.animation = 'none'; el.offsetHeight; el.style.animation = '';
      }
    });
  }

  // Click
  tabs.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.type)));

  // Keyboard: left/right arrows
  document.querySelector('.tabs-solar-system-types')?.addEventListener('keydown', (e) => {
    const idx = tabs.findIndex(b => b.classList.contains('is-active-solar-system-types'));
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (idx + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    }
  });

  // Hash support e.g. #hybrid
  function fromHash() {
    const h = (location.hash || '').replace('#', '').toLowerCase();
    if (['on-grid', 'off-grid', 'hybrid'].includes(h)) activate(h);
  }
  window.addEventListener('hashchange', fromHash);

  // init
  activate('on-grid');
  fromHash();
})();
/* ==========================================================
   Scoped tabs for all .section-types-solar-system-types
   (no global getElementById; supports multiple instances)
   ========================================================== */
(function initAllSolarTypeTabs() {
  document.querySelectorAll('.section-types-solar-system-types').forEach(section => {
    const tabsWrap = section.querySelector('.tabs-solar-system-types');
    if (!tabsWrap) return;

    const tabs = Array.from(section.querySelectorAll('.tab-btn-solar-system-types'));
    const panels = Array.from(section.querySelectorAll('.panel-solar-system-types'));
    if (!tabs.length || !panels.length) return;

    function activate(btn) {
      // Tabs state
      tabs.forEach(t => {
        const isActive = t === btn;
        t.classList.toggle('is-active-solar-system-types', isActive);
        t.setAttribute('aria-selected', String(isActive));
        t.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Panels state (scoped within this section)
      const targetId = btn.getAttribute('aria-controls');
      panels.forEach(p => {
        const show = p.id === targetId;
        p.hidden = !show;
        p.classList.toggle('is-active-solar-system-types', show);
        if (show) { p.style.animation = 'none'; p.offsetHeight; p.style.animation = ''; }
      });
    }

    // Click to activate
    tabs.forEach(btn => btn.addEventListener('click', () => activate(btn)));

    // Keyboard: Left/Right arrows within this tablist
    tabsWrap.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const current = tabs.findIndex(t => t.classList.contains('is-active-solar-system-types'));
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (current + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next]);
    });

    // Init: use the one marked active or the first
    activate(tabs.find(t => t.classList.contains('is-active-solar-system-types')) || tabs[0]);
  });
})();

/* IntersectionObserver reveal - shows elements when they enter the viewport,
   hides them again when they leave (works on scroll down and up). */
(function () {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('is-visible-mobility'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible-mobility');
      } else {
        entry.target.classList.remove('is-visible-mobility');
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();


document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.-gemini-tab');
  const contents = document.querySelectorAll('.-gemini-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // Add active class to the clicked tab
      tab.classList.add('active');

      // Find the corresponding content using the data-tab attribute
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-content`);

      // Add active class to the content
      if (content) {
        content.classList.add('active');
      }
    });
  });

  // Set the default active tab and content on page load
  const defaultTab = document.querySelector('.-gemini-tab[data-tab="mission"]');
  const defaultContent = document.getElementById('mission-content');

  if (defaultTab && defaultContent) {
    defaultTab.classList.add('active');
    defaultContent.classList.add('active');
  }
});

(function () {
  const grid = document.getElementById('grid-neplan-card-with-animation');
  if (!grid) return;
  const cards = grid.querySelectorAll('.card-neplan-card-with-animation');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show-neplan-card-with-animation');
      } else {
        // remove so it replays when scrolling back (LIFO feel)
        e.target.classList.remove('show-neplan-card-with-animation');
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(c => io.observe(c));
})();


(() => {
  const SELECTOR = '.reveal-left, .reveal-right, .reveal-up, .reveal-down';

  // Apply per-element delay from data attribute if provided
  document.querySelectorAll(SELECTOR).forEach(el => {
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', /^\d+$/.test(d) ? `${d}ms` : d);
  });

  // Auto-stagger children inside a .reveal-group
  document.querySelectorAll('.reveal-group[data-reveal-stagger]').forEach(group => {
    const step = parseInt(group.dataset.revealStagger, 10) || 120; // ms
    let i = 0;
    group.querySelectorAll(SELECTOR).forEach(el => {
      el.style.setProperty('--reveal-delay', `${i * step}ms`);
      i++;
    });
  });

  // Observe and toggle visibility (replays when scrolling back unless .reveal-once)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-visible');
      else if (!target.classList.contains('reveal-once'))
        target.classList.remove('is-visible');
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
})();

/* Intersection Observer for gentle reveals */
(function () {
  const items = document.querySelectorAll('.reveal-lv-electrical-panel-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-panel-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(el => io.observe(el));

  /* Simple form handler (prevent empty submit in demo) */
  const form = document.getElementById('service-form-lv-electrical-panel-');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    // You can hook this to your backend
    alert(`Thanks ${fd.get('name') || ''}! We’ll contact you soon.`);
    form.reset();
  });
})();

/* IntersectionObserver reveal - shows elements when they enter the viewport,
   hides them again when they leave (works on scroll down and up). */
(function () {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('is-visible-mobility'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible-mobility');
      } else {
        entry.target.classList.remove('is-visible-mobility');
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();


document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.-gemini-tab');
  const contents = document.querySelectorAll('.-gemini-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // Add active class to the clicked tab
      tab.classList.add('active');

      // Find the corresponding content using the data-tab attribute
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-content`);

      // Add active class to the content
      if (content) {
        content.classList.add('active');
      }
    });
  });

  // Set the default active tab and content on page load
  const defaultTab = document.querySelector('.-gemini-tab[data-tab="mission"]');
  const defaultContent = document.getElementById('mission-content');

  if (defaultTab && defaultContent) {
    defaultTab.classList.add('active');
    defaultContent.classList.add('active');
  }
});

(function () {
  const grid = document.getElementById('grid-neplan-card-with-animation');
  if (!grid) return;
  const cards = grid.querySelectorAll('.card-neplan-card-with-animation');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show-neplan-card-with-animation');
      } else {
        // remove so it replays when scrolling back (LIFO feel)
        e.target.classList.remove('show-neplan-card-with-animation');
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(c => io.observe(c));
})();


(() => {
  const SELECTOR = '.reveal-left, .reveal-right, .reveal-up, .reveal-down';

  // Apply per-element delay from data attribute if provided
  document.querySelectorAll(SELECTOR).forEach(el => {
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', /^\d+$/.test(d) ? `${d}ms` : d);
  });

  // Auto-stagger children inside a .reveal-group
  document.querySelectorAll('.reveal-group[data-reveal-stagger]').forEach(group => {
    const step = parseInt(group.dataset.revealStagger, 10) || 120; // ms
    let i = 0;
    group.querySelectorAll(SELECTOR).forEach(el => {
      el.style.setProperty('--reveal-delay', `${i * step}ms`);
      i++;
    });
  });

  // Observe and toggle visibility (replays when scrolling back unless .reveal-once)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-visible');
      else if (!target.classList.contains('reveal-once'))
        target.classList.remove('is-visible');
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
})();

/* Simple reveal on scroll */
(() => {
  const els = document.querySelectorAll('.reveal-lv-electrical-panel-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-panel-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  els.forEach(el => io.observe(el));
})();

// Reveal on scroll for the About section
(() => {
  const items = document.querySelectorAll('.reveal-lv-electrical-about-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-about-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
})();
// Simple reveal on scroll for the process section
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-process, .reveal-right-lv-electrical-process'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-process');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();
// Reveal-on-scroll for the Why Choose Us section (trigger on every scroll)

// Reveal-on-scroll for the Why Choose Us section – always trigger on scroll up and down
(() => {
  const targets = document.querySelectorAll(
    '.reveal-left-le-electrical-why-us, .reveal-right-le-electrical-why-us, .reveal-top-le-electrical-why-us, .reveal-bottom-le-electrical-why-us'
  );

  const revealOnScroll = () => {
    targets.forEach(target => {
      const rect = target.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;

      if (inView) {
        target.classList.add('reveal-in-le-electrical-why-us');
      } else {
        target.classList.remove('reveal-in-le-electrical-why-us');
      }
    });
  };

  // Run on scroll and on page load
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('resize', revealOnScroll);
  window.addEventListener('load', revealOnScroll);
})();


document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('servicesGrid');
  const detail = document.getElementById('svcDetail');
  const exploreBtn = document.getElementById('exploreServicesBtn'); // header button if present

  if (!grid || !detail) return;

const detailsMap = {
  power: {
    title: "Power Cables (LV/MV/HV/EHV)",
    body: `
      <p><strong>Power cables</strong> are designed for the efficient transmission and distribution of electrical energy. iEngineering provides a wide range of copper and aluminium cables for low, medium, high, and extra-high voltage applications.</p>

      <h4>Applications</h4>
      <ul>
        <li>Utility distribution and transmission networks</li>
        <li>Industrial power systems</li>
        <li>Infrastructure and commercial buildings</li>
        <li>Renewable and substation projects</li>
      </ul>

      <h4>Types of Power Cables</h4>
      <ul>
        <li>ABC Cable</li>
        <li>Bundle Conductor</li>
        <li>Bare Conductor</li>
        <li>Aerial Bundled Conductor</li>
        <li>Apple and Cherry Cables</li>
        <li>Low Voltage (LV)</li>
        <li>Medium Voltage (MV)</li>
        <li>High & Extra High Voltage (HV/EHV)</li>
      </ul>
    `,
    image: { src: "../static/images/types/type1.avif", alt: "LV/MV/HV Power Cables" }
  },

  overhead: {
    title: "Overhead / Aerial Cables",
    body: `
      <p>iEngineering supplies <strong>overhead and aerial cables</strong> that ensure reliable electrical power transmission across urban, industrial, and rural networks. These are designed for robust performance in challenging environmental conditions.</p>

      <h4>Key Features</h4>
      <ul>
        <li>Lightweight and easy to install</li>
        <li>Corrosion-resistant materials</li>
        <li>High mechanical strength</li>
        <li>Compliant with AS/NZS standards</li>
      </ul>

      <h4>Available Types</h4>
      <ul>
        <li>Low Voltage Aerial Bundled Cable (ABC)</li>
        <li>Medium Voltage Aerial Bundled Cable (ABC)</li>
        <li>Pre-Assembled Aerial / Service Drop Cable</li>
        <li>Tree Wire / Spacer Aerial Cable (SAC)</li>
        <li>PVC Covered Conductor</li>
      </ul>
    `,
    image: { src: "../static/images/types/type2.avif", alt: "Overhead Aerial Cable" }
  },

  bare: {
    title: "Bare Conductor & Earthing Materials",
    body: `
      <p><strong>Bare conductors and earthing materials</strong> form the backbone of power transmission and grounding systems. iEngineering offers a comprehensive range of aluminium and copper-based conductors for reliable performance in overhead lines and substations.</p>

      <h4>Available Conductor Types</h4>
      <ul>
        <li>AAC – All Aluminium Conductor</li>
        <li>AAAC – All Aluminium Alloy Conductor</li>
        <li>ACSR – Aluminium Conductor Steel Reinforced</li>
        <li>AACSR – Aluminium Alloy Conductor Steel Reinforced</li>
        <li>AACSR/AW & ACSR/AW – Aluminium Alloy / Steel Wire Reinforced</li>
        <li>ACAR – Aluminium Conductor Alloy Reinforced</li>
        <li>Bare Copper / Copper Earth Wire</li>
        <li>Galvanised Steel Wire (GSW) / Stay / Earth Wire</li>
        <li>Aluminium Clad Steel Wire (ACS)</li>
        <li>Copper Clad Steel Wire (CCS)</li>
      </ul>
    `,
    image: { src: "../static/images/types/type3.avif", alt: "Bare Conductor and Earthing Wire" }
  },

  solar: {
    title: "Solar Plant Cables",
    body: `
      <p>Our <strong>solar plant cables</strong> are designed to deliver high performance and long life in photovoltaic power systems. These cables are UV- and ozone-resistant and provide excellent weatherproofing for outdoor solar installations.</p>

      <h4>Applications</h4>
      <ul>
        <li>Utility-scale solar farms</li>
        <li>Commercial rooftop solar</li>
        <li>Hybrid and off-grid solar systems</li>
      </ul>

      <h4>Types</h4>
      <ul>
        <li>Solar / Photovoltaic Cable</li>
        <li>Low Voltage Power Cable</li>
        <li>Medium Voltage Power Cable</li>
      </ul>
    `,
    image: { src: "../static/images/types/type4.avif", alt: "Solar PV Cables" }
  },

  control: {
    title: "Power Control Cables",
    body: `
      <p><strong>Power control cables</strong> are essential for connecting and managing power equipment in industrial and commercial applications. iEngineering’s range of armoured and unarmoured control cables ensures safe and efficient operation in all conditions.</p>

      <h4>Available Types</h4>
      <ul>
        <li>Armoured PVC Control Cable</li>
        <li>Unarmoured PVC Control Cable</li>
      </ul>

      <h4>Applications</h4>
      <ul>
        <li>Industrial Automation</li>
        <li>Motor Control Systems</li>
        <li>Power Distribution Panels</li>
        <li>Instrumentation and PLC Circuits</li>
      </ul>
    `,
    image: { src: "../static/images/types/type5.avif", alt: "Power Control Cables" }
  },

  instrumentation: {
    title: "Instrumentation Cables",
    body: `
      <p>iEngineering provides a range of <strong>instrumentation cables</strong> for reliable signal transmission in control and monitoring systems. These cables offer noise immunity, durability, and high-temperature performance for sensitive installations.</p>

      <h4>Types</h4>
      <ul>
        <li>Polyethylene</li>
        <li>XLPE</li>
        <li>PVC / Silicon Insulated</li>
      </ul>

      <h4>Applications</h4>
      <ul>
        <li>SCADA & PLC Wiring</li>
        <li>Industrial Plants</li>
        <li>Control Rooms</li>
        <li>Automation Systems</li>
      </ul>
    `,
    image: { src: "../static/images/types/type6.avif", alt: "Instrumentation Cable" }
  },

  specialized: {
    title: "Specialized & Flexible Cables",
    body: `
      <p><strong>Specialized and flexible cables</strong> are designed for mobility, flexibility, and performance in demanding environments. These cables cater to industrial automation, healthcare, transport, and communication systems.</p>

      <h4>Available Types</h4>
      <ul>
        <li>Traffic Cable</li>
        <li>Medical Cable</li>
        <li>Networking Cable</li>
        <li>Single / Multicore Flexible Cable</li>
      </ul>

      <h4>Applications</h4>
      <ul>
        <li>Transport and Traffic Systems</li>
        <li>Hospitals and Laboratories</li>
        <li>Data and Communication Networks</li>
        <li>Flexible Machinery and Robotics</li>
      </ul>
    `,
    image: { src: "../static/images/types/type7.avif", alt: "Flexible and Specialized Cables" }
  }
};


  // --- RENDER DETAILS (single function) ---
  function openDetails(key) {
    const data = detailsMap[key];
    if (!data) return;

    const imgHTML = data.image
      ? `<figure class="svc-detail-figure"><img class="svc-detail-img" src="${data.image.src}" alt="${data.image.alt || ''}"></figure>`
      : '';

    detail.innerHTML = `
      <div class="svc-detail-layout">
        ${imgHTML}
        <div class="svc-detail-copy">
          <h3>${data.title}</h3>
          ${data.body || ''}
        </div>
      </div>
    `;
    detail.style.display = 'block';
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeDetails() {
    detail.style.display = 'none';
    detail.innerHTML = '';
  }

  // --- CLICK HANDLER (delegated) ---
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.svc-cta-lv-electrical-services');
    if (!btn) return;
    const key = btn.getAttribute('data-detail');
    const currentTitle = detail.querySelector('h3')?.textContent || '';
    if (detail.style.display === 'block' && currentTitle === (detailsMap[key]?.title || '')) {
      closeDetails();
    } else {
      openDetails(key);
    }
  });

  // --- EXPLORE / VIEW LESS toggle (uses .is-hidden on extra cards) ---
  if (exploreBtn) {
    const allCards = Array.from(grid.querySelectorAll('.svc-item-lv-electrical-services'));
    const extraCards = allCards.slice(3); // cards 4..7
    let expanded = false;

    function setExpanded(state) {
      expanded = state;
      if (expanded) {
        extraCards.forEach(el => el.classList.remove('is-hidden'));
        exploreBtn.textContent = 'View Less';
        exploreBtn.setAttribute('aria-expanded', 'true');
        
      } else {
        extraCards.forEach(el => el.classList.add('is-hidden'));
        closeDetails();
        exploreBtn.textContent = 'Explore Types';
        exploreBtn.setAttribute('aria-expanded', 'false');
        
      }
      // retrigger reveal animations if you use them
      extraCards.forEach(el => {
        el.classList.remove('reveal-in-lv-electrical-services');
        void el.offsetWidth;
      });
    }

    // init collapsed
    setExpanded(false);

    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setExpanded(!expanded);
    });
  }

  // --- SCROLL REVEAL (bi-directional) ---
  const revealEls = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in-lv-electrical-services');
      } else {
        entry.target.classList.remove('reveal-in-lv-electrical-services');
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => io.observe(el));
});
(() => {
  const modal = document.getElementById('csc-modal');
  const form  = document.getElementById('csc-form');
  const close = modal.querySelector('.modal-close-csc-solar-system-csc-products');
  const successPane  = document.getElementById('csc-success');
  const docNameInput = document.getElementById('csc-doc-name');

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    successPane.hidden = true;
    form.hidden = false;
    form.reset();
    setTimeout(() => document.getElementById('csc-name')?.focus(), 50);
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Open from each "Request Download" button
  document.querySelectorAll('.request-download-csc-solar-system-csc-products').forEach(btn => {
    btn.addEventListener('click', () => {
      docNameInput.value = btn.dataset.doc || '';
      openModal();
    });
  });

  // Close handlers
  close.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop-csc-solar-system-csc-products')
       .addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

/* ===== Scroll reveal + count-up when visible ===== */
(() => {
  const els = document.querySelectorAll('.reveal-lv-electrical-get-in-touch');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('in-view'), delay);

      // If this block contains counters, animate them once
      el.querySelectorAll?.('.stat-num-lv-electrical-get-in-touch').forEach(counter => {
        if (counter.dataset.done) return;
        counter.dataset.done = '1';
        const end = parseInt(counter.dataset.count || '0', 10);
        const hasPlus = end >= 20; // to match mock (25+, 500+, 20+)
        const suffix = hasPlus ? '+' : (end === 98 ? '%' : '');
        let start = 0, duration = 900, startTs;
        const step = (ts) => {
          if (!startTs) startTs = ts;
          const p = Math.min((ts - startTs) / duration, 1);
          const val = Math.floor(start + (end - start) * p);
          counter.textContent = val;
          counter.setAttribute('data-suffix', suffix);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });

      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
})();

