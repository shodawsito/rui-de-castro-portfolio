const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const external = (href, label, className = '') =>
  `<a${className ? ` class="${esc(className)}"` : ''} href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;

const favicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230b1018'/%3E%3Cpath d='M17 46V18h16c9 0 14 4 14 12 0 5-2 8-7 10l9 6H37l-7-6h-3v6H17Zm10-15h6c3 0 4-1 4-3s-1-3-4-3h-6v6Z' fill='%236de7d2'/%3E%3C/svg%3E`;

function page(site, { title, description, path, bodyClass = '', header, content, footer }) {
  return `<!doctype html>
<html lang="${esc(site.lang)}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${esc(description)}">
    <meta name="theme-color" content="#0b1018">
    <link rel="canonical" href="${esc(site.siteUrl + path)}">
    <title>${esc(title)}</title>
    <link rel="icon" type="image/svg+xml" href="${favicon}">
    <link rel="stylesheet" href="/styles.css">
    <script src="/menu.js" defer></script>
  </head>
  <body${bodyClass ? ` class="${esc(bodyClass)}"` : ''}>
    <a class="skip-link" href="#contenido">${esc(site.skipLink)}</a>
    ${header}
    <main id="contenido">${content}
    </main>
    ${footer}
  </body>
</html>
`;
}

function siteHeader(site, kind, project) {
  const home = kind === 'home';
  const casePage = kind === 'case';
  const navigationSection = casePage && (project.case.sections.find((section) => section.id === project.case.navigationSectionId) ?? project.case.sections[0]);
  const links = home ? [
    { href: '#proyectos', text: site.navigation.projects },
    { href: '#perfil', text: site.navigation.profile },
    { href: `mailto:${site.email}`, text: site.navigation.contact, contact: true }
  ] : casePage ? [
    { href: '/', text: site.navigation.portfolio },
    { href: `#${navigationSection.id}`, text: navigationSection.navLabel ?? navigationSection.label },
    ...(project.liveUrl ? [{ href: project.liveUrl, text: site.navigation.visitProject, contact: true, external: true }] : [])
  ] : [
    { href: '/', text: site.navigation.portfolio },
    { href: '/proyectos/', text: site.navigation.projects },
    { href: `mailto:${site.email}`, text: site.navigation.contact, contact: true }
  ];
  const renderLinks = () => links.map(({ href, text, contact, external: out }) =>
    `<a${contact ? ' class="nav-contact"' : ''} href="${esc(href)}"${out ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(text)}</a>`).join('');
  return `<header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="${esc(home ? site.brandHomeLabel : site.brandBackLabel)}">
          <span class="brand-mark" aria-hidden="true">${esc(site.brandMark)}</span>
          <span>${esc(site.name)}</span>
        </a>
        <nav class="desktop-nav" aria-label="${esc(casePage ? site.navigation.projectLabel : site.navigation.homeLabel)}">${renderLinks()}</nav>
        <details class="mobile-menu">
          <summary>${esc(site.navigation.mobileLabel)}<span aria-hidden="true">☰</span></summary>
          <nav aria-label="${esc(casePage ? site.navigation.projectLabel : site.navigation.homeLabel)}">${renderLinks()}</nav>
        </details>
      </div>
    </header>`;
}

function footerLinks(site, withEmail) {
  return `<div>${withEmail ? `<a href="mailto:${esc(site.email)}">${esc(site.footer.emailLabel)}</a>` : ''}${external(site.githubUrl, site.socialLabels.github)}${external(site.linkedinUrl, site.socialLabels.linkedin)}</div>`;
}

function siteFooter(site) {
  return `<footer id="contacto">
      <p class="footer-kicker">${esc(site.footer.contactKicker)}</p>
      <a class="footer-mail" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      <div class="footer-bottom"><p>${esc(site.footer.signature)}</p>${footerLinks(site, false)}</div>
    </footer>`;
}

function projectPath(project) { return `/proyectos/${project.slug}/`; }

function projectCard(site, project) {
  const path = projectPath(project);
  return `<article class="project-card">
          <a class="project-visual" href="${path}" aria-label="${esc(site.projectLabels.viewCaseLabel + ' ' + project.title)}">
            <img src="${esc(project.image.src)}" alt="${esc(project.image.cardAlt)}" width="${project.image.width}" height="${project.image.height}" loading="lazy">
            <span class="project-version">${esc(project.card.version)}</span>
          </a>
          <div class="project-copy">
            <div class="project-meta">${project.card.tags.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>
            <h3>${esc(project.title)}</h3>
            <p>${esc(project.summary)}</p>
            <dl class="project-facts">${project.card.facts.map((fact) => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join('')}</dl>
            <a class="text-link" href="${path}">${esc(site.projectLabels.readCase)} <span aria-hidden="true">→</span></a>
          </div>
        </article>`;
}

export function homePage(site, featured) {
  const h = site.home;
  const noteLines = h.focusLines.map(esc).join('<br>');
  const principles = h.principles.map((item, index) =>
    `<article><span>${String(index + 1).padStart(2, '0')}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></article>`).join('');
  const projectCards = featured.length ? featured.map((project) => projectCard(site, project)).join('') : `<p>${esc(h.noFeaturedProjects)}</p>`;
  return page(site, {
    title: site.seo.homeTitle, description: site.seo.homeDescription, path: '/',
    header: siteHeader(site, 'home'), footer: siteFooter(site),
    content: `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow"><span></span>${esc(h.heroEyebrow)}</p>
          <h1 id="hero-title">${esc(h.heroTitle)}<br><em>${esc(h.heroHighlight)}</em></h1>
          <p class="hero-intro">${esc(h.heroIntro)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#proyectos">${esc(h.viewProjects)} <span aria-hidden="true">↘</span></a>
            ${external(site.linkedinUrl, site.socialLabels.linkedin, 'button button-quiet')}
          </div>
        </div>
        <aside class="hero-note" aria-label="${esc(h.heroNoteLabel)}">
          <div class="note-index">01</div>
          <p class="note-label">${esc(h.currentLabel)}</p>
          <p class="note-value">${esc(h.currentValue)}</p>
          <div class="note-rule"></div>
          <p class="note-label">${esc(h.focusLabel)}</p>
          <p class="note-value">${noteLines}</p>
        </aside>
      </section>
      <section class="projects" id="proyectos" aria-labelledby="projects-title">
        <div class="section-heading"><p class="section-number">${esc(h.projectEyebrow)}</p><h2 id="projects-title">${esc(featured.length === 1 ? h.projectHeadingSingle : h.projectHeadingMultiple)}</h2></div>
        <div class="projects-list">${projectCards}</div>
        <a class="text-link catalog-link" href="/proyectos/">${esc(h.viewAllProjects)} <span aria-hidden="true">→</span></a>
      </section>
      <section class="profile" id="perfil" aria-labelledby="profile-title">
        <div class="section-heading"><p class="section-number">${esc(h.profileEyebrow)}</p><h2 id="profile-title">${esc(h.profileHeading)}</h2></div>
        <div class="profile-grid">
          <p class="profile-lead">${esc(h.profileIntro)}</p>
          <div class="principles">${principles}</div>
        </div>
      </section>`
  });
}

export function projectsPage(site, projects) {
  const p = site.projectsPage;
  return page(site, {
    title: site.seo.projectsTitle, description: site.seo.projectsDescription, path: '/proyectos/',
    header: siteHeader(site, 'catalog'), footer: siteFooter(site),
    content: `
      <header class="catalog-hero">
        <a class="back-link" href="/">${esc(p.back)}</a>
        <p class="eyebrow"><span></span>${esc(p.eyebrow)}</p>
        <h1>${esc(p.heading)}</h1>
        <p class="case-deck">${esc(p.intro)}</p>
      </header>
      <section class="catalog-projects" aria-label="${esc(site.navigation.projects)}">
        <div class="projects-list">${projects.length ? projects.map((project) => projectCard(site, project)).join('') : `<p>${esc(p.empty)}</p>`}</div>
      </section>`
  });
}

function architectureNode(node, extraClass = '') {
  return `<div class="arch-node${extraClass ? ` ${extraClass}` : ''}"><span>${esc(node.label)}</span><strong>${esc(node.title)}</strong><small>${esc(node.detail)}</small></div>`;
}

function caseBlock(block) {
  switch (block.type) {
    case 'lead': return `<p class="case-lead">${esc(block.text)}</p>`;
    case 'paragraph': return `<p>${esc(block.text)}</p>`;
    case 'quote': return `<blockquote>${esc(block.text)}</blockquote>`;
    case 'subheading': return `<h3 class="subheading">${esc(block.text)}</h3>`;
    case 'cards': {
      const challenge = block.style === 'challenge';
      return `<div class="${challenge ? 'challenge-grid' : 'environment-row'}">${block.items.map((item, index) =>
        `<article><span>${String(index + 1).padStart(2, '0')}</span><h${challenge ? '3' : '4'}>${esc(item.title)}</h${challenge ? '3' : '4'}><p>${esc(item.text)}</p></article>`).join('')}</div>`;
    }
    case 'features': return `<ul class="feature-list${block.compact ? ' compact' : ''}">${block.items.map((item) =>
      `<li>${item.label ? `<strong>${esc(item.label)}</strong> ` : ''}${esc(item.text)}</li>`).join('')}</ul>`;
    case 'stats': return `<div class="quality-stats">${block.items.map((item) =>
      `<div><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></div>`).join('')}</div>`;
    case 'architecture': return `<div class="architecture" role="img" aria-label="${esc(block.ariaLabel)}">
      ${architectureNode(block.entry, 'arch-entry')}
      <div class="arch-arrow" aria-hidden="true">↓</div>
      ${architectureNode(block.core, 'arch-core')}
      <div class="arch-split" aria-hidden="true">${block.columns.map(() => '<i></i>').join('')}</div>
      <div class="arch-columns">${block.columns.map((node) => architectureNode(node)).join('')}</div>
      <div class="arch-providers">${block.providers.map((name) => `<span>${esc(name)}</span>`).join('')}</div>
    </div>`;
    default: throw new Error(`Unknown case block: ${block.type}`);
  }
}

function caseSection(section, index, last, site, project) {
  const actions = last ? `<div class="case-actions">
      ${project.liveUrl ? external(project.liveUrl, site.projectLabels.visitProjectFull.replace('{title}', project.title), 'button button-primary') : ''}
      <a class="button button-quiet" href="/">${esc(site.projectLabels.backToPortfolio)}</a>
    </div>` : '';
  return `<section id="${esc(section.id)}">
    <p class="section-number">${String(index + 1).padStart(2, '0')} / ${esc(section.label)}</p>
    <h2>${esc(section.heading)}</h2>
    ${section.blocks.map(caseBlock).join('\n')}
    ${actions}
  </section>`;
}

export function projectPage(site, project, nextProject) {
  const c = project.case;
  const summary = c.summary.map((item) => `<div><dt>${esc(item.label)}</dt><dd>${item.href ? external(item.href, item.value) : esc(item.value)}</dd></div>`).join('');
  const nextText = nextProject ? `<a href="${projectPath(nextProject)}">${esc(nextProject.title)} <span aria-hidden="true">→</span></a>` : esc(site.footer.nextPlaceholder);
  return page(site, {
    title: project.seo.title, description: project.seo.description, path: projectPath(project), bodyClass: 'case-page',
    header: siteHeader(site, 'case', project),
    footer: `<footer><p class="footer-kicker">${esc(site.footer.nextKicker)}</p><p class="next-project">${nextText}</p><div class="footer-bottom"><p>${esc(site.footer.signature)}</p>${footerLinks(site, true)}</div></footer>`,
    content: `
      <header class="case-hero">
        <a class="back-link" href="/proyectos/">${esc(site.projectLabels.backToProjects)}</a>
        <p class="eyebrow"><span></span>${esc(c.eyebrow)}</p>
        <h1>${esc(project.title)}</h1>
        <p class="case-deck">${esc(c.deck)}</p>
        <dl class="case-summary">${summary}</dl>
      </header>
      <figure class="case-cover"><img src="${esc(project.image.src)}" alt="${esc(project.image.caseAlt)}" width="${project.image.width}" height="${project.image.height}"><figcaption>${esc(project.image.caption)}</figcaption></figure>
      <div class="case-layout">
        <aside class="case-nav" aria-label="${esc(site.projectLabels.caseIndex)}"><p>${esc(site.projectLabels.caseContents)}</p><ol>${c.sections.map((section) =>
          `<li><a href="#${esc(section.id)}">${esc(section.navLabel ?? section.label)}</a></li>`).join('')}</ol></aside>
        <article class="case-content">${c.sections.map((section, index) => caseSection(section, index, index === c.sections.length - 1, site, project)).join('\n')}</article>
      </div>`
  });
}
