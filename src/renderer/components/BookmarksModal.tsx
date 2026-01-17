import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Trash2 } from 'lucide-react';

interface BookmarksModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (url: string) => void;
}

export function BookmarksModal({ isOpen, onClose, onNavigate }: BookmarksModalProps) {
    const [bookmarks, setBookmarks] = useState<{ [url: string]: string }>({});

    const loadBookmarks = async () => {
        const data = await window.api.getBookmarks();
        setBookmarks(data || {});
    };

    useEffect(() => {
        if (isOpen) {
            loadBookmarks();
        }
    }, [isOpen]);

    const handleDelete = async (url: string) => {
        const newData = await window.api.removeBookmark(url);
        setBookmarks(newData);
    };

    if (!isOpen) return null;

    const items = Object.entries(bookmarks);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-md rounded-xl shadow-2xl border border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">Bookmarks</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {items.length === 0 ? (
                        <div className="text-center p-8 text-slate-500">
                            No bookmarks yet.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {items.map(([url, title]) => (
                                <div key={url} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg group transition">
                                    <div className="flex-1 min-w-0 mr-4 cursor-pointer" onClick={() => { onNavigate(url); onClose(); }}>
                                        <div className="font-medium text-slate-200 truncate">{title}</div>
                                        <div className="text-xs text-slate-500 truncate">{url}</div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => { onNavigate(url); onClose(); }}
                                            className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full"
                                            title="Open"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(url)}
                                            className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-full"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
