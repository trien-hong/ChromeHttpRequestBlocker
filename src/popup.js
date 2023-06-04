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

    $scope.total_blocked = $scope.backgroundPage.total_blocked;

    currentSite.getUrl(function (url) {
        $scope.website = url;
        
        var checkPattern = obj => obj.pattern === "*://*." + url + "/*";

        if (url === "Sorry, not a valid website.") {
            $scope.currentSiteStatus = "You cannot add this site. It's not valid.";
            $scope.is_blocked = false;
            $scope.is_not_blocked = true;
        } else if ($scope.patterns.some(checkPattern) === true) {
            $scope.currentSiteStatus = "The current site is in your patterns.";
            $scope.is_blocked = true;
            $scope.is_not_blocked = false;
        } else {
            $scope.currentSiteStatus = "The current site is not in your patterns.";
            $scope.is_blocked = false;
            $scope.is_not_blocked = true;
        }
        
        $scope.$apply();
    });

    $scope.addCurrentSite = function() {
        if ($scope.website === "Sorry, not a valid website.") {
            $scope.errorModal("The site you are trying to add doesn't seem to be a valid website.");
        } else {
            $scope.confirmModal("Are you sure you want to block the current site, \"" + $scope.website + "\"?", "addCurrentSiteConfirmed");
        }
    };

    $scope.addCurrentSiteConfirmed = function() {
        $scope.patterns.push({
            index: $scope.patterns.length,
            pattern: "*://*." + $scope.website + "/*"
        });

        $scope.currentSiteStatus = "The current site is in your patterns.";
        $scope.is_blocked = true;
        $scope.is_not_blocked = false;
        $scope.successModal("The site, \"" + $scope.website + "\", has been added. It is now blocked and the page will reload shortly.");

        $scope.save();
    };

    $scope.unblockCurrentSite = function() {
        $scope.confirmModal("Are you sure you want to unblock the current site, \"" + $scope.website + "\"?", "unblockCurrentSiteConfirmed");
    };

    $scope.unblockCurrentSiteConfirmed = function() {
        var object = $scope.patterns.find(patterns => patterns.pattern === "*://*." + $scope.website + "/*");
        var index = $scope.patterns.indexOf(object);

        if (index > -1) {
            $scope.patterns.splice(index, 1);
        }

        $scope.currentSiteStatus = "The current site is not in your patterns.";
        $scope.is_blocked = false;
        $scope.is_not_blocked = true;
        $scope.successModal("The site, \"" + $scope.website + "\", has been removed. It is now unblocked and the page will reload shortly.");

        $scope.save();
    };

    $scope.save = function() {
        var patterns = [];
    
        for (var i = 0; i < $scope.patterns.length; i++) {
            patterns.push($scope.patterns[i].pattern);
        }
    
        $scope.backgroundPage.save(patterns, function() {
            $scope.$apply(function() {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {                    
                    chrome.runtime.sendMessage({type: "reload-background-script"});

                    chrome.tabs.reload();
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
                
                $scope.alertModal("Extension is now PAUSED. All patterns will not be blocked.");
            } else {
                // extension is currently on pause (is not blocking sites)
                // user wants to UNPAUSE extension
                chrome.storage.local.set({'is_pause': false}, function() {
                
                });
                $scope.is_pause = "Pause Extension";
                $scope.button_is_pause_color = "btn-danger";

                $scope.alertModal("Extension is now UNPAUSED. All patterns will be blocked.");
            }

            chrome.storage.local.get("is_pause", function(data) {
                is_pause = data.is_pause;
            });

            chrome.runtime.sendMessage({type: "reload-background-script"});
        }
    });

    // I will try to find a better solution for all these different modals later

    $scope.confirmModal = function(message, functionVariable, parameterVariable) {
        $scope.function = functionVariable;
        $scope.parameter = parameterVariable;
        $scope.show_modal_confirm_button = true;
        $scope.show_modal_close_button = false;
        $scope.modal("PLEASE CONFIRM", message, "text-black");
    };

    $scope.alertModal = function(message) {
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("ALERT", message, "text-info");
    };

    $scope.successModal = function(message) {
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("SUCCESS", message, "text-success");
    };

    $scope.errorModal = function(message) {
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("ERROR", message, "text-danger");
    };

    $scope.modal = function(title, message, modalClass) {
        $scope.modalTitle = title;
        $scope.modalMessage = message;
        $scope.modalClass = modalClass;
        $('#modal').modal('show');
    };
});