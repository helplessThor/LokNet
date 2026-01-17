import { app, ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const DATA_PATH = path.join(app.getPath('userData'), 'loknet-data.json');

interface Bookmarks {
    [url: string]: string; // url -> title
}

interface HistoryItem {
    url: string;
    title: string;
    timestamp: number;
}

interface Data {
    bookmarks: Bookmarks;
    history: HistoryItem[];
}

export class Store {
    private data: Data = { bookmarks: {}, history: [] };

    constructor() {
        this.load();
    }

    private load() {
        try {
            if (fs.existsSync(DATA_PATH)) {
                this.data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
            }
        } catch (e) {
            console.error('Failed to load data', e);
        }
    }

    private save() {
        try {
            fs.writeFileSync(DATA_PATH, JSON.stringify(this.data, null, 2));
        } catch (e) {
            console.error('Failed to save data', e);
        }
    }

    addBookmark(url: string, title: string) {
        this.data.bookmarks[url] = title;
        this.save();
        return this.data.bookmarks;
    }

    removeBookmark(url: string) {
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

    addHistory(url: string, title: string) {
        // Basic deduplication: if last entry is same, update timestamp
        const last = this.data.history[0];
        if (last && last.url === url) {
            last.timestamp = Date.now();
        } else {
            this.data.history.unshift({ url, title, timestamp: Date.now() });
            if (this.data.history.length > 1000) {
                this.data.history = this.data.history.slice(0, 1000);
            }
        }
        this.save();
    }
}
