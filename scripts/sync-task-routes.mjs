import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'task-hub.config.json');
const outputRoot = path.join(root, 'tasks');
const ignoredNames = new Set(['.git', '.vercel', 'node_modules', 'tasks']);

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function emptyDir(target) {
  await fs.rm(target, { force: true, recursive: true });
  await fs.mkdir(target, { recursive: true });
}

async function copyDir(source, destination) {
  const entries = await fs.readdir(source, { withFileTypes: true });
  await fs.mkdir(destination, { recursive: true });

  await Promise.all(entries.map(async (entry) => {
    if (ignoredNames.has(entry.name)) return;

    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDir(from, to);
      return;
    }

    if (entry.isFile()) {
      await fs.copyFile(from, to);
    }
  }));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function overviewHtml(siteTitle, task) {
  const links = task.designs.map((design) => `
          <a class="design-link" href="./${escapeHtml(design.slug)}/">
            <span>${escapeHtml(design.title)}</span>
            <strong>Open</strong>
          </a>`).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(task.title)} | ${escapeHtml(siteTitle)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background: #f7f8fb;
        color: #17202a;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main { width: min(900px, calc(100% - 32px)); margin: 0 auto; padding: 42px 0; }
      a { color: inherit; text-decoration: none; }
      .back { color: #116466; font-weight: 800; }
      h1 { margin: 26px 0 10px; font-size: clamp(2rem, 6vw, 4rem); line-height: 1; letter-spacing: 0; }
      p { max-width: 680px; margin: 0 0 28px; color: #5d6673; line-height: 1.6; }
      .designs { display: grid; gap: 12px; }
      .design-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px;
        border: 1px solid #dde3ea;
        border-radius: 8px;
        background: #ffffff;
      }
      .design-link span { min-width: 0; overflow-wrap: anywhere; font-weight: 800; }
      .design-link strong { color: #116466; }
      @media (max-width: 560px) {
        .design-link { align-items: flex-start; flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <main>
      <a class="back" href="/">Back to hub</a>
      <h1>${escapeHtml(task.title)}</h1>
      <p>${escapeHtml(task.description || 'Design links for this task.')}</p>
      <section class="designs" aria-label="Designs">${links}
      </section>
    </main>
  </body>
</html>
`;
}

async function main() {
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  await emptyDir(outputRoot);

  for (const task of config.tasks) {
    const taskDir = path.join(outputRoot, task.slug);
    await fs.mkdir(taskDir, { recursive: true });
    await fs.writeFile(path.join(taskDir, 'index.html'), overviewHtml(config.siteTitle || 'Task Hub', task));

    for (const design of task.designs) {
      const source = path.resolve(root, design.source);
      const destination = path.join(taskDir, design.slug);

      if (!(await exists(source))) {
        throw new Error(`Missing source for ${task.title} / ${design.title}: ${design.source}`);
      }

      await emptyDir(destination);
      await copyDir(source, destination);
    }
  }

  console.log(`Generated ${config.tasks.length} task route folder${config.tasks.length === 1 ? '' : 's'} in ${path.relative(root, outputRoot)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
