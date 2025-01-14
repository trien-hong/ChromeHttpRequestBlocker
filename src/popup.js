var app = angular.module('RequestBlockerApp', ['ngSanitize']);

app.service('currentSite', function() {
    this.getUrl = function(callback) {
        var url;

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            url = tabs[0].url;

            if (url !== undefined) {
                url = url.replace("www.", "").split("/")[2];
            } else {
                url = undefined;
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

    var timeStamp = new Date();

    $scope.total_blocked_per_day = $scope.backgroundPage.total_blocked_per_day;

    if ($scope.total_blocked_per_day.length === 0) {
        $scope.total_blocked_today = 0;
    } else if ($scope.total_blocked_per_day[$scope.total_blocked_per_day.length - 1]["date"] === timeStamp.getMonth() + 1 + "/" + timeStamp.getDate() + "/" + timeStamp.getFullYear()) {
        $scope.total_blocked_today = $scope.total_blocked_per_day[$scope.total_blocked_per_day.length - 1]["blocked_number"];
    } else {
        $scope.total_blocked_today = 0;
    }

    $scope.total_blocked = $scope.backgroundPage.total_blocked;

    $scope.is_pause = $scope.backgroundPage.is_pause;

    chrome.storage.local.get('is_pause', function(data) {
        var is_pause = data.is_pause;

        $scope.pause = function() {
            if (is_pause === undefined || is_pause === false) {
                // extension is currently not on pause (is blocking sites)
                // user wants to PAUSE extension
                chrome.storage.local.set({'is_pause': true}, function() {
                
                });
                $scope.is_pause = "Unpause Extension";
                $scope.button_is_pause_color = "btn-success";
                
                $scope.alertModal(
                    "Extension is now <b><u>PAUSED</u></b>.<br><br>All patterns will not be blocked." // message
                );
            } else {
                // extension is currently on pause (is not blocking sites)
                // user wants to UNPAUSE extension
                chrome.storage.local.set({'is_pause': false}, function() {
                
                });
                $scope.is_pause = "Pause Extension";
                $scope.button_is_pause_color = "btn-danger";

                $scope.alertModal(
                    "Extension is now <b><u>UNPAUSED</u></b>.<br><br>All patterns will be blocked." // message
                );
            }

            chrome.storage.local.get('is_pause', function(data) {
                is_pause = data.is_pause;
            });

            chrome.runtime.sendMessage({type: "reload-background-script"});
        }
    });

    currentSite.getUrl(function(url) {
        $scope.website = url;
        
        var checkPattern = obj => obj.pattern === "*://*." + url + "/*";

        if (url === undefined) {
            $scope.website = "Sorry, not a valid website."
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
            $scope.errorModal(
                "The site you are trying to add doesn't seem to be a valid website.<br><br>Please try a different website." // message
            );
        } else {
            $scope.confirmModal(
                "Are you sure you want to block the current site, \"<u>" + $scope.website + "</u>\"?", // message
                "addCurrentSiteConfirmed" // function
            );
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

        $scope.successModal(
            "The site, \"<u>" + $scope.website + "</u>\", has been added.<br><br>It is now blocked and the page will reload shortly." // message
        );

        $scope.save();
    };

    $scope.unblockCurrentSite = function() {
        $scope.confirmModal(
            "Are you sure you want to unblock the current site, \"<u>" + $scope.website + "</u>\"?", // message
            "unblockCurrentSiteConfirmed" // function
        );
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
        
        $scope.successModal(
            "The site, \"<u>" + $scope.website + "</u>\", has been removed.<br><br>It is now unblocked and the page will reload shortly." // message
        );

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

    $scope.refreshPage = function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.reload();
        });
    };

    // I will try to find a better solution for all these different modals later

    $scope.confirmModal = function(message, confirmFunctionVariable, confirmParameterVariable) {
        // Not all confirm modal will have a confirmParameterVariable
        $scope.show_modal_confirm_icon = true;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.confirm_function = confirmFunctionVariable;
        $scope.confirm_parameter = confirmParameterVariable;
        $scope.show_modal_refresh_page_button = false;
        $scope.show_modal_confirm_button = true;
        $scope.show_modal_close_button = false;
        $scope.modal("modal-default", "PLEASE CONFIRM", message, "text-black");
    };

    $scope.alertModal = function(message) {
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = true;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_refresh_page_button = true;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "ALERT", message, "text-info-emphasis");
    };

    $scope.successModal = function(message) {
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = true;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_refresh_page_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "SUCCESS", message, "text-success");
    };

    $scope.errorModal = function(message) {
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = true;
        $scope.show_modal_refresh_page_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "ERROR", message, "text-danger");
    };

    $scope.modal = function(size, title, message, modalClass) {
        $scope.modalSize = size;
        $scope.modalTitle = title;
        $scope.modalMessage = message;
        $scope.modalClass = modalClass;
        $('#modal').modal('show');
    };
});