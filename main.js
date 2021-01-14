/* main.js */
const {app, BrowserWindow, dialog, screen} = require('electron');
const path = require('path')
const serve = require('electron-serve');
const exec = require('child_process').exec;

const loadURL = serve({directory: 'build'});
const server = async () => {
    await app.whenReady().then(() => {
        loadURL(mainWindow);
    });
}

function makeSingleInstance() {
    if (process.mas) return

    app.requestSingleInstanceLock()

    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

makeSingleInstance()
let mainWindow = null;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: screen.getPrimaryDisplay().workAreaSize.width,
        height: screen.getPrimaryDisplay().workAreaSize.height,
        backgroundColor: '#d9d9d9',
        show: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    server().then(r => {
        console.log(r)
        console.log('server start')
    })
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools()
    } else {
        const url = path.resolve(__dirname, '..')
        let mainPath = url + '/main'
        exec(mainPath, (rr, stdout, stderr) => {
        })
    }
    mainWindow.on('close', (e) => {
        e.preventDefault()
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Information',
            defaultId: 0,
            message: '确定要关闭吗？',
            buttons: ['最小化', '直接退出']
        }).then(r => {
            if (r.response === 1) {
                mainWindow = null
                app.exit();		//exit()直接关闭客户端，不会执行quit();
            } else {
                e.preventDefault();		//阻止默认行为，一定要有
                mainWindow.minimize();	//调用 最小化实例方法
            }
        })
    });
};

app.whenReady().then(() => {
    createWindow()
    mainWindow.show()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
