import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
const DATA_PATH = path.join(app.getPath('userData'), 'loknet-data.json');
export class Store {
    constructor() {
        this.data = { bookmarks: {}, history: [], permissions: {} };
        this.load();
    }
    load() {
        try {
            if (fs.existsSync(DATA_PATH)) {
                this.data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
            }
        }
        catch (e) {
            console.error('Failed to load data', e);
        }
    }
    save() {
        try {
            fs.writeFileSync(DATA_PATH, JSON.stringify(this.data, null, 2));
        }
        catch (e) {
            console.error('Failed to save data', e);
        }
    }
    addBookmark(url, title) {
        this.data.bookmarks[url] = title;
        this.save();
        return this.data.bookmarks;
    }
    removeBookmark(url) {
        delete this.data.bookmarks[url];
        this.save();
        return this.data.bookmarks;
    }
    getBookmarks() {
        return this.data.bookmarks;
    }
    getHistory() {
        return this.data.history.slice(0, 100);
    }
    addHistory(url, title) {
        // Basic deduplication: if last entry is same, update timestamp
        const last = this.data.history[0];
        if (last && last.url === url) {
            last.timestamp = Date.now();
        }
        else {
            this.data.history.unshift({ url, title, timestamp: Date.now() });
            if (this.data.history.length > 1000) {
                this.data.history = this.data.history.slice(0, 1000);
            }
        }
        this.save();
    }
    removeHistoryItem(url, timestamp) {
        // Remove specific instance based on timestamp or all instances of url if timestamp not provided?
        // For simplicity, let's remove by unique timestamp if possible, or filtered 
        // But the UI will probably just pass back what it got.
        // Let's filter out the specific item.
        this.data.history = this.data.history.filter(item => !(item.url === url && item.timestamp === timestamp));
        this.save();
        return this.getHistory();
    }
    clearHistory() {
        this.data.history = [];
        this.save();
    }
    getPermission(host, permission) {
        if (!this.data.permissions)
            this.data.permissions = {};
        return this.data.permissions[host]?.[permission] || null;
    }
    setPermission(host, permission, status) {
        if (!this.data.permissions)
            this.data.permissions = {};
        if (!this.data.permissions[host])
            this.data.permissions[host] = {};
        this.data.permissions[host][permission] = status;
        this.save();
    }
    getPermissionsForHost(host) {
        return this.data.permissions?.[host] || {};
    }
    removePermissionsForHost(host) {
        if (this.data.permissions?.[host]) {
            delete this.data.permissions[host];
            this.save();
        }
    }
}
