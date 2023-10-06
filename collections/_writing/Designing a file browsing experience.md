---
share: true
homepage: true
category: _writing
date: 2023-03-01
title: Designing a file browsing experience
topics: [Case Study, Design, Accessibility]
---

This is a case study explaining the context in which the Tree View component was designed and built, whilst working as a designer for The National Archives.

- [[Accessibility]]
- [[Weeknote 01]]
- [[Mini-briefs - Exploring datasets]]

![[attachments/Choose a file 1.png|alt text]]

## Background and context
In digital archiving there are various scenarios that require the presentation of a hierarchical file structure to the user. For digital records the preservation of the original folder and file structure is one way they are given meaning and made accessible for future use. Therefore, when a consignment of records is transferred to an archive or when they are presented back to interested parties, showing the original folder structure in a web interface is necessary.

There are many ways to design an interface to accomplish this. During the preparation for this design task we discussed and experimented with two:
1) Presenting the root directory contents. Then loading a new page each time a user requests/clicks a folder showing only that folders content. Therefore we only ever show the content of one folder at a time. 
2) Presenting all the files in a nested 'tree view' with collapsible and expandable folders.
There are positives and negatives to both options to do with accessibility, efficiency, and complexity.  

## UX Research
Both Finder (macOS) and File Explorer (Windows) have been dealing with the UX of file management for a long time. They make multiple options for file exploration available and configurable to the user, including tree, column and single page views. It was useful to assess how the UI design pattern works in an operating system since this is a familiar method for most people to manipulate and explore files and folders. 

![[attachments/Screenshot 2023-09-12 at 08.54.19.png]]Other examples where working with files is prevalent is cloud storage services, such as Dropbox and Google Drive. In each of them there is a similar set of configurable options between single page and tree view presentations. 

## User needs & decisions
User research led us to believe that users could often be browsing deeply nested folder structures. The 'one page per folder' option would make this challenging for a number of reasons. This narrow window on the files would make it challenging to locate oneself in the hierarchy and individual page refreshes when navigating in and out of deeply nested structures would become onerous. 

The hierarchical tree view was the UI and interaction pattern that most suited the users' needs, providing a wider or macro view of the folder structure, helping with find-ability and making navigation through directories trivial.

## Design

The [Figma file for this component](https://www.figma.com/file/Q1I8wOlOkKe5biTkXIzgIc/GDS-Tree-View?type=design&node-id=21012%3A12289&mode=design&t=mFYZ8jiYRr3z62yE-1) is open and based on the [GDS Figma community file](https://www.figma.com/community/file/946837271092540314/GOV.UK-Design-System). 

> [!NOTE] Tidy up and publish as Figma component
> Currently the Figma file could be organised better so will return to this and make the Tree View a proper component.  

The UI design leans on GDS styles and compositing existing components such as radio buttons or checkboxes. The component hover and focus states were adapted, and the visual indicators for focus made much more prominent because of the detailed specifications around keyboard controls.

- [Storybook single-select example](https://nationalarchives.github.io/tdr-components/?path=/story/tdr-tree-view--expand-select-and-display-selected)
- [Storybook keyboard controls example](https://nationalarchives.github.io/tdr-components/?path=/story/tdr-tree-view--keyboard-navigate-move-up-with-left-arrow)

![[attachments/tree-view-zoomed-single-select.png]]

Other differentiated visual states included showing relationships between the active child and the parent directories and indeterminate checkbox states, for scenarios when multi-select 

- [Storybook multi-select example](https://nationalarchives.github.io/tdr-components/?path=/story/tdr-tree-view--multiple-select-child-sets-parent-to-indeterminate)

![[attachments/tree-view-zoomed-multi-select 3.png]]

More than in most of my previous work the devil was in the details of fine-grained interactions and visual states supporting accessibility. The relevant WCAG rules were [Non-text Contrast (1.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) and [Focus Appearance (2.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).
## Implementation
The common design pattern for this type of display and interaction is conveniently called the 'tree view'. This has an equivalent [ARIA role](https://www.w3.org/TR/2017/REC-wai-aria-1.1-20171214/#tree) and implementation guidance from [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/), [Mozilla Developer Network (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role) and various design systems. 

See my page of [[UX Pattern - Tree view|UX research on the Tree View]].

The simplicity of the 


To achieve something like the Finder screenshot above in a web interface we would need to render all files and folders in a set of nested lists, and progressively enhance this to allow collapsing and expanding of folders. 

```html
<ul>
	<li class="dir">Cakes
		<ul>
			<li class="file">Baking powder 1999.txt</li>
			<li class="file">Baking powder 2022.txt</li>
			<li class="dir">Basics techniques</li>
		</ul>
	</li>
	<li class="file">Shopping list.txt</li>
	<li class="dir">Winter Recipes
		<ul>
			...
		</ul>
	</li>
</ul>
```

## Accessible design patterns




## GDS 


<iframe
  id="inlineFrameExample"
  title="Inline Frame Example"
  width="100%"
  height="400"
  src="https://nationalarchives.github.io/tdr-components/iframe.html?args=&id=tdr-tree-view--default-multiple&viewMode=story"
>
</iframe>


## Accessibility testing

There is a  provides a 


## Our own implementation 
[ANOTHER PAGE]

## Summary 
There are some concerns about 


