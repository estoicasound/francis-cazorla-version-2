(function () {
  'use strict';
  const families = { bodoni: ['Bodoni Moda', 400], cormorant: ['Cormorant Garamond', 500], italiana: ['Italiana', 400] };
  let selected = 'bodoni';
  let composition = 'actual';
  const stage = document.querySelector('.cover');
  const image = stage.querySelector('img');
  const original = { src: image.getAttribute('src'), alt: image.alt, width: image.width, height: image.height };
  const status = document.querySelector('#font-status');
  const link = document.querySelector('#see-site');
  function updateLink() {
    const name = families[selected][0];
    link.href = (composition === 'editorial' ? 'portada-editorial.html' : 'index.html') + '?tipografia=' + selected;
    link.firstChild.textContent = 'Ver ' + (composition === 'editorial' ? 'portada B/N' : 'la web') + ' con ' + name + ' ';
  }
  async function chooseTypeface(key) {
    selected = key;
    const [name, weight] = families[key];
    document.documentElement.style.setProperty('--display', "'" + name + "', 'Didot', serif");
    document.documentElement.style.setProperty('--weight', weight);
    document.querySelectorAll('[data-font]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.font === key)));
    updateLink();
    status.textContent = 'Comprobando ' + name + '…';
    try {
      const faces = await document.fonts.load(weight + ' 48px "' + name + '"');
      if (selected === key) status.textContent = faces.length ? 'Tipografía cargada: ' + name + '.' : 'No se ha cargado ' + name + '. Se está mostrando la alternativa local; comprueba la conexión.';
    } catch (_) { if (selected === key) status.textContent = 'No se ha cargado ' + name + '. Se está mostrando la alternativa local.'; }
  }
  function chooseCover(key) {
    composition = key;
    stage.classList.toggle('cover-monochrome', key === 'editorial');
    image.src = key === 'editorial' ? 'assets/editorial/novios-rincon-rustico-1800.jpg' : original.src;
    image.alt = key === 'editorial' ? 'Pareja de novios sentada muy cerca en un rincón rústico, con tratamiento editorial en blanco y negro' : original.alt;
    image.width = key === 'editorial' ? 1199 : original.width;
    image.height = key === 'editorial' ? 1800 : original.height;
    document.querySelectorAll('[data-cover]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cover === key)));
    updateLink();
    requestPaint();
  }
  document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => chooseTypeface(button.dataset.font)));
  document.querySelectorAll('[data-cover]').forEach(button => button.addEventListener('click', () => chooseCover(button.dataset.cover)));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  function paint() {
    scheduled = false;
    if (reduced.matches || composition !== 'editorial') { stage.style.removeProperty('--comparison-progress'); return; }
    const bounds = stage.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    stage.style.setProperty('--comparison-progress', Math.max(0, Math.min(1, -bounds.top / bounds.height)));
  }
  function requestPaint() { if (!scheduled) { scheduled = true; window.requestAnimationFrame(paint); } }
  window.addEventListener('scroll', requestPaint, { passive: true });
  window.addEventListener('resize', requestPaint, { passive: true });
  reduced.addEventListener('change', requestPaint);
  chooseTypeface('bodoni');
})();
