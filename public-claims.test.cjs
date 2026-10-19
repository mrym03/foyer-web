const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const normalized = text => text.replace(/\s+/g, ' ').trim();

test('withholds named customer references pending verification', () => {
  const dom = new JSDOM(html);
  assert.equal(dom.window.document.querySelector('#proof'), null);
  assert.equal(dom.window.document.querySelectorAll('img[src^="/assets/logos/"],img[src^="/assets/testimonials/"]').length, 0);
  dom.window.close();
});

test('does not promise exhaustive indexing, perfect answers or universal setup time', () => {
  assert.doesNotMatch(html, /crawls (?:your entire site|every page)|no hallucinations|in about two minutes|Nothing is shared|part nobody else does|answers every question/i);
  assert.match(html, /up to 50 pages within your plan allowance/);
  assert.match(html, /Processing time depends on the site and its content/);
  assert.match(html, /AI responses are not guaranteed to be error-free/);
});

test('visible knowledge and privacy FAQs match their structured answers', () => {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const data = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent);
  const questions = data['@graph'].find(item => item['@type'] === 'FAQPage').mainEntity;
  for (const name of ['How does the agent learn about my product?', 'Does Foyer recognize returning visitors?', 'What analytics do I get?', 'Where do captured leads go?']) {
    const item = [...doc.querySelectorAll('.faq-item')].find(item => item.querySelector('summary').textContent.trim() === name);
    assert.equal(normalized(item.querySelector('.faq-a').textContent), normalized(questions.find(q => q.name === name).acceptedAnswer.text));
  }
  dom.window.close();
});

test('describes recording, analytics and memory as settings-dependent', () => {
  assert.match(html, /Audio recording depends on your settings/);
  assert.match(html, /optional analytics is enabled with the visitor's choice/);
  assert.match(html, /visitor chooses to be remembered/);
  assert.match(html, /Basic conversation remains available without opting into memory/);
});
