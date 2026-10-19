const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const source = fs.readFileSync(`${__dirname}/about.html`, 'utf8');
const marketing = fs.readFileSync(`${__dirname}/posthog-analytics.js`, 'utf8');
const widgetUrl = 'https://api.foyer.ink/static/widget.js';
const agentId = 'tl_0572c67cb611';

function setup() {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(source, {
    url: 'https://tryfoyer.ai/about',
    runScripts: 'outside-only',
    virtualConsole,
  });
  return { dom, document: dom.window.document, errors };
}

test('About has exactly one asynchronous own-sales widget embed', () => {
  const { dom, document } = setup();
  const embeds = document.querySelectorAll('script[src*="/static/widget.js"],script[data-agent-id]');
  assert.equal(embeds.length, 1);
  assert.equal(embeds[0].getAttribute('src'), widgetUrl);
  assert.equal(embeds[0].getAttribute('data-agent-id'), agentId);
  assert.equal(embeds[0].getAttribute('data-server'), 'https://api.foyer.ink');
  assert.equal(embeds[0].hasAttribute('async'), true);
  assert.equal(embeds[0].parentElement, document.body);
  dom.window.close();
});

test('About uses the same standard embed as the existing sales pages', () => {
  const { dom, document } = setup();
  const embed = document.querySelector(`script[src="${widgetUrl}"]`);
  assert.ok(embed);
  for (const page of ['index', 'affiliate', 'terms', 'privacy-policy']) {
    const other = new JSDOM(fs.readFileSync(`${__dirname}/${page}.html`, 'utf8'));
    assert.equal(embed.outerHTML, other.window.document.querySelector(`script[src="${widgetUrl}"]`).outerHTML, page);
    other.window.close();
  }
  dom.window.close();
});

test('About initializes the existing privacy host before loading the widget', () => {
  const { dom, document } = setup();
  const scripts = [...document.querySelectorAll('script[src]')];
  assert.deepEqual(scripts.map(script => script.getAttribute('src')), ['/posthog-analytics.js', widgetUrl]);
  assert.equal(scripts[0].hasAttribute('async'), false);
  assert.equal(scripts[0].hasAttribute('defer'), false);
  const settings = document.querySelectorAll('#foyer-marketing-privacy-toggle');
  assert.equal(settings.length, 1);
  assert.ok(settings[0].closest('footer'));
  dom.window.close();
});

test('About keeps the normal launcher without homepage docking overrides', () => {
  const { dom, document, errors } = setup();
  const embed = document.querySelector(`script[src="${widgetUrl}"]`);
  assert.ok(embed);
  assert.deepEqual([...embed.attributes].map(attribute => attribute.name).sort(), ['async', 'data-agent-id', 'data-server', 'src']);
  assert.doesNotMatch(source, /foyer-landing-widget|foyer-widget-hero|foyer-widget-docked|heroAgentShell|updateLandingWidgetMode/);
  assert.equal(document.querySelectorAll('#talklayer-root').length, 0);
  assert.equal(document.querySelectorAll('main').length, 1);
  assert.equal(document.querySelectorAll('footer').length, 1);
  assert.deepEqual(errors, []);
  dom.window.close();
});

test('About privacy remains opt-in and denies optional widget processing by default', () => {
  const { dom, document, errors } = setup();
  const choices = [];
  dom.window.addEventListener('foyer:privacy-choice', event => choices.push(JSON.parse(JSON.stringify(event.detail))));
  dom.window.eval(marketing);
  dom.window.dispatchEvent(new dom.window.CustomEvent('foyer:privacy-widget-ready', { detail: { agentId } }));
  assert.deepEqual(choices, [{ agentId, choices: { analytics: false, remember: false, recovery: false } }]);
  assert.equal(document.querySelectorAll('script[src*="posthog-1"]').length, 0);
  assert.ok(document.querySelector('[data-foyer-privacy-host]'));
  document.getElementById('foyer-marketing-privacy-decline').click();
  assert.equal(document.querySelectorAll('script[src*="posthog-1"]').length, 0);
  assert.equal(document.getElementById('foyer-marketing-privacy').hidden, true);
  document.getElementById('foyer-marketing-privacy-toggle').click();
  assert.equal(document.getElementById('foyer-marketing-privacy').hidden, false);
  assert.deepEqual(errors, []);
  dom.window.close();
});
