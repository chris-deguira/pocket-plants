# Contributing

Contributions of plants, fixes, and wording improvements are welcome.

## Preview the site locally

The site is plain HTML, so no build step is needed. Open `index.html` in a browser. All links are relative, so the pages work when opened straight from disk.

## Workflow

1. Open an issue, or comment on an existing one, to describe the change.
2. Create a branch from `main` with a short descriptive name.
3. Make the change and run the check:

   ```bash
   node scripts/check-site.mjs
   ```

4. Open a pull request using the template and link the issue.
5. Wait for the Site check to pass and for a review before merging.

## Adding a plant

1. Copy an existing plant card in `plants.html` and edit the text, keeping the `data-name`, `data-light`, and `data-pets` attributes up to date.
2. Add an SVG illustration to `assets/` and give the image descriptive alt text.
3. Add a row to the table and an option to the planner in `care.html`.

## Rules the check enforces

| Rule | Reason |
|------|--------|
| Every page has a `lang` attribute and a `<title>` | Screen readers and browser tabs depend on them |
| Every image has an `alt` attribute | Images need a text alternative |
| Every local link points to a file that exists | Broken links are the most common site problem |
| Links are relative, not absolute | A link such as `/plants.html` breaks on a project site served from `/REPO-NAME/` |
