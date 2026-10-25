(function () {
  'use strict';
  const base = window.PortfolioConfig.clone(window.PORTFOLIO_CONFIG);
  const fonts = {
    book: "'Baskerville', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
    workshop: "'Courier New', Courier, monospace",
    plain: "'Helvetica Neue', Arial, sans-serif",
    classic: "Georgia, 'Times New Roman', serif"
  };
  const bodyFonts = { humanist: "'Avenir Next', Avenir, 'Segoe UI', sans-serif", system: 'system-ui, sans-serif', mono: "'Courier New', monospace" };
  function apply(input) {
    const config = window.PortfolioConfig.normalize(input, base);
    const design = config.design;
    const root = document.documentElement;
    for (const key of window.PortfolioConfig.colors) root.style.setProperty('--' + key, design[key]);
    root.style.setProperty('--serif', fonts[design.displayFont]);
    root.style.setProperty('--sans', bodyFonts[design.bodyFont]);
    root.style.setProperty('--heading-scale', design.scale / 100);
    root.style.setProperty('--section-space', design.spacing / 100);
    root.style.setProperty('--content-width', design.width + 'px');
    for (const key of ['hero', 'index', 'layout', 'surfaces', 'displayFont']) root.dataset[key] = design[key];
    document.querySelector('.cabinet-scene').hidden = !design.showShelf;
    root.dataset.shelf = design.showShelf ? 'visible' : 'hidden';
    for (const item of config.copy) {
      const node = document.querySelector(`[data-copy="${item.id}"]`);
      if (node) node.textContent = item.value;
    }
    for (const item of config.links) {
      const node = document.querySelector(`[data-link="${item.id}"]`);
      if (node) node.setAttribute('href', item.url);
    }
    const container = document.getElementById('project-stories');
    const index = document.querySelector('.index-grid');
    let visibleNumber = 0;
    for (const project of config.projects) {
      const node = document.getElementById(project.id);
      node.hidden = !project.visible;
      node.dataset.layout = project.layout === 'inherit' ? design.layout : project.layout;
      container.append(node);
      const indexLink = index.querySelector(`[data-project-link="${project.id}"]`);
      index.append(indexLink);
      if (project.visible) {
        visibleNumber += 1;
        const number = String(visibleNumber).padStart(2, '0');
        indexLink.querySelector('.index-number').textContent = indexLink.querySelector('.index-number').textContent.trim().replace(/^\d{2}/, number);
        const label = node.querySelector('.project-top .eyebrow');
        label.textContent = label.textContent.replace(/^\d{2}/, number);
      }
      document.querySelectorAll(`[data-project-link="${project.id}"]`).forEach(link => { link.hidden = !project.visible; });
      const custom = document.querySelector(`[data-custom-visual="${project.id}"]`);
      const original = document.querySelector(`[data-original-visual="${project.id}"]`);
      custom.hidden = !project.image;
      original.hidden = Boolean(project.image);
      if (project.image) {
        custom.querySelector('img').src = project.image;
        custom.querySelector('img').alt = project.alt;
        custom.querySelector('figcaption').textContent = project.caption;
      } else custom.querySelector('img').removeAttribute('src');
    }
    document.querySelector('#work .section-heading .eyebrow').textContent = `Selected experiments / ${visibleNumber} projects`;
    document.getElementById('work').hidden = design.index === 'hidden' || !config.projects.some(project => project.visible);
    // Keep the skip destination useful even when the project index is hidden.
    document.querySelectorAll('a[href="#work"]').forEach(link => {
      link.dataset.workTarget = 'true';
    });
    document.querySelectorAll('[data-work-target]').forEach(link => {
      const first = config.projects.find(project => project.visible);
      link.href = design.index === 'hidden' || !first ? (first ? '#' + first.id : '#about') : '#work';
    });
    document.querySelectorAll('details').forEach(item => { item.open = design.details === 'expanded'; });
    return config;
  }
  function jumpTo(id) {
    const target = document.getElementById(id);
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 28, behavior: 'instant' });
  }
  // Fragment navigation in srcdoc otherwise resolves against the editor's URL.
  if (window.parent !== window) document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    event.preventDefault();
    jumpTo(link.getAttribute('href').slice(1) || 'main');
  });
  window.applyPortfolioConfig = apply;
  apply(base);
  window.addEventListener('message', event => {
    if (window.parent === window || event.source !== window.parent || event.origin !== new URL(document.baseURI).origin || event.data?.type !== 'portfolio:preview') return;
    try {
      apply(event.data.config);
      if (event.data.jump) jumpTo(event.data.jump);
      window.parent.postMessage({ type: 'portfolio:applied' }, new URL(document.baseURI).origin === 'null' ? '*' : new URL(document.baseURI).origin);
    } catch { /* An invalid message never changes the public page. */ }
  });
})();
