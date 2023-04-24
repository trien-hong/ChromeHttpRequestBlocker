Chrome Request Blocker Extension
================================

Chrome extension that will block certain HTTP requests, based on configurable URL patterns.

This is a fork from the original [https://github.com/clupasq/ChromeHttpRequestBlocker](https://chrome.google.com/webstore/detail/http-request-blocker/eckpjmeijpoipmldfbckahppeonkoeko) by [clupasq](https://github.com/clupasq/).

Changes from the original fork
==============================

* Removed valid matching patterns
    * I might put it back but for now it's removed.
    * Since this is for personal use and I know how to add valid patterns I've removed it.
    * I believe it makes the extension a little bit faster. Especially if you have thousands of patterns to check.
* Simply add a site like `google.com` is all you need
    * In the background, when you click save the extension will automatically add in the correct patterns to be able to block request
    * The patterns are `*://*.` for prefix and `/*` for suffix
    * It will look something like `*://*.google.com/*` or `*://*.yahoo.com/*` or `*://*.ads.twitter.com/*`
        * Note that blocking a subdomain will not block the actual domain
        * For example, blocking `ads.twitter.com` will not block `twitter.com`
        * Note that blocking the actual domain will block all subdomains
        * For example, blocking `google.com` will also block `store.google.com`
    * I am aware there are more types of patterns but this is the most useful for me
* Added a way to click on a button to add the current site with just one click
    * Added a check to see if it's a valid site first before adding
* Added a way to export your patterns as a simple text (.txt) file
    * Added check to see if there are any patterns before exporting
* Added a way to import that same text file
    * Added confirmation as importing will replace the existing patterns
    * Added check to see if the uploaded file is indeed a text file
* Added a way to clear your entire pattterns
    * Added confirmation to see if the user really wants to clear their patterns
* Change some of the styling and layout
    * Moved the majority of buttons to the bottom
    * Added a scroll down when adding new sites
    * Added titles when hovering over certain elements
    * Added "borders" to better help seperate different elements
    * Removed some of the unnecessary or extra padding/margin from Bootstrap
    * Moved custom CSS to a different file