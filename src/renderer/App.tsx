import React, { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { TabBar, Tab } from './components/TabBar';
import { BookmarksModal } from './components/BookmarksModal';

// Define the API type for TypeScript (simplified)
declare global {
    interface Window {
        api: any;
    }
}

function App() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string, visible: boolean }>({ msg: '', visible: false });
    const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

    // Toast helper
    const showToast = (msg: string) => {
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
        window.api.onNavUpdate((data: { url: string, title: string }) => {
            setCurrentUrl(data.url);
        });

        window.api.onTabUpdate((data: { id: number, title?: string, icon?: string }) => {
            setTabs(prev => prev.map(tab => {
                if (tab.id === data.id) {
                    return { ...tab, title: data.title || tab.title, icon: data.icon || tab.icon };
                }
                return tab;
            }));
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

    const handleSwitchTab = async (id: number) => {
        await window.api.switchTab(id);
        setActiveTabId(id);
        setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })));
    };

    const handleCloseTab = async (id: number) => {
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

    return (
        <div className="h-screen w-screen bg-slate-900 text-white flex flex-col overflow-hidden">
            {/* Drag region for frameless window if we wanted custom titlebar, 
            but we are using standard window frame for simplicity first, just hidden menu */}
            <div className="flex flex-col border-b border-black">
                <TabBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onSwitch={handleSwitchTab}
                    onClose={handleCloseTab}
                    onNew={handleNewTab}
                />
                <TopBar
                    url={currentUrl}
                    onNavigate={(url) => window.api.loadURL(url)}
                    onBack={() => window.api.goBack()}
                    onForward={() => window.api.goForward()}
                    onReload={() => window.api.reload()}
                    onBookmark={(success, error) => {
                        if (success) showToast("Bookmark Saved");
                        else showToast(error || "Cannot bookmark this page");
                    }}
                    onOpenBookmarks={() => {
                        setIsBookmarksOpen(true);
                        // Hide the browser view so modal is visible
                        window.api.hideView();
                    }}
                />
            </div>

            {/* Bookmarks Modal */}
            <BookmarksModal
                isOpen={isBookmarksOpen}
                onClose={() => {
                    setIsBookmarksOpen(false);
                    // Show the browser view again
                    window.api.showView();
                }}
                onNavigate={(url) => {
                    window.api.loadURL(url);
                    // Ensure view is shown if we navigate from modal
                    window.api.showView();
                }}
            />

            {/* Toast Notification */}
            {/* Toast Notification - Positioned in the header area (safe from BrowserView occlusion) */}
            <div className={`fixed top-[44px] right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-600 transition-opacity duration-300 ${toast.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {toast.msg}
            </div>

            {/* Content area is transparent/empty because BrowserView sits on top */}
            <div className="flex-1 bg-white/5">
                {tabs.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>No tabs open. Cmd+T to open new tab.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
