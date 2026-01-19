import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, ShieldCheck, Star, List, Clock, Lock } from 'lucide-react';

interface TopBarProps {
    url: string;
    onNavigate: (url: string) => void;
    onBack: () => void;
    onForward: () => void;
    onReload: () => void;
    onBookmark: (success: boolean, error?: string) => void;
    onOpenBookmarks: () => void;
    onOpenHistory: () => void;
    onOpenSiteInfo: () => void;
}

export function TopBar({ url: externalUrl, onNavigate, onBack, onForward, onReload, onBookmark, onOpenBookmarks, onOpenHistory, onOpenSiteInfo }: TopBarProps) {
    const [url, setUrl] = useState(externalUrl);

    // Sync input with actual page URL when it changes externally
    React.useEffect(() => {
        // Mask the internal welcome page URL
        if (externalUrl && (externalUrl.includes('/welcome.html') || externalUrl.includes('localhost'))) {
            setUrl('');
        } else {
            setUrl(externalUrl);
        }
    }, [externalUrl]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur(); // Remove focus
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
                <button
                    onClick={onOpenSiteInfo}
                    className="mr-2 text-emerald-500 hover:text-emerald-400 transition"
                    title="View Site Information"
                >
                    <Lock size={14} />
                </button>
                <input
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500"
                    placeholder="Search or enter address"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={(e) => e.target.select()}
                />
            </div>

            <div className="flex items-center space-x-1">
                <button
                    className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 active:text-yellow-400"
                    title="Bookmark this page"
                    onClick={() => {
                        // Call Main process to bookmark current tab
                        window.api.createBookmark().then((result: { success: boolean, error?: string }) => {
                            onBookmark(result.success, result.error);
                        });
                    }}
                >
                    <Star size={16} />
                </button>
                <button
                    className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
                    title="Open Bookmarks"
                    onClick={onOpenBookmarks}
                >
                    <List size={16} />
                </button>
                <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
                <button
                    className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
                    title="History"
                    onClick={onOpenHistory}
                >
                    <Clock size={16} />
                </button>
            </div>
        </div>
    );
}
