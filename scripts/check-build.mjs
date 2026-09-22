import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'src', 'content', 'projects');
const fixturePath = join(source, 'roadmap-check.es.json');
const output = join(root, 'dist');
const build = () => execFileSync(process.execPath, [join(root, 'scripts', 'build.mjs')], { cwd: root, stdio: 'pipe' });
const readOutput = (path) => readFile(join(output, path), 'utf8');

let created = false;
try {
  const project = JSON.parse(await readFile(join(source, 'avoid-guild-web.es.json'), 'utf8'));
  project.slug = 'roadmap-check';
  project.title = 'Roadmap check';
  project.displayOrder = 2;
  project.featuredRank = 2;
  project.seo.title = 'Roadmap check';
  await writeFile(fixturePath, JSON.stringify(project), { flag: 'wx' });
  created = true;

  build();
  const home = await readOutput('index.html');
  const catalogue = await readOutput(join('proyectos', 'index.html'));
  const firstCase = await readOutput(join('proyectos', 'avoid-guild-web', 'index.html'));
  assert(home.indexOf('/proyectos/avoid-guild-web/') < home.indexOf('/proyectos/roadmap-check/'));
  assert(catalogue.indexOf('/proyectos/avoid-guild-web/') < catalogue.indexOf('/proyectos/roadmap-check/'));
  assert(firstCase.includes('href="/proyectos/roadmap-check/"'));
  assert((await readOutput(join('proyectos', 'roadmap-check', 'index.html'))).includes('<h1>Roadmap check</h1>'));

  project.status = 'draft';
  await writeFile(fixturePath, JSON.stringify(project));
  build();
  assert(!(await readOutput('index.html')).includes('/proyectos/roadmap-check/'));
  assert(!(await readOutput(join('proyectos', 'index.html'))).includes('/proyectos/roadmap-check/'));
  process.stdout.write('Project ordering, case generation and draft filtering passed.\n');
} finally {
  if (created) await rm(fixturePath);
  build();
}
