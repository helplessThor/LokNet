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

    // Bookmarks
    addBookmark: (url: string, title: string) => ipcRenderer.invoke('bookmarks:add', { url, title }),

    // Listeners
    onTabsUpdate: (callback: (tabs: any[]) => void) => ipcRenderer.on('tabs:update', (_, tabs) => callback(tabs)),
    onActiveTabUpdate: (callback: (id: number) => void) => ipcRenderer.on('tabs:active', (_, id) => callback(id)),
});
