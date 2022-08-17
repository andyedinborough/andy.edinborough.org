---
title: Duck Punching jQuery UI Datepicker into a DateTimePicker
layout: ../components/Layout.astro
created: "2010-06-23"
description: "There are a TON of awful date pickers out there.  For a who’s who of the worst, check out Date Time Picker Competitive Analysis. jQuery UI’s Datepicker control is by far the best looking and most intuitive picker.  In light of maintaining a uniform UI, I wanted, wanted …"
---

There are a TON of awful date pickers out there. For a who’s who of the worst, check out <a href="https://web.archive.org/web/20120530075153/http://wiki.fluidproject.org:80/display/fluid/Date+Time+Picker+Competitive+Analysis" target="_blank" rel="external noopener">Date Time Picker Competitive Analysis</a>.

<a href="http://jqueryui.com/demos/datepicker/" target="_blank" rel="external noopener">jQuery UI’s Datepicker</a> control is by far the best looking and most intuitive picker. In light of maintaining a uniform UI, I wanted a date time picker that played on that control. I found two:

- Integrates with Datepicker, but the UI is completely disjoined.
- The first one listed here is the one I had been using. It integrated nicely with Datepicker, but the author’s website is down now, and I found it was quite bulky and that it limited how you could use Datepicker—no inlining, no animation, etc.

So I created a <a href="http://paulirish.com/2010/duck-punching-with-jquery/" target="_blank" rel="external noopener">duck-punched</a> DateTimepicker that simply manipulates the Datepicker DOM element and functions to add the missing functionality:image

As you can see, I also added the ability to specify custom buttons for the button panel.

<a href="http://jsfiddle.net/hLTcB/8/" target="_blank" rel="external noopener">View the demo at jsFiddle</a>
