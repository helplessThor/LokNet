import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { X, ExternalLink, Trash2 } from 'lucide-react';
export function BookmarksModal({ isOpen, onClose, onNavigate }) {
    const [bookmarks, setBookmarks] = useState({});
    const loadBookmarks = async () => {
        const data = await window.api.getBookmarks();
        setBookmarks(data || {});
    };
    useEffect(() => {
        if (isOpen) {
            loadBookmarks();
        }
    }, [isOpen]);
    const handleDelete = async (url) => {
        const newData = await window.api.removeBookmark(url);
        setBookmarks(newData);
    };
    if (!isOpen)
        return null;
    const items = Object.entries(bookmarks);
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-slate-800 w-full max-w-md rounded-xl shadow-2xl border border-slate-700 overflow-hidden", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-700", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Bookmarks" }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-white transition", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "max-h-[60vh] overflow-y-auto p-2", children: items.length === 0 ? (_jsx("div", { className: "text-center p-8 text-slate-500", children: "No bookmarks yet." })) : (_jsx("div", { className: "space-y-1", children: items.map(([url, title]) => (_jsxs("div", { className: "flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg group transition", children: [_jsxs("div", { className: "flex-1 min-w-0 mr-4 cursor-pointer", onClick: () => { onNavigate(url); onClose(); }, children: [_jsx("div", { className: "font-medium text-slate-200 truncate", children: title }), _jsx("div", { className: "text-xs text-slate-500 truncate", children: url })] }), _jsxs("div", { className: "flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition", children: [_jsx("button", { onClick: () => { onNavigate(url); onClose(); }, className: "p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full", title: "Open", children: _jsx(ExternalLink, { size: 16 }) }), _jsx("button", { onClick: () => handleDelete(url), className: "p-2 text-rose-400 hover:bg-rose-400/10 rounded-full", title: "Delete", children: _jsx(Trash2, { size: 16 }) })] })] }, url))) })) })] }) }));
}
