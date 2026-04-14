# gfoote.me

Local development for this repo is expected to run in WSL rather than native Windows.

Hat-tip to the [Jekyll Garden project](https://github.com/Jekyll-Garden/jekyll-garden.github.io), which this repo was forked from. My needs were quite different so it has diverged quite substantially. The premise remains that you publish markdown docs to Github, Jekyll converts those to HTML and are presented in Github pages. 

I'm using the [Obsidian Github Publisher](https://github.com/ObsidianPublisher/) plugin to get documents selectively into Github.

Other than HTML, styles ([tailwind](tailwind.config.js)), HTML and build system ([vite](vite.config.cjs)) there has been a lot of work involved in getting Jekyll to manage alt text for wiki style markdown links:

## Images and Alt Text
That extra work is mostly in `_includes/content.html`. It is now  possible to have a link with a different title to the filename using the wikilink alt text syntax:  
`Read more about the [projects.md|my work]`

And provide custom alt text for images in the same way:
`[project 1.png|Screenshot of an interface]`

## Publishing flow

The publishing goal is still the same: write in Obsidian, publish with the Obsidian GitHub Publisher plugin, and let GitHub Pages do the rest without any manual intermediate step.

To keep that workflow intact while avoiding brittle Liquid parsing, the repo now includes a Node build script at [`scripts/prepare-jekyll-build.mjs`](scripts/prepare-jekyll-build.mjs). It creates a generated build copy in `.obsidian-build/`, rewrites Obsidian-style wikilinks and attachment embeds into standard Markdown/HTML, and generates backlink data before Jekyll runs. The source notes are left untouched.

This is intended to run automatically in GitHub Actions on push to `main`, so the transform is part of deployment rather than a manual authoring step.

The script accepts both the plugin-converted `@#` delimiter and normal Obsidian `|` aliases, so the extra text replacer rule in Obsidian GitHub Publisher can be removed once the build-side transform is in place.


## Running project

Two scripts need to be running for local development. One for Jekyll and the other for the Typescript compilation and Vite for tailwind. This could probably be consolidated, but 🤷  

**Jekyll**  
```
bundle exec jekyll serve --host=0.0.0.0
```

**Typescript & Vite**  
```
npm run dev
```

## Local development with WSL

The most reliable local setup for this repo is to run it in WSL rather than native Windows Ruby.

Recommended working copy:
`/home/micro/projects/gfoote-linux`

Open that folder in VS Code using the WSL extension, or from Ubuntu run:

```bash
cd ~/projects/gfoote-linux
code .
```

In the VS Code terminal, start the local environment with:

```bash
cd ~/projects/gfoote-linux
PATH=/usr/local/bin:/usr/bin:/bin npm run build
npm run build:content
/usr/local/bin/bundle exec jekyll serve --source .obsidian-build --destination .obsidian-build/_site --host 127.0.0.1 --livereload
```

Or use the helper script from the WSL copy:

```bash
cd ~/projects/gfoote-linux
bash scripts/dev-wsl.sh
```

Then open:

```text
http://127.0.0.1:4000
```

Notes:
- `npm run build:content` creates the generated `.obsidian-build/` copy that Jekyll serves from.
- `npm run dev:content` watches markdown, layouts, includes, and config files and regenerates `.obsidian-build/`.
- `127.0.0.1:4000` is the site URL. The LiveReload port shown in terminal is not the page URL.
- `scripts/dev-wsl.sh` does a one-way sync from the Windows repo into the WSL copy before starting the dev environment.
- Rerunning that script will overwrite overlapping files in the WSL copy with whatever is currently in the Windows repo.

