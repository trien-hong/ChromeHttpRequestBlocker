Chrome Request Blocker Extension
================================

Chrome extension that will block certain HTTP requests, based on configurable URL patterns.

This is a fork from the original [https://github.com/clupasq/ChromeHttpRequestBlocker](https://github.com/clupasq/ChromeHttpRequestBlocker) by [clupasq](https://github.com/clupasq/).

Changes from the original fork
==============================

* Removed valid matching patterns
    * I might put it back but for now it's removed.
    * Since this is for personal use and I know how to add valid patterns I've removed it.
    * I believe it makes the extension a little bit faster. Especially if you have thousands of patterns to check.
* Simply add a site like `google.com` is all you need
    * In the background, when you click save, the extension will automatically add in the correct patterns to be able to block request
    * The patterns are `*://*.` for prefix and `/*` for suffix
    * It will look something like `*://*.google.com/*` or `*://*.yahoo.com/*` or `*://*.ads.twitter.com/*`
        * Note that blocking subdomain(s) will not block the actual domain
        * For example, blocking `ads.twitter.com` will not block `twitter.com`
        * Note that blocking the actual domain will block all subdomain(s)
        * For example, blocking `google.com` will also block `ads.google.com`
    * I am aware there are more types of patterns but this is the most useful for me
    * Please do remember to save after adding your site(s)
* Added a way to click on a button to add the current site with just one click
    * Added a check to see if it's a valid site first before adding
    * Please do remember to save after adding your site(s)
* Added a way to export your patterns as a simple text (.txt) file
    * Added check to see if there are any patterns before exporting
* Added a way to import that same text file
    * Added confirmation as importing will replace the existing patterns
    * Added check to see if the uploaded file is indeed a text file
    * Added an example file (patternsExport_05-03-2023.txt) that contains 997 patterns in which the user can import
* Added a way to clear your entire pattterns
    * Added confirmation to see if the user really wants to clear their patterns
* Added a pause feature to temporarily not block sites
* Context menu will now appear when you right click over certain elements
    * This can be useful when you want to quickly block a site
        * The more patterns you have (thousands if not more) will increase the extension's popup load time
    * Context menu will appear when you right click a page to block the current site
    * Context menu will appear when you right click on a link to block the link
    * Context menu will appear when you right click over highlighted text to block said text
        * Not all highlighted text are websites though so be mindful of what it is
        * Though you can always remove invalid sites by opening the extension's popup
* Extension will now check for duplicate patterns before adding via context menu, popup, and uploading file
* Change some of the styling and layout
    * Moved the majority of buttons to the bottom
    * Moved some of the custom CSS to a seperate file
    * Added dyanmic colors to pause button
    * Added a scroll down when adding new sites
    * Added titles when hovering over certain elements
    * Added borders to better help seperate different elements
    * Removed some of the unnecessary or extra padding/margin from Bootstrap