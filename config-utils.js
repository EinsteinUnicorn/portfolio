/* Shared by the public page and design studio. Imported edits are data, never HTML. */
(function () {
  'use strict';
  const options = {
    displayFont: ['book', 'workshop', 'plain', 'classic'],
    bodyFont: ['humanist', 'system', 'mono'],
    hero: ['split', 'centered', 'shelf-first'],
    index: ['questions', 'list', 'hidden'],
    layout: ['editorial', 'visual-first', 'stacked'],
    details: ['collapsed', 'expanded'],
    surfaces: ['color', 'paper']
  };
  const colors = ['paper', 'ink', 'accent', 'voice', 'tea', 'circuit', 'stitch', 'about'];
  const ranges = { scale: [75, 125], spacing: [65, 140], width: [900, 1500] };
  // Strings (including uploaded images) are immutable: share them across undo states.
  const clone = value => Array.isArray(value) ? value.map(clone) :
    value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])) : value;
  const text = (value, fallback, max = 8000) => typeof value === 'string' ? value.slice(0, max) : fallback;
  function safeLink(value) {
    return typeof value === 'string' && /^(https?:\/\/|mailto:)/i.test(value) && !/[\u0000-\u001f]/.test(value);
  }
  function safeImage(value) {
    return typeof value === 'string' && (value === '' || /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(value));
  }
  function normalize(input, base) {
    if (!input || input.version !== 1 || !input.design || !Array.isArray(input.copy) || !Array.isArray(input.projects) || !Array.isArray(input.links)) {
      throw new Error('Choose a version 1 portfolio backup or configuration.');
    }
    const result = clone(base);
    for (const key of colors) if (/^#[a-f0-9]{6}$/i.test(input.design[key])) result.design[key] = input.design[key];
    for (const [key, values] of Object.entries(options)) if (values.includes(input.design[key])) result.design[key] = input.design[key];
    for (const [key, [min, max]] of Object.entries(ranges)) if (Number.isFinite(input.design[key])) result.design[key] = Math.max(min, Math.min(max, input.design[key]));
    if (typeof input.design.showShelf === 'boolean') result.design.showShelf = input.design.showShelf;
    result.copy = result.copy.map(item => ({ ...item, value: text(input.copy.find(copy => copy.id === item.id)?.value, item.value) }));
    result.links = result.links.map(item => {
      const url = input.links.find(link => link.id === item.id)?.url;
      return { ...item, url: safeLink(url) ? url : item.url };
    });
    const seen = new Set();
    result.projects = input.projects.flatMap(project => {
      const original = base.projects.find(item => item.id === project.id);
      if (!original || seen.has(project.id)) return [];
      seen.add(project.id);
      const image = safeImage(project.image) && project.image.length <= 6000000 ? project.image : original.image;
      return [{ ...original, visible: typeof project.visible === 'boolean' ? project.visible : true,
        layout: ['inherit', ...options.layout].includes(project.layout) ? project.layout : 'inherit',
        image, alt: text(project.alt, original.alt, 500), caption: text(project.caption, original.caption, 1000) }];
    });
    result.projects.push(...base.projects.filter(item => !seen.has(item.id)).map(clone));
    return result;
  }
  function script(config) { return 'window.PORTFOLIO_CONFIG = ' + JSON.stringify(config, null, 2).replace(/</g, '\\u003c') + ';\n'; }
  window.PortfolioConfig = { normalize, clone, safeLink, safeImage, script, colors };
})();
