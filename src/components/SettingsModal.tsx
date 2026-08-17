import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/Button';
import { Settings, AlertTriangle, Download, Upload, RefreshCw, X, Github, Bug, ExternalLink, Code2 } from 'lucide-react';
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
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const data = await res.json();
        const latestVersion = data.tag_name?.replace(/^v/i, '');
        if (!latestVersion) {
          throw new Error("Missing tag_name in response");
        }
        if (latestVersion !== pkg.version) {
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
      .catch((err) => {
        console.warn("Update check failed:", err);
        toast.error("Could not check for updates (network or rate limit)", { id: 'update-check' });
      });
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
      }, 1200);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-background w-full max-w-md p-6 rounded-2xl border border-border shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between mb-4 shrink-0">
              <div>
                <h2 className="text-2xl font-bold">Settings & Info</h2>
                <p className="text-xs text-muted-foreground mt-0.5">ThePrepLab Desktop v{pkg.version}</p>
              </div>
              <Button variant="ghost" size="sm" className="p-1.5 h-auto rounded-lg" onClick={() => { setIsOpen(false); setConfirmDelete(false); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-1">
              
              {/* Application Settings */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application</h3>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleManualUpdateCheck}>
                  <RefreshCw className="w-4 h-4 text-primary" /> Check for Updates
                </Button>
                <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/10">
                  <span className="text-sm font-medium">Smart Highlighter (Ctrl+F/B)</span>
                  <input 
                    type="checkbox" 
                    checked={enableShortcuts} 
                    onChange={(e) => toggleShortcuts(e.target.checked)} 
                    className="rounded border-gray-300 w-4 h-4 text-primary focus:ring-primary cursor-pointer" 
                  />
                </div>
              </div>

              {/* About & Support */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Community & Support</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => window.open("https://github.com/BiaanVanSittert/ThePrepLab/issues/new", "_blank")}
                    className="w-full flex items-center justify-between p-3 border border-border rounded-xl bg-card hover:bg-muted/40 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Bug className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Report an Issue / Bug</p>
                        <p className="text-xs text-muted-foreground">Found a bug or have a suggestion? Open an issue</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open("https://github.com/BiaanVanSittert", "_blank")}
                    className="w-full flex items-center justify-between p-3 border border-border rounded-xl bg-card hover:bg-muted/40 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Github className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Developer GitHub (Other Projects)</p>
                        <p className="text-xs text-muted-foreground">Check out other projects by @BiaanVanSittert</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open("https://github.com/BiaanVanSittert/ThePrepLab", "_blank")}
                    className="w-full flex items-center justify-between p-3 border border-border rounded-xl bg-card hover:bg-muted/40 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">ThePrepLab Repository</p>
                        <p className="text-xs text-muted-foreground">Star, fork, or view the open source code</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                  </button>
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Management</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsExportOpen(true)}>
                    <Download className="w-4 h-4" /> Export Backup
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Import Backup
                  </Button>
                </div>
              </div>
              
              {/* Dangerous Actions */}
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold text-sm">Danger Zone</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permanently delete all your custom Notebooks, FlashDecks, Exams, and scores. Restores original demo data.
                </p>
                
                {!confirmDelete ? (
                  <Button variant="outline" className="w-full text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white text-xs h-9" onClick={() => setConfirmDelete(true)}>
                    Factory Reset All Data
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 text-xs h-9" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs h-9" onClick={handleFactoryReset}>
                      Confirm Wipe
                    </Button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
