import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    createTab: (url?: string) => ipcRenderer.invoke('tab:create', url),
    switchTab: (id: number) => ipcRenderer.invoke('tab:switch', id),
    closeTab: (id: number) => ipcRenderer.invoke('tab:close', id),

    goBack: () => ipcRenderer.send('nav:back'),
    goForward: () => ipcRenderer.send('nav:forward'),
    reload: () => ipcRenderer.send('nav:reload'),
    loadURL: (url: string) => ipcRenderer.send('nav:load', url),
    hideView: () => ipcRenderer.send('view:hide'),
    showView: () => ipcRenderer.send('view:show'),

    // Bookmarks
    createBookmark: () => ipcRenderer.invoke('bookmarks:create'),
    getBookmarks: () => ipcRenderer.invoke('bookmarks:get'),
    removeBookmark: (url: string) => ipcRenderer.invoke('bookmarks:remove', url),

    // History
    getHistory: () => ipcRenderer.invoke('history:get'),
    clearHistory: () => ipcRenderer.invoke('history:clear'),
    removeHistoryItem: (url: string, timestamp: number) => ipcRenderer.invoke('history:remove', { url, timestamp }),

    // Listeners
    onTabsUpdate: (callback: (tabs: any[]) => void) => ipcRenderer.on('tabs:update', (_, tabs) => callback(tabs)),
    onTabUpdate: (callback: (data: { id: number, title?: string, url?: string, icon?: string }) => void) => ipcRenderer.on('tab:update', (_, data) => callback(data)),
    onActiveTabUpdate: (callback: (id: number) => void) => ipcRenderer.on('tabs:active', (_, id) => callback(id)),
    onNavUpdate: (callback: (data: { url: string, title: string }) => void) => ipcRenderer.on('nav:update', (_, data) => callback(data)),

    // Permissions
    onPermissionRequest: (callback: (data: { host: string, permission: string, id: number }) => void) => ipcRenderer.on('permission:request', (_, data) => callback(data)),
    sendPermissionResponse: (data: { id: number, permission: string, allow: boolean, persist: boolean, host: string }) => ipcRenderer.send('permission:response', data),
    getSitePermissions: (host: string) => ipcRenderer.invoke('permissions:get-for-host', host),
    resetSitePermissions: (host: string) => ipcRenderer.invoke('permissions:reset', host),
});
