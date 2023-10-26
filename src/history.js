var app = angular.module('RequestBlockerApp', ['ngSanitize']);

app.controller('HistoryController', function($scope) {
    $scope.backgroundPage = chrome.extension.getBackgroundPage();

    $scope.extension_version = chrome.runtime.getManifest().version;

    $scope.url_blocked = $scope.backgroundPage.url_blocked;

    if (Object.keys($scope.url_blocked[$scope.url_blocked.length - 1]).length === 0 && $scope.url_blocked.length !== 1) {
        $scope.max_page = $scope.url_blocked.length - 1;
    } else {
        $scope.max_page = $scope.url_blocked.length;
    }

    $scope.page_number = 0;

    $scope.page = $scope.url_blocked[$scope.page_number];

    if (Object.keys($scope.url_blocked[0]).length === 0) {
        $scope.is_empty = true;
        $scope.show_page_arrow_left_icon = false;
        $scope.show_page_arrow_right_icon = false;
    } else {
        $scope.is_empty = false;
        $scope.show_page_arrow_left_icon = false;

        if ($scope.page_number === $scope.max_page || $scope.page_number === $scope.max_page - 1) {
            $scope.show_page_arrow_right_icon = false;
        } else {
            $scope.show_page_arrow_right_icon = true;
        }
    }

    var timeStamp = new Date();

    if ($scope.backgroundPage.total_blocked_per_day[timeStamp.getMonth() + 1 + "/" + timeStamp.getDate() + "/" + timeStamp.getFullYear()] === undefined) {
        $scope.total_blocked_today = 0;
    } else {
        $scope.total_blocked_today = $scope.backgroundPage.total_blocked_per_day[timeStamp.getMonth() + 1 + "/" + timeStamp.getDate() + "/" + timeStamp.getFullYear()];
    }

    $scope.button_is_pause_color = $scope.backgroundPage.button_is_pause_color;

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

    $scope.decreasePageNumber = function() {
        $scope.page_number = $scope.page_number - 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();
    };

    $scope.increasePageNumber = function() {
        $scope.page_number = $scope.page_number + 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();
    };

    $scope.decreaseMaxPageNumber = function() {
        $scope.page_number = 0;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();
    };

    $scope.increaseMaxPageNumber = function() {
        $scope.page_number = $scope.max_page - 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();
    };

    $scope.checkArrowIcons = function() {
        if ($scope.page_number === 0) {
            $scope.show_page_arrow_left_icon = false;
        } else {
            $scope.show_page_arrow_left_icon = true;
        }

        if ($scope.page_number === $scope.max_page || $scope.page_number === $scope.max_page - 1) {
            $scope.show_page_arrow_right_icon = false;
        } else {
            $scope.show_page_arrow_right_icon = true;
        }
    };

    $scope.searchHistory = function() {
        $('#searchHistoryInput').val('');

        if ($scope.is_empty === true) {
            $scope.errorModal("Your history seems to be empty. Therefore, there was nothing to search.<br><br>History will only update when a URL is blocked.");
        } else {
            $scope.inputModal("SEARCH HISTORY", "Please enter the exact URL in which you want to search for.");
        }
    };

    $scope.searchHistoryInput = function() {
        var input = $('#searchHistoryInput').val();
        var found = false;
        var index = 0;

        if (input === "") {
            $scope.errorModal("Sorry, your input was empty (\"\").<br><br>Please try a different input.");
        } else {
            for (var i = 0; i < $scope.max_page; i++) {
                if ($scope.url_blocked[i][input] !== undefined) {
                    found = true;
                    index = i + 1;
                    break;
                }
            }

            if (found === true) {
                $scope.successModal("A match was found on page " + index + ".<br><br>If you were not already on page " + index + ", you have been taken there automatically.");
                $scope.page_number = index - 1;
                $scope.page = $scope.url_blocked[$scope.page_number];
                $scope.checkArrowIcons();
            } else {
                $scope.errorModal("Sorry, your input of \"<u>" + input + "</u>\", was not found in your history.<br><br>Please try a different input.");
            }
        }
    };

    $scope.clearHistory = function() {
        if ($scope.is_empty === true) {
            $scope.errorModal("Your history seems to be empty. Therefore, there was nothing to clear.<br><br>History will only update when a URL is blocked.");
        } else {
            $scope.confirmModal("Are you sure you want to clear your history?<br><br>Depending on the size of your history, it may take some time to load.", "clearHistoryConfirmed");
        }
    };

    $scope.clearHistoryConfirmed = function() {
        $scope.is_empty = true;
        $scope.show_page_arrow_left_icon = false;
        $scope.show_page_arrow_right_icon = false;
        $scope.url_blocked = undefined;
        $scope.page_number = 0;
        $scope.max_page = 1;
        $scope.page = $scope.url_blocked;

        $scope.successModal("Your history has been cleared.");

        chrome.runtime.sendMessage({type: "clear-url_blocked"});
    };

    $scope.viewGraph = function() {
        if (Object.keys($scope.backgroundPage.total_blocked_per_day).length === 0) {
            $scope.errorModal("Your \"total blocked per day seems\" to be empty. Therefore, there was no graph to draw.<br><br>You can only view a graph if the extension has blocked a URL.");
        } else {
            var graph_data = [];
            var starting_highlight = undefined;
            var ending_highlight = undefined;
            var highest = 0;

            for (const [key, value] of Object.entries($scope.backgroundPage.total_blocked_per_day)) {
                var insert_graph_data = [];
                insert_graph_data.push(new Date(key));
                insert_graph_data.push(value);
                graph_data.push(insert_graph_data);
                
                if (value > highest) {
                    var start_date = new Date(key);
                    var end_date = new Date(key);

                    starting_highlight = start_date.setHours(start_date.getHours() - 3);
                    ending_highlight = end_date.setHours(end_date.getHours() + 3);
                    highest = value;
                }
            }
    
            draw_line_graph = new Dygraph(
                document.getElementById("line_graph"),
                graph_data, {
                    height: 500,
                    width: 500,
                    colors: ['#A33434'],
                    fillGraph: true,
                    fillAlpha: 0.4,
                    underlayCallback: function(canvas, area, g) {
                        // Used to highlight the day (+/- 3 hours) with the most blocked URL
                        // If there's only one key/day, it won't show any highlights
                        // You need at least two keys/days for highlight to show
                        highlight_highest_point();

                        function highlight_highest_point() {
                            if (Object.keys($scope.backgroundPage.total_blocked_per_day).length >= 1) {
                                var bottom_left = g.toDomCoords(new Date(starting_highlight));
                                var top_right = g.toDomCoords(new Date(ending_highlight));
                
                                var left = bottom_left[0];
                                var right = top_right[0];
                
                                canvas.fillStyle = "#369C53";
                                canvas.fillRect(left, area.y, right - left, area.h);
                            }
                        }
                    },
                    showRangeSelector: true,
                    labels: ['Date', 'Blocked #'],
                    title: 'Blocked Per Day - Line Graph',
                    titleHeight: 30,
                }
            );

            $scope.graphModal();
        }
    }

    // I will try to find a better solution for all these different modals later (there may be more)

    $scope.graphModal = function(message) {
        $scope.show_modal_bar_chart_icon = true;
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = false;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "block";
        $scope.show_modal_search_history_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("Graph", message, "text-black");
    }

    $scope.inputModal = function(title, message) {
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = true;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_input = true;
        $scope.show_modal_message_class = false;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_search_history_button = true;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal(title, message, "text-black");
    };

    $scope.confirmModal = function(message, functionVariable, parameterVariable) {
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = true;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.function = functionVariable;
        $scope.parameter = parameterVariable;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_search_history_button = false;
        $scope.show_modal_confirm_button = true;
        $scope.show_modal_close_button = false;
        $scope.modal("PLEASE CONFIRM", message, "text-black");
    };

    $scope.alertModal = function(message) {
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = true;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_search_history_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("ALERT", message, "text-info-emphasis");
    };

    $scope.successModal = function(message) {
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = true;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_search_history_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("SUCCESS", message, "text-success");
    };

    $scope.errorModal = function(message) {
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = true;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_search_history_button = false;
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