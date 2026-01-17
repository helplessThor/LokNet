import { BrowserWindow, BrowserView, ipcMain } from 'electron';
import { Store } from './store';
import path from 'node:path';

export class ViewManager {
    private window: BrowserWindow;
    private views: Map<number, BrowserView> = new Map();
    private activeViewId: number | null = null;
    private nextId = 1;
    private bounds = { x: 0, y: 80, width: 800, height: 600 };
    private store: Store;

    constructor(window: BrowserWindow) {
        this.window = window;
        this.store = new Store(); // Initialize store
        this.setupIPC();

        // Initial resize to match window
        const winBounds = this.window.getBounds();
        this.updateBounds({ width: winBounds.width, height: winBounds.height - 80 });

        // Load Welcome Page
        const welcomePath = process.env.VITE_DEV_SERVER_URL
            ? 'http://localhost:5173/welcome.html' // Served by Vite in dev (public dir)
            : `file://${path.join(process.env.VITE_PUBLIC || '', 'welcome.html')}`; // In prod

        this.createView(welcomePath);
    }

    private setupIPC() {
        ipcMain.handle('tab:create', (_, url) => this.createView(url));
        ipcMain.handle('tab:switch', (_, id) => this.switchTo(id));
        ipcMain.handle('tab:close', (_, id) => this.closeView(id));

        // Browser controls
        ipcMain.on('nav:back', () => this.activeView?.webContents.goBack());
        ipcMain.on('nav:forward', () => this.activeView?.webContents.goForward());
        ipcMain.on('nav:reload', () => this.activeView?.webContents.reload());
        ipcMain.on('nav:load', (_, url) => this.activeView?.webContents.loadURL(url));
    }

    get activeView() {
        return this.activeViewId ? this.views.get(this.activeViewId) : null;
    }

    createView(url: string = 'about:blank') {
        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                plugins: false,
                backgroundThrottling: true,
            }
        });

        // Record History
        view.webContents.on('did-navigate', (_, url) => {
            this.store.addHistory(url, view.webContents.getTitle());
        });
        view.webContents.on('did-navigate-in-page', (_, url) => {
            this.store.addHistory(url, view.webContents.getTitle());
        });

        view.webContents.loadURL(url);

        const id = this.nextId++;
        this.views.set(id, view);

        this.switchTo(id);
        return id;
    }

    switchTo(id: number) {
        const view = this.views.get(id);
        if (!view) return;

        if (this.activeView) {
            this.window.removeBrowserView(this.activeView);
        }

        this.activeViewId = id;
        this.window.addBrowserView(view);
        view.setBounds({ x: 0, y: 80, width: this.bounds.width, height: this.bounds.height });
        view.setAutoResize({ width: true, height: true });
    }

    closeView(id: number) {
        const view = this.views.get(id);
        if (!view) return;

        if (this.activeViewId === id) {
            const ids = Array.from(this.views.keys());
            const idx = ids.indexOf(id);
            const newId = ids[idx - 1] || ids[idx + 1];
            if (newId) {
                this.switchTo(newId);
            } else {
                this.activeViewId = null;
                this.window.removeBrowserView(view);
                this.createView('about:blank');
            }
        }

        (view.webContents as any).destroy();
        this.views.delete(id);
    }

    updateBounds(newBounds: { width: number, height: number }) {
        this.bounds = { ...this.bounds, ...newBounds };
        if (this.activeView) {
            this.activeView.setBounds({ x: 0, y: 80, width: this.bounds.width, height: this.bounds.height });
        }
    }
}
