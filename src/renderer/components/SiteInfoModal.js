import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Lock, RefreshCw, Shield, X } from 'lucide-react';
export function SiteInfoModal({ isOpen, onClose, host }) {
    const [permissions, setPermissions] = useState({});
    useEffect(() => {
        if (isOpen && host) {
            loadPermissions();
        }
    }, [isOpen, host]);
    const loadPermissions = async () => {
        try {
            const perms = await window.api.getSitePermissions(host);
            setPermissions(perms || {});
        }
        catch (e) {
            console.error(e);
        }
    };
    const handleReset = async () => {
        await window.api.resetSitePermissions(host);
        setPermissions({});
    };
    if (!isOpen)
        return null;
    const hasPermissions = Object.keys(permissions).length > 0;
    return (_jsxs("div", { className: "fixed top-[100px] left-4 z-[60] w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200", children: [_jsxs("div", { className: "p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "text-emerald-500", children: _jsx(Lock, { size: 16 }) }), _jsx("div", { className: "text-sm font-semibold text-white", children: "Site Information" })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-white", children: _jsx(X, { size: 16 }) })] }), _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1", children: "Current Site" }), _jsx("div", { className: "text-emerald-400 font-medium truncate", children: host })] }), _jsx("div", { className: "text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2", children: "Permissions" }), hasPermissions ? (_jsx("div", { className: "space-y-2 mb-4", children: Object.entries(permissions).map(([perm, status]) => (_jsxs("div", { className: "flex justify-between items-center bg-slate-700/50 p-2 rounded-lg border border-slate-700", children: [_jsx("span", { className: "text-sm text-slate-200 capitalize", children: perm }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${status === 'allow' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`, children: status })] }, perm))) })) : (_jsx("div", { className: "text-sm text-slate-500 italic mb-4", children: "No special permissions granted." })), hasPermissions && (_jsxs("button", { onClick: handleReset, className: "w-full flex items-center justify-center space-x-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition", children: [_jsx(RefreshCw, { size: 14 }), _jsx("span", { children: "Reset Permissions" })] }))] }), _jsxs("div", { className: "bg-slate-900/30 p-3 text-[10px] text-slate-500 border-t border-slate-700 flex items-center space-x-2", children: [_jsx(Shield, { size: 12 }), _jsx("span", { children: "Connection is secure (Local/HTTPS)" })] })] }));
}
