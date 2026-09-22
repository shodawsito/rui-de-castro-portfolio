import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homePage, projectPage, projectsPage } from './render.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'src');
const output = join(root, 'dist');
const projectsDirectory = join(source, 'content', 'projects');

const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

function validateProject(project, filename, slugs) {
  const where = `src/content/projects/${filename}`;
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug ?? ''), `${where}: invalid slug`);
  assert(!slugs.has(project.slug), `${where}: duplicate slug ${project.slug}`);
  slugs.add(project.slug);
  assert(['draft', 'published'].includes(project.status), `${where}: status must be draft or published`);
  assert(Number.isInteger(project.displayOrder) && project.displayOrder >= 0, `${where}: displayOrder must be a nonnegative integer`);
  assert(project.featuredRank == null || (Number.isInteger(project.featuredRank) && project.featuredRank > 0), `${where}: featuredRank must be a positive integer`);
  for (const key of ['title', 'summary', 'liveUrl']) assert(isText(project[key]), `${where}: missing ${key}`);
  assert(/^https:\/\//.test(project.liveUrl), `${where}: liveUrl must use HTTPS`);
  assert(project.image && /^\/assets\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|svg)$/.test(project.image.src ?? ''), `${where}: invalid image.src`);
  assert(Number.isInteger(project.image.width) && project.image.width > 0, `${where}: invalid image.width`);
  assert(Number.isInteger(project.image.height) && project.image.height > 0, `${where}: invalid image.height`);
  for (const key of ['cardAlt', 'caseAlt', 'caption']) assert(isText(project.image[key]), `${where}: missing image.${key}`);
  assert(isText(project.card?.version) && Array.isArray(project.card.tags) && Array.isArray(project.card.facts), `${where}: invalid card`);
  assert(isText(project.seo?.title) && isText(project.seo?.description), `${where}: missing SEO fields`);
  assert(isText(project.case?.eyebrow) && isText(project.case?.deck) && Array.isArray(project.case?.summary), `${where}: invalid case introduction`);
  assert(Array.isArray(project.case.sections) && project.case.sections.length > 0, `${where}: case must have sections`);
  const ids = new Set();
  for (const section of project.case.sections) {
    assert(/^[a-z0-9-]+$/.test(section.id ?? '') && !ids.has(section.id), `${where}: invalid or duplicate section id`);
    ids.add(section.id);
    assert(isText(section.label) && isText(section.heading) && Array.isArray(section.blocks), `${where}: invalid section ${section.id}`);
  }
  assert(ids.has('arquitectura'), `${where}: case navigation expects an arquitectura section`);
}

async function build() {
  const site = await readJson(join(source, 'content', 'site.es.json'));
  assert(isText(site.siteUrl) && /^https:\/\//.test(site.siteUrl), 'site.es.json: siteUrl must use HTTPS');
  const files = (await readdir(projectsDirectory)).filter((name) => name.endsWith('.es.json')).sort();
  const slugs = new Set();
  const allProjects = [];
  for (const filename of files) {
    const project = await readJson(join(projectsDirectory, filename));
    validateProject(project, filename, slugs);
    assert(filename === `${project.slug}.es.json`, `${filename}: filename must match slug`);
    await stat(join(source, project.image.src.slice(1)));
    allProjects.push(project);
  }
  const published = allProjects.filter((project) => project.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder || b.year - a.year || a.title.localeCompare(b.title, 'es'));
  const featured = published.filter((project) => project.featuredRank != null)
    .sort((a, b) => a.featuredRank - b.featuredRank || a.displayOrder - b.displayOrder);

  // Guard the generated directory before removing stale pages from earlier builds.
  assert(dirname(output) === root && output === resolve(root, 'dist') && output.startsWith(root + sep), 'Unsafe output directory');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(join(source, 'assets'), join(output, 'assets'), { recursive: true });
  await cp(join(source, 'styles.css'), join(output, 'styles.css'));
  await cp(join(source, 'menu.js'), join(output, 'menu.js'));
  await writeFile(join(output, 'index.html'), homePage(site, featured));
  await mkdir(join(output, 'proyectos'), { recursive: true });
  await writeFile(join(output, 'proyectos', 'index.html'), projectsPage(site, published));
  for (const [index, project] of published.entries()) {
    const directory = join(output, 'proyectos', project.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), projectPage(site, project, published[index + 1]));
  }
  process.stdout.write(`Built ${published.length} project pages and the catalogue in dist/\n`);
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
