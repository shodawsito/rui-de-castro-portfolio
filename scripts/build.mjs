import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homePage, projectPage, projectsPage } from './render.mjs';
import { validateProject, validateSite } from './validate.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'src');
const output = join(root, 'dist');
const projectsDirectory = join(source, 'content', 'projects');

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

async function build() {
  const site = await readJson(join(source, 'content', 'site.es.json'));
  validateSite(site);
  const files = (await readdir(projectsDirectory)).filter((name) => name.endsWith('.es.json')).sort();
  const slugs = new Set();
  const allProjects = [];
  for (const filename of files) {
    const project = await readJson(join(projectsDirectory, filename));
    validateProject(project, filename, slugs);
    assert(filename === `${project.slug}.es.json`, `${filename}: filename must match slug`);
    assert((await stat(join(source, project.image.src.slice(1)))).isFile(), `${filename}: image.src must point to a file`);
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
