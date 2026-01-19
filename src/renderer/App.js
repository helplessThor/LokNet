import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { BookmarksModal } from './components/BookmarksModal';
import { HistoryModal } from './components/HistoryModal';
import { PermissionModal } from './components/PermissionModal';
import { SiteInfoModal } from './components/SiteInfoModal';
function App() {
    const [tabs, setTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [toast, setToast] = useState({ msg: '', visible: false });
    const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSiteInfoOpen, setIsSiteInfoOpen] = useState(false);
    const [permissionRequest, setPermissionRequest] = useState(null);
    // Toast helper
    const showToast = (msg) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
    };
    const [currentUrl, setCurrentUrl] = useState('');
    const initialized = React.useRef(false);
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // Initial tab
            handleNewTab();
        }
        // Listeners for updates from main process
        window.api.onNavUpdate((data) => {
            setCurrentUrl(data.url);
        });
        window.api.onTabUpdate((data) => {
            setTabs(prev => prev.map(tab => {
                if (tab.id === data.id) {
                    return { ...tab, title: data.title || tab.title, icon: data.icon || tab.icon };
                }
                return tab;
            }));
        });
        window.api.onPermissionRequest((data) => {
            setPermissionRequest(data);
            window.api.hideView();
        });
    }, []);
    const handleNewTab = async () => {
        const id = await window.api.createTab(); // Defaults to Welcome Page in Main
        // For V1, we just crudely add to list. 
        // Ideally ViewManager sends an event 'tab:created' which we listen to.
        // Making this robust:
        setTabs(prev => [...prev, { id, title: 'New Tab', active: true }]);
        setActiveTabId(id);
    };
    const handleSwitchTab = async (id) => {
        await window.api.switchTab(id);
        setActiveTabId(id);
        setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })));
    };
    const handleCloseTab = async (id) => {
        await window.api.closeTab(id);
        setTabs(prev => {
            const newTabs = prev.filter(t => t.id !== id);
            // If we closed active tab, logic is handled in Main, but we need to update UI focus
            if (id === activeTabId && newTabs.length > 0) {
                // This is tricky without 2-way sync. We'll improve this later.
                setActiveTabId(newTabs[newTabs.length - 1].id);
            }
            return newTabs;
        });
    };
    return (_jsxs("div", { className: "h-screen w-screen bg-slate-900 text-white flex flex-col overflow-hidden", children: [_jsxs("div", { className: "flex flex-col border-b border-black", children: [_jsx(TabBar, { tabs: tabs, activeTabId: activeTabId, onSwitch: handleSwitchTab, onClose: handleCloseTab, onNew: handleNewTab }), _jsx(TopBar, { url: currentUrl, onNavigate: (url) => window.api.loadURL(url), onBack: () => window.api.goBack(), onForward: () => window.api.goForward(), onReload: () => window.api.reload(), onBookmark: (success, error) => {
                            if (success)
                                showToast("Bookmark Saved");
                            else
                                showToast(error || "Cannot bookmark this page");
                        }, onOpenBookmarks: () => {
                            setIsBookmarksOpen(true);
                            window.api.hideView();
                        }, onOpenHistory: () => {
                            setIsHistoryOpen(true);
                            window.api.hideView();
                        }, onOpenSiteInfo: () => {
                            setIsSiteInfoOpen(true);
                            window.api.hideView();
                        } })] }), _jsx(BookmarksModal, { isOpen: isBookmarksOpen, onClose: () => {
                    setIsBookmarksOpen(false);
                    // Show the browser view again
                    window.api.showView();
                }, onNavigate: (url) => {
                    window.api.loadURL(url);
                    // Ensure view is shown if we navigate from modal
                    window.api.showView();
                } }), _jsx(HistoryModal, { isOpen: isHistoryOpen, onClose: () => {
                    setIsHistoryOpen(false);
                    window.api.showView();
                }, onNavigate: (url) => {
                    window.api.loadURL(url);
                    window.api.showView();
                } }), _jsx(PermissionModal, { request: permissionRequest, onResponse: (allow, persist) => {
                    if (permissionRequest) {
                        window.api.sendPermissionResponse({
                            id: permissionRequest.id,
                            permission: permissionRequest.permission,
                            host: permissionRequest.host,
                            allow,
                            persist
                        });
                        setPermissionRequest(null);
                        window.api.showView();
                    }
                } }), _jsx(SiteInfoModal, { isOpen: isSiteInfoOpen, onClose: () => {
                    setIsSiteInfoOpen(false);
                    window.api.showView();
                }, host: currentUrl ? new URL(currentUrl).host : '' }), _jsx("div", { className: `fixed top-[44px] right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-600 transition-opacity duration-300 ${toast.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`, children: toast.msg }), _jsx("div", { className: "flex-1 bg-white/5", children: tabs.length === 0 && (_jsx("div", { className: "flex items-center justify-center h-full text-slate-500", children: _jsx("p", { children: "No tabs open. Cmd+T to open new tab." }) })) })] }));
}
export default App;
