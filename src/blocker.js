chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
    title: "Block current site",
    contexts: ["page"],
    onclick: function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url;
      
        if (url !== undefined) {
          var newUrl = url.replace("www.", "");
          var website = newUrl.split("/");
          var pattern = "*://*." + website[2] + "/*";

          if (patterns.includes(pattern) === false) {
            patterns.push(pattern);

            save(patterns, function() {
              alert("Your site, \"" + website[2] + "\" has been added. Page will reload shortly.");

              is_empty = false;

              chrome.tabs.reload();
            });
          } else {
            alert("Your site, \"" + website[2] + "\" is already in your patterns. \n\nTherefore, the website will not be added again.");
          }
        } else {
          alert("This site you are trying to add doesn't seem to be a valid website.");
        }
      });
    }
  });
});

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
    title: "Block link",
    contexts: ["link"],
    onclick: function(data) {
      var url = data.linkUrl;
      
      if (url !== undefined) {
        var newUrl = url.replace("www.", "");
        var website = newUrl.split("/");
        var pattern = "*://*." + website[2] + "/*";

        if (patterns.includes(pattern) === false) {
          patterns.push(pattern);

          save(patterns, function() {
            is_empty = false;

            alert("Your site, \"" + website[2] + "\" has been added.");
          });
        } else {
          alert("Your site, \"" + website[2] + "\" is already in your patterns. \n\nTherefore, the website will not be added again.");
        }
      } else {
        alert("This site you are trying to add doesn't seem to be a valid website.");
      }
    }
  });
});

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
      title: "Click to add highlighted text to blacklist",
      contexts: ["selection"],
      onclick: function(data) {
        var pattern = "*://*." + data.selectionText + "/*";

        if (patterns.includes(pattern) === false) {
          patterns.push(pattern);

          save(patterns, function() {
            is_empty = false;

            alert("Your site, \"" + data.selectionText + "\" has been added.");
          });
        } else {
          alert("Your site, \"" + data.selectionText + "\" is already in your patterns. \n\nTherefore, the website will not be added again.");
        }
      }
  });
});

function blockRequest(details) {
  console.log("Blocked: ", details.url);
  return {
    cancel: true
  };
}

function updateFilters(urls) {
  if (chrome.webRequest.onBeforeRequest.hasListener(blockRequest)) {
    chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
  }

  if (patterns.length) {
    chrome.storage.local.get('is_pause', function(data) {
      if (data.is_pause === undefined || data.is_pause === false) {
        try {
          chrome.webRequest.onBeforeRequest.addListener(blockRequest, {
            urls: patterns
          }, ['blocking']);
        } catch (e) {
          console.error(e);
        }
      } else {
        console.log("Extension is currently paused. Any and all patterns will not be blocked.");
      }
    });
  }
}

function load(callback) {
  chrome.storage.local.get('blocked_patterns', function(data) {
    callback(data['blocked_patterns'] || []);
  });
}

function save(newPatterns, callback) {
  patterns = newPatterns;
  chrome.storage.local.set({
    'blocked_patterns': newPatterns
  }, function() {
    updateFilters();
    callback.call();
  });
}

load(function(p) {
  chrome.storage.local.get('is_pause', function(data) {
    // inital value of pause button
    if (data.is_pause === undefined || data.is_pause === false) {
      // extension is currently not on pause (is blocking sites)
      is_pause = "Pause extension";
      button_is_pause_color = "btn-danger";
    } else {
      // extension is currently on pause (is not blocking sites)
      is_pause = "Unpause extension";
      button_is_pause_color = "btn-success";
    }
  });
  patterns = p;
  if (patterns.length === 0) {
    is_empty = true;
  }
  updateFilters();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "reload-background-script") {
    window.location.reload();
  }
});