import { contextBridge, ipcRenderer } from 'electron';
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    createTab: (url) => ipcRenderer.invoke('tab:create', url),
    switchTab: (id) => ipcRenderer.invoke('tab:switch', id),
    closeTab: (id) => ipcRenderer.invoke('tab:close', id),
    goBack: () => ipcRenderer.send('nav:back'),
    goForward: () => ipcRenderer.send('nav:forward'),
    reload: () => ipcRenderer.send('nav:reload'),
    loadURL: (url) => ipcRenderer.send('nav:load', url),
    hideView: () => ipcRenderer.send('view:hide'),
    showView: () => ipcRenderer.send('view:show'),
    // Bookmarks
    createBookmark: () => ipcRenderer.invoke('bookmarks:create'),
    getBookmarks: () => ipcRenderer.invoke('bookmarks:get'),
    removeBookmark: (url) => ipcRenderer.invoke('bookmarks:remove', url),
    // History
    getHistory: () => ipcRenderer.invoke('history:get'),
    clearHistory: () => ipcRenderer.invoke('history:clear'),
    removeHistoryItem: (url, timestamp) => ipcRenderer.invoke('history:remove', { url, timestamp }),
    // Listeners
    onTabsUpdate: (callback) => ipcRenderer.on('tabs:update', (_, tabs) => callback(tabs)),
    onTabUpdate: (callback) => ipcRenderer.on('tab:update', (_, data) => callback(data)),
    onActiveTabUpdate: (callback) => ipcRenderer.on('tabs:active', (_, id) => callback(id)),
    onNavUpdate: (callback) => ipcRenderer.on('nav:update', (_, data) => callback(data)),
    // Permissions
    onPermissionRequest: (callback) => ipcRenderer.on('permission:request', (_, data) => callback(data)),
    sendPermissionResponse: (data) => ipcRenderer.send('permission:response', data),
    getSitePermissions: (host) => ipcRenderer.invoke('permissions:get-for-host', host),
    resetSitePermissions: (host) => ipcRenderer.invoke('permissions:reset', host),
});
