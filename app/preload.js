// Requirements
const {contextBridge, ipcRenderer} = require("electron");
const electronShell = require("electron").shell;

// Expose Endpoints
contextBridge.exposeInMainWorld("api", {

    // ipcRenderer Endpoint
    ipcRenderer: ipcRenderer,

    // syncProcessStdout Endpoint
    syncProcessStdout: (data) => ipcRenderer.on("syncProcessStdout", data),

    // syncProcessClose Endpoint
    syncProcessClose: (data) => ipcRenderer.on("syncProcessClose", data)
});