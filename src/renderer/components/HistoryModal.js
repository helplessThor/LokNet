import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { X, ExternalLink, Trash2, Clock } from 'lucide-react';
export function HistoryModal({ isOpen, onClose, onNavigate }) {
    const [history, setHistory] = useState([]);
    const loadHistory = async () => {
        const data = await window.api.getHistory();
        setHistory(data || []);
    };
    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);
    const handleDelete = async (url, timestamp) => {
        const newData = await window.api.removeHistoryItem(url, timestamp);
        setHistory(newData);
    };
    const handleClear = async () => {
        if (confirm("Are you sure you want to clear all history?")) {
            await window.api.clearHistory();
            setHistory([]);
        }
    };
    const formatTime = (ts) => {
        return new Date(ts).toLocaleString();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl border border-slate-700 overflow-hidden", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-700", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "text-slate-400", size: 20 }), _jsx("h2", { className: "text-lg font-semibold text-white", children: "History" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [history.length > 0 && (_jsx("button", { onClick: handleClear, className: "text-xs px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full transition", children: "Clear All" })), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-white transition", children: _jsx(X, { size: 20 }) })] })] }), _jsx("div", { className: "max-h-[60vh] overflow-y-auto p-2", children: history.length === 0 ? (_jsx("div", { className: "text-center p-8 text-slate-500", children: "No history yet." })) : (_jsx("div", { className: "space-y-1", children: history.map((item) => (_jsxs("div", { className: "flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg group transition", children: [_jsxs("div", { className: "flex-1 min-w-0 mr-4 cursor-pointer", onClick: () => { onNavigate(item.url); onClose(); }, children: [_jsx("div", { className: "font-medium text-slate-200 truncate", children: item.title || item.url }), _jsxs("div", { className: "flex items-center space-x-2 text-xs text-slate-500", children: [_jsx("span", { children: formatTime(item.timestamp) }), _jsx("span", { className: "truncate max-w-[200px] opacity-75", children: item.url })] })] }), _jsxs("div", { className: "flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition", children: [_jsx("button", { onClick: () => { onNavigate(item.url); onClose(); }, className: "p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-full", title: "Open", children: _jsx(ExternalLink, { size: 16 }) }), _jsx("button", { onClick: () => handleDelete(item.url, item.timestamp), className: "p-2 text-rose-400 hover:bg-rose-400/10 rounded-full", title: "Delete", children: _jsx(Trash2, { size: 16 }) })] })] }, `${item.url}-${item.timestamp}`))) })) })] }) }));
}
