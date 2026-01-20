import { app, BrowserWindow, session } from 'electron';
import path from 'node:path';
app.commandLine.appendSwitch('disable-client-side-phishing-detection');
app.commandLine.appendSwitch('no-service-autorun');
// Suppress Verbose/Info logs from Chromium to clean terminal
app.commandLine.appendSwitch('log-level', '3'); // 0=info, 1=warning, 2=error, 3=fatal
// Disable FLoC (Interest Cohort) to clean up console warnings
app.commandLine.appendSwitch('disable-features', 'InterestCohort');
// Removed disable-speech-api and disable-features to allow Google Meet media access
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');
let win;
// We will store our "Tabs" (WebContentsViews) here later.
import { ViewManager } from './ViewManager';
import { Menu } from 'electron';
// Disable default menu (This stops Ctrl+Shift+I from opening the Shell DevTools)
Menu.setApplicationMenu(null);
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'LokNet',
        // Windows does not support SVG for window icons. Use PNG or ICO.
        icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'index.js'),
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false,
        },
        // autoHideMenuBar: true, // Not needed with hidden title bar
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0f172a', // Matches slate-900
            symbolColor: '#94a3b8', // Matches slate-400
            height: 40 // Height of the TabBar
        },
        backgroundColor: '#1a1b1e', // Dark theme customized
        minWidth: 800,
        minHeight: 600,
    });
    const viewManager = new ViewManager(win);
    // Handle Resize
    // Handle Resize
    const resize = () => {
        if (win) {
            const { width, height } = win.getContentBounds();
            viewManager.updateBounds({ width, height: height - 90 });
        }
    };
    win.on('resize', resize);
    win.on('maximize', resize);
    win.on('unmaximize', resize);
    win.on('enter-full-screen', resize);
    win.on('leave-full-screen', resize);
    // Load the shell (renderer)
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'));
    }
    // Configure Session for Privacy
    const ses = session.defaultSession;
    // Block known tracking/telemetry domains explicitly (Simple privacy shield)
    ses.webRequest.onBeforeRequest({ urls: ['*://*.google-analytics.com/*', '*://*.doubleclick.net/*'] }, (details, callback) => {
        callback({ cancel: true });
    });
    // Disable cache if extremely privacy focused? No, caching is good for bandwidth. 
    // We keep cache but might clear on exit.
    win.on('closed', () => {
        win = null;
    });
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.whenReady().then(createWindow);
