import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/Button';
import { Settings, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const handleFactoryReset = async () => {
    try {
      const { clearResults } = useAppStore.getState();
      
      // Wipe Zustand Persist Store from IndexedDB/SessionStorage
      const isWeb = import.meta.env.VITE_APP_MODE === 'web';
      if (isWeb) {
        sessionStorage.removeItem('thepreplab-storage');
      } else {
        const { del } = await import('idb-keyval');
        await del('thepreplab-storage');
      }
      
      // Clear runtime memory
      useAppStore.setState({ decks: [], exams: [], results: [], knowledgeBase: '' });
      clearResults();
      
      toast.success("Factory Reset Complete", { description: "App will now reload." });
      
      // Reload app to clear any remaining react state
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (e) {
      console.error(e);
      toast.error("Failed to reset data");
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsOpen(true)}>
        <Settings className="w-5 h-5 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            <div className="space-y-6">
              
              {/* Dangerous Actions */}
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you are planning to uninstall the application, or just want to start fresh, you can permanently delete all your local FlashDecks, Exams, and scores here.
                </p>
                
                {!confirmDelete ? (
                  <Button variant="outline" className="w-full text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white" onClick={() => setConfirmDelete(true)}>
                    Factory Reset All Data
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleFactoryReset}>
                      Confirm Wipe
                    </Button>
                  </div>
                )}
              </div>

            </div>

            <Button variant="ghost" className="absolute top-4 right-4" onClick={() => { setIsOpen(false); setConfirmDelete(false); }}>
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
