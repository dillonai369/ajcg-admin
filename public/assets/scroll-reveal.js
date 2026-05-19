/* ============================================================
 * AJ Commercial Group · Momentum Build
 * Scroll-reveal animations — elegant fade-up as elements
 * enter the viewport. Uses IntersectionObserver (no library).
 * ============================================================
 * - Respects prefers-reduced-motion (animations disabled for users who opt out)
 * - Triggers once per element (no repeat animations on scroll back up)
 * - Skips above-the-fold content (hero, page header, nav, footer)
 * - Subtle stagger when multiple cards are siblings (cascade effect)
 * ============================================================ */
(function () {
  // Bail early on browsers without IntersectionObserver (older Safari, IE).
  if (!('IntersectionObserver' in window)) return;
  // Respect users who've opted out of motion.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Selectors for elements that should fade up on scroll.
  // Hero, nav, page-header, and footer are intentionally excluded so above-the-fold
  // content is visible immediately on load (no flash, no awkward animation).
  var SELECTORS = [
    '.service-card',
    '.sold-card',
    '.city-card',
    '.why-item',
    '.testimonial-slide',
    '.form-card',
    '.property-broker',
    '.property-brokers-row',
    '.property-facts',
    '.team-card',
    '.broker-contact-block',
    '.creative-card',
    '.insight-card',
    '.blog-card',
    '.culture-grid-item',
    '.cta-grid',
    '.creatives-head',
    '.sold-head',
    '.services-head',
    '.insights-head',
    '.culture-head',
    '.content-block'
  ].join(',');

  // Containers whose descendants should NOT be animated (always visible).
  var SKIP_INSIDE = '.hero, .property-hero, .broker-hero, .page-header, nav, .nav, .mobile-menu, footer';

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  function init() {
    var all = toArray(document.querySelectorAll(SELECTORS));
    if (!all.length) return;

    // Filter out elements inside skip-zones (hero, nav, footer, etc.)
    var els = all.filter(function (el) {
      return !el.closest(SKIP_INSIDE);
    });
    if (!els.length) return;

    // First pass: tag every element with the .reveal class so siblings can be detected
    els.forEach(function (el) {
      el.classList.add('reveal');
    });

    // Observer — triggers fade-up when element scrolls into view, then stops watching it.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    // Second pass: stagger sibling elements + observe
    els.forEach(function (el) {
      var parent = el.parentElement;
      if (parent) {
        var siblings = toArray(parent.children).filter(function (c) {
          return c.classList && c.classList.contains('reveal');
        });
        var idx = siblings.indexOf(el);
        // Cap stagger at 5 siblings so long lists don't get a noticeable lag at the bottom
        if (idx > 0 && idx < 6) {
          el.style.transitionDelay = (idx * 0.07) + 's';
        }
      }
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
