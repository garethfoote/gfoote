---
share: true
homepage: true
category: _writing
date: 2023-03-01
topics:
  - Interaction Design
  - Accessibility
  - Gov.uk
hidden:
  - Case Studies for GDS (Jan 2024)
types:
  - Case Study
---


![[Choose a file 1.png@#The Tree View component created for The National Archives]]

This is a case study explaining the context in which the Tree View component was designed and built, whilst working as a designer for The National Archives.

## Background and context

In digital archiving there are various scenarios that require the presentation of a hierarchical file structure to the user. For digital records the preservation of the original folder and file structure is an important way of retaining meaningful context. This adheres to the principles of preservation and helps to make the documents more accessible for future use. 

When a consignment of digital files is being uploaded through our UI we need to present the original folder and file structure back to the user. We discovered how important this was during a workshop I facilitated. Working with user research and interviews with front-stage staff we devised some Jobs to be Done stories that emphasised the importance of reviewing and easily navigating folders and files. 

![[Designing a file browsing component-20240106125938620.png@#Jobs to be Done stories]]


There are many ways to design an interface to accomplish this. During the preparation for this design task we discussed and experimented with two:  
1. **One folder per page:**<br>First, presenting only the root directory, which may consist of files and more folders. Each time a user selects a directory a new page is loaded showing the content of the new folder. We only ever show the content of one folder at a time. 
2. **The Tree View:**<br>Presenting all the files in a nested 'tree view' with collapsible and expandable folders, so that files in different folders can be seen in one view.

There are positives and negatives to both options to do with accessibility, efficiency, and complexity.  

## UX Research
Both Finder (macOS) and File Explorer (Windows) have been dealing with the UX of file management for a long time. They make multiple options for file exploration available and configurable to the user, including tree, column and single page views. It was useful to assess how the UI design pattern works in an operating system since this is a familiar method for most people to manipulate and explore files and folders. 

![[attachments/Screenshot 2023-09-12 at 08.54.19.png@#attachments/Screenshot 2023-09-12 at 08.54.19.png]]

Other examples where working with files is prevalent is cloud storage services, such as Dropbox and Google Drive. In each of them there is a similar set of configurable options between single page and tree view presentations. 

## User needs & decisions
User research led us to believe that users could often be browsing deeply nested folder structures. The 'one page per folder' option would make this challenging for a number of reasons. This *narrow view* of the consignment would make it challenging to locate oneself in the hierarchy and individual page refreshes when navigating in and out of deeply nested structures would become time-consuming and onerous. The ability to see the folders opening and closing without any delay and in one viewport also helps to keep track of their current position, which is good for the findability within the component. 

The hierarchical tree view was the UI and interaction pattern that most suited the user needs, providing a wider or macro view of the folder structure, helping with find-ability and making navigation through directories trivial.

## Design

View and copy the component in this open [Figma file](https://www.figma.com/file/Q1I8wOlOkKe5biTkXIzgIc/GDS-Tree-View?type=design&node-id=21012%3A12289&mode=design&t=mFYZ8jiYRr3z62yE-1). It is based on the [GDS Figma community file](https://www.figma.com/community/file/946837271092540314/GOV.UK-Design-System). 

<!-- 
> [!NOTE] Tidy up and publish as Figma component
> Currently the Figma file could be organised better so will return to this and make the Tree View a proper component.  
-->

The UI design leans on GDS styles and composites existing components such as radio buttons or checkboxes. The component hover and focus states were adapted, and the visual indicators for focus made much more prominent because of the detailed specifications around keyboard controls. You can see this in the [Single Select Example in Storybook](https://nationalarchives.github.io/tdr-components/?path=/story/tdr-tree-view--expand-select-and-display-selected) .

![[attachments/tree-view-zoomed-single-select.png@#attachments/tree-view-zoomed-single-select.png]]

Other differentiated visual states included showing relationships between the active child and the parent directories and indeterminate checkbox states, for scenarios when multi-select. This can be seen below and in the [Multi-select example in Storybook](https://nationalarchives.github.io/tdr-components/?path=/story/tdr-tree-view--multiple-select-child-sets-parent-to-indeterminate).

![[attachments/tree-view-zoomed-multi-select 3.png@#attachments/tree-view-zoomed-multi-select 3.png]]

More than in most of my previous work the devil was in the details of fine-grained interactions and visual states supporting accessibility. The relevant WCAG rules were [Non-text Contrast (1.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) and [Focus Appearance (2.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).

## Tree View pattern
The common design pattern for this type of display and interaction is conveniently called the 'tree view'. This has an equivalent [ARIA role](https://www.w3.org/TR/2017/REC-wai-aria-1.1-20171214/#tree) and implementation guidance from [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/), [Mozilla Developer Network (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role) and various design systems.

<!-- See more 
[[UX Pattern - Tree view@#UX research on the Tree View]].
-->

The ARIA Authoring Practices Guide contains detailed specifications about ARIA roles, states and properties, which need to be implemented. It also lists a very detailed keyboard control specification, which can be [seen and tested in this Storybook example](https://nationalarchives.github.io/tdr-components/?path=/story/tdr-tree-view--keyboard-navigate-move-up-with-left-arrow).

Despite it's complex appearance the HTML for a nested set of folders is a simple nested list. Following progressive enhancement standards we would first of all render all HTML files as below. This can be styled so that when JavaScript is disabled the UI renders all folders expanded and includes a sensible presentation to indicate the hierachical relationship. 

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

With JavaScript enabled the folders are collapsed by default, all ARIA states are updated during interactions and keyboard controls are enabled.

