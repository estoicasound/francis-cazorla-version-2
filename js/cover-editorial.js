/* Limited to the alternative cover; no form, metadata or other scene is changed. */
(function () {
  'use strict';
  const hero = document.querySelector('.cover-editorial .hero');
  if (!hero) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  function paint() {
    scheduled = false;
    if (reduced.matches) { hero.style.removeProperty('--cover-progress'); return; }
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top > window.innerHeight) return;
    hero.style.setProperty('--cover-progress', Math.max(0, Math.min(1, -bounds.top / bounds.height)));
  }
  function requestPaint() { if (!scheduled) { scheduled = true; window.requestAnimationFrame(paint); } }
  window.addEventListener('scroll', requestPaint, { passive: true });
  window.addEventListener('resize', requestPaint, { passive: true });
  reduced.addEventListener('change', requestPaint);
  requestPaint();
})();
