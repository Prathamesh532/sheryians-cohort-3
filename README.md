# Task Hub

One Vercel deployment can host many assignments and design variants.

## Local URLs

After running the build, tasks are available at clean paths:

```text
/tasks/a1/
/tasks/a1/design-1/
/tasks/a2/design-1/
/tasks/a5/design-1/
```

The root page lists every task from `task-hub.config.json`.

## Add A New HTML/CSS/JS Task

1. Add the task folder at the project root.
2. Add it to `task-hub.config.json`.
3. Run:

```bash
npm run build
```

Example:

```json
{
  "title": "A3 - Assignment Three",
  "slug": "a3",
  "description": "Short task description.",
  "designs": [
    {
      "title": "Design 1",
      "slug": "design-1",
      "source": "A3 - Assignment Three/design 1"
    },
    {
      "title": "Design 2",
      "slug": "design-2",
      "source": "A3 - Assignment Three/design 2"
    }
  ]
}
```

## Add A React/Vite Task

Build the React project first, then point `source` to its static output folder:

```json
{
  "title": "A4 - React Task",
  "slug": "a4",
  "description": "React task.",
  "designs": [
    {
      "title": "Design 1",
      "slug": "design-1",
      "source": "A4 - React Task/dist"
    }
  ]
}
```

For Vite apps that will live under `/tasks/a4/design-1/`, set the Vite `base` config to that same path before building.

## Deploy To Vercel

Create one Vercel project from this repository. Vercel will run:

```bash
npm run build
```

Then share one hub link, or share direct links to individual designs.
