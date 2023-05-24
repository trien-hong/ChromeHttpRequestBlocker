Chrome Request Blocker Extension
================================

Chrome extension that will block certain HTTP requests, based on configurable URL patterns.

This is a fork from the original [https://github.com/clupasq/ChromeHttpRequestBlocker](https://github.com/clupasq/ChromeHttpRequestBlocker) by [clupasq](https://github.com/clupasq/).

Changes from the original repository
====================================

* Removed valid matching patterns
    * I might put it back but for now it's removed.
    * Since this is for personal use and I know how to add valid patterns I've removed it.
    * I believe it makes the extension a little bit faster. Especially if you have thousands of patterns to check.
* Within options.html simply add a site like `google.com` is all you need
    * In the background, when you click save, the extension will automatically add in the correct patterns to be able to block request
    * The patterns are `*://*.` for prefix and `/*` for suffix
    * It will look something like `*://*.google.com/*` or `*://*.yahoo.com/*` or `*://*.ads.twitter.com/*`
        * Note that blocking subdomain(s) will not block the domain/second-level domain
            * For example, blocking `ads.twitter.com` will not block `twitter.com`
        * However, blocking the domain/second-level domain will block all subdomain(s)
            * For example, blocking `google.com` will also block `ads.google.com`
    * I am aware there are more types of patterns but this is the most useful for me
    * Please do remember to save after adding your site(s)
* Added .map files for AngularJS & Bootstrap
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
* Extension now keeps track of the number of times it has blocked a pattern
* Extension's options.html page now contains most of the utilities in terms of viewing, exporting, clearing, uploading, removing patterns, etc.
* Before adding via popup, context menu, & options.html (manually) it will check for existing patterns before adding or saving
* Change some of the styling and layout
    * Updated Bootstrap to v5.3.0-alpha3
    * Removed glyphicons files in favor of Bootstrap icons
    * Moved some of the custom CSS to a seperate file
    * Added favicons for each pattern (if it has one)
    * Added dyanmic colors to pause button
    * Added a scroll up and scroll down button
    * Added titles when hovering over certain elements
    * Added borders to better help seperate different elements

Example of Valid Patterns (when adding manually)
================================================

<details>
    <summary>Click to view</summary>
    <br>
    <b>NOTE:</b> The extension will automatically add in <code>*://*.</code> and <code>/*</code> for you when adding your sites manually. You do not need to add <code>*://*.</code> or <code>/*</code> to your patterns. Just the domain/second-level domain, subdomain(s), IP address, or file path are all you need.
    <br><br>
    Here are some valid exmaples...
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
</details>