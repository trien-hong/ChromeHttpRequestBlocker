var total_blocked = 0;
var url_blocked = [{}];

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
    title: "Block current site",
    contexts: ["page"],
    onclick: function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url;
      
        if (url !== undefined) {
          var website = url.replace("www.", "").split("/")[2];
          var pattern = "*://*." + website + "/*";

          if (patterns.includes(pattern) === false) {
            patterns.push(pattern);

            save(patterns, function() {
              alert("Your site, \"" + website + "\" has been added. Page will reload shortly.");

              is_empty = false;

              chrome.tabs.reload();
            });
          } else {
            alert("Your site, \"" + website + "\" is already in your patterns. \n\nTherefore, the website will not be added again.");
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
    title: "Block URL of link",
    contexts: ["link"],
    onclick: function(data) {
      var url = data.linkUrl;
      
      if (url !== undefined) {
        var website = url.replace("www.", "").split("/")[2];
        var pattern = "*://*." + website + "/*";

        if (patterns.includes(pattern) === false) {
          patterns.push(pattern);

          save(patterns, function() {
            is_empty = false;

            alert("Your site, \"" + website + "\" has been added.");
          });
        } else {
          alert("Your site, \"" + website + "\" is already in your patterns. \n\nTherefore, the website will not be added again.");
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
  increaseUrlBlocked(details);
  increaseTotalBlocked();

  console.log("Blocked #" + total_blocked + ": " + details.url);

  return {
    cancel: true
  };
}

function increaseUrlBlocked(details) {
  var timeStamp = new Date();

  // pagination/paging
  // each element in the array will contain an object with max length of 100
  for (var i = 0; i < url_blocked.length; i++) {
    if (url_blocked[i][details.url] !== undefined) {
      url_blocked[i][details.url] = [url_blocked[i][details.url][0] + 1, timeStamp.toLocaleString().replace(",", " @")];
      break;
    } else if (url_blocked[i][details.url] === undefined) {
      if (Object.keys(url_blocked[i]).length !== 100) {
        url_blocked[i][details.url] = [1, timeStamp.toLocaleString().replace(",", " @")];
        if (Object.keys(url_blocked[i]).length === 100) {
          url_blocked.push({});
        }
        break;
      }
    }
  }

  chrome.storage.local.set({'url_blocked': url_blocked}, function() {
  
  });
}

function increaseTotalBlocked() {
  total_blocked = total_blocked + 1;

  chrome.storage.local.set({'total_blocked': total_blocked}, function() {

  });
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
  // chrome.storage.local.get(console.log)
  // view the storage being used by a Chrome extension

  patterns = p;

  total_blocked = total_blocked;

  url_blocked = url_blocked;

  if (patterns.length === 0) {
    is_empty = true;
  } else {
    is_empty = false;
  }

  chrome.storage.local.get('total_blocked', function(data) {
    // initial value of total_blocked
    if (data.total_blocked === undefined) {
      // if total_blocked is undefined
      chrome.storage.local.set({'total_blocked': 0}, function() {
  
      });
    } else {
      // if total_block contains a value that's not undefined
      total_blocked = data.total_blocked;
    }
  });

  chrome.storage.local.get('url_blocked', function(data) {
    // initial value of url_blocked
    if (data.url_blocked === undefined) {
      // if url_blocked is undefined
      chrome.storage.local.set({'url_blocked': url_blocked}, function() {
  
      });
    } else {
      // if url_blocked contains a value that's not undefined
      url_blocked = data.url_blocked;
    }
  });

  chrome.storage.local.get('is_pause', function(data) {
    // initial value of pause button
    if (data.is_pause === undefined || data.is_pause === false) {
      // extension is currently not on pause (is blocking sites)
      is_pause = "Pause Extension";
      button_is_pause_color = "btn-danger";
    } else {
      // extension is currently on pause (is not blocking sites)
      is_pause = "Unpause Extension";
      button_is_pause_color = "btn-success";
    }
  });
  
  updateFilters();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "reload-background-script") {
    window.location.reload();
  }
});