import { app, BrowserWindow, session } from 'electron';
import path from 'node:path';

// DISABLE GOOGLE SAFE BROWSING PINGS & TELEMETRY
app.commandLine.appendSwitch('disable-client-side-phishing-detection');
app.commandLine.appendSwitch('no-service-autorun');
app.commandLine.appendSwitch('disable-speech-api'); // block google voice
app.commandLine.appendSwitch('disable-features', 'SafeBrowsing,Translate'); // Disable features explicitly

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
// We will store our "Tabs" (WebContentsViews) here later.
import { ViewManager } from './ViewManager';

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
        autoHideMenuBar: true,
        backgroundColor: '#1a1b1e', // Dark theme customized
    });

    const viewManager = new ViewManager(win);

    // Handle Resize
    win.on('resize', () => {
        if (win) {
            const { width, height } = win.getBounds();
            viewManager.updateBounds({ width, height: height - 80 });
        }
    });

    // Load the shell (renderer)
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'));
    }

    // Configure Session for Privacy
    const ses = session.defaultSession;

    // Block known tracking/telemetry domains explicitly (Simple privacy shield)
    ses.webRequest.onBeforeRequest(
        { urls: ['*://*.google-analytics.com/*', '*://*.doubleclick.net/*'] },
        (details, callback) => {
            callback({ cancel: true });
        }
    );

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
