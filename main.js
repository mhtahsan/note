const { BrowserWindow, app, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require('electron-updater');

// require("electron-reloader")(module);
let mainWindow;
let openedFilePath;

const creatWindow = () =>{
        mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        // titleBarOverlay: true,
        // titleBarStyle: "hidden",
        icon: "icon.ico",
        webPreferences: {
            preload: path.join(app.getAppPath(), "renderer.js"),
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile("index.html")
    // mainWindow.webContents.openDevTools();

    const menyTemplate = [{
        label: "File", 
        submenu: [
            {
            label: "Add New File",
            click: () => ipcMain.emit("open")
            },
            {
                label: "Create New File",
                click: () => ipcMain.emit("create")
                },
                {
                    role: 'quit'
                }
                 ] 
    }];
    const menu = Menu.buildFromTemplate(menyTemplate);
    Menu.setApplicationMenu(menu);
    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
      });
}

app.whenReady().then(creatWindow);

ipcMain.on("open", () => {
    dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "text files", extensions: ["txt"]}]
    }).then(({ filePaths}) => {
        const filePath = filePaths[0];

        fs.readFile(filePath, "utf8", (error, content) => {
            if(error){
               
            }else{
                openedFilePath = filePath;
                mainWindow.webContents.send("opened", { filePath, content})
            }
        })
    })
})

ipcMain.on("create", () => {
   dialog.showSaveDialog(mainWindow, {
       filters: [{ name: "text files", extensions: ["txt"]}]
   }).then(({ filePath }) =>{
      
       fs.writeFile(filePath, "", (error) =>{
           if(error){
               
           }else{
               openedFilePath = filePath;
               mainWindow.webContents.send("created", filePath)
           }
       })
   } )
});
ipcMain.on("updated", (_, textareaContent) =>{
    fs.writeFile(openedFilePath, textareaContent, (error) =>{
        if(error){
           console.log("error"); 
        }
    })
})
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });
  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });