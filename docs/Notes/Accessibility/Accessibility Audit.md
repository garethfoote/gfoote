---
share: true
category: Notes/Accessibility
title: Audits
---

- [A Definitive Guide On How To Perform A Web Accessibility Audit • DigitalA11Y](https://www.digitala11y.com/a-definitive-guide-on-how-to-perform-a-web-accessibility-audit/)

---


- [GitHub - dequelabs/axe-core: Accessibility engine for automated Web UI testing](https://github.com/dequelabs/axe-core)
- [axe Browser Extensions for Accessibility Testing | Deque](https://www.deque.com/axe/browser-extensions/)
	- [Chrome Web Store - Extensions](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)


Berkley DIY Accessibility Checklist
- [DIY Accessibility Checklists | Web Access](https://webaccess.berkeley.edu/evaluating-your-site/diy-accessibility-checklists)
- [DIY Accessibility Checklist for Web Developers and Content Creators - Google Sheets](https://docs.google.com/spreadsheets/d/1oL4HyTr2EibU2eaNsymFWwO4pu36zbFAGzbdH186t1U/edit#gid=1428302354)

WebAIM
- [WAVE Web Accessibility Evaluation Tools](https://wave.webaim.org/)
- [WebAIM: Quick Reference - Testing Web Content for Accessibility](https://webaim.org/resources/evalquickref/)
- [WebAIM: WebAIM's **WCAG 2** Checklist](https://webaim.org/standards/wcag/checklist)

Automated
 - AXE
 - WAVE
 - Google Lighthouse

# Resources
- [How I do an accessibility check -- A11ycasts #11 - YouTube](https://www.youtube.com/watch?v=cOmehxAU_4s)
- [How to do an accessibility audit](https://inviqa.com/blog/accessibility-audits-how-do-quick-and-dirty-audit)


# Checklist 

## Content
- Alt text on images
- `<h1>`  is only used once and relates correctly to page title
- Decent heading structure
- Do not skip heading levels
- Unique and descriptive links
- Tables for tabular data

## Keyboard
- Repetitive content can be skipped using the keyboard only.
	- Skip to main content
- All interactive elements can be used with the keyboard only.
- Tab key works in both directions.
- Keyboard focus is always visible.
- All instances of hover effects (highlight, custom tooltip, etc) also have an equivalent effect for keyboard focus.
- Hidden content is not in the tab order
- The keyboard focus order should match the logical reading order of the page.
- Increase browser zoom until you hit a responsive breakpoint, and verify the above items again.

## Screen Reader
- [How I do an accessibility check -- A11ycasts #11 - YouTube](https://www.youtube.com/watch?v=cOmehxAU_4s)