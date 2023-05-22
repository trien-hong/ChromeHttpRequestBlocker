var app = angular.module('RequestBlockerApp', []);

app.service('currentSite', function() {
    this.getUrl = function(callback) {
        var url;

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            url = tabs[0].url;

            if (url !== undefined) {
                url = url.replace("www.", "").split("/")[2];
            } else {
                url = "Sorry, not a valid website.";
            }

            callback(url);
        });
    };
});
    
app.controller('PopupController', function($scope, currentSite) {
    $scope.backgroundPage = chrome.extension.getBackgroundPage();

    $scope.patterns = $scope.backgroundPage.patterns.map(function(x, i) {
        return {
            index: i,
            pattern: x
        };
    });

    $scope.button_is_pause_color = $scope.backgroundPage.button_is_pause_color;

    $scope.is_pause = $scope.backgroundPage.is_pause;

    currentSite.getUrl(function (url) {
        $scope.website = url;
        
        var checkPattern = obj => obj.pattern === "*://*." + url + "/*";

        if (url === "Sorry, not a valid website.") {
            $scope.isBlocked = "You cannot add this site. It's not valid.";
        } else if ($scope.patterns.some(checkPattern) === true) {
            $scope.isBlocked = "The current site is in your patterns.";
        } else {
            $scope.isBlocked = "The current site is not in your patterns.";
        }
        
        $scope.$apply();
    });

    $scope.addCurrentSite = function() {
        if ($scope.website === "Sorry, not a valid website."){
            $scope.error("The site you are trying to add doesn't seem to be a valid website.");
        } else if ($scope.isBlocked === "The current site is in your patterns.") {
            $scope.error("The website, \"" + $scope.website + "\" already exist in your patterns. Therefore, it will not be added again. Check the pause button if it's not being blocked or refresh page.");
        } else {
            $scope.patterns.push({
                index: $scope.patterns.length,
                pattern: "*://*." + $scope.website + "/*"
            });

            $scope.save();
        }
    };

    $scope.save = function() {
        var patterns = [];
    
        for (var i = 0; i < $scope.patterns.length; i++) {
            patterns.push($scope.patterns[i].pattern);
        }
    
        $scope.backgroundPage.save(patterns, function() {
            $scope.$apply(function() {
                $scope.isBlocked = "The current site is in your patterns.";
                
                $scope.success("The site, \"" + $scope.website + "\", has been added. It is now blocked and page will reload shortly.");
                
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.reload();
                    
                    chrome.runtime.sendMessage({type: "reload"});
                });
            });
        });
    };

    chrome.storage.local.get("is_pause", function(data) {
        var is_pause = data.is_pause;

        $scope.pause = function() {
            if (is_pause === undefined || is_pause === false) {
                // extension is currently not on pause (is blocking sites)
                // user wants to PAUSE extension
                chrome.storage.local.set({'is_pause': true}, function() {
                
                });
                $scope.is_pause = "Unpause Extension";
                $scope.button_is_pause_color = "btn-success";
                $scope.alert("Extension is now PAUSED. All patterns will not be blocked.");
            } else {
                // extension is currently on pause (is not blocking sites)
                // user wants to UNPAUSE extension
                chrome.storage.local.set({'is_pause': false}, function() {
                
                });
                $scope.is_pause = "Pause Extension";
                $scope.button_is_pause_color = "btn-danger";
                $scope.alert("Extension is now UNPAUSED. All patterns will be blocked.");
            }
            chrome.storage.local.get("is_pause", function(data) {
                is_pause = data.is_pause;
            });
            chrome.runtime.sendMessage({type: "reload"});
        }
    });

    $scope.alert = function(message, title) {
        $scope.modal(message, title || "ALERT", "text-info");
    };

    $scope.success = function(message, title) {
        $scope.modal(message, title || "SUCCESS", "text-success");
    };

    $scope.error = function(message, title) {
        $scope.modal(message, title || "ERROR", "text-danger");
    };

    $scope.modal = function(message, title, modalClass) {
        $scope.modalClass = modalClass;
        $scope.modalTitle = title;
        $scope.modalMessage = message;
        $('#modal').modal('show');
    };
});