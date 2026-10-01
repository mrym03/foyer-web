/* PostHog 1.435.6: explicit optional consent, anonymous masked replay. */
(function () {
  'use strict';
  const TOKEN = 'phc_RcsMxoWSU8oKJVS3SC40Lupk2aX8i0mlY33o4ixrJyv';
  const CHOICE = 'foyer-marketing-privacy-v1';
  const VERSION = '2026-10-01';
  const MAX_AGE = 180 * 86400000;
  const SDK_URL = '/assets/vendor/posthog-1.435.6.js';
  const privateSelector = '#talklayer-widget,#tl-root,[id^="tl-"],#heroAgentShell,#talkOverlay,#my-cal-inline-foyer-strategy-call,iframe,canvas,video,audio,script,input[type="file"],[contenteditable],.testimonial-person,[class*="founder"],[class*="author"],[data-private],.ph-no-capture';
  const publicPaths = new Set(['/', '/index.html', '/about', '/about.html', '/affiliate', '/affiliate.html', '/privacy-policy', '/privacy-policy.html', '/terms', '/terms.html', '/third-party-notices', '/third-party-notices.html']);
  let choice = readChoice();
  let instance = null;
  let transport = null;
  let sdkPromise = null;
  let generation = 0;
  let instanceName = '';
  let starting = false;
  let loadError = false;
  let widgetAgentId = null;
  let pendingWidgetChoice = null;
  let footerSettingsOpen = false;
  const readyWidgets = new Set();
  const initialText = new WeakMap();
  const initialAttributes = new WeakMap();
  // Only text present in the public page before the assistant loads is eligible
  // to be replayed. Later/user-specific text stays masked, including on known nodes.
  document.querySelectorAll('body *').forEach(element => {
    if (element.closest(privateSelector)) return;
    initialText.set(element, new Set(Array.from(element.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent)));
    initialAttributes.set(element, new Map(Array.from(element.attributes).map(a => [a.name, a.value])));
  });
  function masked(value) { return String(value || '').replace(/\S/g, '*'); }
  function safePage() { return location.origin + (publicPaths.has(location.pathname) ? location.pathname : '/other'); }
  function safeUrl(value) {
    try { const url = new URL(value, location.origin); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : ''; }
    catch (_) { return ''; }
  }
  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(CHOICE) || 'null');
      return value && value.version === VERSION && typeof value.allowed === 'boolean' && Number.isFinite(value.at) && value.at <= Date.now() && Date.now() - value.at < MAX_AGE ? value : null;
    } catch (_) { return null; }
  }
  function allowed() { return choice?.allowed === true; }
  function clearIdentifiers() {
    // Remove this project's old/default and current marketing identifiers only.
    const matches = key => key.includes(TOKEN) || key.startsWith('ph_foyer_marketing') || key.startsWith('foyer_marketing_');
    for (const name of ['localStorage', 'sessionStorage']) {
      try { const storage = window[name]; Object.keys(storage).filter(matches).forEach(key => storage.removeItem(key)); } catch (_) {}
    }
    const parts = location.hostname.split('.');
    const domains = ['', location.hostname, ...parts.map((_, i) => '.' + parts.slice(i).join('.'))];
    document.cookie.split(';').map(v => v.trim().split('=')[0]).filter(matches).forEach(key => {
      domains.forEach(domain => { document.cookie = key + '=; Max-Age=0; Path=/' + (domain ? '; Domain=' + domain : '') + '; SameSite=Lax'; });
    });
  }
  function beforeSend(event) {
    if (!allowed() || !instance || !['$pageview', '$snapshot'].includes(event.event)) return null;
    const source = event.properties || {};
    const properties = {};
    for (const key of ['token', 'distinct_id', '$device_id', '$session_id', '$window_id', '$lib', '$lib_version', '$viewport_height', '$viewport_width', '$screen_height', '$screen_width', '$time', '$sent_at']) {
      if (source[key] !== undefined) properties[key] = source[key];
    }
    for (const key of Object.keys(source)) if (key.startsWith('$snapshot')) properties[key] = source[key];
    properties.$current_url = safePage();
    properties.$pathname = publicPaths.has(location.pathname) ? location.pathname : '/other';
    properties.$host = location.host;
    properties.$process_person_profile = false;
    properties.$is_identified = false;
    properties.$ip = null;
    properties.$geoip_disable = true;
    properties.surface = 'marketing';
    event.properties = properties;
    delete event.$set; delete event.$set_once;
    return event;
  }
  function loadSdk() {
    if (window.posthog?.init) return Promise.resolve();
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL; script.async = true; script.referrerPolicy = 'no-referrer';
      script.onload = resolve;
      script.onerror = () => { script.remove(); sdkPromise = null; reject(new Error('Analytics unavailable')); };
      document.head.appendChild(script);
    });
    return sdkPromise;
  }
  function stop() {
    generation++; starting = false;
    // Abort first: SDK teardown flushes queues, which must not send after withdrawal.
    transport?.abort(); transport = null;
    if (instance) {
      const old = instance; instance = null;
      old.opt_out_capturing(); old.stopSessionRecording();
      old.set_config({ disable_persistence: true, disable_session_recording: true });
      void old.shutdown();
      if (window.posthog && instanceName) delete window.posthog[instanceName];
    }
    clearIdentifiers();
  }
  async function start() {
    if (!allowed() || instance || starting) return;
    const attempt = ++generation; starting = true; loadError = false; renderStatus();
    try {
      await loadSdk();
      if (!allowed() || attempt !== generation) return;
      transport = new AbortController();
      instanceName = 'foyerMarketing' + generation;
      const config = {
        api_host: 'https://us.i.posthog.com',
        defaults: 'unset', persistence: 'sessionStorage', persistence_name: 'foyer_marketing',
        cross_subdomain_cookie: false, person_profiles: 'never',
        capture_pageview: false, capture_pageleave: false, autocapture: false,
        capture_performance: false, capture_heatmaps: false, capture_dead_clicks: false,
        capture_exceptions: false, rageclick: false,
        save_referrer: false, save_campaign_params: false,
        enable_recording_console_log: false,
        disable_surveys: true, disable_product_tours: true, disable_conversations: true,
        disable_web_experiments: true, disable_external_dependency_loading: true,
        advanced_disable_feature_flags: true, advanced_disable_feature_flags_on_first_load: true,
        error_tracking: { autocapture: false },
        opt_out_capturing_by_default: true, opt_out_persistence_by_default: true,
        request_batching: false, api_transport: 'fetch', disable_beacon: true,
        fetch_options: { signal: transport.signal, referrerPolicy: 'no-referrer', credentials: 'omit' },
        get_current_url: safePage, before_send: beforeSend,
        disable_session_recording: true,
        session_recording: {
          maskAllInputs: true, maskInputFn: masked, maskTextSelector: '*',
          maskTextFn: (text, element) => {
            if (!element || element.closest(privateSelector) || !initialText.get(element)?.has(text)) return masked(text);
            return text.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]');
          },
          maskAttributeFn: (name, value, element) => {
            if (element.closest(privateSelector)) return '';
            const original = initialAttributes.get(element)?.get(name);
            name = name.toLowerCase();
            if (['aria-expanded', 'aria-selected', 'aria-checked', 'hidden', 'open'].includes(name)) return /^(true|false|hidden|open)?$/.test(value) ? value : '';
            if (original !== value) return '';
            if (['href', 'src', 'action', 'poster'].includes(name)) return safeUrl(value);
            if (/^(class|id|style|role|type|width|height|viewbox|d|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|xmlns|cx|cy|r|x|y|rx|ry|transform|loading|rel|target|tabindex|aria-hidden)$/.test(name)) return value;
            return '';
          },
          blockSelector: privateSelector, slimDOMOptions: { script: true, comment: true },
          recordCrossOriginIframes: false, recordBody: false, recordHeaders: false,
          captureCanvas: { recordCanvas: false }, captureJsonLd: false,
          maskCapturedNetworkRequestFn: request => Object.keys(request).length === 1 && typeof request.name === 'string' ? { name: safePage() } : null,
        },
      };
      instance = window.posthog.init(TOKEN, config, instanceName);
      if (!allowed() || attempt !== generation) { stop(); return; }
      instance.opt_in_capturing({ captureEventName: false });
      instance.startSessionRecording({ sampling: true, linked_flag: true, url_trigger: true, event_trigger: true });
      instance.capture('$pageview');
    } catch (_) { if (attempt === generation) { loadError = true; stop(); } }
    finally { if (attempt === generation) starting = false; renderStatus(); }
  }
  const style = document.createElement('style');
  style.textContent = '#foyer-marketing-privacy{font:12px/1.4 Inter,system-ui,sans-serif;color:#242424;position:fixed;left:16px;bottom:16px;max-width:calc(100vw - 32px);z-index:2147483600}#foyer-marketing-privacy[hidden],#foyer-marketing-privacy-panel[hidden]{display:none}#foyer-marketing-privacy-panel{display:flex;align-items:center;flex-wrap:wrap;gap:10px;box-sizing:border-box;background:#fff;border:1px solid #ddd;border-radius:8px;padding:10px 12px;box-shadow:0 2px 12px #0001}#foyer-marketing-privacy-copy{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center}#foyer-marketing-privacy a{color:inherit;text-decoration:underline}#foyer-marketing-privacy-actions{display:flex;gap:6px}#foyer-marketing-privacy button{font:inherit;cursor:pointer;background:#fff;color:#242424;border:1px solid #aaa;border-radius:5px;min-width:64px;min-height:32px;padding:5px 9px}#foyer-marketing-privacy button:focus-visible,#foyer-marketing-privacy a:focus-visible,#foyer-marketing-privacy-toggle:focus-visible{outline:2px solid #bd7400;outline-offset:3px}#foyer-marketing-privacy-assistant{border:0!important;background:transparent!important;padding:0!important;min-width:0!important;font-size:11px!important;text-decoration:underline}#foyer-marketing-privacy-assistant[hidden]{display:none}#foyer-marketing-privacy-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@media(max-width:900px){#foyer-marketing-privacy{left:12px;bottom:12px;max-width:calc(100vw - 24px)}#foyer-marketing-privacy-panel{gap:8px;padding:9px 10px}body:has(#foyer-marketing-privacy:not([hidden])) #talklayer-root.foyer-widget-docked{bottom:128px!important}}';
  document.head.appendChild(style);
  const root = document.createElement('aside'); root.id = 'foyer-marketing-privacy'; root.setAttribute('aria-label', 'Website privacy'); root.setAttribute('data-foyer-privacy-host', ''); root.className = 'ph-no-capture';
  root.innerHTML = '<section id="foyer-marketing-privacy-panel" aria-label="Optional analytics"><div id="foyer-marketing-privacy-copy"><span>Optional cookies help us understand site usage.</span><a href="/privacy-policy">Privacy policy</a></div><div id="foyer-marketing-privacy-actions"><button type="button" id="foyer-marketing-privacy-decline">Decline</button><button type="button" id="foyer-marketing-privacy-accept">Accept</button></div><button type="button" id="foyer-marketing-privacy-assistant" hidden>Assistant choices</button><span id="foyer-marketing-privacy-status" role="status"></span></section>';
  document.body.appendChild(root);
  const panel = root.querySelector('section'); const toggle = document.querySelector('#foyer-marketing-privacy-toggle');
  function renderStatus() {
    if (!root) return;
    root.querySelector('#foyer-marketing-privacy-status').textContent = loadError ? 'Analytics could not load. Accept to retry, or decline.' : starting ? 'Loading optional analytics…' : allowed() ? 'Optional analytics are allowed.' : 'Optional analytics are off.';
  }
  function show(open, fromFooter = false) {
    if (open) window.dispatchEvent(new CustomEvent('foyer:privacy-widget-close', { detail: { agentId: widgetAgentId } }));
    root.hidden = !open; panel.hidden = !open; toggle?.setAttribute('aria-expanded', String(open));
    footerSettingsOpen = open && fromFooter;
    root.querySelector('#foyer-marketing-privacy-assistant').hidden = !footerSettingsOpen || !widgetAgentId;
  }
  function sendWidgetChoice(value) {
    if (!widgetAgentId) { pendingWidgetChoice = value; return; }
    window.dispatchEvent(new CustomEvent('foyer:privacy-choice', {
      detail: { agentId: widgetAgentId, choices: { analytics: value, remember: false, recovery: false } },
    }));
  }
  function choose(value) {
    choice = { version: VERSION, allowed: value, at: Date.now() };
    try { localStorage.setItem(CHOICE, JSON.stringify(choice)); } catch (_) {}
    loadError = false;
    if (value) void start(); else stop();
    sendWidgetChoice(value);
    renderStatus(); show(false); toggle?.focus({ preventScroll: true });
  }
  root.querySelector('#foyer-marketing-privacy-accept').addEventListener('click', () => choose(true));
  root.querySelector('#foyer-marketing-privacy-decline').addEventListener('click', () => choose(false));
  toggle?.addEventListener('click', event => {
    event.preventDefault();
    show(true, true);
    root.querySelector('#foyer-marketing-privacy-decline').focus({ preventScroll: true });
  });
  root.addEventListener('keydown', event => { if (event.key === 'Escape') { show(false); toggle?.focus({ preventScroll: true }); } });
  const assistant = root.querySelector('#foyer-marketing-privacy-assistant');
  assistant.addEventListener('click', () => {
    if (!widgetAgentId || assistant.hidden) return;
    show(false);
    window.dispatchEvent(new CustomEvent('foyer:privacy-widget-open', { detail: { agentId: widgetAgentId } }));
  });
  window.addEventListener('foyer:privacy-widget-ready', event => {
    const agentId = event.detail?.agentId;
    if (typeof agentId !== 'string' || !agentId.trim()) return;
    widgetAgentId = agentId; assistant.hidden = !footerSettingsOpen;
    if (readyWidgets.has(agentId)) return;
    readyWidgets.add(agentId);
    // An in-page click may precede async widget loading. Consume it once;
    // stored marketing grants must never become new assistant permission.
    if (pendingWidgetChoice !== null) {
      const value = pendingWidgetChoice; pendingWidgetChoice = null; sendWidgetChoice(value);
    } else if (!allowed()) sendWidgetChoice(false);
  });
  window.addEventListener('storage', event => {
    if (event.key !== CHOICE && event.key !== null) return;
    choice = readChoice();
    pendingWidgetChoice = null;
    if (allowed()) void start(); else { stop(); sendWidgetChoice(false); }
    renderStatus(); show(choice === null);
  });
  show(choice === null); renderStatus();
  window.dispatchEvent(new CustomEvent('foyer:privacy-host-ready'));
  if (allowed()) void start(); else clearIdentifiers();
})();
