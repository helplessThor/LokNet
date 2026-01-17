import React, { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { TabBar, Tab } from './components/TabBar';

// Define the API type for TypeScript (simplified)
declare global {
    interface Window {
        api: any;
    }
}

function App() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<number | null>(null);

    useEffect(() => {
        // Initial tab
        handleNewTab();

        // Listeners for updates from main process (if we were syncing state fully)
        // For now we manage UI state locally and trust main process to sync
    }, []);

    const handleNewTab = async () => {
        const id = await window.api.createTab('https://duckduckgo.com');
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
                    onNavigate={(url) => window.api.loadURL(url)}
                    onBack={() => window.api.goBack()}
                    onForward={() => window.api.goForward()}
                    onReload={() => window.api.reload()}
                />
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
