/* Presentation only: font comparison, word entrances and safe headline sizing. */
(function () {
  'use strict';
  const root = document.documentElement;
  const chosen = new URLSearchParams(window.location.search).get('tipografia');
  const families = {
    bodoni: ['Bodoni Moda', 'Bodoni+Moda:opsz,wght@96,400'],
    cormorant: ['Cormorant Garamond', 'Cormorant+Garamond:wght@500'],
    italiana: ['Italiana', 'Italiana']
  };
  const preset = Object.hasOwn(families, chosen) ? chosen : (Object.hasOwn(families, root.dataset.typeface) ? root.dataset.typeface : 'bodoni');
  root.dataset.typeface = preset;
  if (preset !== 'bodoni') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + families[preset][1] + '&display=swap';
    document.head.append(link);
  }
  const headings = [...document.querySelectorAll('main h1, main h2, .story-frame h3')];
  headings.forEach(heading => {
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement.closest('.visually-hidden') && walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
    }
    let index = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
        const span = document.createElement('span');
        span.className = 'type-word';
        span.style.setProperty('--type-i', Math.min(index++, 7));
        span.textContent = word;
        fragment.append(span);
      });
      node.replaceWith(fragment);
    });
  });
  // Measure only after resize/font loading; the existing scroll loop stays unchanged.
  let scheduled = false;
  function fitHeadlines() {
    scheduled = false;
    headings.forEach(heading => {
      heading.style.removeProperty('font-size');
      const available = heading.clientWidth;
      if (!available) return;
      const words = [...heading.querySelectorAll('.type-word')];
      const widest = Math.max(0, ...words.map(word => word.getBoundingClientRect().width));
      if (widest > available - 2) {
        const size = parseFloat(window.getComputedStyle(heading).fontSize);
        heading.style.fontSize = `${Math.floor(size * (available - 4) / widest * 10) / 10}px`;
      }
    });
  }
  function scheduleFit() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(fitHeadlines);
  }
  window.addEventListener('resize', scheduleFit, { passive: true });
  if (document.fonts) {
    document.fonts.ready.then(scheduleFit);
    document.fonts.addEventListener('loadingdone', scheduleFit);
  }
  scheduleFit();
})();
