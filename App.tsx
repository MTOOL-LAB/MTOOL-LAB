
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WorkForm } from './components/WorkForm';
import { WorkTable } from './components/WorkTable';
import { ShareModal } from './components/ShareModal';
import { ImportPreviewModal } from './components/ImportPreviewModal';
import { CeramicCalculator } from './components/CeramicCalculator';
import { WorkItem, UserGroup, Language, VisibleColumns, AppTab } from './types';
import { exportToExcel, exportToCsv, parseFile, exportToJpg, exportToPdf, exportToJsl, exportToOfflineHtml } from './services/exportService';
import { translations } from './i18n';

const STORAGE_KEYS = {
  WORKS: 'works_calculator_data_v1',
  LANG: 'works_calculator_lang_v1',
  COLUMNS: 'works_calculator_columns_v1',
  ACTIVE_TAB: 'works_calculator_tab_v1'
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved as Language) || 'zh';
  });

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    return (saved as AppTab) || 'volume';
  });

  const t = translations[lang];

  const [works, setWorks] = useState<WorkItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    const defaultCols = {
      workNo: true, l: true, w: true, h: true, quantity: true, remark: true, unitPrice: true, subtotal: true
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLUMNS);
      return saved ? { ...defaultCols, ...JSON.parse(saved) } : defaultCols;
    } catch (e) {
      return defaultCols;
    }
  });

  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [formKey, setFormKey] = useState(0); 
  const [ceramicKey, setCeramicKey] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<WorkItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const offlineFileInputRef = useRef<HTMLInputElement>(null);

  const getFullBackupState = () => {
    let ceramic = null;
    try {
      const savedCeramic = localStorage.getItem('ceramic_state_v1');
      ceramic = savedCeramic ? JSON.parse(savedCeramic) : null;
    } catch (e) {
      console.error(e);
    }

    if (!ceramic) {
      ceramic = {
        clayName: '',
        shrinkageRate: 12,
        measurements: [
          { id: '1', label: 'Height', wetValue: 10, firedValue: 8.8, mode: 'forward', note: '' }
        ],
        object3D: { wetL: 0, wetW: 0, wetH: 0 }
      };
    }

    return {
      works,
      ceramicState: ceramic,
      lang,
      activeTab,
      visibleColumns
    };
  };

  const handleOfflineFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileText = event.target?.result as string;
        let jsonText = fileText;
        
        // Extract JSON if it is inside an exported HTML block
        if (file.name.endsWith('.html') || fileText.includes('<script id="offline-data-json"')) {
          const startMarker = '<script id="offline-data-json" type="application/json">';
          const endMarker = '</script>';
          const startIndex = fileText.indexOf(startMarker);
          if (startIndex !== -1) {
            const contentStart = startIndex + startMarker.length;
            const endIndex = fileText.indexOf(endMarker, contentStart);
            if (endIndex !== -1) {
              jsonText = fileText.substring(contentStart, endIndex).trim();
            }
          }
        }

        const backupData = JSON.parse(jsonText);
        const imported = backupData.state || backupData;

        if (imported && (Array.isArray(imported.works) || imported.ceramicState)) {
          if (Array.isArray(imported.works)) {
            localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(imported.works));
            setWorks(imported.works);
          }
          if (imported.lang) {
            localStorage.setItem(STORAGE_KEYS.LANG, imported.lang);
            setLang(imported.lang as Language);
          }
          if (imported.activeTab) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, imported.activeTab);
            setActiveTab(imported.activeTab as AppTab);
          }
          if (imported.visibleColumns) {
            localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(imported.visibleColumns));
            setVisibleColumns(imported.visibleColumns);
          }
          if (imported.ceramicState) {
            localStorage.setItem('ceramic_state_v1', JSON.stringify(imported.ceramicState));
          }

          // Trigger forces updates of form inputs & subcomponents
          setFormKey(prev => prev + 1);
          setCeramicKey(prev => prev + 1);

          alert(t.importSuccess);
        } else {
          alert(t.importFailed);
        }
      } catch (err) {
        alert(t.importFailed);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(works));
  }, [works]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const handleAddWork = (work: WorkItem) => {
    setWorks(prev => [...prev, work]);
  };

  const handleUpdateWork = (updatedWork: WorkItem) => {
    setWorks(prev => prev.map(w => w.id === updatedWork.id ? updatedWork : w));
    setEditingWork(null);
  };

  const handleDeleteWork = (id: string) => {
    setWorks(prev => prev.filter(w => w.id !== id));
    if (editingWork?.id === id) setEditingWork(null);
  };

  const handleStartEdit = (work: WorkItem) => {
    setEditingWork(work);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    if (window.confirm(t.clearConfirm)) {
      setWorks([]);
      setEditingWork(null);
      localStorage.removeItem(STORAGE_KEYS.WORKS);
      setFormKey(prev => prev + 1);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedData = await parseFile(file);
      if (importedData.length > 0) {
        setPendingImportData(importedData);
        setIsPreviewModalOpen(true);
      } else {
        alert(t.importError);
      }
    } catch (err) {
      alert(t.importError);
    } finally {
      e.target.value = '';
    }
  };

  const confirmImport = (selectedData: WorkItem[]) => {
    setWorks(selectedData);
    setIsPreviewModalOpen(false);
    setPendingImportData([]);
    setEditingWork(null);
    setFormKey(prev => prev + 1);
  };

  const shareUrl = useMemo(() => {
    try {
      const data = btoa(unescape(encodeURIComponent(JSON.stringify(works))));
      const url = new URL(window.location.href);
      url.searchParams.set('data', data);
      return url.toString();
    } catch (e) {
      return window.location.href;
    }
  }, [works]);

  const groups = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};
    works.forEach(work => {
      const name = work.name || 'Unknown';
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(work);
    });
    return Object.entries(grouped).map(([name, items]): UserGroup => ({
      userName: name,
      works: items,
      totalPrice: items.reduce((acc, cur) => acc + (cur.unitPrice * (cur.quantity || 1)), 0)
    }));
  }, [works]);

  const grandTotal = useMemo(() => groups.reduce((acc, g) => acc + g.totalPrice, 0), [groups]);

  return (
    <div className="min-h-screen bg-black text-white py-4 md:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2V5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              {activeTab === 'volume' ? t.title : t.ceramicTitle}
            </h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm font-medium tracking-wide">
              {activeTab === 'volume' ? t.subtitle : t.ceramicSubtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/20 transition-all font-black text-xs uppercase"
            >
              {t.switchLang}
            </button>
          </div>
        </header>

        <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-8 w-fit">
          <button 
            onClick={() => setActiveTab('volume')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
              activeTab === 'volume' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t.tabVolume}
          </button>
          <button 
            onClick={() => setActiveTab('ceramic')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${
              activeTab === 'ceramic' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            {t.tabCeramic}
          </button>
        </div>

        {/* Offline Backup Control Panel */}
        <div id="offline-control-panel" className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl animate-in fade-in duration-300">
          <div className="flex-1">
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t.offlineSectionTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{t.offlineSectionDesc}</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input 
              type="file" 
              ref={offlineFileInputRef} 
              className="hidden" 
              accept=".jsl,.html" 
              onChange={handleOfflineFileImport} 
            />
            <button 
              onClick={() => offlineFileInputRef.current?.click()}
              className="flex-1 md:flex-none px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl border border-white/20 transition-all text-xs flex items-center justify-center gap-2 animate-all"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {t.importJsl}
            </button>
            <button 
              onClick={() => exportToJsl(getFullBackupState(), t)}
              className="flex-1 md:flex-none px-5 py-2.5 bg-blue-950/40 hover:bg-blue-900 border border-blue-500/30 text-blue-200 font-black rounded-xl transition-all text-xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {t.exportJsl}
            </button>
            <button 
              onClick={() => exportToOfflineHtml(getFullBackupState(), t)}
              className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {t.exportHtml}
            </button>
          </div>
        </div>

        {activeTab === 'volume' ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <WorkForm 
              key={formKey}
              onAddWork={handleAddWork} 
              editingWork={editingWork} 
              onUpdateWork={handleUpdateWork}
              onCancelEdit={() => setEditingWork(null)}
              t={t}
            />
            
            <div id="volume-table-area">
              <WorkTable 
                groups={groups} 
                onDeleteWork={handleDeleteWork} 
                onEditWork={handleStartEdit} 
                t={t}
                visibleColumns={visibleColumns}
              />
              
              <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-4 items-center">
                {works.length > 0 && (
                  <>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileImport} />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl border border-white/10 transition-all flex items-center gap-2 shadow-xl"
                    >
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {t.importFile}
                    </button>
                    <button 
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-6 py-3 bg-blue-900/40 hover:bg-blue-800 text-blue-100 font-black rounded-xl border border-blue-500/30 transition-all shadow-xl"
                    >
                      {t.shareQr}
                    </button>
                    <button 
                      onClick={() => exportToCsv(groups, t)}
                      className="px-6 py-3 bg-slate-100 hover:bg-white text-slate-900 font-black rounded-xl transition-all shadow-xl"
                    >
                      {t.exportCsv}
                    </button>
                    <button 
                      onClick={() => exportToExcel(groups, t)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-xl shadow-emerald-500/10"
                    >
                      {t.exportExcel}
                    </button>
                    {/* New PDF and JPEG buttons */}
                    <button 
                      onClick={() => exportToJpg('volume-report-export-container', t)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-xl"
                    >
                      {t.ceramicExportJpg}
                    </button>
                    <button 
                      onClick={() => exportToPdf('volume-report-export-container', t)}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl transition-all shadow-xl"
                    >
                      {t.exportPdf}
                    </button>
                    <button 
                      onClick={handleClearAll}
                      className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-black rounded-xl border border-red-500/30 transition-all"
                    >
                      {t.clearAll}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <CeramicCalculator key={ceramicKey} t={t} />
        )}
      </div>

      {/* Hidden container for Volume PDF/JPEG export */}
      <div className="fixed top-[-9999px] left-[-9999px]">
         <div id="volume-report-export-container" className="p-10 bg-white space-y-8 w-[1000px] border border-slate-200 text-slate-900">
            <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6">
               <div>
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{t.title}</h2>
                 <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">{new Date().toLocaleString()}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.totalAmount}</p>
                 <p className="text-4xl font-black text-blue-600">${Math.round(grandTotal).toLocaleString()}</p>
               </div>
            </div>
            
            <div className="space-y-6">
              {groups.map((group, gIdx) => (
                <div key={group.userName} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 flex justify-between items-center border-b border-slate-200">
                    <span className="font-black text-slate-700 uppercase">#{gIdx + 1} {group.userName}</span>
                    <span className="font-black text-blue-600">${Math.round(group.totalPrice).toLocaleString()}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-center">L</th>
                        <th className="px-4 py-2 text-center">W</th>
                        <th className="px-4 py-2 text-center">H</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {group.works.map(work => (
                        <tr key={work.id}>
                          <td className="px-4 py-2 font-bold">{work.name}</td>
                          <td className="px-4 py-2 text-center">{work.l}</td>
                          <td className="px-4 py-2 text-center">{work.w}</td>
                          <td className="px-4 py-2 text-center">{work.h < 3 ? 3 : work.h}</td>
                          <td className="px-4 py-2 text-center">{work.quantity}</td>
                          <td className="px-4 py-2 text-right">${Math.round(work.unitPrice).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-bold">${Math.round(work.unitPrice * work.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calculated with Volume Factor 0.1</p>
              <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                <p className="text-2xl font-black text-slate-900">${Math.round(grandTotal).toLocaleString()}</p>
              </div>
            </div>
         </div>
      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={shareUrl} t={t} />
      <ImportPreviewModal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        onConfirm={confirmImport} 
        data={pendingImportData} 
        t={t} 
      />

      <footer className="mt-20 py-10 border-t border-white/5 text-center">
         <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{t.creditText}</p>
      </footer>
    </div>
  );
};

export default App;
