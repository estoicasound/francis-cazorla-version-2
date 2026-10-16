/* Keep the floating contact link clear of the approved cover controls. */
(function () {
  'use strict';
  const hero = document.querySelector('.hero');
  if (!hero || !('IntersectionObserver' in window)) return;
  document.body.classList.add('cover-contact-managed');
  new IntersectionObserver(entries => {
    document.body.classList.toggle('cover-contact-visible', entries[0].boundingClientRect.bottom <= 0);
  }, { threshold: 0 }).observe(hero);
})();
