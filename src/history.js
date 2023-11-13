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

    $scope.total_blocked_per_day = $scope.backgroundPage.total_blocked_per_day;

    if ($scope.total_blocked_per_day.length === 0) {
        $scope.total_blocked_today = 0;
    } else if ($scope.total_blocked_per_day[$scope.total_blocked_per_day.length - 1]["date"] === timeStamp.getMonth() + 1 + "/" + timeStamp.getDate() + "/" + timeStamp.getFullYear()) {
        $scope.total_blocked_today = $scope.total_blocked_per_day[$scope.total_blocked_per_day.length - 1]["blocked_number"];
    } else {
        $scope.total_blocked_today = 0;
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

    $scope.pageRange = function() {
        var pages = [];

        for (var i = 1; i <= $scope.max_page; i++) {
            pages.push(i);
        }

        return pages;
    };

    $scope.modalPageNumber = function() {
        // Go to a specific page number via input modal
        $('#input').val('');

        if ($scope.max_page === 1) {
            $scope.alertToast(
                "There is currently only 1 page." // message
            );
        } else {
            $scope.inputModal(
                "INPUT PAGE NUMBER", // title
                "Please enter the page number you want to go to. You can only enter between (inclusive) 1 and " + $scope.max_page + ".", // message
                "ex. 1, 2, 3, etc.", // placeholder
                "modalPageNumberInput" // function
            );
        }
    };

    $scope.modalPageNumberInput = function() {
        var input = $('#input').val();

        if (input === "") {
            // Empty string
            $scope.errorModal(
                "Sorry, your input was empty (\"\").<br><br>You can only enter between 1 and " + $scope.max_page + " (inclusive).", // message
                "modalPageNumber" // function
            );
        } else if (!/^-?\d+$/.test(input)) {
            // Not a number (including decimals)
            $scope.errorModal(
                "Your input of, \"<u>" + input + "</u>\", doesn't seem to be a valid number.<br><br>You can only enter between 1 and " + $scope.max_page + " (inclusive).", // message
                "modalPageNumber" // function
            );
        } else if (input <= 0) {
            // A negative number
            $scope.errorModal(
                "Your input of, \"<u>" + input + "</u>\", is a negative number.<br><br>You can only enter between 1 and " + $scope.max_page + " (inclusive).", // message
                "modalPageNumber" // function
            );
        } else if (input > $scope.max_page) {
            // Number greater than max page
            $scope.errorModal(
                "Your input of, \"<u>" + input + "</u>\", is greater than the maxium page number.<br><br>You can only enter between 1 and " + $scope.max_page + " (inclusive).", // message
                "modalPageNumber" // function
            );
        } else if ($scope.page_number === parseInt(input - 1)) {
            // Page number is already the same as input
            $scope.alertToast(
                "You are already on page <u>" + input + "</u>." // message
            );
        } else {
            $scope.page_number = parseInt(input - 1);
            $scope.page = $scope.url_blocked[$scope.page_number];
            
            $scope.checkArrowIcons();

            if ($scope.page_number === 0) {
                $scope.alertToast(
                    "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the first page." // message
                );
            } else if ($scope.page_number === $scope.max_page - 1) {
                $scope.alertToast(
                    "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the last page." // message
                );
            } else {
                $scope.alertToast(
                    "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>." // message
                );
            }
        }
    };

    $scope.dropdownMenuPageNumber = function(index) {
        // Go to a specific page number via dropdown menu
        if ($scope.max_page === 1) {
            $scope.alertToast(
                "There is currently only <u>1</u> page." // message
            );
        } else if ($scope.page_number === index - 1) {
            $scope.alertToast(
                "You are already on page <u>" + index + "</u>." // message
            );
        } else {
            $scope.page_number = index - 1;
            $scope.page = $scope.url_blocked[$scope.page_number];

            $scope.checkArrowIcons();
 
            if ($scope.page_number === 0) {
                $scope.alertToast(
                    "You are now on page <u>" + index + "</u>. This is the first page." // message
                );
            } else if ($scope.page_number === $scope.max_page - 1) {
                $scope.alertToast(
                    "You are now on page <u>" + index + "</u>. This is the last page." // message
                );
            } else {
                $scope.alertToast(
                    "You are now on page <u>" + index + "</u>." // message
                );
            }
        }
    };

    $scope.decreasePageNumber = function() {
        // Decrease page number by 1
        $scope.page_number = $scope.page_number - 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();

        if ($scope.page_number === 0) {
            $scope.alertToast(
                "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the first page." // message
            );
        } else if ($scope.page_number === $scope.max_page - 1) {
            $scope.alertToast(
                "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the last page." // message
            );
        } else {
            $scope.alertToast(
                "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>." // message
            );
        }
    };

    $scope.increasePageNumber = function() {
        // Increase page number by 1
        $scope.page_number = $scope.page_number + 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();

        if ($scope.page_number === 0) {
            $scope.alertToast(
                "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the first page." // message
            );
        } else if ($scope.page_number === $scope.max_page - 1) {
            $scope.alertToast(
                "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the last page." // message
            );
        } else {
            $scope.alertToast(
                "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>." // message
            );
        }
    };

    $scope.firstPageNumber = function() {
        // Go to page 0 (first page)
        $scope.page_number = 0;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();

        $scope.alertToast(
            "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the first page." // message
        );
    };

    $scope.lastPageNumber = function() {
        // Go to the max page (last page)
        $scope.page_number = $scope.max_page - 1;
        $scope.page = $scope.url_blocked[$scope.page_number];

        $scope.checkArrowIcons();

        $scope.alertToast(
            "You are now on page <u>" + parseInt($scope.page_number + 1) + "</u>. This is the last page." // message
        );
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
        $('#input').val('');

        if ($scope.is_empty === true) {
            $scope.errorModal(
                "Your history seems to be empty. Therefore, there was nothing to search.<br><br>History will only update when a URL/request is blocked." // message
            );
        } else {
            $scope.inputModal(
                "SEARCH HISTORY", // title
                "Please enter the EXACT URL in which you want to search for. Enter only one at a time.", // message
                "ex. http://www.google-analytics.com/ga.js, https://test.com/ad.js?v=3, https://www.doubleclick.net/, etc.", // placeholder
                "searchHistoryInput" // function
            );
        }
    };

    $scope.searchHistoryInput = function() {
        var input = $('#input').val();
        var found = false;
        var index = 0;

        if (input === "") {
            $scope.errorModal(
                "Sorry, your input was empty (\"\").<br><br>Please try a different input.", // message
                "searchHistory" // function
            );
        } else {
            for (var i = 0; i < $scope.max_page; i++) {
                if ($scope.url_blocked[i][input] !== undefined) {
                    found = true;
                    index = i + 1;
                    break;
                }
            }

            if (found === true) {
                $scope.page_number = index - 1;
                $scope.page = $scope.url_blocked[$scope.page_number];

                $scope.checkArrowIcons();

                $scope.successModal(
                    "Your input of, \"<u>" + input + ",</u>\" had a match and was found on page " + index + ".<br><br>If you were not already on page " + index + ", you have been taken there automatically." // message
                );
            } else {
                $scope.errorModal(
                    "Sorry, your input of, \"<u>" + input + "</u>\", was not found in your history.<br><br>Please try a different input.", // message
                    "searchHistory" // function
                );
            }
        }
    };

    $scope.clearHistory = function() {
        if ($scope.is_empty === true) {
            $scope.errorModal(
                "Your history seems to be empty. Therefore, there was nothing to clear.<br><br>History will only update when a URL/request is blocked." // message
            );
        } else {
            $scope.confirmModal(
                "Are you sure you want to clear your history? This will not affect your graph/total blocked per day.<br><br>Depending on the size of your history, it may take some time to load.", // message
                "clearHistoryConfirmed" // function
            );
        }
    };

    $scope.clearHistoryConfirmed = function() {
        $scope.is_empty = true;
        $scope.show_page_arrow_left_icon = false;
        $scope.show_page_arrow_right_icon = false;
        $scope.page_number = 0;
        $scope.max_page = 1;
        $scope.url_blocked = undefined;
        $scope.page = $scope.url_blocked;

        $scope.successModal(
            "Your history has been cleared." // message
        );

        chrome.runtime.sendMessage({type: "clear-url_blocked"});
    };

    $scope.viewGraph = function() {
        if ($scope.total_blocked_per_day.length === 0) {
            $scope.errorModal(
                "Your \"total blocked per day seems\" to be empty or recently cleared. Therefore, there was no graph to draw.<br><br>You can only view a graph if the extension has blocked a URL." // message
            );
        } else {
            var graph_data = [];
            var starting_highlight_highest_point = undefined;
            var ending_highlight_highest_point = undefined;
            var starting_highlight_lowest_point = undefined;
            var ending_highlight_lowest_point = undefined;
            var highest = 0;
            var lowest = Number.MAX_SAFE_INTEGER;

            for (var i = 0; i < $scope.total_blocked_per_day.length; i++) {
                var insert_graph_data = [];
                insert_graph_data.push(new Date($scope.total_blocked_per_day[i]["date"]));
                insert_graph_data.push($scope.total_blocked_per_day[i]["blocked_number"]);
                graph_data.push(insert_graph_data);
                
                if ($scope.total_blocked_per_day[i]["blocked_number"] > highest) {
                    var start_date = new Date($scope.total_blocked_per_day[i]["date"]);
                    var end_date = new Date($scope.total_blocked_per_day[i]["date"]);

                    starting_highlight_highest_point = start_date.setHours(start_date.getHours() - 4);
                    ending_highlight_highest_point = end_date.setHours(end_date.getHours() + 4);
                    highest = $scope.total_blocked_per_day[i]["blocked_number"];
                }

                if ($scope.total_blocked_per_day[i]["blocked_number"] < lowest) {
                    var start_date = new Date($scope.total_blocked_per_day[i]["date"]);
                    var end_date = new Date($scope.total_blocked_per_day[i]["date"]);

                    starting_highlight_lowest_point = start_date.setHours(start_date.getHours() - 4);
                    ending_highlight_lowest_point = end_date.setHours(end_date.getHours() + 4);
                    lowest = $scope.total_blocked_per_day[i]["blocked_number"];
                }
            }
    
            draw_line_graph = new Dygraph(
                document.getElementById("line_graph"),
                graph_data, {
                    height: 500,
                    width: 1100,
                    colors: ['#A33434'],
                    fillGraph: true,
                    fillAlpha: 0.4,
                    underlayCallback: function(canvas, area, g) {
                        // Used to highlight the day (+/- 4 hours) with the highest blocked URL/request
                        // If there's only one key/day, it won't show any highlights
                        // You need at least two keys/days for highlight to show
                        highlight_lowest_point();

                        function highlight_lowest_point() {
                            if ($scope.total_blocked_per_day.length >= 2) {
                                var bottom_left = g.toDomCoords(new Date(starting_highlight_lowest_point));
                                var top_right = g.toDomCoords(new Date(ending_highlight_lowest_point));
                
                                var left = bottom_left[0];
                                var right = top_right[0];
                
                                canvas.fillStyle = "#9DC8F3";
                                canvas.fillRect(left, area.y, right - left, area.h);
                            }
                        }

                        // Used to highlight the day (+/- 4 hours) with the lowest blocked URL/request
                        // If there's only one key/day, it won't show any highlights
                        // You need at least two keys/days for highlight to show
                        highlight_highest_point();

                        function highlight_highest_point() {
                            if ($scope.total_blocked_per_day.length >= 2) {
                                var bottom_left = g.toDomCoords(new Date(starting_highlight_highest_point));
                                var top_right = g.toDomCoords(new Date(ending_highlight_highest_point));
                
                                var left = bottom_left[0];
                                var right = top_right[0];
                
                                canvas.fillStyle = "#9DF3A2";
                                canvas.fillRect(left, area.y, right - left, area.h);
                            }
                        }
                    },
                    pointClickCallback: function(e, point) {
                        if (point["yval"] === lowest && point["yval"] === highest && lowest === highest) {
                            alert("The extension blocked a total of " + point["yval"] + " requests on " + new Date(point["xval"]).toLocaleString('default', { month: 'long' }) + " " + new Date(point["xval"]).getDate() + ", " + new Date(point["xval"]).getFullYear() + ".\n\nThis day is also your lowest and highest (same) in terms of blocked requests.");
                        } else if (point["yval"] === lowest) {
                            alert("The extension blocked a total of " + point["yval"] + " requests on " + new Date(point["xval"]).toLocaleString('default', { month: 'long' }) + " " + new Date(point["xval"]).getDate() + ", " + new Date(point["xval"]).getFullYear() + ".\n\nThis day is also your lowest in terms of blocked requests.");
                        } else if (point["yval"] === highest) {
                            alert("The extension blocked a total of " + point["yval"] + " requests on " + new Date(point["xval"]).toLocaleString('default', { month: 'long' }) + " " + new Date(point["xval"]).getDate() + ", " + new Date(point["xval"]).getFullYear() + ".\n\nThis day is also your highest in terms of blocked requests.");
                        } else {
                            alert("The extension blocked a total of " + point["yval"] + " requests on " + new Date(point["xval"]).toLocaleString('default', { month: 'long' }) + " " + new Date(point["xval"]).getDate() + ", " + new Date(point["xval"]).getFullYear() + ".");
                        }
                    },
                    showRangeSelector: true,
                    labels: ['Date', 'Blocked #'],
                    xlabel: "<b>Day</b>",
                    ylabel: "<b>Blocked #</br>",
                    title: 'Blocked Per Day - Line Graph',
                    titleHeight: 30
                }
            );

            $scope.graphModal();
        }
    };

    $scope.clearGraph = function() {
        $scope.confirmModal(
            "Are you sure you want to clear your graph?<br><br>Clearing your graph will clear all data associated with total blocked per day. This will not affect your history.", // message
            "clearGraphConfirmed" // function
        );
    };

    $scope.clearGraphConfirmed = function() {
        $scope.total_blocked_today = 0;
        $scope.total_blocked_per_day = [];

        chrome.runtime.sendMessage({type: "clear-total_blocked_per_day"});

        $scope.successModal(
            "All data assocated with total blocked per day has been cleared." // message
        );
    };

    $scope.alertToast = function(message) {
        $scope.toast("HTTP Request Blocker", "Just now", message);
    };

    $scope.toast = function(title, subtitle, message) {
        $scope.toastTitle = title;
        $scope.toastSubtitle = subtitle;
        $scope.toastMessage = message;
        $('#modal').modal('hide');
        $('#toast').toast('show');
    };

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
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_clear_graph_button = true;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-xl", "GRAPH", message, "text-black");
    };

    $scope.inputModal = function(title, message, placeholder, inputFunctionVariable, inputParameterVariable) {
        // Not all input modal will have an inputParameterVariable
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = true;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.input_message = message;
        $scope.input_placeholder = placeholder;
        $scope.input_function = inputFunctionVariable;
        $scope.input_parameter = inputParameterVariable;
        $scope.show_modal_input = true;
        $scope.show_modal_message_class = false;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_clear_graph_button = false;
        $scope.show_modal_input_button = true;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-lg", title, message, "text-black");
    };

    $scope.confirmModal = function(message, confirmFunctionVariable, confirmParameterVariable) {
        // Not all confirm modal will have a confirmParameterVariable
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = true;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.confirm_function = confirmFunctionVariable;
        $scope.confirm_parameter = confirmParameterVariable;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_clear_graph_button = false;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = true;
        $scope.show_modal_close_button = false;
        $scope.modal("modal-default", "PLEASE CONFIRM", message, "text-black");
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
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_clear_graph_button = false;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "ALERT", message, "text-info-emphasis");
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
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_clear_graph_button = false;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "SUCCESS", message, "text-success");
    };

    $scope.errorModal = function(message, errorFunctionVariable, errorParameterVariable) {
        // Not all error modal will have a errorParameterVariable
        $scope.show_modal_bar_chart_icon = false;
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = true;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        if (errorFunctionVariable === undefined) {
            $scope.show_modal_go_back_button = false;
        } else {
            $scope.show_modal_go_back_button = true;
            $scope.error_function = errorFunctionVariable;
            $scope.error_parameter = errorParameterVariable;
        }
        var line_graph = document.getElementById("line_graph");
        line_graph.style.display = "none";
        $scope.show_modal_clear_graph_button = false;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "ERROR", message, "text-danger");
    };

    $scope.modal = function(size, title, message, modalClass) {
        $scope.modalSize = size;
        $scope.modalTitle = title;
        $scope.modalMessage = message;
        $scope.modalClass = modalClass;
        $('#toast').toast('hide');
        $('#modal').modal('show');
    };
});