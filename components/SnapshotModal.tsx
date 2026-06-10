
import React from 'react';
import { SnapshotEntry } from '../types';

interface SnapshotModalProps {
  snapshots: SnapshotEntry[];
  isOpen: boolean;
  onClose: () => void;
  onRestore: (entry: SnapshotEntry) => void;
  onDelete: (id: string) => void;
  t: any;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({ snapshots, isOpen, onClose, onRestore, onDelete, t }) => {
  if (!isOpen) return null;

  const hasSnapshots = snapshots.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white">{t.snapshotTitle}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!hasSnapshots ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p className="font-bold text-lg italic">{t.snapshotEmpty}</p>
            </div>
          ) : (
            snapshots.map((snapshot) => (
              <div key={snapshot.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-indigo-500/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      {snapshot.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                      {snapshot.timestamp}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <p><span className="text-slate-600 font-bold uppercase text-[9px]">Items:</span> {snapshot.data.length}</p>
                    <p><span className="text-slate-600 font-bold uppercase text-[9px]">Total:</span> <span className="text-emerald-400 font-bold">${snapshot.totalAmount.toLocaleString()}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onRestore(snapshot)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    {t.snapshotLoad}
                  </button>
                  <button 
                    onClick={() => onDelete(snapshot.id)}
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
