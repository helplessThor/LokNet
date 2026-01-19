import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Trash2, Clock } from 'lucide-react';

interface HistoryItem {
    url: string;
    title: string;
    timestamp: number;
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (url: string) => void;
}

export function HistoryModal({ isOpen, onClose, onNavigate }: HistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const loadHistory = async () => {
        const data = await window.api.getHistory();
        setHistory(data || []);
    };

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const handleDelete = async (url: string, timestamp: number) => {
        const newData = await window.api.removeHistoryItem(url, timestamp);
        setHistory(newData);
    };

    const handleClear = async () => {
        if (confirm("Are you sure you want to clear all history?")) {
            await window.api.clearHistory();
            setHistory([]);
        }
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleString();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl border border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                        <Clock className="text-slate-400" size={20} />
                        <h2 className="text-lg font-semibold text-white">History</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        {history.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="text-xs px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full transition"
                            >
                                Clear All
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {history.length === 0 ? (
                        <div className="text-center p-8 text-slate-500">
                            No history yet.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {history.map((item) => (
                                <div key={`${item.url}-${item.timestamp}`} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg group transition">
                                    <div className="flex-1 min-w-0 mr-4 cursor-pointer" onClick={() => { onNavigate(item.url); onClose(); }}>
                                        <div className="font-medium text-slate-200 truncate">{item.title || item.url}</div>
                                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                                            <span>{formatTime(item.timestamp)}</span>
                                            <span className="truncate max-w-[200px] opacity-75">{item.url}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            onClick={() => { onNavigate(item.url); onClose(); }}
                                            className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full"
                                            title="Open"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.url, item.timestamp)}
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
