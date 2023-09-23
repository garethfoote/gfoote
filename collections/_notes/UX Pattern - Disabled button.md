---
title: Disabling a button
category: _notes
share: true
---

- [Axess Lab | Disabled buttons suck](https://axesslab.com/disabled-buttons-suck/)
- [Aria-disabled | Introduction to Accessibility](https://a11y-101.com/development/aria-disabled)
- [Making Disabled Buttons More Inclusive | CSS-Tricks - CSS-Tricks](https://css-tricks.com/making-disabled-buttons-more-inclusive/)

The general consensus advise is about using `aria-disabled` instead of `disabled` property. This is because `disabled` means the button isn’t a focusable interactive element that can be accessed via tabbing. This means a keyboard only user who is using the tab to navigate won't realise there is any button there. Screen readers do have other keyboard controls that go through each piece of content 1 by 1 (buttons, paragraphs, whatever) and therefore it is still possible to access the button in this way. 

A problem with removing the `disabled` attribute is that the button action is no longer prevented (i.e. clicking it will still submit a form). `aria-disabled` alone does not prevent the button being clicked.  

There are a few suggested solutions:
- Do not use disabled buttons at all
	- in our use case it's a backend process the user has to wait for. We could therefore show the button only when that has finished (alongside an notification panel/message)
- Use `aria-disabled` alongside either or both of these options: 
	- Use JS to prevent the button being submitted whilst aria-disabled=true
	- Don't disable and show an error when they are clicked
- ...and for an added bonus use `aria-describedby` alongside `aria-disabled` to explain why the button is disabled