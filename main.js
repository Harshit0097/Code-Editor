const { app, BrowserWindow } = require('electron')
const reload = require('electron-reload')
const path = require('path')
function createWindow(){
    try{
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show:false,
        webPreferences:{
          nodeIntegration:true
        }
        // backgroundColor:'#008000'
      })
    
      // and load the index.html of the app.
      win.loadFile('index.html').then(function(){
        win.removeMenu();
        win.maximize();
        win.show();
        win.webContents.openDevTools();
      });
    }catch(err)
    {
        console.log(err);
    }
}
reload(__dirname,{
    electron:path.join(__dirname,'node_modules/.bin/electron.cmd')
})

app.whenReady().then(createWindow);
app.allowRendererProcessReuse=false;