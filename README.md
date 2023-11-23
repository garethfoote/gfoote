# gfoote.me

Hat-tip to the [Jekyll Garden project](https://github.com/Jekyll-Garden/jekyll-garden.github.io), which this repo was forked from. My needs were quite different so it has diverged quite substantially. The premise remains that you publish markdown docs to Github, Jekyll converts those to HTML and are presented in Github pages. 

Other than HTML, styles ([tailwind](tailwind.config.js)), HTML and build system ([vite](vite.config.cjs)) there has been a lot of work involved in getting Jekyll to manage alt text for wiki style markdown links.

## Images and Alt Text
That extra work is mostly in `_includes/content.html`. Here is is now  possible to have a link with a different title to the filename using the wikilink alt text syntax:  
`Read more about the [projects.md|my work]`

And provide custom alt text for images in the same way:
`[project 1.png|Screenshot of an interface]`
