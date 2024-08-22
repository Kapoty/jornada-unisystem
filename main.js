// update

const { updateElectronApp, UpdateSourceType } = require('update-electron-app')
updateElectronApp({
  updateSource: {
    type: UpdateSourceType.StaticStorage,
    baseUrl: `https://unisystem.app.br/assets/jornada-unisystem/${process.platform}/${process.arch}/`
  }
})

// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, dialog, ipcMain, Tray, Menu } = require('electron')
const path = require('node:path')

// run this as early in the main process as possible
if (require('electron-squirrel-startup')) app.quit();

let mainWindow;
let queryString = "";

var iconpath = path.join(__dirname, 'icon.ico')

const loadUrl = () => {
	//mainWindow.loadURL('https://192.168.100.4:8080/jornada' + queryString);
	mainWindow.loadURL('https://unisystem.app.br/jornada' + queryString);
}

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		transparent: true,
		frame: false,
		movable: false,
		resizable: false,
		skipTaskbar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	mainWindow.once('ready-to-show', () => {
		mainWindow.maximize()
	})

	mainWindow.setContentProtection(true);

	loadUrl();

	mainWindow.setAlwaysOnTop(true, 'screen');
	mainWindow.setIgnoreMouseEvents(true, { forward: true });

	//mainWindow.webContents.openDevTools({mode: 'undocked'})

	var appIcon = new Tray(iconpath)

	var contextMenu = Menu.buildFromTemplate([
		{
			label: 'Fechar', click: function () {
				app.quit()
			}
		}
	])

	appIcon.setTitle('Jornada-UniSystem')
	appIcon.setToolTip('Jornada-UniSystem')
	appIcon.setContextMenu(contextMenu)
}

ipcMain.on('quit', (event) => {
  app.quit();
})

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  mainWindow.setIgnoreMouseEvents(ignore, options)
})

if (process.defaultApp) {
	if (process.argv.length >= 2) {
		app.setAsDefaultProtocolClient('jornada-unisystem', process.execPath, [path.resolve(process.argv[1])])
	}
} else {
	app.setAsDefaultProtocolClient('jornada-unisystem')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
	app.quit()
} else {

	process.argv.forEach((arg) => {
		if (arg.indexOf("jornada-unisystem://") >=0 )
			queryString = arg.replace("jornada-unisystem://", "");
	});

	console.log(queryString);

	app.on('second-instance', (event, commandLine, workingDirectory) => {
	// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore()
				mainWindow.focus()
		}
		// the commandLine is array of strings in which last element is deep link url
		//queryString = commandLine.pop().replace("jornada-unisystem://", "");

		commandLine.forEach((arg) => {
			if (arg.indexOf("jornada-unisystem://") >=0 )
				queryString = arg.replace("jornada-unisystem://", "");
		});
		
		loadUrl();
	})

	app.whenReady().then(() => {

		app.setAppUserModelId(process.execPath);

		createWindow();

		app.on('activate', () => {
			if (BrowserWindow.getAllWindows().length === 0) createWindow()
		})

		//setInterval(() => mainWindow.webContents.send('mousemove', {}), 1000);
	})

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit()
	})

	// SSL/TSL: this is the self signed certificate support
	app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
	    // On certificate error we disable default behaviour (stop loading the page)
	    // and we then say "it is all fine - true" to the callback
	    event.preventDefault();
	    callback(true);
	});
}