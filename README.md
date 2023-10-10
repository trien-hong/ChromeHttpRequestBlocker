Chrome Request Blocker Extension
================================

Chrome extension that will block certain HTTP requests, based on configurable URL patterns.

This is a fork from the original [https://github.com/clupasq/ChromeHttpRequestBlocker](https://github.com/clupasq/ChromeHttpRequestBlocker) by [clupasq](https://github.com/clupasq/).

Changes from the original repository
====================================
I'm made a lot of changes and updates from the original repository. So much so that it looks much nicer if I just put it within a dropdown menu.

<details>
    <summary><b>Click to view the changes and updates I've made</b></summary>
    <br>
    <ul>
        <li>Fixed an issue with the original extension where empty ("") patterns could be save and more or less brick the extension
            <ul>
                <li>It would block every single web page including the extension's html pages itself</li>
            </ul>
        </li>
        <li>Removed valid matching patterns
            <ul>
                <li>I might put it back but for now it's removed</li>
                <li>Since this is for personal use and the extension automatically adds in the correct patterns</li>
                <li>I believe it makes the extension a little bit faster especially if you have thousands of patterns to check</li>
            </ul>
        </li>
        <li>There are three ways to block a request
            <ul>
                <li>Clicking on the extension will open it's popup and from there you are given the option to add the current site to your patterns
                    <ul>
                        <li>You do not need to save, as it will save automatically</li>
                    </ul>
                </li>
                <li>Right clicking on certain elements (page, link, & highlighted text) will open a context menu to block respective the element
                    <ul>
                        <li>You do not need to save, as it will save automatically</li>
                    </ul>
                </li>
                <li>Going to the extension's options.html page will allow you to manually add a new set of patterns
                    <ul>
                        <li>You will need to save manually (just click the save button)</li>
                    </ul>
                </li>
            </ul>
        </li>
        <li>Before adding patterns via popup, context menu, & options.html (manually) it will check for existing patterns first before adding or saving</li>
        <li>When saving manually, the extension will check for empty ("") patterns and remove them before saving</li>
        <li>Within options.html page simply add a site like `google.com` is all you have to do
            <ul>
                <li>In the background, when you click save, the extension will automatically add in the correct patterns to be able to block request</li>
                <li>The patterns are <code>*://*.</code> for prefix and <code>/*</code> for suffix</li>
                <li>It will look something like <code>*://*.google.com/*</code> or <code>*://*.yahoo.com/*</code> or <code>*://*.ads.twitter.com/*</code></li>
                <ul>
                    <li>Note that blocking subdomain(s) will not block the domain/second-level domain</li>
                        <ul>
                            <li>For example, blocking <code>ads.twitter.com</code> will not block <code>twitter.com</code></li>
                        </ul>
                    <li>However, blocking the domain/second-level domain will block all subdomain(s)</li>
                        <ul>
                            <li>For example, blocking <code>google.com</code> will also block <code>ads.google.com</code></li>
                        </ul>
                </ul>
            </ul>
        </li>
        <li>You can now add exact URLs manually
            <ul>
                <li>For example, <code>https://www.linkedin.com/learning/</code> or <code>https://www.youtube.com/watch?v=uICUlqWXGB0</code></li>
                <li>To do... I still need to check for duplicates and be able to remove them inline since I don't want to refresh the page</li>
                <li>For now, just know that it won't remove duplicates for exact URLs (you can remove them manually though)</li>
            </ul>
        </li>
        <li>Context menu will now appear when you right click over certain elements
            <ul>
                <li>Context menu will appear when you right click on a page to block the current site</li>
                <li>Context menu will appear when you right click on a link to block the link</li>
                <li>Context menu will appear when you right click over highlighted text to block said text</li>
                <ul>
                    <li>Not all highlighted text are websites so be mindful of what it is</li>
                    <li>Though you can always remove invalid sites by opening the extension's options.html page</li>
                </ul>
            </ul>
        </li>
        <li>Extension's popup now does a few things
            <ul>
                <li>It shows the current site along with it's favicon (if it has one)</li>
                <li>Shows if the current site is or is not in your patterns</li>
                <li>You can now add the current site within extension's popup to block it</li>
                    <ul>
                        <li>Added check to see if it's a valid website first</li>
                    </ul>
                <li>It shows the total number of blocked patterns</li>
                <li>Extension's popup also includes a pause/unpause button, options button, & GitHub repo button</li>
            </ul>
        </li>
        <li>Extension's options.html page now contains most of the utilities in terms of viewing, exporting, clearing, uploading, removing patterns, etc.</li>
        <li>Extension now keeps track of the number of times it has blocked a pattern
            <ul>
                <li>Added ability to reset the number back to 0</li>
            </ul>
        </li>
        <li>Added .map files for AngularJS & Bootstrap</li>
        <li>Added a way to export your patterns as a simple text (.txt) file
            <ul>
                <li>Added check to see if there are any patterns before exporting</li>
                <li>I suggest you don't edit the text file unless you know what you're doing</li>
                    <ul>
                        <li>As editing the text file may lead to errors</li>
                    </ul>
            </ul>
        </li>
        <li>Added a way to import that same text file
            <ul>
                <li>Added confirmation as importing will replace the existing patterns</li>
                <li>Added check to see if the uploaded file is indeed a text file</li>
                <li>Added an example file (patternsExport_05-03-2023.txt) that contains 997 patterns in which the user can import to start off with</li>
            </ul>
        </li>
        <li>Added a pause feature to temporarily not block sites (clicking it again will unpause and vice versa)</li>
        <li>Added a search & remove button which allows you to input a specific pattern (ex. google.com, https://test.com/placeholder.js?v=3, etc.)
            <ul>
                <li>Added check to see if the input exist and if it exist it'll be removed</li>
            </ul>
        </li>
        <li>Added a way to clear your entire pattterns
            <ul>
                <li>Added confirmation to see if the user really wants to clear their entire patterns</li>
            </ul>
        </li>
        <li>Change some of the styling, layout, and added other minor features
            <ul>
                <li>Updated Bootstrap to v5.3.2</li>
                <li>Removed glyphicons files in favor of Bootstrap icons</li>
                <li>When patterns are empty, a simple message is displayed on the screen leting the user know</li>
                <li>Moved some of the custom CSS to a seperate file</li>
                <li>All confirmations are done through modal rather than JavaScript's confirm</li>
                <li>Added favicons for each pattern (if it has one)</li>
                <li>Added alert and confirm modal</li>
                <li>Added dyanmic colors to pause button</li>
                <li>Added a scroll up and scroll down button</li>
                <li>Added titles when hovering over certain elements</li>
                <li>Added borders to better help seperate different elements</li>
            </ul>
        </li>
        <li>Updated icon credit to SVG Repo
            <ul>
                <li><a href="https://www.svgrepo.com">https://www.svgrepo.com</a></li>
                <li><a href="https://www.svgrepo.com/svg/261850/shield-antivirus">https://www.svgrepo.com/svg/261850/shield-antivirus</a></li>
            </ul>
        </li>
    </ul>
</details>

What requests are being made and how to check?
==============================================

To see what kind of requests are being made, you will need to open the chrome developer tool. Within the developer tool, there's a Network tab. From there, you will be able to see every request that was made by the webpage (may need a page refresh).

More info here:<br>
[https://developer.chrome.com/docs/devtools/](https://developer.chrome.com/docs/devtools/) and [https://developer.chrome.com/docs/devtools/network/](https://developer.chrome.com/docs/devtools/network/)

<details>
    <summary><b>Click to view for what to look for</b></summary>
    <br>
    Here is an example of what to look for. The website in question is from https://www.fandom.com/.<br>
    Most of the time it's just assets for the webpage like images, fonts, data, etc. Other times it is not.
    <br><br>
    Note the number of request being made. The website made 248 request.<br>
    The extension was pasued and no requests were being blocked.
    <br>
    <img src="https://i.imgur.com/Cyr8F2O.jpg"/>
    <br><br>
    Note the number of request being made this time. The website only made 106 request.<br>
    The extension was not pasued and certain requests were being blocked.
    <br>
    <img src="https://i.imgur.com/I9xOpzk.jpg"/>
    <br><br>
    This is what a blocked site looks like.
    <img src="https://i.imgur.com/u4K2FWH.png">
</details>

Example of Valid Patterns (when adding manually)
================================================
<b>NOTE:</b> The extension will automatically add in <code>\*://\*.</code> and <code>/\*</code> for you when adding your sites manually. You do not need to add <code>\*://\*.</code> or <code>/\*</code> to your patterns. Just the domain/second-level domain, subdomain(s), IP address, or file path are all you need. When adding/removing manually please remember to click the save button after you're done. Matching exact URLs is also now possible.
<br>
<details>
    <summary><b>Click to view example of valid patterns</b></summary>
    <br>
    Here are some valid exmaples of domains/second-level domains, subdomains, file path, and IP addresses
    <ul>
        <li><code>google.com</code>
            <ul>
                <li>Blocking this domain/second-level domain will block all its subdomain(s)</li>
                <li>For example, <code>ads.google.com</code>, <code>store.google.com</code>, <code>apis.google.com</code>, etc. will all be blocked</li>
                <li><code>www.google.com</code> is also blocked</li>
            </ul>
        </li>
        <li><code>ads.twitter.com</code>
            <ul>
                <li>Blocking this subdomain will not affect other subdomain(s) and the domain/second-level domain</li>
                <li>For example, <code>twitter.com</code>, <code>api.twitter.com</code>, <code>developer.twitter.com</code>, etc. will all not be blocked</li>
            </ul>
        </li>
        <li><code>www.w3schools.com</code>
            <ul>
                <li>Some websites like <code>www.youtube.com</code>, <code>www.instagram.com</code>, <code>www.google.com</code>, etc. still have <code>www</code> included</li>
                <li>Blocking <code>www.w3schools.com</code> should be okay as going to <code>w3schools.com</code> will redirect you to <code>www.w3schools.com</code></li>
                <li>However, I do recommend that you just block the domain/second-level domain instead.</li>
            </ul>
        </li>
        <li><code>ouo.press/images/b1.png</code>
            <ul>
                <li>Blocking a specific file is also possible</li>
                <li>It will only block the file and not the domain/second-level domain or it's subdomains</li>
            </ul>
        </li>
        <li><code>12.34.56.78</code>
            <ul>
                <li>Blocking an IP address is also possible</li>
            </ul>
        </li>
        <li><code>usa.gov</code></li>
        <li><code>google.co.uk</code></li>
        <li><code>digital.co.jp</code></li>
        <li><code>sony.net</code></li>
        <li><code>thenew.org</code></li>
    </ul>
    Here are some valid examples of exact URLs
    <ul>
        <li><code>https://www.w3.org/about/history/</code></li>
        <li><code>https://www.youtube.com/watch?v=CDokUdux0rc</code></li>
        <li><code>https://github.com/trien-hong/ChromeHttpRequestBlocker</code></li>
        <li><code>https://en.wikipedia.org/wiki/World_Wide_Web</code></li>
        <li><code>https://wordpress.org/about/</code></li>
    </ul>
</details>

Images
======
<details>
    <summary><b>Click to view images</b></summary>
    <br>
    <a href="https://imgur.com/a/yaMN7y7" target="_blank">Imgur link</a>
    <br>
    <h3>NEW images</h3>
    <img src="https://i.imgur.com/Dg4SImW.png">
    <img src="https://i.imgur.com/Jq2scex.png">
    <img src="https://i.imgur.com/WTvI8w7.png">
    <img src="https://i.imgur.com/OSLBh34.png">
    <img src="https://i.imgur.com/PpvjhXT.png">
    <img src="https://i.imgur.com/13veyqp.png">
    <img src="https://i.imgur.com/7Sx5FQt.png">
    <img src="https://i.imgur.com/FaMbajQ.png">
    <h3>OLD/ORIGINAL images | there was no options or history page to begin with</h3>
    <img src="https://i.imgur.com/WTyicC6.png">
    <img src="https://i.imgur.com/wXMKDmJ.png">
</details>