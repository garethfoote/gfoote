---
title: UX Pattern -  Tree View
share: true
feed: true
category: Notes
topics:
  - Accessibility
---


## Examples
[MDN Web Docs - ARIA: tree role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role) 
> An example of a `tree` is a file system selection user interface: a tree view displaying folders and files. Folder items can be expanded to reveal the contents of the folder — which may be files, folders, or both — and collapsed, hiding its contents.


[Deque University - Tree View example](https://dequeuniversity.com/library/aria/tree-view)
> Tree view is a hierarchical structure with parent and child nodes that can expand and collapse. Tree views on the web are not common, but they do exist, often to represent a file system or other similar structure of folders and files.


[ARIA Authoring Practices Guide (APG) - Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
[ARIA Authoring Practices Guide (APG) - File Directory Treeview Example](https://www.w3.org/WAI/ARIA/apg/example-index/treeview/treeview-1/treeview-1b.html)
> [!note]
> Each of the above has a CodePen example
 
[ARIA Authoring Practices Guide (APG) - Navigation Treeview example](https://www.w3.org/WAI/ARIA/apg/example-index/treeview/treeview-navigation)
Often treeviews are used for complex nested navigation but this is not recommended
> [!danger]
> The above use of a treeview is an anti-pattern. Not the best accessibilty pattern to use. 
> "A pattern more suited for typical site navigation with expandable groups of links is the [disclosure pattern.](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)"

[PatternFly Design System (from Red Hat) - Design Guidelines for tree view](https://www.patternfly.org/2021.16/components/tree-view/design-guidelines)

## Other Links
[(Not so) Simple ARIA Tree Views and Screen Readers @# Articles @# Accessible Culture](http://accessibleculture.org/articles/2013/02/not-so-simple-aria-tree-views-and-screen-readers/) (2013)
[Bootstrap Treeview - examples & tutorial](https://mdbootstrap.com/docs/standard/plugins/tree-view/) 
[Clarity Design System - Documentation - Tree View](https://clarity.design/documentation/tree-view#checkbox-tree)

## Specific accessibility issues with VoiceOver
[Accessibility WTF: Voiceover on Mac announcing a list tree as a table? @# Christian Heilmann](https://christianheilmann.com/2021/07/28/accessibility-wtf-voiceover-on-mac-announcing-a-list-tree-as-a-table/)
