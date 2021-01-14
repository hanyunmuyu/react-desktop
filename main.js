/* main.js */
const {app, Menu, BrowserWindow, dialog, screen} = require('electron');
const path = require('path')
const serve = require('electron-serve');
const exec = require('child_process').exec;
const url = path.resolve(__dirname, '..')
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
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools()
    } else {
        let mainPath = url + '/main'
        exec(mainPath, (rr, stdout, stderr) => {
        })
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
            console.log(r)
            if (r.response === 1) {
                e.preventDefault();		//阻止默认行为，一定要有
                mainWindow = null
                app.exit();		//exit()直接关闭客户端，不会执行quit();
            } else if (r.response === 0) {
                e.preventDefault();		//阻止默认行为，一定要有
                mainWindow.minimize();	//调用 最小化实例方法
            }
        })
    });
};

app.whenReady().then(() => {
    createWindow()
    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    })
    // mainWindow.show()
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
                label: '关于我们',
                click: async () => {
                    const {shell} = require('electron')
                    await shell.openExternal('https://electronjs.org')
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
