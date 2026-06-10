
import React from 'react';
import { HistoryEntry } from '../types';
import { exportHistoryToExcel, exportHistoryToCsv } from '../services/exportService';

interface HistoryModalProps {
  history: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onLoad: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  t: any;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, isOpen, onClose, onLoad, onDelete, t }) => {
  if (!isOpen) return null;

  // Extra safety check for the history array
  const hasHistory = Array.isArray(history) && history.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white">{t.historyTitle}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {hasHistory && (
              <>
                <button 
                  onClick={() => exportHistoryToCsv(history, t)}
                  className="text-[10px] sm:text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-400/30 px-3 py-1.5 rounded-lg bg-blue-400/10 transition-all flex items-center gap-2 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t.historyExportCsv}
                </button>
                <button 
                  onClick={() => exportHistoryToExcel(history, t)}
                  className="text-[10px] sm:text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-400/30 px-3 py-1.5 rounded-lg bg-emerald-400/10 transition-all flex items-center gap-2 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.historyExport}
                </button>
              </>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1.5 ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50">
          {!hasHistory ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="font-medium text-lg">{t.historyEmpty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {history.map((entry) => (
                <div key={entry.id} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 hover:border-white/20 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                        {entry.name}
                      </h4>
                      <span className="text-[10px] sm:text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 font-mono">
                        {entry.timestamp}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-sm text-slate-400">
                      <p><span className="text-slate-500 font-bold uppercase text-[9px] mr-1">Count:</span> {entry.data?.length || 0} works</p>
                      <p><span className="text-slate-500 font-bold uppercase text-[9px] mr-1">Total:</span> <span className="text-emerald-400 font-bold">${(entry.totalAmount || 0).toLocaleString()}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onLoad(entry)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                    >
                      {t.historyLoad}
                    </button>
                    <button 
                      onClick={() => onDelete(entry.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title={t.historyDelete}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
