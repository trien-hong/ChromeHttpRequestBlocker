var app = angular.module('RequestBlockerApp', ['ngSanitize']);

app.controller('HistoryController', function($scope) {
    $scope.backgroundPage = chrome.extension.getBackgroundPage();

    $scope.extension_version = chrome.runtime.getManifest().version;

    $scope.url_blocked = $scope.backgroundPage.url_blocked;

    $scope.page_number = 0;

    $scope.page = $scope.url_blocked[$scope.page_number];

    $scope.button_is_pause_color = $scope.backgroundPage.button_is_pause_color;

    $scope.is_pause = $scope.backgroundPage.is_pause;

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
                
                $scope.alertModal("Extension is now <u>PAUSED</u>. All patterns will not be blocked.");
            } else {
                // extension is currently on pause (is not blocking sites)
                // user wants to UNPAUSE extension
                chrome.storage.local.set({'is_pause': false}, function() {
                
                });
                $scope.is_pause = "Pause Extension";
                $scope.button_is_pause_color = "btn-danger";
                
                $scope.alertModal("Extension is now <u>UNPAUSED</u>. All patterns will be blocked.");
            }

            chrome.storage.local.get("is_pause", function(data) {
                is_pause = data.is_pause;
            });

            chrome.runtime.sendMessage({type: "reload-background-script"});
        }
    });

    if (Object.keys($scope.url_blocked[0]).length === 0) {
        $scope.is_empty = true;
        $scope.show_page_arrow_left_icon = false;
        $scope.show_page_arrow_right_icon = false;
    } else {
        $scope.is_empty = false;
        $scope.show_page_arrow_left_icon = false;
        
        if ($scope.page_number === $scope.url_blocked.length - 1) {
            $scope.show_page_arrow_right_icon = false;
        } else {
            $scope.show_page_arrow_right_icon = true;
        }
    }

    $scope.decreasePageNumber = function() {
        $scope.page_number = $scope.page_number - 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();
    }

    $scope.increasePageNumber = function() {
        $scope.page_number = $scope.page_number + 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();
    }

    $scope.checkArrowIcons = function() {
        if ($scope.page_number === 0) {
            $scope.show_page_arrow_left_icon = false;
        } else {
            $scope.show_page_arrow_left_icon = true;
        }

        if ($scope.page_number === $scope.url_blocked.length - 1) {
            $scope.show_page_arrow_right_icon = false;
        } else {
            $scope.show_page_arrow_right_icon = true;
        }
    }

    // I will try to find a better solution for all these different modals later (there will be more)

    $scope.alertModal = function(message) {
        $scope.show_modal_alert_icon = true;
        $scope.show_modal_message_class = true;
        $scope.show_modal_close_button = true;
        $scope.modal("ALERT", message, "text-info-emphasis");
    };

    $scope.modal = function(title, message, modalClass) {
        $scope.modalTitle = title;
        $scope.modalMessage = message;
        $scope.modalClass = modalClass;
        $('#modal').modal('show');
    };
});