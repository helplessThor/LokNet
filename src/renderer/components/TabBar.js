import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, Plus } from 'lucide-react';
export function TabBar({ tabs, activeTabId, onSwitch, onClose, onNew }) {
    return (_jsxs("div", { className: "h-10 bg-slate-900 flex items-end px-2 space-x-1 pt-2 w-full overflow-x-auto no-scrollbar pr-[140px]", style: { WebkitAppRegion: 'drag' }, children: [tabs.map((tab) => (_jsxs("div", { onClick: () => onSwitch(tab.id), className: `
            group flex items-center min-w-[150px] max-w-[200px] h-8 px-3 rounded-t-md cursor-pointer select-none text-sm transition-colors
            ${activeTabId === tab.id ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
          `, style: { WebkitAppRegion: 'no-drag' }, children: [tab.icon && _jsx("img", { src: tab.icon, className: "w-4 h-4 mr-2", alt: "" }), _jsx("span", { className: "flex-1 truncate mr-2", children: tab.title || 'New Tab' }), _jsx("button", { onClick: (e) => { e.stopPropagation(); onClose(tab.id); }, className: `p-1 rounded-full hover:bg-slate-600 ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`, children: _jsx(X, { size: 12 }) })] }, tab.id))), _jsx("button", { onClick: onNew, className: "h-8 w-8 flex items-center justify-center text-slate-400 hover:bg-slate-800 rounded-md transition", style: { WebkitAppRegion: 'no-drag' }, children: _jsx(Plus, { size: 18 }) })] }));
}
