'use strict';

(function initFoyerLandingAnalytics() {
  if (typeof window.posthog === 'undefined') return;

  const posthog = window.posthog;
  const props = {
    app: 'foyer-web',
    product: 'foyer',
    surface: 'landing',
  };

  function capture(event, extra) {
    posthog.capture(event, {
      ...props,
      ...extra,
      page_url: window.location.href,
      page_title: document.title,
    });
  }

  capture('landing_loaded', {
    path: window.location.pathname,
    referrer: document.referrer || 'direct',
  });

  const ctaMap = [
    ['.nav-cta', 'nav'],
    ['.mobile-cta', 'mobile_menu'],
    ['#final-cta .btn-primary', 'final_cta'],
  ];

  ctaMap.forEach(([selector, placement]) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('click', () => {
        capture('landing_cta_clicked', {
          placement,
          label: el.textContent?.trim() || '',
          href: el.getAttribute('href') || '',
        });
      });
    });
  });

  document.querySelectorAll('#nav a[href^="#"], .mobile-menu a[href^="#"]').forEach((el) => {
    el.addEventListener('click', () => {
      capture('landing_nav_clicked', {
        label: el.textContent?.trim() || '',
        href: el.getAttribute('href') || '',
      });
    });
  });

  document.getElementById('heroAgentShell')?.addEventListener('click', () => {
    capture('landing_hero_agent_clicked');
  });

  document.getElementById('copyBtn')?.addEventListener('click', () => {
    capture('landing_embed_copied');
  });
})();
