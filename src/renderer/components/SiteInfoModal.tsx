import React, { useEffect, useState } from 'react';
import { Lock, RefreshCw, Shield, Trash2, X } from 'lucide-react';

interface SiteInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    host: string;
}

export function SiteInfoModal({ isOpen, onClose, host }: SiteInfoModalProps) {
    const [permissions, setPermissions] = useState<{ [key: string]: 'allow' | 'deny' }>({});

    useEffect(() => {
        if (isOpen && host) {
            loadPermissions();
        }
    }, [isOpen, host]);

    const loadPermissions = async () => {
        try {
            const perms = await window.api.getSitePermissions(host);
            setPermissions(perms || {});
        } catch (e) {
            console.error(e);
        }
    };

    const handleReset = async () => {
        await window.api.resetSitePermissions(host);
        setPermissions({});
    };

    if (!isOpen) return null;

    const hasPermissions = Object.keys(permissions).length > 0;

    return (
        <div className="fixed top-[100px] left-4 z-[60] w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="text-emerald-500">
                        <Lock size={16} />
                    </div>
                    <div className="text-sm font-semibold text-white">
                        Site Information
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            <div className="p-4">
                <div className="mb-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Current Site</div>
                    <div className="text-emerald-400 font-medium truncate">{host}</div>
                </div>

                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Permissions</div>

                {hasPermissions ? (
                    <div className="space-y-2 mb-4">
                        {Object.entries(permissions).map(([perm, status]) => (
                            <div key={perm} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-lg border border-slate-700">
                                <span className="text-sm text-slate-200 capitalize">{perm}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'allow' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-slate-500 italic mb-4">
                        No special permissions granted.
                    </div>
                )}

                {hasPermissions && (
                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center space-x-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition"
                    >
                        <RefreshCw size={14} />
                        <span>Reset Permissions</span>
                    </button>
                )}
            </div>

            <div className="bg-slate-900/30 p-3 text-[10px] text-slate-500 border-t border-slate-700 flex items-center space-x-2">
                <Shield size={12} />
                <span>Connection is secure (Local/HTTPS)</span>
            </div>
        </div>
    );
}
