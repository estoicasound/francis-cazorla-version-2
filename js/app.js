(function () {
  'use strict';
  const doc = document.documentElement;
  const body = document.body;
  doc.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 900px)');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = (returnFocus = false) => {
    body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    if (returnFocus) menuButton.focus();
  };
  menuButton.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && body.classList.contains('menu-open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  desktop.addEventListener('change', () => closeMenu());

  // Elements are visible by default. Only off-screen elements get an entrance.
  if ('IntersectionObserver' in window) {
    doc.classList.add('reveals-on');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('awaiting');
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 30px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      if (!reduced.matches && element.getBoundingClientRect().top > window.innerHeight - 50) element.classList.add('awaiting');
      revealObserver.observe(element);
    });
    const contactObserver = new IntersectionObserver(entries => {
      body.classList.toggle('contact-visible', entries[0].isIntersecting);
    }, { threshold: 0.05 });
    contactObserver.observe(document.querySelector('#contacto'));
  }

  // A single passive listener drives camera movement, expanding masks and chapters.
  const story = document.querySelector('.story');
  const stage = document.querySelector('.story-stage');
  const hero = document.querySelector('.hero');
  const heroPhoto = document.querySelector('.hero-photo');
  const album = document.querySelector('.album');
  const albumPhoto = document.querySelector('.album-photo');
  const aperture = document.querySelector('.aperture');
  const apertureStage = document.querySelector('.aperture-stage');
  const introImage = document.querySelector('.intro-image');
  const ribbon = document.querySelector('.type-ribbon');
  const chapterImages = [...document.querySelectorAll('.story-frame img')];
  const count = document.querySelector('.story-count');
  const clamp = value => Math.max(0, Math.min(1, value));
  let ticking = false;
  function drawScroll() {
    ticking = false;
    if (reduced.matches) return;
    const viewport = window.innerHeight;
    const bounds = story.getBoundingClientRect();
    if (bounds.bottom >= 0 && bounds.top <= viewport) {
      const progress = clamp(-bounds.top / Math.max(1, bounds.height - stage.offsetHeight));
      const second = clamp((progress - 0.2) / 0.22);
      const third = clamp((progress - 0.58) / 0.22);
      stage.style.setProperty('--wipe-two', `${(1 - second) * 100}%`);
      stage.style.setProperty('--wipe-three', `${(1 - third) * 100}%`);
      stage.style.setProperty('--story-progress', progress);
      chapterImages.forEach((image, index) => {
        const camera = clamp((progress - index * 0.3) / 0.4);
        image.style.setProperty('--chapter-scale', 1.1 - camera * 0.1);
      });
      count.textContent = `${third > 0.5 ? '03' : second > 0.5 ? '02' : '01'} / 03`;
    }
    const opening = aperture.getBoundingClientRect();
    if (opening.bottom >= 0 && opening.top <= viewport) {
      const progress = clamp(-opening.top / Math.max(1, opening.height - apertureStage.offsetHeight));
      const expand = clamp(progress / 0.8);
      apertureStage.style.setProperty('--aperture-x', `${(1 - expand) * (desktop.matches ? 24 : 17)}%`);
      apertureStage.style.setProperty('--aperture-y', `${(1 - expand) * 14}%`);
      apertureStage.style.setProperty('--aperture-scale', 1.15 - expand * 0.15);
      apertureStage.style.setProperty('--aperture-copy', clamp((progress - 0.35) / 0.45));
      apertureStage.style.setProperty('--aperture-copy-y', `${(1 - clamp((progress - 0.35) / 0.45)) * 40}px`);
    }
    const portrait = introImage.getBoundingClientRect();
    if (portrait.bottom >= 0 && portrait.top <= viewport) {
      const reveal = clamp((viewport - portrait.top) / (viewport * 0.7));
      introImage.style.setProperty('--intro-crop', `${(1 - reveal) * 17}%`);
    }
    const ribbonBounds = ribbon.getBoundingClientRect();
    if (ribbonBounds.bottom >= 0 && ribbonBounds.top <= viewport) {
      const progress = clamp((viewport - ribbonBounds.top) / (viewport + ribbonBounds.height));
      ribbon.style.setProperty('--ribbon-x', `${-progress * (desktop.matches ? 480 : 230)}px`);
    }
    const heroBounds = hero.getBoundingClientRect();
    if (heroBounds.bottom > 0) heroPhoto.style.transform = `translateY(${clamp(-heroBounds.top / viewport) * (desktop.matches ? 45 : 20)}px)`;
    const albumBounds = album.getBoundingClientRect();
    if (albumBounds.bottom > 0 && albumBounds.top < viewport) {
      albumPhoto.style.transform = `translateY(${((viewport - albumBounds.top) / (viewport + albumBounds.height) - 0.5) * (desktop.matches ? 70 : 35)}px)`;
    }
  }
  function requestDraw() { if (!ticking) { ticking = true; window.requestAnimationFrame(drawScroll); } }
  function syncMotion() {
    doc.classList.toggle('motion', !reduced.matches);
    heroPhoto.style.transform = '';
    albumPhoto.style.transform = '';
    if (reduced.matches) document.querySelectorAll('.awaiting').forEach(element => element.classList.remove('awaiting'));
    requestDraw();
  }
  reduced.addEventListener('change', syncMotion);
  desktop.addEventListener('change', syncMotion);
  window.addEventListener('scroll', requestDraw, { passive: true });
  window.addEventListener('resize', requestDraw, { passive: true });
  window.addEventListener('pageshow', requestDraw);
  syncMotion();
  if ('IntersectionObserver' in window) {
    const preparePhotos = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
        preparePhotos.unobserve(entry.target);
      });
    }, { rootMargin: '1000px' });
    [aperture, story].forEach(scene => preparePhotos.observe(scene));
  }

  const filters = document.querySelector('.filters');
  const grid = document.querySelector('.portfolio-grid');
  const more = document.querySelector('#portfolio-more');
  const items = [...grid.querySelectorAll('.portfolio-item')];
  let expanded = false;
  let category = 'all';
  function filterGallery(announce) {
    grid.classList.toggle('is-filtered', category !== 'all');
    items.forEach((item, index) => {
      item.hidden = (category !== 'all' && item.dataset.category !== category) || (category === 'all' && !expanded && index >= 8);
      if (!item.hidden && announce) { item.classList.remove('awaiting'); item.classList.add('revealed'); }
    });
    more.hidden = expanded || category !== 'all';
    if (announce) {
      const labels = { all: 'Todas las historias', boda: 'Historias de boda', preboda: 'Sesiones de preboda', retrato: 'Retratos' };
      document.querySelector('.portfolio-status').textContent = labels[category];
    }
    requestDraw();
  }
  filters.hidden = false;
  filterGallery(false);
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    category = button.dataset.filter;
    filterGallery(true);
  });
  more.addEventListener('click', () => {
    expanded = true;
    filterGallery(true);
    const firstNewPhoto = items[8].querySelector('a');
    firstNewPhoto.focus({ preventScroll: true });
    firstNewPhoto.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'center' });
  });

  const dialog = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const caption = document.querySelector('#lightbox-caption');
  const imageCount = document.querySelector('#lightbox-count');
  const previous = document.querySelector('#lightbox-prev');
  const next = document.querySelector('#lightbox-next');
  let gallery = [], current = 0, trigger = null, startX = 0, startY = 0;
  function showImage(index) {
    current = (index + gallery.length) % gallery.length;
    const link = gallery[current];
    lightboxImage.src = link.href;
    lightboxImage.alt = link.querySelector('img').alt;
    lightboxImage.classList.toggle('monochrome', link.querySelector('img').classList.contains('monochrome'));
    caption.textContent = link.dataset.caption;
    imageCount.textContent = `${current + 1} / ${gallery.length}`;
    previous.disabled = next.disabled = gallery.length < 2;
  }
  document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    trigger = link;
    // Keep sessions and the portfolio as separate collections; respect active filters.
    const collection = link.closest('.portfolio-grid') || link.closest('.session-images') || link.closest('.editorial-spread');
    gallery = [...collection.querySelectorAll('[data-lightbox]')].filter(anchor => !anchor.closest('[hidden]'));
    showImage(gallery.indexOf(link));
    dialog.showModal();
    body.classList.add('dialog-open');
    document.querySelector('#lightbox-close').focus();
  }));
  document.querySelector('#lightbox-close').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => showImage(current - 1));
  next.addEventListener('click', () => showImage(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(current + 1); }
  });
  dialog.addEventListener('close', () => { body.classList.remove('dialog-open'); if (trigger) trigger.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  lightboxImage.addEventListener('touchstart', event => { startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY; }, { passive: true });
  lightboxImage.addEventListener('touchend', event => {
    const x = event.changedTouches[0].clientX - startX;
    const y = event.changedTouches[0].clientY - startY;
    if (Math.abs(x) > 60 && Math.abs(x) > Math.abs(y) * 1.5) showImage(current + (x < 0 ? 1 : -1));
  }, { passive: true });

  const form = document.querySelector('#contact-form');
  window.FrancisContact.connectForm(form, window);
  document.querySelectorAll('[data-event]').forEach(link => link.addEventListener('click', () => { form.elements.namedItem('tipo').value = link.dataset.event; }));

  const loadMap = document.querySelector('#load-map');
  const mapCard = document.querySelector('#map-card');
  loadMap.hidden = false;
  loadMap.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.title = 'Google Maps: estudio de Francis Cazorla, Camino Cruz de Caravaca, 7, 04008 Almería. Atención con cita previa.';
    frame.src = 'https://www.google.com/maps?cid=14123049268649819056&output=embed';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer';
    frame.allowFullscreen = true;
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'map-close'; close.textContent = 'Cerrar mapa ×';
    const intro = mapCard.querySelector('.map-intro');
    intro.hidden = true;
    mapCard.append(frame, close);
    close.focus();
    close.addEventListener('click', () => { frame.remove(); close.remove(); intro.hidden = false; loadMap.focus(); });
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
