const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { window: {} };
for (const name of ['portfolio.config.js', 'config-utils.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'), context);
const { PORTFOLIO_CONFIG: base, PortfolioConfig: C } = context.window;

test('customization round trip preserves text, order, visibility, links, and images', () => {
  const draft = C.clone(base);
  draft.copy[0].value = 'My actual words\nSecond line';
  draft.projects.reverse(); draft.projects[0].visible = false;
  draft.projects[1].image = 'data:image/png;base64,AAAA';
  draft.design.hero = 'shelf-first'; draft.design.scale = 90;
  draft.links[0].url = 'mailto:hello@example.com';
  const result = C.normalize(JSON.parse(JSON.stringify(draft)), base);
  assert.equal(result.copy[0].value, draft.copy[0].value);
  assert.equal(result.projects[0].id, draft.projects[0].id);
  assert.equal(result.projects[0].visible, false);
  assert.equal(result.projects[1].image, draft.projects[1].image);
  assert.equal(result.links[0].url, draft.links[0].url);
  assert.equal(result.design.hero, 'shelf-first');
});
test('import rejects executable links, CSS injections, SVG data, and unknown enum values', () => {
  const draft = C.clone(base);
  draft.design.paper = 'red; background:url(https://example.com)';
  draft.design.layout = '__proto__';
  draft.design.scale = 9999;
  draft.links[0].url = 'javascript:alert(1)';
  draft.projects[0].image = 'data:image/svg+xml;base64,AAAA';
  const result = C.normalize(draft, base);
  assert.equal(result.design.paper, base.design.paper);
  assert.equal(result.design.layout, base.design.layout);
  assert.equal(result.design.scale, 125);
  assert.equal(result.links[0].url, base.links[0].url);
  assert.equal(result.projects[0].image, '');
});
test('imports cannot duplicate projects or remove schema fields', () => {
  const draft = C.clone(base);
  draft.projects = [draft.projects[2], draft.projects[2], {id:'unknown'}];
  draft.copy = [];
  const result = C.normalize(draft, base);
  assert.equal(result.projects.length, base.projects.length);
  assert.equal(new Set(result.projects.map(p => p.id)).size, base.projects.length);
  assert.equal(result.projects[0].id, 'circuits');
  assert.equal(result.copy.length, base.copy.length);
  assert.throws(() => C.normalize({version:99}, base));
});
test('exported config keeps script-looking text inert and remains valid JavaScript', () => {
  const draft = C.clone(base);
  draft.copy[0].value = '</script><script>alert(1)</script>';
  const serialized = C.script(draft);
  assert.equal(serialized.includes('</script>'), false);
  const output = {window:{}};
  vm.runInNewContext(serialized, output);
  assert.equal(output.window.PORTFOLIO_CONFIG.copy[0].value, draft.copy[0].value);
});
