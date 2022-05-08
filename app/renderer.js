// Globals and Initializations
var rowLocalRemoteGo = false;
var rowSyncDirectionState = "push";
var rowSyncSelectionGo = false;
var rowSyncSelectionButtonsGo = false;
var rowStartSyncGo = false;



// Entrypoints
$(document).ready(function() {

    // Load Settings
    loadSettings();

    // Execute immediately once
    rowLocalRemote();
    rowSyncSelection();
    rowSyncSelectionButtons();
    rowTerminal();
    rowStartSync();
    footerLink();

    // Execute after rowLocalRemote Focusout
    $(".row-local-remote input").focusout(function() {
        rowLocalRemote();
        rowSyncSelection();
        rowStartSync();
    });

    // Execute after rowSyncDirection Input Click
    $(".row-sync-direction input").click(function() {
        rowSyncDirection();
        rowSyncSelection();
        rowSyncSelectionButtonsGoNoGo();
        rowStartSync();
    });

    // Execute after rowSyncSelection Button Click
    $(".row-sync-selection .list .list-control .buttons .btn").click(function() {
        rowSyncSelectionButtonsGoNoGo();
        rowSyncSelectionTotalSize();
        rowSyncSelectionSpaceAvailable();
        rowStartSync();
    });

    // Execute after rowSyncSelection Label Click
    $(document).on("click", ".row-sync-selection .list .list-group label", function() {
        rowSyncSelectionButtonsGoNoGo();
        rowSyncSelectionTotalSize();
        rowSyncSelectionSpaceAvailable();
        rowStartSync();
    });

    // Execute after rowStartSync Checkbox Click
    $(".row-start-sync .alert .form-check-input").click(function() {
        rowStartSync();
    });

    // Execute after rowStartSync Button Click
    $(".row-start-sync button").click(function() {
        rowStartSyncStartProcess();
    });
});



// Load Settings
function loadSettings() {
    var settingsObject = window.api.ipcRenderer.sendSync("settingsLoad");

    $(".row-local-remote #inputLocal").val(settingsObject.local);
    $(".row-local-remote #inputRemote").val(settingsObject.remote);

    if (settingsObject.direction == "push") {
        rowSyncDirectionState = "push";
        $(".row-sync-direction #syncDirectionPush").prop("checked", true);
        $(".row-sync-direction #syncDirectionPull").prop("checked", false);
    }
    else if (settingsObject.direction == "pull") {
        rowSyncDirectionState = "pull";
        $(".row-sync-direction #syncDirectionPush").prop("checked", false);
        $(".row-sync-direction #syncDirectionPull").prop("checked", true);
    }
}



// rowLocalRemote Logic
function rowLocalRemote() {
    
    // Set No-Go
    rowLocalRemoteGo = false;

    // Check if Paths for both Inputs are specified
    if ( ($(".row-local-remote #inputLocal").val() == "") || ($(".row-local-remote #inputRemote").val() == "") ) {

        // Set Alert Text
        if ( ($(".row-local-remote #inputLocal").val() == "") && ($(".row-local-remote #inputRemote").val() == "") ) {
            $(".row-local-remote .alert span").text("Please specify valid paths for the Local and Remote Directories!");
        }
        else if ($(".row-local-remote #inputLocal").val() == "") {
            $(".row-local-remote .alert span").text("Please specify a valid path for the Local Directory!");
        }
        else if ($(".row-local-remote #inputRemote").val() == "") {
            $(".row-local-remote .alert span").text("Please specify a valid path for the Remote Directory!");
        }

        // Display Alert
        $(".row-local-remote .alert").css("display", "block");
    }
    else {

        // Check if both Paths are not the same, existing and readable
        if ($(".row-local-remote #inputLocal").val() == $(".row-local-remote #inputRemote").val()) {

            // Set Alert Text
            $(".row-local-remote .alert span").text("The specified paths for the Local and Remote Directories can not be the same!");

            // Display Alert
            $(".row-local-remote .alert").css("display", "block");

        }
        else if ( (!window.api.ipcRenderer.sendSync("checkPath", $(".row-local-remote #inputLocal").val())) || (!window.api.ipcRenderer.sendSync("checkPath", $(".row-local-remote #inputRemote").val())) ) {

            // Set Alert Text
            if ( (!window.api.ipcRenderer.sendSync("checkPath", $(".row-local-remote #inputLocal").val())) && (!window.api.ipcRenderer.sendSync("checkPath", $(".row-local-remote #inputRemote").val())) ) {
                $(".row-local-remote .alert span").text("The specified paths for the Local and Remote Directories do not exist!");
            }
            else if (!window.api.ipcRenderer.sendSync("checkPath", $(".row-local-remote #inputLocal").val())) {
                $(".row-local-remote .alert span").text("The specified path for the Local Directory does not exist!");
            }
            else if (!window.api.ipcRenderer.sendSync("checkPath", $(".row-local-remote #inputRemote").val())) {
                $(".row-local-remote .alert span").text("The specified path for the Remote Directory does not exist!");
            }

            // Display Alert
            $(".row-local-remote .alert").css("display", "block");
        }
        else if ( (!Array.isArray(window.api.ipcRenderer.sendSync("getSubdirsOfPath", $(".row-local-remote #inputLocal").val()))) || (!Array.isArray(window.api.ipcRenderer.sendSync("getSubdirsOfPath", $(".row-local-remote #inputRemote").val()))) ) {
            
            // Set Alert Text
            if ( (!Array.isArray(window.api.ipcRenderer.sendSync("getSubdirsOfPath", $(".row-local-remote #inputLocal").val()))) && (!Array.isArray(window.api.ipcRenderer.sendSync("getSubdirsOfPath", $(".row-local-remote #inputRemote").val()))) ) {
                $(".row-local-remote .alert span").text("The specified paths for the Local and Remote Directories are not readable. Please check your permissions.");
            }
            else if (!Array.isArray(window.api.ipcRenderer.sendSync("getSubdirsOfPath", $(".row-local-remote #inputLocal").val()))) {
                $(".row-local-remote .alert span").text("The specified path for the Local Directory is not readable. Please check your permissions.");
            }
            else if (!Array.isArray(window.api.ipcRenderer.sendSync("getSubdirsOfPath", $(".row-local-remote #inputRemote").val()))) {
                $(".row-local-remote .alert span").text("The specified path for the Remote Directory is not readable. Please check your permissions.");
            }

            // Display Alert
            $(".row-local-remote .alert").css("display", "block");
        }
        else {

            // Reset Alert Text
            $(".row-local-remote .alert span").text("");

            // Hide Alert
            $(".row-local-remote .alert").css("display", "none");

            // Set Go
            rowLocalRemoteGo = true;
        }
    }

    // Save Settings
    window.api.ipcRenderer.sendSync("settingsSave", {
        type: "rowLocalRemote",
        data: {
            local: $(".row-local-remote #inputLocal").val(),
            remote: $(".row-local-remote #inputRemote").val()
        }
    });
}



// rowSyncDirection Logic
function rowSyncDirection() {

    // Update State of Sync Direction
    if ($(".row-sync-direction #syncDirectionPush").prop("checked")) {
        rowSyncDirectionState = "push";
    }
    else if ($(".row-sync-direction #syncDirectionPull").prop("checked")) {
        rowSyncDirectionState = "pull";
    }

    // Save Settings
    window.api.ipcRenderer.sendSync("settingsSave", {
        type: "rowSyncDirection",
        data: {
            direction: rowSyncDirectionState
        }
    });
}



// rowSyncSelection Logic: Core
function rowSyncSelection() {

    //Set No-Go
    rowSyncSelectionGo = false;

    // Inits
    var inputLocation = (rowSyncDirectionState == "push" ? "inputLocal" : "inputRemote");
    var outputLocation = (rowSyncDirectionState == "push" ? "inputRemote" : "inputLocal");
    var subdirsOfPath = window.api.ipcRenderer.sendSync("getSubdirsOfPath", $(".row-local-remote #" + inputLocation).val());

    // InputLocation has syncable directories
    if ( (rowLocalRemoteGo) && (subdirsOfPath.length > 0) ) {

        // Reset Alert Text
        $(".row-sync-selection .alert span").text("");

        // Hide Alert
        $(".row-sync-selection .alert").css("display", "none");

        // Refresh remaining Space on OutputLocation
        var remainingSpace = (window.api.ipcRenderer.sendSync("getAvailableSpaceOnDisk", $(".row-local-remote #" + outputLocation).val())).free;

        $(".row-sync-selection .list .list-control .stats .remaining .description").text("Space remaining on " + outputLocation.replace("input", "") + ": ");
        $(".row-sync-selection .list .list-control .stats .remaining .badge").attr("data-size", remainingSpace);
        $(".row-sync-selection .list .list-control .stats .remaining .badge").text(helperFindSuitableSizeSuffix(remainingSpace));

        // Fill List with Payload
        var listHtml = "";

        for (var counter = 0; counter < subdirsOfPath.length; counter++) {
            var currentFsObjectPath = $(".row-local-remote #" + inputLocation).val() + "/" + subdirsOfPath[counter];
            var currentFsObjectStats = window.api.ipcRenderer.sendSync("getFsObjectMetainfo", currentFsObjectPath);

            listHtml += `
            <label class="list-group-item d-flex justify-content-between align-items-center" data-filename=` + subdirsOfPath[counter] + `>
                <input class="form-check-input me-1" type="checkbox" value="">

                <div class="ms-2 me-auto">
                    <div class="fw-bold">` + subdirsOfPath[counter] + `</div>

                    <div class="stats">
                        <span>Created on: ` + helperFormatDateTime(currentFsObjectStats.birthtime) + `</span><br>
                        <span>Last accessed on: ` + helperFormatDateTime(currentFsObjectStats.atime) + `</span>
                    </div>
                </div>

                <span class="badge bg-primary rounded-pill" data-size="` + window.api.ipcRenderer.sendSync("getSizeOfDirectory", currentFsObjectPath) + `">` + helperFindSuitableSizeSuffix(window.api.ipcRenderer.sendSync("getSizeOfDirectory", currentFsObjectPath)) + `</span>
            </label>
            `;
        }
        $(".row-sync-selection .list .list-group").html(listHtml);

        // Reset ListControl Stats
        rowSyncSelectionTotalSize();
        rowSyncSelectionSpaceAvailable();

        // Show List
        $(".row-sync-selection .list").css("display", "block");

        // Set Go
        rowSyncSelectionGo = true;
    }
    else {

        // Set Alert Text
        if (subdirsOfPath.length == 0) {
            $(".row-sync-selection .alert span").text("The " + inputLocation.replace("input", "") + " Directory has no subdirectories to sync. Nothing to do here.");
        }
        else {
            $(".row-sync-selection .alert span").text('Please make sure to specify valid values under the "Local and Remote Directory" section!');
        }

        // Show Alert
        $(".row-sync-selection .alert").css("display", "block");

        // Hide List
        $(".row-sync-selection .list").css("display", "none");
    }
}



// rowSyncSelection Logic: "Select All"/"Deselect All"-Buttons
function rowSyncSelectionButtons() {

    // "Select All"-Button
    $(".row-sync-selection .list .list-control .buttons .btn-primary").click(function() {
        $(".row-sync-selection .list .list-group input").prop("checked", true);
    });

    // "Deselect All"-Button
    $(".row-sync-selection .list .list-control .buttons .btn-secondary").click(function() {
        $(".row-sync-selection .list .list-group input").prop("checked", false);
    });
}



// rowSyncSelection Logic: Determine Go/No-Go State
function rowSyncSelectionButtonsGoNoGo() {

    // Count Selected Checkboxes
    if ($(".row-sync-selection .list .list-group input:checked").length > 0) {
        rowSyncSelectionButtonsGo = true;
    }
    else {
        rowSyncSelectionButtonsGo = false;
    }
}



// rowSyncSelection Logic: Calculate Total Size
function rowSyncSelectionTotalSize() {
    var accumulatedSize = 0;

    $(".row-sync-selection .list .list-group .list-group-item").each(function() {
        if ($(this).find("input").prop("checked")) {
            if (!isNaN($(this).find(".badge").attr("data-size"))) {
                accumulatedSize = accumulatedSize + parseInt($(this).find(".badge").attr("data-size"));
            }
        }
    });

    $(".row-sync-selection .list .list-control .stats .total .badge").attr("data-size", accumulatedSize);
    $(".row-sync-selection .list .list-control .stats .total .badge").text( helperFindSuitableSizeSuffix(accumulatedSize) );
}



// rowSyncSelection Logic: Check Space Budget
function rowSyncSelectionSpaceAvailable() {

    // Inits
    var outputLocation = (rowSyncDirectionState == "push" ? "inputRemote" : "inputLocal");

    // Check Space Budget
    if (parseInt($(".row-sync-selection .list .list-control .stats .remaining .badge").attr("data-size")) < parseInt($(".row-sync-selection .list .list-control .stats .total .badge").attr("data-size"))) {
        
        // Set Alert Text
        $(".row-sync-selection .alert span").text("Not enough Space available on the " + outputLocation.replace("input", "") + " Directory, to carry out the proposed sync!");

        // Show Alert
        $(".row-sync-selection .alert").css("display", "block");
    }
    else {

        // Reset Alert Text
        $(".row-sync-selection .alert span").text("");

        // Hide Alert
        $(".row-sync-selection .alert").css("display", "none");
    }
}



// rowTerminal Logic
function rowTerminal() {

    // Retrieve syncProcessStdout from Main Context
    window.api.syncProcessStdout((event, value) => {
        $(".row-terminal .terminal").prepend("<p>" + value + "</p>");
    });

    // Retrieve syncProcessClose from Main Context
    window.api.syncProcessClose((event, value) => {

        // Inits
        $(".feedback-modal .modal-title").text("");
        $(".feedback-modal .alert").css("display", "none");
        $(".feedback-modal .alert span").text("");

        // Success
        if (value == 0) {
            $(".feedback-modal .modal-title").text("Sync successful");
            $(".feedback-modal .alert-success").css("display", "block");
            $(".feedback-modal .alert-success span").text("The Sync Process finished successfuly!");
        }

        // Failure
        else {
            $(".feedback-modal .modal-title").text("Sync failed");
            $(".feedback-modal .alert-danger").css("display", "block");
            $(".feedback-modal .alert-danger span").text("The Sync Process failed!");
        }

        // Reset Pre-Sync State
        $(".row-start-sync button").text("Start Syncing");

        $("button, input").each(function() {
            if ($(this).prop("disabled")) {
                if (!$(this).hasClass("keep-disabled")) {
                    $(this).prop("disabled", false);
                }
            }
        });

        // Trigger Modal
        var feedbackModal = new bootstrap.Modal($(".feedback-modal")[0]);
        feedbackModal.show();
    });
}



// rowStartSync Logic: Core
function rowStartSync() {

    // Determine Go/No-Go State
    if ($(".row-start-sync .alert .form-check-input").prop("checked")) {
        rowStartSyncGo = true;
    }
    else {
        rowStartSyncGo = false;
    }

    // Set outputLocation in Notice Text
    var outputLocation = (rowSyncDirectionState == "push" ? "Remote Directory" : "Local Directory");
    $(".row-start-sync .alert .outputlocation").text(outputLocation);

    // Release-Control for "Start Syncing"-Button
    if (rowLocalRemoteGo && rowSyncSelectionGo && rowSyncSelectionButtonsGo && rowStartSyncGo) {
        $(".row-start-sync button").prop("disabled", false);
    }
    else {
        $(".row-start-sync button").prop("disabled", true);
    }
}



// rowStartSync Logic: Start Process
function rowStartSyncStartProcess() {

    // Set Notice + Block all Inputs
    $(".row-start-sync button").text("Sync in Progress...");
    $(".row-start-sync .alert .form-check-input").prop("checked", false);

    $("button, input").each(function() {
        if ($(this).prop("disabled")) {$(this).addClass("keep-disabled");}
        $(this).prop("disabled", true);
    });

    // Determine selected Directories
    var selectedDirectories = [];
    $(".row-sync-selection .list .list-group .list-group-item").each(function() {
        if ($(this).find("input").prop("checked")) {
            selectedDirectories.push($(this).attr("data-filename"));
        }
    });

    // Start SyncProcess
    window.api.ipcRenderer.sendSync("startSyncProcess", {
        localDirectory: $(".row-local-remote #inputLocal").val(),
        remoteDirectory: $(".row-local-remote #inputRemote").val(),
        syncDirection: rowSyncDirectionState,
        syncSelection: selectedDirectories
    });
}



// Footer: Open Website
function footerLink() {
    $("footer.navbar .eerolink").click(function() {
        window.api.ipcRenderer.sendSync("startFooterLink");
    });
}



// Helper: Take timedate and format it into a proper date string
function helperFormatDateTime(timedate) {
    var year = timedate.getFullYear();
    var month = String(timedate.getMonth() + 1).padStart(2, "0");
    var day = String(timedate.getDate()).padStart(2, "0");
    var hour = String(timedate.getHours()).padStart(2, "0");
    var minutes = String(timedate.getMinutes()).padStart(2, "0");
    var seconds = String(timedate.getSeconds()).padStart(2, "0");

    var formattedDate = day + "." + month + "." + year + " " + hour + ":" + minutes + ":" + seconds;
    return formattedDate;
}



// Helper: Find appropriate SI-Suffix for File/Directory Size
function helperFindSuitableSizeSuffix(filesize) {
    if (!isNaN(filesize)) {
        var counter = 0;
        var suffix = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

        while (filesize > 1024) {
            filesize = filesize / 1024;
            counter++;
        }

        if (counter == 0) {
            filesize = filesize.toFixed(0) + " " + suffix[counter];
        }
        else {
            filesize = filesize.toFixed(2) + " " + suffix[counter];
        }
    }

    return filesize;
}
