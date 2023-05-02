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

          patterns.push("*://*." + website[2] + "/*");

          save(patterns);

          alert("Your site, \"" + website[2] + "\" has been added.");

          chrome.tabs.reload();
        } else {
          alert("This site you are trying to add doesn't seem to be a valid website.");
        }
      });
    }
  });
});

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
      title: "Click to add highlighted text to blacklist",
      contexts:["selection"],
      onclick: function(highlightedText) {
        var url = highlightedText.selectionText;

        patterns.push("*://*." + url + "/*");

        save(patterns);

        alert("Your site, \"" + url + "\" has been added.");
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
      if (data.is_pause === true) {
        try {
          chrome.webRequest.onBeforeRequest.addListener(blockRequest, {
            urls: patterns
          }, ['blocking']);
        } catch (e) {
          console.error(e);
        }
      } else {
        console.log("Extension is currently paused. All patterns will not be blocked.")
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
    if (data.is_pause === undefined || data.is_pause === false) {
      is_pause = "Unpause Extension";
      button_is_pause_color = "btn-success";
    } else {
      is_pause = "Pause Extension";
      button_is_pause_color = "btn-danger";
    }
  });
  patterns = p;
  if (patterns.length === 0) {
    is_empty = true;
  }
  updateFilters();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "reload") {
    window.location.reload();
  }
});