import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Star, List, Clock, Lock } from 'lucide-react';
export function TopBar({ url: externalUrl, onNavigate, onBack, onForward, onReload, onBookmark, onOpenBookmarks, onOpenHistory, onOpenSiteInfo }) {
    const [url, setUrl] = useState(externalUrl);
    // Sync input with actual page URL when it changes externally
    React.useEffect(() => {
        // Mask the internal welcome page URL
        if (externalUrl && (externalUrl.includes('/welcome.html') || externalUrl.includes('localhost'))) {
            setUrl('');
        }
        else {
            setUrl(externalUrl);
        }
    }, [externalUrl]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Remove focus
            let finalUrl = url;
            if (!url.startsWith('http') && !url.includes('://')) {
                if (url.includes('.') && !url.includes(' ')) {
                    finalUrl = `https://${url}`;
                }
                else {
                    // Privacy focused default search
                    finalUrl = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
                }
            }
            onNavigate(finalUrl);
        }
    };
    return (_jsxs("div", { className: "h-12 bg-slate-800 flex items-center px-2 space-x-2 border-b border-slate-700", children: [_jsxs("div", { className: "flex space-x-1 text-slate-400", children: [_jsx("button", { onClick: onBack, className: "p-2 hover:bg-slate-700 rounded-full transition", children: _jsx(ArrowLeft, { size: 16 }) }), _jsx("button", { onClick: onForward, className: "p-2 hover:bg-slate-700 rounded-full transition", children: _jsx(ArrowRight, { size: 16 }) }), _jsx("button", { onClick: onReload, className: "p-2 hover:bg-slate-700 rounded-full transition", children: _jsx(RotateCw, { size: 16 }) })] }), _jsxs("div", { className: "flex-1 flex items-center bg-slate-900 rounded-full px-4 h-8 border border-slate-700 focus-within:border-cyan-500 transition", children: [_jsx("button", { onClick: onOpenSiteInfo, className: "mr-2 text-emerald-500 hover:text-emerald-400 transition", title: "View Site Information", children: _jsx(Lock, { size: 14 }) }), _jsx("input", { className: "flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500", placeholder: "Search or enter address", value: url, onChange: (e) => setUrl(e.target.value), onKeyDown: handleKeyDown, onFocus: (e) => e.target.select() })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("button", { className: "p-2 hover:bg-slate-700 rounded-full transition text-slate-400 active:text-yellow-400", title: "Bookmark this page", onClick: () => {
                            // Call Main process to bookmark current tab
                            window.api.createBookmark().then((result) => {
                                onBookmark(result.success, result.error);
                            });
                        }, children: _jsx(Star, { size: 16 }) }), _jsx("button", { className: "p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white", title: "Open Bookmarks", onClick: onOpenBookmarks, children: _jsx(List, { size: 16 }) }), _jsx("div", { className: "w-[1px] h-4 bg-slate-700 mx-1" }), _jsx("button", { className: "p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white", title: "History", onClick: onOpenHistory, children: _jsx(Clock, { size: 16 }) })] })] }));
}
