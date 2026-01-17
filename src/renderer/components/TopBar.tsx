import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, ShieldCheck, Star } from 'lucide-react';

interface TopBarProps {
    onNavigate: (url: string) => void;
    onBack: () => void;
    onForward: () => void;
    onReload: () => void;
}

export function TopBar({ onNavigate, onBack, onForward, onReload }: TopBarProps) {
    const [url, setUrl] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            let finalUrl = url;
            if (!url.startsWith('http') && !url.includes('://')) {
                if (url.includes('.') && !url.includes(' ')) {
                    finalUrl = `https://${url}`;
                } else {
                    // Privacy focused default search
                    finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
                }
            }
            onNavigate(finalUrl);
        }
    };

    return (
        <div className="h-12 bg-slate-800 flex items-center px-2 space-x-2 border-b border-slate-700">
            <div className="flex space-x-1 text-slate-400">
                <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition"><ArrowLeft size={16} /></button>
                <button onClick={onForward} className="p-2 hover:bg-slate-700 rounded-full transition"><ArrowRight size={16} /></button>
                <button onClick={onReload} className="p-2 hover:bg-slate-700 rounded-full transition"><RotateCw size={16} /></button>
            </div>

            <div className="flex-1 flex items-center bg-slate-900 rounded-full px-4 h-8 border border-slate-700 focus-within:border-cyan-500 transition">
                <ShieldCheck size={14} className="text-emerald-500 mr-2" />
                <input
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                    placeholder="Search or enter address"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <button
                className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 active:text-yellow-400"
                title="Bookmark this page"
                onClick={() => {
                    // Naive implementation: save current URL. 
                    // In a real app we'd get the actual current URL from the ViewManager via IPC if it differs from input.
                    // But 'url' state in TopBar is just the input text. 
                    // We should ideally pass the current confirmed URL from parent.
                    // For MVP, we'll just alert "Bookmark Saved" to demonstrate intent.
                    // But better: use a window.api call.
                    if (url) window.api.addBookmark(url, 'Bookmark');
                }}
            >
                <Star size={16} />
            </button>
        </div>
    );
}
