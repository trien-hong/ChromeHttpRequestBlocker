Chrome Request Blocker Extension
================================

Chrome extension that will block certain HTTP requests, based on configurable URL patterns.

This is a fork from the original [https://github.com/clupasq/ChromeHttpRequestBlocker](https://github.com/clupasq/ChromeHttpRequestBlocker) by [clupasq](https://github.com/clupasq/).

Changes from the original repository
====================================

* Fixed an issue with the original extension where empty ("") patterns could be save and more or less brick the extension
    * It would block every single web page including the extension's html pages itself
* Removed valid matching patterns
    * I might put it back but for now it's removed
    * Since this is for personal use and the extension automatically adds in the correct patterns
    * I believe it makes the extension a little bit faster especially if you have thousands of patterns to check
* There are three ways to block a request
    * Clicking on the extension will open it's popup and from there you are given the option to add the current site to your patterns
        * You do not need to save, as it will save automatically
    * Right clicking on certain elements (page, link, & highlighted text) will open a context menu to block respective the element
        * You do not need to save, as it will save automatically
    * Going to the extension's options.html page will allow you to manually add a new set of patterns
        * You will need to save manually (just click the save button)
* Before adding patterns via popup, context menu, & options.html (manually) it will check for existing patterns first before adding or saving
* When saving manually, the extension will check for empty ("") patterns and remove them before saving
* Within options.html page simply add a site like `google.com` is all you have to do
    * In the background, when you click save, the extension will automatically add in the correct patterns to be able to block request
    * The patterns are `*://*.` for prefix and `/*` for suffix
    * It will look something like `*://*.google.com/*` or `*://*.yahoo.com/*` or `*://*.ads.twitter.com/*`
        * Note that blocking subdomain(s) will not block the domain/second-level domain
            * For example, blocking `ads.twitter.com` will not block `twitter.com`
        * However, blocking the domain/second-level domain will block all subdomain(s)
            * For example, blocking `google.com` will also block `ads.google.com`
* You can now add exact URLs manually
    * For example, `https://www.linkedin.com/learning/` or `https://www.youtube.com/watch?v=uICUlqWXGB0`
    * To do... I still need to check for duplicates and be able to remove them inline since I don't want to refresh the page
    * For now, just know that it won't remove duplicates for exact URLs (you can remove them manually though)
* Context menu will now appear when you right click over certain elements
    * Context menu will appear when you right click on a page to block the current site
    * Context menu will appear when you right click on a link to block the link
    * Context menu will appear when you right click over highlighted text to block said text
        * Not all highlighted text are websites so be mindful of what it is
        * Though you can always remove invalid sites by opening the extension's options.html page
* Extension's popup now does a few things
    * It shows the current site along with it's favicon (if it has one)
    * Shows if the current site is or is not in your patterns
    * You can now add the current site within extension's popup to block it
        * Added check to see if it's a valid website first
    * It shows the total number of blocked patterns
    * Extension's popup also includes a pause/unpause button, options button, & GitHub repo button
* Extension's options.html page now contains most of the utilities in terms of viewing, exporting, clearing, uploading, removing patterns, etc.
* Extension now keeps track of the number of times it has blocked a pattern
    * Added ability to reset the number back to 0
* Added .map files for AngularJS & Bootstrap
* Added a way to export your patterns as a simple text (.txt) file
    * Added check to see if there are any patterns before exporting
    * I suggest you don't edit the text file unless you know what you're doing
        * As editing the text file may lead to errors
* Added a way to import that same text file
    * Added confirmation as importing will replace the existing patterns
    * Added check to see if the uploaded file is indeed a text file
    * Added an example file (patternsExport_05-03-2023.txt) that contains 997 patterns in which the user can import to start off with
* Added a pause feature to temporarily not block sites (clicking it again will unpause and vice versa)
* Added a search & remove button which allows you to input a specific pattern (ex. google.com, https://test.com/placeholder.js?v=3, etc.)
    * Added check to see if the input exist and if it exist it'll be removed
* Added a way to clear your entire pattterns
    * Added confirmation to see if the user really wants to clear their entire patterns
* Change some of the styling, layout, and added other minor features
    * Updated Bootstrap to v5.3.0-alpha3
    * Removed glyphicons files in favor of Bootstrap icons
    * When patterns are empty, a simple message is displayed on the screen leting the user know
    * Moved some of the custom CSS to a seperate file
    * All confirmations are done through modal rather than JavaScript's confirm
    * Added favicons for each pattern (if it has one)
    * Added alert and confirm modal
    * Added dyanmic colors to pause button
    * Added a scroll up and scroll down button
    * Added titles when hovering over certain elements
    * Added borders to better help seperate different elements
* Updated icon credit to SVG Repo
    * [https://www.svgrepo.com](https://www.svgrepo.com)
    * [https://www.svgrepo.com/svg/261850/shield-antivirus](https://www.svgrepo.com/svg/261850/shield-antivirus)

What requests are being made and how to check?
==============================================

To see what kind of requests are being made, you will need to open the chrome developer tool. Within the developer tool, there's a Network tab. From there, you will be able to see every request that was made by the webpage (may need a page refresh).

More info here:<br>
[https://developer.chrome.com/docs/devtools/](https://developer.chrome.com/docs/devtools/) and [https://developer.chrome.com/docs/devtools/network/](https://developer.chrome.com/docs/devtools/network/)

Here is an example of what to look for...
<details>
    <summary>Click to view</summary>
    <br>
    Most of the time it's just assets for the webpage like images, fonts, data, etc. Other times it is not.
    <br><br>
    <img src="https://i.imgur.com/hjeT2Ex.png"/>
</details>

Example of Valid Patterns (when adding manually)
================================================

<details>
    <summary>Click to view</summary>
    <br>
    <b>NOTE:</b> The extension will automatically add in <code>*://*.</code> and <code>/*</code> for you when adding your sites manually. You do not need to add <code>*://*.</code> or <code>/*</code> to your patterns. Just the domain/second-level domain, subdomain(s), IP address, or file path are all you need. When adding/removing manually please remember to click the save button after you're done. Matching exact URLs is also now possible.
    <br><br>
    Here are some valid exmaples of domains/second-level domains, subdomains, file path, and IP addresses...
    <ul>
        <li><code>google.com</code></li>
            <ul>
                <li>Blocking this domain/second-level domain will block all its subdomain(s)</li>
                <li>For example, <code>ads.google.com</code>, <code>store.google.com</code>, <code>apis.google.com</code>, etc. will all be blocked</li>
                <li><code>www.google.com</code> is also blocked</li>
            </ul>
        <li><code>ads.twitter.com</code></li>
            <ul>
                <li>Blocking this subdomain will not affect other subdomain(s) and the domain/second-level domain</li>
                <li>For example, <code>twitter.com</code>, <code>api.twitter.com</code>, <code>developer.twitter.com</code>, etc. will all not be blocked</li>
            </ul>
        <li><code>www.w3schools.com</code></li>
            <ul>
                <li>Some websites like <code>www.youtube.com</code>, <code>www.instagram.com</code>, <code>www.google.com</code>, etc. still have <code>www</code> included</li>
                <li>Blocking <code>www.w3schools.com</code> should be okay as going to <code>w3schools.com</code> will redirect you to <code>www.w3schools.com</code></li>
            </ul>
        <li><code>ouo.press/images/b1.png</code></li>
        <ul>
            <li>Blocking a specific file is also possible</li>
            <li>It will only block the file and not the domain/second-level domain or it's subdomains</li>
        </ul>
        <li><code>12.34.56.78</code></li>
        <ul>
            <li>Blocking an IP address is also possible</li>
        </ul>
        <li><code>usa.gov</code></li>
        <li><code>google.co.uk</code></li>
        <li><code>digital.co.jp</code></li>
        <li><code>sony.net</code></li>
        <li><code>thenew.org</code></li>
    </ul>
    Here are some valid examples of exact URLs
    <ul>
        <li><code>https://www.youtube.com/watch?v=CDokUdux0rc</code></li>
        <li><code>https://github.com/trien-hong/ChromeHttpRequestBlocker</code></li>
        <li><code>https://en.wikipedia.org/wiki/World_Wide_Web</code></li>
        <li><code>https://wordpress.org/about/</code></li>
    </ul>
</details>