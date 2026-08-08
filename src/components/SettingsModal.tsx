import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/Button';
import { Settings, AlertTriangle, Download, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import pkg from '../../package.json';
import { ExportModal } from './modals/ExportModal';
import { ImportModal } from './modals/ImportModal';

export function SettingsModal() {
  const isWeb = import.meta.env.VITE_APP_MODE === 'web';
  const enableShortcuts = useAppStore(s => s.enableShortcuts);
  const toggleShortcuts = useAppStore(s => s.toggleShortcuts);
  
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [importContent, setImportContent] = useState<string | null>(null);

  if (isWeb) return null;

  const handleManualUpdateCheck = () => {
    toast.loading("Checking for updates...", { id: 'update-check' });
    fetch('https://api.github.com/repos/BiaanVanSittert/ThePrepLab/releases/latest', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const latestVersion = data.tag_name?.replace(/^v/i, '');
        if (latestVersion && latestVersion !== pkg.version) {
          toast.success(`Version ${data.tag_name} is available!`, {
            id: 'update-check',
            description: "A newer version is ready.",
            action: {
              label: "Download",
              onClick: () => window.open("https://github.com/BiaanVanSittert/ThePrepLab/releases/latest", "_blank")
            }
          });
        } else {
          toast.success("ThePrepLab is up to date!", { id: 'update-check' });
        }
      })
      .catch(() => toast.error("Failed to check for updates", { id: 'update-check' }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImportContent(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFactoryReset = async () => {
    try {
      const { factoryReset } = useAppStore.getState();
      
      const { del } = await import('idb-keyval');
      await del('thepreplab-storage');
      
      factoryReset();
      
      toast.success("Factory Reset Complete", { description: "App will now reload." });
      
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
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      {importContent && <ImportModal fileContent={importContent} onClose={() => setImportContent(null)} />}

      <Button variant="ghost" size="sm" className="p-2" onClick={() => setIsOpen(true)}>
        <Settings className="w-5 h-5 text-muted-foreground" />
      </Button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-1">Settings</h2>
            <p className="text-sm text-muted-foreground mb-6">Version {pkg.version}</p>

            <div className="space-y-6">
              
              {/* Application Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Application</h3>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleManualUpdateCheck}>
                  <RefreshCw className="w-4 h-4 text-primary" /> Check for Updates
                </Button>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
                  <span className="text-sm font-medium">Builder Shortcuts (Ctrl+F/B)</span>
                  <input type="checkbox" checked={enableShortcuts} onChange={(e) => toggleShortcuts(e.target.checked)} className="rounded border-gray-300 w-4 h-4" />
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Data Management</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsExportOpen(true)}>
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Import
                  </Button>
                </div>
              </div>
              
              {/* Dangerous Actions */}
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl space-y-4 mt-8">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your local FlashDecks, Exams, and scores. This will restore the default demo data.
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
        </div>,
        document.body
      )}
    </>
  );
}
