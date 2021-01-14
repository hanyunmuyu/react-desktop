[加载第三方资源](https://segmentfault.com/a/1190000017715279)


右键菜单问题

渲染进程是不可以调用remote模块的，所以先隐藏页面，等到页面加载完成了，再显示页面就可以了

```js

let mainWindow = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        backgroundColor: '#ffff',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools()
        server().then(r => {
            console.log(r)
            console.log('server start')
        })
    } else {
        const url = path.resolve(__dirname, '..')
        let mainPath = url + '/main'
        exec(mainPath, (rr, stdout, stderr) => {
        })
        mainWindow.loadURL("http://localhost:886").then(r => {
            console.log(r)
        })
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
};


```


```js

app.whenReady().then(() => {
    createWindow()
    mainWindow.show()

})

```
