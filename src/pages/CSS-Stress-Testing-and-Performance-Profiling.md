---
title: CSS Stress Testing and Performance Profiling
layout: ../components/Layout.astro
created: "2011-4-14"
description: "I present you with the CSS Stress Test bookmarklet. Now let me explain: I have been losing my sanity over the oddest issue.  The project I’m working on right now has a fairly complex stylesheet.  Performance for the site is absolutely critical.  I’ve done my best, best …"
---

I present you with the <a href="javascript:(function()%7Bvar%20d=document,s=d.createElement(&#39;script&#39;),doit=function()%7Bif(window.stressTest)%7BstressTest.bookmarklet();%7Delse%7BsetTimeout(doit,100);%7D%7D;s.src=&#39;https://rawgithub.com/andyedinborough/stress-css/master/stressTest.js?_=&#39;%2BMath.random();(d.body%7C%7Cd.getElementsByTagName(&#39;head&#39;)%5B0%5D).appendChild(s);doit();%7D)();">CSS Stress Test</a> bookmarklet.

Now let me explain: I have been losing my sanity over the oddest issue.&nbsp; The project I’m working on right now has a fairly complex stylesheet.&nbsp; Performance for the site is absolutely critical.&nbsp; I’ve done my best to squeeze and optimize every line I can.&nbsp; In all browsers, it runs like a champion.&nbsp; Except IE9.&nbsp; It runs <em>terribly</em> in IE9.&nbsp; To make matters worse, it runs fine in IE8, IE7, and though it’s mangled, it even runs in IE6!

Something specific to IE9 was causing a serious performance glitch.&nbsp; I realized fairly quickly that CSS was to blame.&nbsp; Disabling JavaScript had no effect, but disabling all CSS instantly fixed performance.&nbsp; I went through the usual suspects: filters, and various new CSS3 properties, but nothing seemed to help.&nbsp; So I reached out to the community looking for something that could profile my CSS rules and find what was killing performance.&nbsp;

Sadly, <a href="http://stackoverflow.com/questions/5173122/css-performance-profiler" rel="external noopener">no one had an answer</a>.&nbsp; :[

So, as I lay there in the corner of the closet, weeping bitterly, I realized that writing my own CSS stress tester wouldn’t be that difficult.&nbsp; All it needs to do is stress the page for a baseline (in my case, all I needed to do was scroll the window up and down), index all the available CSS class names, and then methodically remove one, stress the page, and compare that time to the baseline.

Of course it took a while to work out the exact implementation.&nbsp;

My first implementation was written synchronously.&nbsp; It indexed the classes, scrolled the page up and down and tracked times.&nbsp; It turns out, browsers don’t like you doing really annoying things (like franticly scrolling the page).&nbsp; So after a couple iterations <code>window.scrollBy</code> stopped responding to my commands.

Instead of:

```js
var time0 = new Date().getTime();
window.scrollBy(0, 100);
var delta = new Date().getTime() - time0;
```

I needed to add an event handler to window.scroll, scroll the page, then capture time in the event.&nbsp; Of course this means the entire set of code would have to be rewritten to run asynchronously:

```js
var time0 = new Date().getTime(),

recordTime = function (){
var delta = (new Date().getTime()) - time0;
window.removeEventListener('scroll', recordTime, false);
};
window.addEventListener('scroll, recordTime, false);
window.scrollBy(0, 100);
```

(this isn’t how the code is actually written—just showing some insight into the how it works)

<strong><em> Fast forward a several weeks. </em></strong>

I’ve created a project on GitHub for the completed code (<a href="http://github.com/andyedinborough/stress-css">http://github.com/andyedinborough/stress-css</a>), and have created a simple bookmarklet to invoke the test: <a href="javascript:(function()%7Bvar%20d=document,s=d.createElement(&#39;script&#39;),doit=function()%7Bif(window.stressTest)%7BstressTest.bookmarklet();%7Delse%7BsetTimeout(doit,100);%7D%7D;s.src=&#39;https://rawgithub.com/andyedinborough/stress-css/master/stressTest.js?_=&#39;%2BMath.random();(d.body%7C%7Cd.getElementsByTagName(&#39;head&#39;)%5B0%5D).appendChild(s);doit();%7D)();">CSS Stress Test</a>

This test pinpointed exactly which class was killing the page.&nbsp; From there, I was able to fiddle with the CSS properties of the class and nail down the culprit.

&nbsp;

Was it box-shadow?&nbsp; … nope

&nbsp;

Was it filter/opacity? … nope

&nbsp;

…. wait for it …

&nbsp;

It was <strong><em>border-radius</em></strong>!&nbsp; More specifically, it was border-radius on a body-level element.&nbsp; I use border-radius quite extensively on the page, and the only time it causes performance problems in on a body-level element with a large number child elements.
