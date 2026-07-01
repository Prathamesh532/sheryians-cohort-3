async function loadTasks() {
  const response = await fetch('/task-hub.config.json');
  if (!response.ok) {
    throw new Error('Unable to load task-hub.config.json');
  }
  return response.json();
}

function taskUrl(taskSlug, designSlug) {
  return `/tasks/${taskSlug}/${designSlug}/`;
}

function createDesignRow(task, design) {
  const row = document.createElement('div');
  row.className = 'design-row';

  const title = document.createElement('div');
  title.className = 'design-title';
  title.textContent = design.title;

  const open = document.createElement('a');
  open.className = 'task-link';
  open.href = taskUrl(task.slug, design.slug);
  open.textContent = 'Open';

  const copy = document.createElement('button');
  copy.className = 'copy-link';
  copy.type = 'button';
  copy.textContent = 'Copy link';
  copy.addEventListener('click', async () => {
    const absoluteUrl = new URL(open.getAttribute('href'), window.location.origin).href;
    await navigator.clipboard.writeText(absoluteUrl);
    copy.textContent = 'Copied';
    window.setTimeout(() => {
      copy.textContent = 'Copy link';
    }, 1400);
  });

  row.append(title, open, copy);
  return row;
}

function createTaskCard(task) {
  const card = document.createElement('article');
  card.className = 'task-card';

  const summary = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = task.title;
  const description = document.createElement('p');
  description.textContent = task.description || `${task.designs.length} design link${task.designs.length === 1 ? '' : 's'}`;
  summary.append(title, description);

  const designs = document.createElement('div');
  designs.className = 'design-grid';
  task.designs.forEach((design) => {
    designs.append(createDesignRow(task, design));
  });

  card.append(summary, designs);
  return card;
}

loadTasks()
  .then((config) => {
    document.title = config.siteTitle || 'Task Hub';
    document.querySelector('h1').textContent = config.siteTitle || 'Task Hub';
    const list = document.querySelector('.task-list');
    config.tasks.forEach((task) => {
      list.append(createTaskCard(task));
    });
  })
  .catch((error) => {
    const list = document.querySelector('.task-list');
    list.textContent = error.message;
  });
