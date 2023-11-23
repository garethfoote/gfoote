---
share: true
feed: true
category: _notes
topics:
  - Accessibility
date: 2023-09-23
---



Exploring options for documenting designs and tracking design changes. 

**Notes and takeaways**
- Currently we are missing error state content in a lot of places
- Some accessbility documentation also: focus order, landmarks, document announced content.
- How do we make use of user flows and *screen flows*? 

A lot of this is lifted from the [excellent article by Stefanie Walter](https://stephaniewalter.design/blog/a-designers-guide-to-documenting-accessibility-user-interactions/). 

# Accessibility Documentation
What design, content or interaction elements are at risk of being lost or forgotten between ux, design and dev.

- HTML title of the page
- Landmarks
	- Example from [Figma Plugin for accessibility annotations](https://www.figma.com/community/file/984136149483735147)
	- ![[Screenshot 2022-10-10 at 12.12.16.png|Screenshot 2022-10-10 at 12.12.16.png]]
- HTML headings in the page
- Focus order at page level
	- Example from [Figma Plugin for accessibility annotations](https://www.figma.com/community/file/984136149483735147)
	- ![[Screenshot 2022-10-10 at 12.12.28.png|Screenshot 2022-10-10 at 12.12.28.png]]
- Documenting Announced Content and Markup
	- What should assisstive technology announce? 
	- An example is the green tick being used in TDR metadata to indicate existing metadata

# General Documentation
## Component level documentation (GDS)

Thankfully the [Gov Design System](https://design-system.service.gov.uk/) takes care of the component level documentation unless we are creating our own components, for example the tree view. It should cover:
- State changes
- User interactions
- Accessibility
- ~~Detailed design spec~ ~ 
	- This should be readable from design files or coded prototype

> [!INFO]
> See [[#Examples| > Examples]] for how a dropdown component could be documented.


## User flows and screen flows

> **User flows** (on the left) are kind of “step by step” boxes and arrow graphs that document how someone accomplishes a task. They list **pages**, views, branchings, … They are usually built at the beginning of the project to help plan those pages and flows.

> **Screen flows** (on the right) are kind of the same. But instead of boxes for pages, I put the real interface mockups. I build those at the end, once we went through usability testing, refinement and have mockups. Both help the dev team understand how the user will navigate across the whole interface.

![User vs Screen flows](https://stephaniewalter.design/wp-content/uploads/2022/03/20-userflow-2.jpg)

We have been discussing creating 'Screen flows' in order to help the dev team (and other team members) understand the flow between pages. Having a macro level mapping of this is also useful to have visibilty across pages for consistency.  

# Examples 

## Components details

This example includes interactions & keyboard navigation. 

![](https://stephaniewalter.design/wp-content/uploads/2022/03/08-interactionflow-2.jpg)

<small>[Stefanie Walter's article and talk](https://stephaniewalter.design/blog/a-designers-guide-to-documenting-accessibility-user-interactions/)</small>

## Annotations

Detailed notes on accessibility. This example is from [Karen Hawkins](https://www.behance.net/gallery/78024369/Accessibility-Annotation-Examples%20).

![Accessibility Annotation Examples - Karen Hawkins](https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/5c22d778024369.5c992c3799637.png)

<small>[Accessibility Annotations from Karen Hawkings on Behance](https://www.behance.net/gallery/78024369/Accessibility-Annotation-Examples%20)</small>

# Reading 

- [A Designer’s Guide to Documenting Accessibility & User Interactions](https://stephaniewalter.design/blog/a-designers-guide-to-documenting-accessibility-user-interactions/) 
- [How to Jira for designers](https://medium.com/designing-atlassian/how-to-jira-for-designers-e37c354aa078)
- [How to write design specifications](https://northell.design/blog/how-to-write-the-design-specifications-quick-guide)
- [Using Jira as a research repo](https://uxdesign.cc/using-jira-as-a-research-repository-pros-cons-and-how-to-eb112936c1e8)
- [Why and how we create design histories - DfE Digital, Data and Technology](https://dfedigital.blog.gov.uk/2020/09/01/design-history/)