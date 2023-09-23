---
share: true
category: _notes
topics: [Accessibility]
date: 2023-09-23
title: Autocomplete select for multiple files
---

There are various cases when a select element with many options can be quite unweildy to use. Scrolling or tabbing through a list of hundreds of items is time consuming and challenging. 

Within TDR we have at least two use cases for this scenario - selecting multiple FOI exemption codes and selecting multiple languages. 

Currently we have a separate page of checkboxes for choosing FOI exemption codes, which requires the user to leave the current page/form to select options before returning to complete the rest of the form. It would be more efficient, potentially less error prone if we could keep the user on the same form whilst they select multiple options. This solution will depend on JavaScript progressive enhancement.

# Existing off-the-shelf solutions

## Single select only from GDS/Alphagov
There is an Accessible Autocomplete component ([Github](https://github.com/alphagov/accessible-autocomplete) and [examples](https://alphagov.github.io/accessible-autocomplete/examples/))  maintained by GDS that is very useful for single select. It offers autocomplete and is built to allow progressive enhancement (i.e. picking up already rendered HTML elements). 

This, however, doesn't include the ability to select multiple options. 

## Multi-select accessibility focussed, but not maintained

Github user [mynamesleaon](https://github.com/mynamesleon/) has built upon the Accessible Autocomplete module making his own called [Aria Autocomplete](https://github.com/mynamesleon/aria-autocomplete), which includes multiple file selection. Similarly to Accessible Autocomplete it can progressively enhance already rendered HTML checkboxes or selects. It has an accessibility focus ("Use of ARIA attributes, custom screen reader announcements, and testing with assistive technologies") but isn't being maintained activley compared to the GDS/alphagov predecessor. 


> [!NOTE] Regular maintenance might not be an issue
> The component is written in vanilla JS and with a focus on accessibilty standards that haven't changed dramatically since the component was written. Therefore if this does what we need then we can continue with user, uasbility and accessibility testing.

## Bespoke solution from Gov.uk NewsFinder

This article very usefully describes the GDS teams process of developing and testing a multi-select form input for the [News Finder](https://www.gov.uk/search/news-and-communications) on gov.uk: 

📰 [Accessibility lessons: dealing with a large amount of form inputs - Accessibility in government](https://accessibility.blog.gov.uk/2019/04/08/accessibility-lessons-dealing-with-a-large-amount-of-form-inputs/)

They start by using the [alphagov/accessible-autocomplete](https://alphagov.github.io/accessible-autocomplete/examples/), then try using the [multi-select version](https://github.com/mynamesleon/aria-autocomplete), and then abandon both in favour of their own bespoke solution. 

Extremely helpful human Andy Sellick (Front end Dev at GDS) sent me the repo location for this code:
-   [JavaScript](https://github.com/alphagov/finder-frontend/blob/main/app/assets/javascripts/components/option-select.js)
-   [Rails template](https://github.com/alphagov/finder-frontend/blob/main/app/views/components/_option-select.html.erb)
-   [Rails test file](https://github.com/alphagov/finder-frontend/blob/main/spec/components/option_select_spec.rb)
-   [JavaScript test file](https://github.com/alphagov/finder-frontend/blob/main/spec/javascripts/components/option-select-spec.js)
-   [documentation file](https://github.com/alphagov/finder-frontend/blob/main/app/views/components/docs/option-select.yml) - there's a live rendered version of this but it's currently down for some reason, will have a look


# Issues 

Keyboard accessibility with scrollable areas:
https://www.w3.org/WAI/standards-guidelines/act/rules/0ssw9k/proposed/