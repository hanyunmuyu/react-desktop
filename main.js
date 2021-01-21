/* main.js */
const {app, Menu, BrowserWindow, dialog, screen, MenuItem} = require('electron');
const path = require('path')
const serve = require('electron-serve');
const child_process = require('child_process');
const url = path.resolve(__dirname, '..')
const loadURL = serve({directory: 'build'});
const server = async () => {
    await app.whenReady().then(() => {
        loadURL(mainWindow);
    });
}
let mainPath
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'pre') {
    mainPath = './main'
} else {
    mainPath = url + '/main'
}
let childProcess = "";

childProcess = child_process.exec(mainPath, {}, (err, stdout, stderr) => {
    console.log(err, stdout, stderr)
})

// console.log(childProcess.pid)

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
        backgroundColor: '#bfbfbf',
        show: false,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    server().then(r => {
        console.log('server start')
    })
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'pre') {
        mainWindow.webContents.openDevTools()
    }
    mainWindow.on('close', (e) => {
        e.preventDefault()
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Information',
            defaultId: 1,
            cancelId: 2,
            message: '确定要关闭吗？',
            buttons: ['最小化', '直接退出', '取消']
        }).then(r => {
            if (r.response === 1) {
                e.preventDefault();		//阻止默认行为，一定要有
                mainWindow = null
                childProcess.kill()
                app.exit();		//exit()直接关闭客户端，不会执行quit();
            } else if (r.response === 0) {
                e.preventDefault();		//阻止默认行为，一定要有
                mainWindow.minimize();	//调用 最小化实例方法
            }
        })
    });
};

app.whenReady().then(options => {
    createWindow()
    mainWindow.on('ready-to-show', options => {
        mainWindow.show();

    })
    const menu = new Menu();
    menu.append(new MenuItem({label: '全选', role: 'selectall'}));
    menu.append(new MenuItem({label: '复制', role: 'copy'}));
    menu.append(new MenuItem({label: '粘贴', role: 'paste'}));
    menu.append(new MenuItem({label: '剪切', role: 'cut'}));
    menu.append(new MenuItem({label: '删除', role: 'delete'}));
    menu.append(new MenuItem({label: '撤销', role: 'undo'}));
    menu.append(new MenuItem({label: '重做', role: 'redo'}));
    mainWindow.webContents.on('context-menu', (e, params) => {
        menu.popup({window: mainWindow, x: params.x, y: params.y})
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
const isMac = process.platform === 'darwin'

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services'},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'}
        ]
    }] : []),
    // { role: 'fileMenu' }
    {
        label: '文件',
        submenu: [
            isMac ? {role: 'close', label: '退出'} : {role: 'quit', label: '退出'}
        ]
    },
    // { role: 'editMenu' }
    {
        label: '编辑',
        submenu: [
            {role: 'undo', label: '撤销'},
            {role: 'redo', label: '重做'},
            {type: 'separator'},
            {role: 'cut', label: '剪切'},
            {role: 'copy', label: '复制'},
            {role: 'paste', label: '粘贴'},
            ...(
                isMac ?
                    [
                        {role: 'pasteAndMatchStyle'},
                        {role: 'delete', label: '删除'},
                        {role: 'selectAll', label: '全选'},
                        {type: 'separator'},
                        {
                            label: '搜索',
                            submenu: [
                                {role: 'startSpeaking'},
                                {role: 'stopSpeaking'}
                            ]
                        }
                    ]
                    :
                    [
                        {role: 'delete', label: '删除'},
                        {type: 'separator'},
                        {role: 'selectAll', label: '全选'}
                    ]
            )
        ]
    },
    // { role: 'viewMenu' }
    {
        label: '视图',
        submenu: [
            {role: 'reload', label: '重新加载'},
            {role: 'forceReload', label: '强制重新加载'},
            {role: 'toggleDevTools', label: '调试工具'},
            {type: 'separator'},
            {role: 'resetZoom', label: '重置窗口'},
            {role: 'zoomIn', label: '放大'},
            {role: 'zoomOut', label: '缩小'},
            {type: 'separator'},
            {role: 'togglefullscreen', label: '全屏'}
        ]
    },
    // { role: 'windowMenu' }
    {
        label: '窗口',
        submenu: [
            {role: 'minimize', label: '最小化'},
            {role: 'zoom', label: '缩放'},
            ...(
                isMac ?
                    [
                        {type: 'separator'},
                        {role: 'front', label: '前置'},
                        {type: 'separator'},
                        {role: 'window', label: '窗口'}
                    ]
                    :
                    [
                        {role: 'close', label: '退出'}
                    ]
            )
        ]
    },
    {
        role: 'help',
        label: '帮助',
        submenu: [
            {
                label: 'API文档',
                click: async () => {
                    const {shell} = require('electron')
                    await shell.openExternal('http://127.0.0.1:886/swagger/index.html')
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
