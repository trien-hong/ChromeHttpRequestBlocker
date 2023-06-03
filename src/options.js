var app = angular.module('RequestBlockerApp', []);

app.controller('OptionsController', function($scope) {
    $scope.backgroundPage = chrome.extension.getBackgroundPage();

    $scope.patterns = $scope.backgroundPage.patterns.map(function(x, i) {
        return {
            index: i,
            pattern: x
        };
    });

    $scope.button_is_pause_color = $scope.backgroundPage.button_is_pause_color;

    $scope.is_pause = $scope.backgroundPage.is_pause;

    $scope.is_empty = $scope.backgroundPage.is_empty;

    $scope.total_blocked = $scope.backgroundPage.total_blocked;

    chrome.storage.local.get("is_pause", function(data) {
        var is_pause = data.is_pause;

        $scope.pause = function() {
            if (is_pause === undefined || is_pause === false) {
                // extension is currently not on pause (is blocking sites)
                // user wants to PAUSE extension
                chrome.storage.local.set({'is_pause': true}, function() {
                
                });
                $scope.is_pause = "Unpause extension";
                $scope.button_is_pause_color = "btn-success";
                
                $scope.alertModal("Extension is now PAUSED. All patterns will not be blocked.");
            } else {
                // extension is currently on pause (is not blocking sites)
                // user wants to UNPAUSE extension
                chrome.storage.local.set({'is_pause': false}, function() {
                
                });
                $scope.is_pause = "Pause extension";
                $scope.button_is_pause_color = "btn-danger";
                
                $scope.alertModal("Extension is now UNPAUSED. All patterns will be blocked.");
            }

            chrome.storage.local.get("is_pause", function(data) {
                is_pause = data.is_pause;
            });

            chrome.runtime.sendMessage({type: "reload-background-script"});
        }
    });

    $scope.resetTotalBlocked = function() {
        if ($scope.total_blocked === 0) {
            $scope.errorModal("Your total blocked request is already at 0.");
        } else {
            $scope.confirmModal("Are you sure you want to reset your total blocked requests to 0?", "resetTotalBlockedConfirmed");
        }
    };

    $scope.resetTotalBlockedConfirmed = function() {
        chrome.storage.local.set({'total_blocked': 0}, function() {

        });

        $scope.total_blocked = 0;
        $scope.successModal("Your total blocked requests has been reset. It is now 0.");

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

    $scope.removeByIndex = function(patternToRemove) {
        var index = $scope.patterns.indexOf(patternToRemove);

        if (index > -1) {
            $scope.patterns.splice(index, 1);
        }

        if ($scope.patterns.length === 0) {
            $scope.is_empty = true;
        }
    };

    $scope.save = function(msg) {
        /*
        for matching exact URLs, I still need to check for duplicates and be able to remove them inline since I don't want to refresh the page
        the implementation I did below matching exact URLs doesn't work here becuse it's modifying the existing one
        since exact URLs aren't modified it'll just check for itself and remove itself which doesn't help
        i may have to redo the entire save. for now, just know it doesn't remove duplicates for exact URLs
        you can remove duplicates manually if you managed to add them in and find them
        */
        var prefix = "*://*.";
        var suffix = "/*";
        var removedEmptyElements = [];
        var patterns = $scope.patterns;

        for (var i = 0; i < patterns.length; i++) { 
            if (patterns[i].pattern.substring(0, 8) === "https://" || patterns[i].pattern.substring(0, 7) === "http://") {
                // Matching exact URLs (ex. https://www.youtube.com/watch?v=CDokUdux0rc or https://github.com/trien-hong/ChromeHttpRequestBlocker)
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
                    // If the pattern does not contain a prefix, it'll be added here along with a suffix
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
                    $scope.successModal("Your patterns has been saved. Any pattern(s) that were \"\" (empty) have been removed. If your pattern(s) contains any duplicates, it was also removed (beyond the first).");
                } else {
                    $scope.successModal(msg);
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
            $scope.errorModal("Your patterns seems to be empty. Therefore, there was nothing to export. Please try adding some websites first.");
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
                    $scope.successModal("Your patterns has been exported. Please be sure to download it. Also remember that you can always import this file in the future. Depending on the size of your patterns, it may take some time to load.");
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
        $('#searchAndRemoveInput').val('');

        if ($scope.patterns.length === 0) {
            $scope.errorModal("Your patterns seems to be empty. Therefore, there was nothing to search and remove. Please try adding some websites first.");
        } else {
            $scope.inputModal("SEARCH & REMOVE", "Please enter the pattern in which you want to remove.");
        }
    };

    $scope.searchAndRemoveInput = function() {
        var input = $('#searchAndRemoveInput').val();
        
        if (input.substring(0, 8) === "https://" || input.substring(0, 7) === "http://") {
            var object = $scope.patterns.find(patterns => patterns.pattern === input);
        } else {
            var object = $scope.patterns.find(patterns => patterns.pattern === "*://*." + input + "/*");
        }

        if (object !== undefined) {
            $scope.confirmModal("A match was found at index " + object.index + " with the pattern \"" + object.pattern + "\". Are you sure you want to remove it?", "searchAndRemoveInputConfirmed", object);
        } else if (input === "") {
            $scope.errorModal("Sorry, your input was empty (\"\"). Please try a different input.");
        } else {
            $scope.errorModal("Sorry, your input of \"" + input + "\" could not be found. Please try a different input.");
        }
    };

    $scope.searchAndRemoveInputConfirmed = function(pattern) {
        $scope.removeByIndex(pattern);
        $scope.save("Your pattern, \"" + pattern.pattern + "\", has been removed at index " + pattern.index + ".");
    };

    $scope.clearPatterns = function() {
        if ($scope.patterns.length === 0) {
            $scope.errorModal("Your patterns seems to be empty. Therefore, there was nothing to clear. Please try adding some websites first.");
        } else {
            $scope.confirmModal("Are you sure you want to clear your current patterns? Depending on the size of your patterns, it may take some time to load.", "clearPatternsConfirmed");
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
        $scope.confirmModal("Please note that importing patterns from a file will overwrite your current patterns. Are you okay with that? Depending on the size of your patterns, it may take some time to load.", "uploadFileConfirmed");
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
                $scope.errorModal("The file you've uploaded doesn't seem to be a text file. Please try a different file or try again.");
            }
        } catch {
            $scope.errorModal("There seems to be an error with uploading and/or reading your file. It's also possible that you did not choose a file. Please try a different file or try again.");
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

    // I will try to find a better solution for all these different modals later
    
    $scope.inputModal = function(title, message) {
        $scope.show_modal_input = true;
        $scope.show_modal_message_class = false;
        $scope.show_modal_search_remove_button = true;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal(title, message, "text-black");
    };

    $scope.confirmModal = function(message, functionVariable, parameterVariable) {
        $scope.function = functionVariable;
        $scope.parameter = parameterVariable;
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        $scope.show_modal_search_remove_button = false;
        $scope.show_modal_confirm_button = true;
        $scope.show_modal_close_button = false;
        $scope.modal("PLEASE CONFIRM", message, "text-black");
    };

    $scope.alertModal = function(message) {
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        $scope.show_modal_search_remove_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("ALERT", message, "text-info");
    };

    $scope.successModal = function(message) {
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        $scope.show_modal_search_remove_button = false;
        $scope.show_modal_confirm_button = false;
        $scope.show_modal_close_button = true;
        $scope.modal("SUCCESS", message, "text-success");
    };

    $scope.errorModal = function(message) {
        $scope.show_modal_input = false;
        $scope.show_modal_message_class = true;
        $scope.show_modal_search_remove_button = false;
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