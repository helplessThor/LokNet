import { BrowserWindow, BrowserView, ipcMain } from 'electron';
import { Store } from './store';
import path from 'node:path';

export class ViewManager {
    private window: BrowserWindow;
    private views: Map<number, BrowserView> = new Map();
    private activeViewId: number | null = null;
    private nextId = 1;
    private bounds = { x: 0, y: 90, width: 800, height: 600 };
    private store: Store;

    constructor(window: BrowserWindow) {
        this.window = window;
        this.store = new Store(); // Initialize store
        this.setupIPC();

        // Initial resize to match window
        const winBounds = this.window.getBounds();
        this.updateBounds({ width: winBounds.width, height: winBounds.height - 90 });
    }

    private setupIPC() {
        ipcMain.handle('tab:create', (_, url) => this.createView(url));
        ipcMain.handle('tab:switch', (_, id) => this.switchTo(id));
        ipcMain.handle('tab:close', (_, id) => this.closeView(id));

        // Bookmarks (Handled here to access active view data)
        ipcMain.handle('bookmarks:create', () => {
            if (!this.activeView) return { success: false, error: "No active tab" };

            const url = this.activeView.webContents.getURL();
            let title = this.activeView.webContents.getTitle() || url; // Fallback title

            if (!url) return { success: false, error: "No URL found" };

            // Block internal pages
            if (url.includes('welcome.html') || url.startsWith('file://')) {
                return { success: false, error: "Cannot bookmark internal page" };
            }

            this.store.addBookmark(url, title);
            return { success: true };
        });

        ipcMain.handle('bookmarks:get', () => {
            return this.store.getBookmarks();
        });

        ipcMain.handle('bookmarks:remove', (_, url) => {
            return this.store.removeBookmark(url);
        });

        // Browser controls
        ipcMain.on('nav:back', () => this.activeView?.webContents.goBack());
        ipcMain.on('nav:forward', () => this.activeView?.webContents.goForward());
        ipcMain.on('nav:reload', () => this.activeView?.webContents.reload());
        ipcMain.on('nav:load', (_, url) => this.activeView?.webContents.loadURL(url));

        // Visibility controls for UI overlays
        ipcMain.on('view:hide', () => {
            if (this.activeView) this.window.removeBrowserView(this.activeView);
        });
        ipcMain.on('view:show', () => {
            if (this.activeView) this.window.addBrowserView(this.activeView);
        });
    }

    get activeView() {
        return this.activeViewId ? this.views.get(this.activeViewId) : null;
    }

    private get defaultUrl() {
        return process.env.VITE_DEV_SERVER_URL
            ? 'http://localhost:5173/welcome.html'
            : `file://${path.join(process.env.VITE_PUBLIC || '', 'welcome.html')}`;
    }

    createView(url?: string) {
        const targetUrl = url || this.defaultUrl;

        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                plugins: false,
                backgroundThrottling: true,
            }
        });

        // Record History & Notify Renderer
        // Record History & Notify Renderer
        const updateUrl = (url: string) => {
            const title = view.webContents.getTitle();
            this.store.addHistory(url, title);

            // Notify renderer to update specific tab title/url
            this.window.webContents.send('tab:update', { id, title, url });

            if (this.activeViewId === id) {
                this.window.webContents.send('nav:update', { url, title });
            }
        };

        const updateFavicon = (favicons: string[]) => {
            if (favicons && favicons.length > 0) {
                this.window.webContents.send('tab:update', { id, icon: favicons[0] });
            }
        };

        view.webContents.on('did-navigate', (_, url) => updateUrl(url));
        view.webContents.on('did-navigate-in-page', (_, url) => updateUrl(url));
        view.webContents.on('page-title-updated', (_, title) => {
            this.window.webContents.send('tab:update', { id, title });
            if (this.activeViewId === id) {
                this.window.webContents.send('nav:update', { url: view.webContents.getURL(), title });
            }
        });
        view.webContents.on('page-favicon-updated', (_, favicons) => updateFavicon(favicons));

        view.webContents.loadURL(targetUrl);

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
        view.setBounds({ x: 0, y: 90, width: this.bounds.width, height: this.bounds.height });
        view.setAutoResize({ width: true, height: true });

        // Notify renderer of current URL on switch
        this.window.webContents.send('nav:update', { url: view.webContents.getURL(), title: view.webContents.getTitle() });
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
            this.activeView.setBounds({ x: 0, y: 90, width: this.bounds.width, height: this.bounds.height });
        }
    }
}
