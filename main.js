const { app, BrowserWindow, Menu, MenuItem} = require('electron')
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
        // let menu=remote.Menu ;
        
        // menu.append(new MenuItem({label:'save',click(){
        //   console.log('item save clicked');
        // }}));
        // console.log(menu.items);
        win.maximize();
        win.removeMenu();
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