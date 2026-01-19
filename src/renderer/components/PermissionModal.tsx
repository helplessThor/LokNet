import React from 'react';
import { Shield, Check, X, Ban } from 'lucide-react';

interface PermissionModalProps {
    request: { host: string, permission: string, id: number } | null;
    onResponse: (allow: boolean, persist: boolean) => void;
}

export function PermissionModal({ request, onResponse }: PermissionModalProps) {
    if (!request) return null;

    const { host, permission } = request;

    // Format permission name for display
    const formatPermission = (perm: string) => {
        if (perm === 'media') return 'Use Camera & Microphone';
        if (perm === 'geolocation') return 'Know your Location';
        if (perm === 'notifications') return 'Show Notifications';
        return perm;
    };

    return (
        <div className="fixed top-20 right-4 z-[100] w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-start space-x-3">
                <div className="p-2 bg-slate-700 rounded-lg text-emerald-400">
                    <Shield size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Permission Request</h3>
                    <p className="text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-200">{host}</span> wants to:
                    </p>
                    <p className="text-sm font-medium text-emerald-400 mt-0.5">
                        {formatPermission(permission)}
                    </p>
                </div>
            </div>

            <div className="p-2 flex flex-col space-y-1">
                <button
                    onClick={() => onResponse(true, true)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 text-white transition text-left group"
                >
                    <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md group-hover:bg-emerald-500 group-hover:text-white transition">
                        <Check size={16} />
                    </div>
                    <div>
                        <div className="text-sm font-medium">Always Allow</div>
                        <div className="text-[10px] text-slate-500 group-hover:text-slate-300">Detailed access for this site</div>
                    </div>
                </button>

                <button
                    onClick={() => onResponse(true, false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 text-white transition text-left"
                >
                    <div className="p-1.5 bg-slate-700 rounded-md text-slate-400">
                        <Check size={16} />
                    </div>
                    <div className="text-sm font-medium">Allow this time</div>
                </button>

                <div className="h-px bg-slate-700 my-1 mx-2" />

                <button
                    onClick={() => onResponse(false, true)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-900/20 text-red-200 hover:text-red-100 transition text-left"
                >
                    <div className="p-1.5 bg-red-500/10 text-red-500 rounded-md">
                        <Ban size={16} />
                    </div>
                    <div className="text-sm font-medium">Deny</div>
                </button>
            </div>
        </div>
    );
}
