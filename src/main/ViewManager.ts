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
        // Initial resize to match window
        const winBounds = this.window.getContentBounds();
        this.updateBounds({ width: winBounds.width, height: winBounds.height - 90 });

        // Handle Permissions
        this.setupPermissionHandler();
    }

    private setupPermissionHandler() {
        const { session } = require('electron');

        // Handle synchronous permission checks (navigator.permissions.query)
        session.defaultSession.setPermissionCheckHandler((webContents: any, permission: string, origin: string, details: any) => {
            // details might contain securityOrigin or other info
            try {
                if (!origin) return true; // Default allow for null origin? Or handle gracefully
                const host = new URL(origin).host;

                // Check transient first
                // For checks, we want to know if we have *Granted* access. 
                // If transient is true, return true (allowed).
                if (permission === 'media') {
                    const types = details?.mediaTypes || ['video', 'audio']; // Default to both if unknown
                    const permsToCheck = [];
                    if (types.includes('video')) permsToCheck.push('camera');
                    if (types.includes('audio')) permsToCheck.push('microphone');

                    if (permsToCheck.length === 0) {
                        // Fallback to strict check if unknown? Or just force "true" to let request handler deal with it?
                        // For check handler, "true" just means "allow browser to ask".
                        // So returning true here is actually SAFER than returning false (which blocks).
                        // But let's log it.
                        console.log('Check: Empty media types, falling through');
                        return true;
                    }

                    // Check if ANY explicitly denied
                    for (const p of permsToCheck) {
                        const stored = this.store.getPermission(host, p);
                        if (stored === 'deny') {
                            return false; // If part of the bundle is denied, we deny the whole media request (Electron limitation)
                        }
                    }

                    // Check if ALL explicitly allowed (or transient allowed)
                    const allAllowed = permsToCheck.every(p => {
                        return this.transientPermissions.get(host + p) || this.store.getPermission(host, p) === 'allow';
                    });

                    if (allAllowed) {
                        return true;
                    }

                    // Force ALLOW for media check to ensure getUserMedia is called and trapped by request handler
                    return true;
                }

                // Check transient first
                if (this.transientPermissions.get(host + permission)) {
                    return true;
                }

                const stored = this.store.getPermission(host, permission);
                if (stored) {
                    return stored === 'allow';
                }

                return null;
            } catch (e) {
                console.error('Permission check error:', e);
                return null;
            }
        });

        // Handle async permission requests (getUserMedia, etc.)
        session.defaultSession.setPermissionRequestHandler((webContents: any, permission: string, callback: (granted: boolean) => void, details: any) => {
            if (details && details.mediaTypes) {
            }

            try {
                // Prefer requestingUrl from details if available (supports iframes/redirects better)
                // Fallback to webContents URL
                let requestUrl = details?.requestingUrl || webContents.getURL();

                if (!requestUrl) {
                    return callback(false);
                }

                // Handle 'about:blank' or strange origins
                if (requestUrl === 'about:blank') {
                    requestUrl = webContents.getURL();
                }

                const host = new URL(requestUrl).host;

                // Determine precise permissions
                let permissionsToHandle = [permission];
                if (permission === 'media') {
                    const types = details?.mediaTypes || ['video', 'audio'];

                    permissionsToHandle = [];
                    if (types.includes('video')) permissionsToHandle.push('camera');
                    if (types.includes('audio')) permissionsToHandle.push('microphone');

                    // Fallback: If types is e.g. empty or unknown, default to both to be safe (or prompt)
                    if (permissionsToHandle.length === 0) {
                        console.log('Warning: No recognized media types, defaulting to camera & microphone');
                        permissionsToHandle = ['camera', 'microphone'];
                    }
                }


                // CHECK: If any denied, deny all
                for (const p of permissionsToHandle) {
                    const stored = this.store.getPermission(host, p);
                    if (stored === 'deny') {
                        return callback(false);
                    }
                }

                // CHECK: If ALL allowed, allow
                const allAllowed = permissionsToHandle.length > 0 && permissionsToHandle.every(p => {
                    const isTransient = this.transientPermissions.get(host + p);
                    const isStored = this.store.getPermission(host, p) === 'allow';
                    return isTransient || isStored;
                });

                if (allAllowed) {
                    return callback(true);
                }

                const uiPermissionString = permissionsToHandle.join(' & ');
                this.window.webContents.send('permission:request', { host, permission: uiPermissionString, id: webContents.id });

                const key = webContents.id + uiPermissionString;
                this.pendingPermissions.set(key, { callback, types: permissionsToHandle });
            } catch (e) {
                console.error('Permission request handling error:', e);
                callback(false);
            }
        });
    }

    private pendingPermissions = new Map<string, { callback: (allowed: boolean) => void, types: string[] }>();
    private transientPermissions = new Map<string, boolean>();

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

        // History
        ipcMain.handle('history:get', () => {
            return this.store.getHistory();
        });

        ipcMain.handle('history:clear', () => {
            this.store.clearHistory();
            return [];
        });

        ipcMain.handle('history:remove', (_, { url, timestamp }) => {
            return this.store.removeHistoryItem(url, timestamp);
        });

        // Permission Response
        ipcMain.on('permission:response', (_, { id, permission, allow, persist, host }) => {
            // Reconstruct key based on simple 'media' check logic used in request handler
            // The UI returns the "display string" (e.g. "camera & microphone") as 'permission', which is NOT the original key.
            // But we stored it using 'media' if it was a media request.
            // This is brittle. Let's fix.
            // Solution: We look for the entry. Since 'permission' from UI is now 'combined string', we can't use it directly as key 
            // if we keyed by 'media'. 
            // Better: Iterate map or fix the keying. 
            // Simple Fix: Key by `id`, since we block multiple concurrent prompts from same webContents?
            // Actually, `permission` in the UI response comes from `request.permission`.
            // In request handler we set `permission` sent to UI as "camera & microphone".
            // So we can use that as the key suffix IF we keyed it that way.

            // NOTE: In the previous step's request handler replacement, I forgot to update the key generation to match the new "joined" permission string.
            // Let's assume I did: `this.pendingPermissions.set(webContents.id + permissionsToHandle.join(' & '), ...)`
            // So here:
            const key = id + permission;

            const entry = this.pendingPermissions.get(key);
            if (entry) {
                const { callback, types } = entry;
                callback(allow);
                this.pendingPermissions.delete(key);

                if (allow) {
                    for (const type of types) {
                        const cacheKey = host + type;
                        if (persist) {
                            this.store.setPermission(host, type, 'allow');
                        } else {
                            this.transientPermissions.set(cacheKey, true);
                        }
                    }
                } else {
                    // If denied, we should probably stick strict deny?
                    if (persist) {
                        for (const type of types) {
                            this.store.setPermission(host, type, 'deny');
                        }
                    }
                }
            }
        });

        // Site Settings Management
        ipcMain.handle('permissions:get-for-host', (_, host) => {
            const persistent = this.store.getPermissionsForHost(host) || {};

            // Merge with transient permissions
            const combined = { ...persistent };

            for (const [key, value] of this.transientPermissions.entries()) {
                if (key.startsWith(host)) {
                    // key is "host" + "permission" (e.g. "example.com" + "camera")
                    // But wait, the key concatenation is simple string concat: host + permission. 
                    // If host is "example.com" and permission is "camera", key is "example.comcamera".
                    // This is slightly risky for parsing. 
                    // Ideally we should have used a separator. 
                    // But since we know 'host', we can strip it.
                    const perm = key.slice(host.length);
                    if (value) {
                        combined[perm] = 'allow'; // Transient is always 'allow' in our logic currently
                    }
                }
            }

            return combined;
        });

        ipcMain.handle('permissions:reset', (_, host) => {
            if (host) {
                this.store.removePermissionsForHost(host);
                // Also clear transient for this host
                for (const key of this.transientPermissions.keys()) {
                    if (key.startsWith(host)) {
                        this.transientPermissions.delete(key);
                    }
                }

                // FORCE RELOAD: Revoking permissions doesn't kill active streams automatically.
                // We must reload the page to enforce the new "no permission" state.
                let viewToReload: BrowserView | null = null;

                // Try to find the view by host
                for (const [id, view] of this.views) {
                    try {
                        const viewUrl = view.webContents.getURL();
                        const viewHost = new URL(viewUrl).host;

                        // We check if this view matches the reset host
                        if (viewHost === host) {
                            viewToReload = view;
                            break;
                        }
                    } catch (e) { }
                }

                if (viewToReload) {
                    viewToReload.webContents.reload();
                }
            }
        });

        // Browser controls

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

        // DevTools Control
        ipcMain.on('devtools:toggle', () => {
            if (this.activeView) {
                const webContents = this.activeView.webContents;
                if (webContents.isDevToolsOpened()) {
                    webContents.closeDevTools();
                } else {
                    // Small delay to ensure clean state if it was just closed or focused
                    setTimeout(() => {
                        webContents.openDevTools({ mode: 'right', activate: true });
                    }, 100);
                }
            }
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

        // Set User Agent to bypass "Old Chrome" detection (WhatsApp Web fix)
        view.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

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

        // DevTools Shortcut Handling
        view.webContents.on('before-input-event', (event, input) => {
            if (input.type === 'keyDown') {
                // Ctrl+Shift+I or F12
                if ((input.control && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
                    const wc = view.webContents;
                    // Force close first to ensure mode change is applied if it was previously detached
                    if (wc.isDevToolsOpened()) {
                        wc.closeDevTools();
                    }
                    // strictly open in 'right' mode (docked)
                    wc.openDevTools({ mode: 'right', activate: true });
                    event.preventDefault();
                }
            }
        });

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
