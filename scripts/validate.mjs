const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function text(value, where) {
  assert(isText(value), `${where}: required text is missing`);
}

function httpsUrl(value, where) {
  text(value, where);
  let url;
  try { url = new URL(value); } catch { throw new Error(`${where}: invalid URL`); }
  assert(url.protocol === 'https:' && url.hostname, `${where}: URL must use HTTPS`);
  return url;
}

function items(value, where) {
  assert(Array.isArray(value) && value.length > 0, `${where}: expected a nonempty list`);
  return value;
}

function architectureNode(node, where) {
  for (const key of ['label', 'title', 'detail']) text(node?.[key], `${where}.${key}`);
}

function validateBlock(block, where) {
  switch (block?.type) {
    case 'lead':
    case 'paragraph':
    case 'quote':
    case 'subheading':
      text(block.text, `${where}.text`);
      break;
    case 'cards':
      assert(['challenge', 'environment'].includes(block.style), `${where}: invalid card style`);
      items(block.items, `${where}.items`).forEach((item, index) => {
        text(item?.title, `${where}.items[${index}].title`);
        text(item?.text, `${where}.items[${index}].text`);
      });
      break;
    case 'features':
      items(block.items, `${where}.items`).forEach((item, index) => {
        text(item?.text, `${where}.items[${index}].text`);
        if (item?.label != null) text(item.label, `${where}.items[${index}].label`);
      });
      break;
    case 'stats':
      items(block.items, `${where}.items`).forEach((item, index) => {
        text(item?.value, `${where}.items[${index}].value`);
        text(item?.label, `${where}.items[${index}].label`);
      });
      break;
    case 'architecture':
      text(block.ariaLabel, `${where}.ariaLabel`);
      architectureNode(block.entry, `${where}.entry`);
      architectureNode(block.core, `${where}.core`);
      assert(Array.isArray(block.columns) && block.columns.length === 3, `${where}: architecture requires three columns`);
      block.columns.forEach((node, index) => architectureNode(node, `${where}.columns[${index}]`));
      items(block.providers, `${where}.providers`).forEach((provider, index) => text(provider, `${where}.providers[${index}]`));
      break;
    default:
      throw new Error(`${where}: unknown block type ${block?.type}`);
  }
}

export function validateSite(site) {
  const url = httpsUrl(site?.siteUrl, 'site.es.json: siteUrl');
  assert(site.siteUrl === url.origin, 'site.es.json: siteUrl must be the origin without a trailing /');
}

export function validateProject(project, filename, slugs) {
  const where = `src/content/projects/${filename}`;
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project?.slug ?? ''), `${where}: invalid slug`);
  assert(!slugs.has(project.slug), `${where}: duplicate slug ${project.slug}`);
  slugs.add(project.slug);
  assert(['draft', 'published'].includes(project.status), `${where}: status must be draft or published`);
  assert(Number.isInteger(project.displayOrder) && project.displayOrder >= 0, `${where}: displayOrder must be a nonnegative integer`);
  assert(Number.isInteger(project.year) && project.year > 0, `${where}: invalid year`);
  assert(project.featuredRank == null || (Number.isInteger(project.featuredRank) && project.featuredRank > 0), `${where}: featuredRank must be a positive integer`);
  text(project.title, `${where}.title`);
  text(project.summary, `${where}.summary`);
  if (project.liveUrl != null) httpsUrl(project.liveUrl, `${where}.liveUrl`);
  assert(/^\/assets\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|svg)$/.test(project.image?.src ?? ''), `${where}: invalid image.src`);
  assert(Number.isInteger(project.image.width) && project.image.width > 0, `${where}: invalid image.width`);
  assert(Number.isInteger(project.image.height) && project.image.height > 0, `${where}: invalid image.height`);
  for (const key of ['cardAlt', 'caseAlt', 'caption']) text(project.image[key], `${where}.image.${key}`);
  text(project.card?.version, `${where}.card.version`);
  items(project.card?.tags, `${where}.card.tags`).forEach((tag, index) => text(tag, `${where}.card.tags[${index}]`));
  items(project.card?.facts, `${where}.card.facts`).forEach((fact, index) => {
    text(fact?.label, `${where}.card.facts[${index}].label`);
    text(fact?.value, `${where}.card.facts[${index}].value`);
  });
  text(project.seo?.title, `${where}.seo.title`);
  text(project.seo?.description, `${where}.seo.description`);
  text(project.case?.eyebrow, `${where}.case.eyebrow`);
  text(project.case?.deck, `${where}.case.deck`);
  items(project.case?.summary, `${where}.case.summary`).forEach((item, index) => {
    text(item?.label, `${where}.case.summary[${index}].label`);
    text(item?.value, `${where}.case.summary[${index}].value`);
    if (item.href != null) httpsUrl(item.href, `${where}.case.summary[${index}].href`);
  });
  const ids = new Set();
  items(project.case?.sections, `${where}.case.sections`).forEach((section, index) => {
    const sectionWhere = `${where}.case.sections[${index}]`;
    assert(/^[a-z0-9-]+$/.test(section?.id ?? '') && !ids.has(section.id), `${sectionWhere}: invalid or duplicate id`);
    ids.add(section.id);
    text(section.label, `${sectionWhere}.label`);
    text(section.heading, `${sectionWhere}.heading`);
    if (section.navLabel != null) text(section.navLabel, `${sectionWhere}.navLabel`);
    items(section.blocks, `${sectionWhere}.blocks`).forEach((block, blockIndex) => validateBlock(block, `${sectionWhere}.blocks[${blockIndex}]`));
  });
  if (project.case.navigationSectionId != null) {
    assert(ids.has(project.case.navigationSectionId), `${where}: navigationSectionId must match a case section`);
  }
}
