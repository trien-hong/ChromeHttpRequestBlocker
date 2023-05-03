var app = angular.module('RequestBlockerApp', []);

app.controller('PopupController', function($scope) {
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

    chrome.storage.local.get("is_pause", function (data) {
        var is_pause = data.is_pause;

        $scope.pause = function() {
            if (is_pause === undefined || is_pause === false) {
                // extension is currently not on pause (is blocking sites)
                // user wants to PUASE extension
                chrome.storage.local.set({'is_pause': true}, function () {
                
                });
                $scope.is_pause = "Unpause Extension";
                $scope.button_is_pause_color = "btn-success";
                $scope.alert("Extension is now PAUSED. All patterns will not be blocked.");
            } else {
                // extension is currently on pause (is not blocking sites)
                // user wants to UNPUASE extension
                chrome.storage.local.set({'is_pause': false}, function () {
                
                });
                $scope.is_pause = "Pause Extension";
                $scope.button_is_pause_color = "btn-danger";
                $scope.alert("Extension is now UNPAUSED. All patterns will be blocked.");
            }
            chrome.storage.local.get("is_pause", function (data) {
                is_pause = data.is_pause;
            });
            chrome.runtime.sendMessage({type: "reload"});
        }
    });

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

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url;

        if (url !== undefined) {
            var newUrl = url.replace("www.", "");
            var website = newUrl.split("/");
        }

        $scope.addCurrentSite = function() {
            if (url === undefined) {
                $scope.error("This site you are trying to add doesn't seem to be a valid website.");
            } else {
                $scope.patterns.push({
                    index: $scope.patterns.length,
                    pattern: website[2]
                });
                
                $scope.scrollDown();
                $scope.is_empty = false;
            }
        }
    });

    $scope.remove = function(patternToRemove) {
        var index = $scope.patterns.indexOf(patternToRemove);

        if (index > -1) {
            $scope.patterns.splice(index, 1);
        }

        if ($scope.patterns.length === 0) {
            $scope.is_empty = true;
        }
    };

    $scope.save = function(msg) {
        var prefix = "*://*."
        var suffix = "/*"
        var removedEmptyElements = [];
        var patterns = $scope.patterns;

        for (var i = 0; i < $scope.patterns.length; i++) {
            if (patterns[i].pattern.includes(prefix) === false && patterns[i].pattern !== "") {
                // If the pattern does not contain a prefix, it'll be added here along with a suffix
                var completePattern = prefix + patterns[i].pattern + suffix;
                $scope.patterns[i].pattern = completePattern;
                removedEmptyElements.push(completePattern);
            } else if (patterns[i].pattern === "") {
                // If the pattern is "", it'll be removed
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
                    $scope.success("Your patterns has been saved. Any pattern(s) that were empty have also been removed.");
                } else {
                    $scope.success(msg);
                }
                chrome.runtime.sendMessage({type: "reload"});
            });
        });
    };

    $scope.exportPatterns = function() {
        if ($scope.patterns.length === 0) {
            $scope.error("Your patterns seems to be empty. There was nothing to export. Please try adding some websites first.");
        } else {
            var patterns = $scope.backgroundPage.patterns.map(function(x) {
                return x;
            });
    
            var exportData = (function () {
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style = 'display: none';
        
                return function (fileName) {
                    blob = new Blob([patterns], {type: 'octet/stream'}),
                    url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    $scope.success("Your patterns has been exported. Please be sure to download it. Also remember that you can always import this file in the future.");
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

    $scope.clearPatterns = function(confirmation) {
        if ($scope.patterns.length === 0 && confirmation === undefined) {
            $scope.error("Your patterns seems to be empty. Try adding some websites first.");
        } else if (confirmation === undefined) {
            if (confirm("Are you sure you want to clear your current patterns?\n\nDepending on the size of your patterns, it make take some time to load.") === true) {
                length = $scope.patterns.length;

                for (var i = 0; i < length; i++) {
                    $scope.patterns.splice(0, 1);
                }

                $scope.save("Your patterns has been cleared.");
                $scope.is_empty = true;
            }
        } else {
            length = $scope.patterns.length;

            for (var i = 0; i < length; i++) {
                $scope.patterns.splice(0, 1);
            }
        }
    };

    $scope.uploadFile = function() {
        if (confirm("Importing a patterns from a file will overwrite your current patterns.\n\nDepending on the size of your patterns, it make take some time to load.") === true) {
            try {
                var file = document.getElementById('file').files[0];

                if (file["type"] === "text/plain") {
                    var reader = new FileReader();

                    reader.onloadend = function(e) {
                        var patterns = e.target.result.split(",");

                        $scope.clearPatterns(1);

                        for (var i = 0; i < patterns.length; i++) {
                            $scope.add(patterns[i]);
                        }

                        $scope.save("Your new patterns has been imported.");
                        $scope.is_empty = false;
                    }

                    reader.readAsBinaryString(file);
                } else {
                    $scope.error("The file you've uploaded doesn't seem to be a text file. Please try a different file or try again.");
                }
            } catch {
                $scope.error("You did not choose a file to upload or there seems to be an error with uploading and/or reading your file. Please try a different file or try again.");
            }
        }
    };

    $scope.scrollDown = function() {
        window.scrollTo({top: document.body.scrollHeight, behavior: "smooth" });
    };

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
        $('#modal').modal();
    };
});