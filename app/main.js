// ====== INITS ========================================================

// Requirements + Inits
const os = require("os");
const fs = require("fs");
const childProcess = require("child_process")
const {app, BrowserWindow, ipcMain, shell} = require("electron");
const path = require("path");
const fastFolderSizeSync = require("fast-folder-size/sync");
const checkDiskSpace = require("check-disk-space").default;

var mainWindow;

// ====== ELECTRON ========================================================

// Electron: Window Definition
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 1200,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    
    mainWindow.loadFile("./app/index.html");
}



// Electron: Window Creation
app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});



// Electron: Window Ending
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});



// ====== BUSINESS LOGIC ========================================================

// Inter-Process-Communication (IPC) Handling
ipcMain.on("checkPath", (event, params) => {
    event.returnValue = checkPath(params);
});

ipcMain.on("getSubdirsOfPath", (event, params) => {
    event.returnValue = getSubdirsOfPath(params);
});

ipcMain.on("getFsObjectMetainfo", (event, params) => {
    event.returnValue = getFsObjectMetainfo(params);
});

ipcMain.on("getSizeOfDirectory", (event, params) => {
    event.returnValue = getSizeOfDirectory(params);
});

ipcMain.on("getAvailableSpaceOnDisk", async(event, params) => {
    event.returnValue = await getAvailableSpaceOnDisk(params);
});

ipcMain.on("startSyncProcess", (event, params) => {
    event.returnValue = startSyncProcess(params);
});

ipcMain.on("startFooterLink", (event, params) => {
    event.returnValue = startFooterLink(params);
});

ipcMain.on("settingsSave", (event, params) => {
    event.returnValue = settingsSave(params);
});

ipcMain.on("settingsLoad", (event, params) => {
    event.returnValue = settingsLoad(params);
});



// Check if Path exists
function checkPath(path) {
    var returnValue = false;

    try {
        if (fs.existsSync(path)) {
            returnValue = true;
        }
    }
    catch (error) {
        returnValue = error;
    }

    return returnValue;
}



// Return all Subdirectories of Path
function getSubdirsOfPath(path) {
    var returnValue = [];

    try {
        fs.readdirSync(path).forEach(fsObject => { 
            if (fs.statSync(path + "/" + fsObject).isDirectory()) {
                if (fsObject.charAt(0) != ".") {
                    returnValue.push(fsObject);
                }
            }
        });
    }
    catch (error) {
        returnValue = error;
    }

    return returnValue;
}



// Get File/Directory (fsObject) Metainfo
function getFsObjectMetainfo(fsObject) {
    var returnValue = null;

    try {returnValue = fs.statSync(fsObject);}
    catch (error) {returnValue = error;}

    return returnValue;
}



// Get Size of Directory
function getSizeOfDirectory(path) {
    var returnValue = null;
    
    try {returnValue = fastFolderSizeSync(path);}
    catch (error) {returnValue = "n/a";}

    return returnValue;
}



// Get available Space on Disk
function getAvailableSpaceOnDisk(path) {
    var returnValue = null;

    returnValue = checkDiskSpace(path);

    return returnValue;
}



// Create Script File for Terminal to read
function startSyncProcess(syncJob) {

    // OS is Supported
    if ((os.platform() == "win32") || (os.platform() == "linux")) {

        // Inits
        var child = childProcess.execFile;
        var scriptBody = "";
        var pathScript = "";

        // Generate Script depending on OS
        if (os.platform() == "win32") {
            pathScript = path.join(__dirname, "../run/syncProcess.bat");

            for (var counter = 0; counter < syncJob.syncSelection.length; counter++) {
                if (syncJob.syncDirection == "push") {
                    var randomString = helperCreateString(6);

                    scriptBody += "robocopy " + syncJob.localDirectory + "\\" + syncJob.syncSelection[counter] + " " + syncJob.remoteDirectory + "\\" + randomString + syncJob.syncSelection[counter] + " /E /ETA" + "\r\n";
                    scriptBody += "rd /S /Q " + syncJob.remoteDirectory + "\\" + syncJob.syncSelection[counter] + "\r\n";
                    scriptBody += "move " + syncJob.remoteDirectory + "\\" + randomString + syncJob.syncSelection[counter] + " " + syncJob.remoteDirectory + "\\" + syncJob.syncSelection[counter] + "\r\n";
                }
                else if (syncJob.syncDirection == "pull") {
                    var randomString = helperCreateString(6);

                    scriptBody += "robocopy " + syncJob.remoteDirectory + "\\" + syncJob.syncSelection[counter] + " " + syncJob.localDirectory + "\\" + randomString + syncJob.syncSelection[counter] + " /E /ETA" + "\r\n";
                    scriptBody += "rd /S /Q " + syncJob.localDirectory + "\\" + syncJob.syncSelection[counter] + "\r\n";
                    scriptBody += "move " + syncJob.localDirectory + "\\" + randomString + syncJob.syncSelection[counter] + " " + syncJob.localDirectory + "\\" + syncJob.syncSelection[counter] + "\r\n";
                }
            }
        }
        else if (os.platform() == "linux") {
            pathScript = path.join(__dirname, "../run/syncProcess.sh");
            scriptBody += "#!/bin/bash" + "\n";
            
            for (var counter = 0; counter < syncJob.syncSelection.length; counter++) {
                if (syncJob.syncDirection == "push") {
                    var randomString = helperCreateString(6);

                    scriptBody += "rsync --progress -avb " + syncJob.localDirectory + "/" + syncJob.syncSelection[counter] + "/" + " " + syncJob.remoteDirectory + "/" + randomString + syncJob.syncSelection[counter] + "\n";
                    scriptBody += "rm -rf " + syncJob.remoteDirectory + "/" + syncJob.syncSelection[counter] + "\n";
                    scriptBody += "mv " + syncJob.remoteDirectory + "/" + randomString + syncJob.syncSelection[counter] + " " + syncJob.remoteDirectory + "/" + syncJob.syncSelection[counter] + "\n";
                }
                else if (syncJob.syncDirection == "pull") {
                    var randomString = helperCreateString(6);

                    scriptBody += "rsync --progress -avb " + syncJob.remoteDirectory + "/" + syncJob.syncSelection[counter] + "/" + " " + syncJob.localDirectory + "/" + randomString + syncJob.syncSelection[counter] + "\n";
                    scriptBody += "rm -rf " + syncJob.localDirectory + "/" + syncJob.syncSelection[counter] + "\n";
                    scriptBody += "mv " + syncJob.localDirectory + "/" + randomString + syncJob.syncSelection[counter] + " " + syncJob.localDirectory + "/" + syncJob.syncSelection[counter] + "\n";
                }
            }
        }

        // Write Script to Filesystem
        fs.writeFileSync(pathScript, scriptBody);

        // Define Execution Format
        var syncProcess = null;

        if (os.platform() == "win32") {
            syncProcess = child("C:\\Windows\\system32\\cmd.exe", ["/C", pathScript]);
        }
        else if (os.platform() == "linux") {
            syncProcess = child("/bin/bash", [pathScript]);
        }

        // Execute Script in Terminal - Send stdout back to Frontend
        syncProcess.stdout.on("data", (data) => {
            mainWindow.webContents.send("syncProcessStdout", data.toString());
        });

        // Script finished - Send Feedback to Frontend
        syncProcess.on("close", (exitCode) => {
            mainWindow.webContents.send("syncProcessClose", exitCode);
        });
    }
}



// Open Link from Footer
function startFooterLink() {
    shell.openExternal("https://eerokaan.de");
}



// Save Settings from GUI in File
function settingsSave(dataObject) {

    // Inits
    var settingsFile = path.join(__dirname, "../run/settings.json");
    var settingsObjectJson = null;

    var settingsObject = {
        local: "",
        remote: "",
        direction: ""
    };

    // Load Settings from Filesystem if available
    if (fs.existsSync(settingsFile)) {
        settingsObjectJson = fs.readFileSync(settingsFile);
        settingsObject = JSON.parse(settingsObjectJson);
    }
    
    // Fill settingsObject with available dataObject
    if (dataObject.type == "rowLocalRemote") {
        settingsObject.local = dataObject.data.local || "",
        settingsObject.remote = dataObject.data.remote || ""
    }
    else if (dataObject.type == "rowSyncDirection") {
        settingsObject.direction = dataObject.data.direction || ""
    }

    // Write settingsObject as JSON to Filesystem
    settingsObjectJson = JSON.stringify(settingsObject);
    fs.writeFileSync(settingsFile, settingsObjectJson);
}



// Load Settings from File to GUI
function settingsLoad() {
    
    // Inits
    var settingsFile = path.join(__dirname, "../run/settings.json");
    var settingsObjectJson = null;

    var settingsObject = {
        local: "",
        remote: "",
        direction: ""
    };

    // Load Settings from Filesystem if available
    if (fs.existsSync(settingsFile)) {
        settingsObjectJson = fs.readFileSync(settingsFile);
        settingsObject = JSON.parse(settingsObjectJson);
    }

    // Return
    return settingsObject;
}



// Helper: Create Random String
function helperCreateString(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;

    for (var counter = 0; counter < length; counter++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result = "tmp-syncdir-" + result + "-";

    return result;
}