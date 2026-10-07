const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const start = html.indexOf('function updateLandingWidgetMode()');
const end = html.indexOf('function syncHeroAgentShell()', start);
const controller = html.slice(start, end);

function element(initial = []) {
  const classes = new Set(initial);
  const result = { mutations: 0 };
  result.classList = {
    contains: name => classes.has(name),
    add(name) { classes.add(name); result.mutations++; },
    toggle(name, enabled) {
      if (classes.has(name) !== enabled) {
        enabled ? classes.add(name) : classes.delete(name);
        result.mutations++;
      }
    },
  };
  return result;
}

function setup({ call = false, chat = false, scroll = 0 } = {}) {
  const root = element(call ? ['tl-call-open'] : []);
  const panel = element(chat ? ['tl-open'] : []);
  const shell = element();
  const context = vm.createContext({
    hero: {}, heroAgentShell: shell,
    document: { getElementById: id => ({ 'talklayer-root': root, 'tl-transcript-panel': panel }[id]) },
    window: { scrollY: scroll }, heroDockThreshold: () => 80,
  });
  vm.runInContext(controller, context);
  return { root, panel, shell, update: () => context.updateLandingWidgetMode() };
}

test('idle top-of-page demo uses the hero launcher', () => {
  const state = setup(); state.update();
  assert.equal(state.root.classList.contains('foyer-widget-hero'), true);
  assert.equal(state.shell.classList.contains('is-docked'), false);
});

for (const options of [{ call: true }, { chat: true }, { scroll: 100 }]) {
  test(`controls dock for ${JSON.stringify(options)}`, () => {
    const state = setup(options); state.update();
    assert.equal(state.root.classList.contains('foyer-widget-docked'), true);
    assert.equal(state.root.classList.contains('foyer-widget-hero'), false);
    assert.equal(state.shell.classList.contains('is-docked'), true);
  });
}

test('ending a top-of-page call restores the hero launcher', () => {
  const state = setup({ call: true }); state.update();
  state.root.classList.toggle('tl-call-open', false); state.update();
  assert.equal(state.root.classList.contains('foyer-widget-hero'), true);
  assert.equal(state.shell.classList.contains('is-docked'), false);
});

test('observer updates settle without repeatedly mutating the observed root', () => {
  const state = setup({ call: true }); state.update();
  const mutations = state.root.mutations;
  state.update(); state.update();
  assert.equal(state.root.mutations, mutations);
  assert.match(html, /landingWidgetObserver = new MutationObserver\(\(\) => \{\s*updateLandingWidgetMode\(\)/);
});

test('interactive hero launcher is not inside an aria-hidden anchor', () => {
  assert.doesNotMatch(html, /class="hero-widget-anchor"[^>]*aria-hidden="true"/);
});
