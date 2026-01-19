import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Shield, Check, Ban } from 'lucide-react';
export function PermissionModal({ request, onResponse }) {
    if (!request)
        return null;
    const { host, permission } = request;
    // Format permission name for display
    const formatPermission = (perm) => {
        if (perm === 'media')
            return 'Use Camera & Microphone';
        if (perm === 'geolocation')
            return 'Know your Location';
        if (perm === 'notifications')
            return 'Show Notifications';
        return perm;
    };
    return (_jsxs("div", { className: "fixed top-20 right-4 z-[100] w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200", children: [_jsxs("div", { className: "p-4 border-b border-slate-700 bg-slate-900/50 flex items-start space-x-3", children: [_jsx("div", { className: "p-2 bg-slate-700 rounded-lg text-emerald-400", children: _jsx(Shield, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: "Permission Request" }), _jsxs("p", { className: "text-xs text-slate-400 mt-1", children: [_jsx("span", { className: "font-medium text-slate-200", children: host }), " wants to:"] }), _jsx("p", { className: "text-sm font-medium text-emerald-400 mt-0.5", children: formatPermission(permission) })] })] }), _jsxs("div", { className: "p-2 flex flex-col space-y-1", children: [_jsxs("button", { onClick: () => onResponse(true, true), className: "flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 text-white transition text-left group", children: [_jsx("div", { className: "p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md group-hover:bg-emerald-500 group-hover:text-white transition", children: _jsx(Check, { size: 16 }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Always Allow" }), _jsx("div", { className: "text-[10px] text-slate-500 group-hover:text-slate-300", children: "Detailed access for this site" })] })] }), _jsxs("button", { onClick: () => onResponse(true, false), className: "flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 text-white transition text-left", children: [_jsx("div", { className: "p-1.5 bg-slate-700 rounded-md text-slate-400", children: _jsx(Check, { size: 16 }) }), _jsx("div", { className: "text-sm font-medium", children: "Allow this time" })] }), _jsx("div", { className: "h-px bg-slate-700 my-1 mx-2" }), _jsxs("button", { onClick: () => onResponse(false, true), className: "flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-900/20 text-red-200 hover:text-red-100 transition text-left", children: [_jsx("div", { className: "p-1.5 bg-red-500/10 text-red-500 rounded-md", children: _jsx(Ban, { size: 16 }) }), _jsx("div", { className: "text-sm font-medium", children: "Deny" })] })] })] }));
}
