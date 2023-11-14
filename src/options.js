var app = angular.module('RequestBlockerApp', ['ngSanitize']);

app.controller('OptionsController', function($scope) {
    $scope.backgroundPage = chrome.extension.getBackgroundPage();

    $scope.extension_version = chrome.runtime.getManifest().version;

    $scope.patterns = $scope.backgroundPage.patterns.map(function(x, i) {
        return {
            index: i,
            pattern: x
        };
    });

    $scope.button_is_pause_color = $scope.backgroundPage.button_is_pause_color;

    $scope.total_blocked = $scope.backgroundPage.total_blocked;

    if ($scope.patterns.length === 0) {
        $scope.is_empty = true;
    } else {
        $scope.is_empty = false;
    }

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

    $scope.resetTotalBlocked = function() {
        if ($scope.total_blocked === 0) {
            $scope.errorModal(
                "Your total blocked request is already at 0." // message
            );
        } else {
            $scope.confirmModal(
                "Are you sure you want to reset your total blocked requests to 0?", // message
                "resetTotalBlockedConfirmed" // function
            );
        }
    };

    $scope.resetTotalBlockedConfirmed = function() {
        $scope.total_blocked = 0;

        chrome.storage.local.set({'total_blocked': $scope.total_blocked}, function() {

        });

        $scope.successModal(
            "Your total blocked requests has been reset. It is now 0." // message
        );

        chrome.runtime.sendMessage({type: "reload-background-script"});
    };

    $scope.add = function(site) {
        if (site === undefined) {
            $scope.patterns.push({
                index: $scope.patterns.length,
                pattern: ''
            });
            $scope.scrollDown();
            $scope.is_empty = false;
        } else {
            $scope.patterns.push({
                index: $scope.patterns.length,
                pattern: site
            });
        }
    };

    $scope.removeByIndex = function(patternToRemove, showToast) {
        var index = $scope.patterns.indexOf(patternToRemove);

        if (index > -1) {
            $scope.patterns.splice(index, 1);
        }

        if ($scope.patterns.length === 0) {
            $scope.is_empty = true;
        }

        if (showToast === undefined || showToast !== false) {
            $scope.deleteToast(
                "You have removed, \"<u>" + patternToRemove.pattern + "</u>\", from your patterns.<br><br>You can save now or later. Just please don't forget to save!" // message
            );
        }
    };

    $scope.save = function(msg) {
        /*
        For those that are unaware of the structure of a URL here's a basic overview of https://ads.twitter.com/
        https:// is the protocol
        ads is the subdomain
        twitter is the domain or sometimes called second-level domain (SLD/2LD)
        com is the top-level domain (TLD)
        */
        var prefix = "*://*.";
        var suffix = "/*";
        var removedEmptyElements = [];
        var patterns = $scope.patterns;

        for (var i = 0; i < patterns.length; i++) { 
            if (patterns[i].pattern.substring(0, 8) === "https://" || patterns[i].pattern.substring(0, 7) === "http://") {
                // Matching exact URLs (ex. https://www.youtube.com/watch?v=CDokUdux0rc or https://github.com/trien-hong/ChromeHttpRequestBlocker)
                // For matching exact URLs, I still need to check for duplicates and be able to remove them inline since I don't want to refresh the page
                removedEmptyElements.push(patterns[i].pattern);
            } else if (patterns[i].pattern.substring(0, 6) !== prefix && patterns[i].pattern !== "") {
                // Matching domains/second-level domains, subdomain(s), file path, and ip adresses (ex. youtube.com, www.google.com, test.com/picture.png, and 12.34.56.78)
                var completePattern = prefix + patterns[i].pattern + suffix;
                var checkPattern = obj => obj.pattern === completePattern;

                if (patterns.some(checkPattern) === true) {
                    // If pattern already exist, it'll be removed
                    $scope.patterns.splice(i, 1);
                    i--;
                } else {
                    // If the pattern does not contain a prefix ("*://*."), it'll be added here along with a suffix ("/*")
                    $scope.patterns[i].pattern = completePattern;
                    removedEmptyElements.push(completePattern);
                }
            } else if (patterns[i].pattern === "") {
                // If the pattern is "" (empty), it'll be removed
                $scope.patterns.splice(i, 1);
                i--;
            } else {
                // If the pattern already has the correct patterns
                removedEmptyElements.push(patterns[i].pattern);
            }
        }

        $scope.backgroundPage.save(removedEmptyElements, function() {
            $scope.$apply(function() {
                if (msg === undefined) {
                    $scope.successModal(
                        "Your patterns has been saved.<br><br>Any pattern(s) that were empty (\"\") have been removed.<br><br>If your pattern(s) contains any duplicates, it was also removed (beyond the first)." // message
                    );
                } else {
                    $scope.successModal(
                        msg // message
                    );
                }

                if ($scope.patterns.length === 0) {
                    $scope.is_empty = true;
                }

                chrome.runtime.sendMessage({type: "reload-background-script"});
            });
        });
    };

    $scope.exportPatterns = function() {
        if ($scope.patterns.length === 0) {
            $scope.errorModal(
                "Your patterns seems to be empty. Therefore, there was nothing to export.<br><br>Please try adding some websites first." // message
            );
        } else {
            var patterns = $scope.backgroundPage.patterns.map(function(x) {
                return x;
            });
    
            var exportData = (function() {
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style = 'display: none';
        
                return function(fileName) {
                    blob = new Blob([patterns], {type: 'octet/stream'}),
                    url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    $scope.successModal(
                        "Your patterns has been exported. Please be sure to download it. Also remember that you can always import this file in the future.<br><br>Depending on the size of your patterns, it may take some time to load." // message
                    );
                };
            }());
        
            var today = new Date();
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var dd = String(today.getDate()).padStart(2, '0');
            var yyyy = today.getFullYear();
        
            today = mm + '-' + dd + '-' + yyyy;
        
            var fileName = "patternsExport" + "_" + today + ".txt";
        
            exportData(fileName);
        }
    };

    $scope.searchAndRemove = function() {
        $('#input').val('');

        if ($scope.patterns.length === 0) {
            $scope.errorModal(
                "Your patterns seems to be empty. Therefore, there was nothing to search and remove.<br><br>Please try adding some websites first." // message
            );
        } else {
            $scope.inputModal(
                "SEARCH & REMOVE", // title
                "Please enter the pattern (without \"*://*.\" & \"/*\") in which you want to remove. Enter only one at a time.", // message
                "ex. adbrain.com, 12.34.56.78, ads.twitter.com, www.youtube.com, https://test.com/ad.js?v=3, etc.", // placeholder
                "searchAndRemoveInput" // function
            );
        }
    };

    $scope.searchAndRemoveInput = function() {
        var input = $('#input').val();
        
        if (input.substring(0, 8) === "https://" || input.substring(0, 7) === "http://") {
            var object = $scope.patterns.find(patterns => patterns.pattern === input);
        } else {
            var object = $scope.patterns.find(patterns => patterns.pattern === "*://*." + input + "/*");
        }

        if (object !== undefined) {
            $scope.confirmModal(
                "A match was found at index " + object.index + " with the pattern \"<u>" + object.pattern + "</u>\".<br><br>Are you sure you want to remove it?", // message
                "searchAndRemoveInputConfirmed", // function
                object // parameter
            );
        } else if (input === "") {
            $scope.errorModal(
                "Sorry, your input was empty (\"\").<br><br>Please try a different input.", // message
                "searchAndRemove" // function
            );
        } else {
            $scope.errorModal(
                "Sorry, your input of, \"<u>" + input + "</u>\", could not be found.<br><br>Please try a different input.", // message
                "searchAndRemove" // function
            );
        }
    };

    $scope.searchAndRemoveInputConfirmed = function(pattern) {
        $scope.removeByIndex(pattern, false);
        $scope.save("Your pattern, \"<u>" + pattern.pattern + "</u>\", has been removed at index " + pattern.index + ".");
    };

    $scope.clearPatterns = function() {
        if ($scope.patterns.length === 0) {
            $scope.errorModal(
                "Your patterns seems to be empty. Therefore, there was nothing to clear.<br><br>Please try adding some websites first." // message
            );
        } else {
            $scope.confirmModal(
                "Are you sure you want to clear your current patterns?<br><br>Depending on the size of your patterns, it may take some time to load.", // message
                "clearPatternsConfirmed" // function
            );
        }
    };

    $scope.clearPatternsConfirmed = function(showClearPatternsConfirmModal) {
        var length = $scope.patterns.length;

        for (var i = 0; i < length; i++) {
            $scope.patterns.splice(0, 1);
        }

        if (showClearPatternsConfirmModal !== false) {
            $scope.save("Your patterns has been cleared.");
        }
    };

    $scope.uploadFile = function() {
        $scope.confirmModal(
            "Please note that importing patterns from a file will overwrite your current patterns. Are you okay with that?<br><br>Depending on the size of your patterns, it may take some time to load.", // message
            "uploadFileConfirmed" // function
        );
    };

    $scope.uploadFileConfirmed = function() {
        try {
            var file = document.getElementById('file').files[0];

            if (file["type"] === "text/plain") {
                var reader = new FileReader();

                reader.onloadend = function(e) {
                    var patterns = e.target.result.split(",");

                    $scope.clearPatternsConfirmed(false);

                    for (var i = 0; i < patterns.length; i++) {
                        var checkPattern = obj => obj.pattern === patterns[i];
                    
                        if ($scope.patterns.some(checkPattern) === false) {
                            $scope.add(patterns[i]);
                        }
                    }

                    $scope.is_empty = false;

                    $scope.save("Your new patterns has been imported. If the file contains any duplicate patterns, it will not be added beyond the first.");
                }
                reader.readAsBinaryString(file);
            } else {
                $scope.errorModal(
                    "The file you've uploaded doesn't seem to be a text file.<br><br>Please try a different file or try again." // message
                );
            }
        } catch {
            $scope.errorModal(
                "There seems to be an error with uploading and/or reading your file. It's also possible that you did not choose a file.<br><br>Please try a different file or try again." // message
            );
        }
    };

    $scope.scrollUp = function() {
        var objDiv = document.getElementsByClassName("patterns")[0];
        objDiv.scrollTo({top: 0, behavior: "smooth"});
    };

    $scope.scrollDown = function() {
        var objDiv = document.getElementsByClassName("patterns")[0];
        objDiv.scrollTo({top: objDiv.scrollHeight, behavior: "smooth"});
    };

    $scope.deleteToast = function(message) {
        $scope.show_toast_save_button = true;
        $scope.toast("HTTP Request Blocker", "Just now", message);
    };

    $scope.toast = function(title, subtitle, message) {
        $scope.toastTitle = title;
        $scope.toastSubtitle = subtitle;
        $scope.toastMessage = message;
        $('#modal').modal('hide');
        $('#toast').toast('show');
    };

    // I will try to find a better solution for all these different modals later
    
    $scope.inputModal = function(title, message, placeholder, inputFunctionVariable, inputParameterVariable) {
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
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_input_button = true;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-lg", title, message, "text-black");
    };

    $scope.confirmModal = function(message, confirmFunctionVariable, confirmParameterVariable) {
        // Not all confirm modal will have a confirmParameterVariable
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = true;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.confirm_function = confirmFunctionVariable;
        $scope.confirm_parameter = confirmParameterVariable;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = true;
        $scope.show_modal_close_button = false;
        $scope.modal("modal-default", "PLEASE CONFIRM", message, "text-black");
    };

    $scope.alertModal = function(message) {
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = true;
        $scope.show_modal_success_icon = false;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "ALERT", message, "text-info-emphasis");
    };

    $scope.successModal = function(message) {
        $scope.show_modal_input_icon = false;
        $scope.show_modal_confirm_icon = false;
        $scope.show_modal_alert_icon = false;
        $scope.show_modal_success_icon = true;
        $scope.show_modal_error_icon = false;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        $scope.show_modal_go_back_button = false;
        $scope.show_modal_input_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("modal-default", "SUCCESS", message, "text-success");
    };

    $scope.errorModal = function(message, errorFunctionVariable, errorParameterVariable) {
        // Not all error modal will have a errorParameterVariable
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