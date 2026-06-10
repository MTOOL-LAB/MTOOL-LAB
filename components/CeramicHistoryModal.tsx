
import React from 'react';
import { CeramicLogEntry } from '../types';

interface CeramicHistoryModalProps {
  logs: CeramicLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (entry: CeramicLogEntry) => void;
  onDelete: (id: string) => void;
  t: any;
}

export const CeramicHistoryModal: React.FC<CeramicHistoryModalProps> = ({ logs, isOpen, onClose, onRestore, onDelete, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white">{t.ceramicHistory}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-bold text-lg italic">{t.ceramicNoHistory}</p>
            </div>
          ) : (
            logs.slice().reverse().map((log) => (
              <div key={log.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      {log.recordName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                      {log.timestamp}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <p><span className="text-slate-600 font-bold uppercase text-[9px]">Clay:</span> {log.state.clayName || 'Unknown'}</p>
                    <p><span className="text-slate-600 font-bold uppercase text-[9px]">Shrinkage:</span> <span className="text-emerald-400 font-bold">{log.state.shrinkageRate}%</span></p>
                    <p><span className="text-slate-600 font-bold uppercase text-[9px]">Rows:</span> {log.state.measurements.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onRestore(log)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    {t.historyLoad}
                  </button>
                  <button 
                    onClick={() => onDelete(log.id)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
