
import React, { useState, useMemo } from 'react';
import { WorkItem } from '../types';

interface ImportPreviewModalProps {
  data: WorkItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedData: WorkItem[]) => void;
  t: any;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({ data, isOpen, onClose, onConfirm, t }) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Reset selection when modal opens with new data
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIndices(new Set(data.map((_, i) => i)));
      setSearchQuery('');
    }
  }, [isOpen, data]);

  const filteredData = useMemo(() => {
    return data.map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          (item.remark || '').toLowerCase().includes(query)
        );
      });
  }, [data, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIndices.size === data.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(data.map((_, i) => i)));
    }
  };

  const toggleIndex = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  const handleConfirm = () => {
    const selectedData = data.filter((_, i) => selectedIndices.has(i));
    if (selectedData.length === 0) return;
    onConfirm(selectedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-900">{t.previewTitle}</h3>
            <p className="text-sm text-slate-500 mt-1">{t.previewDesc}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input 
                  type="text"
                  placeholder="Filter by name..."
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-white z-20 shadow-sm">
              <tr className="border-b-2 border-slate-100 text-[10px] uppercase font-bold text-slate-400 bg-white">
                <th className="px-4 py-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedIndices.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4">{t.colName}</th>
                <th className="px-4 py-4 text-center">L</th>
                <th className="px-4 py-4 text-center">W</th>
                <th className="px-4 py-4 text-center">H</th>
                <th className="px-4 py-4 text-center">{t.colQty}</th>
                <th className="px-4 py-4">{t.colRemark}</th>
                <th className="px-4 py-4 text-right">{t.colUnitPrice}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map(({ item, originalIndex }) => {
                const isSelected = selectedIndices.has(originalIndex);
                return (
                  <tr 
                    key={originalIndex} 
                    className={`text-sm transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                    onClick={() => toggleIndex(originalIndex)}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleIndex(originalIndex)}
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.l}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{item.w}</td>
                    <td className="px-4 py-3 text-center text-slate-900 font-bold">{item.adjustedH}</td>
                    <td className="px-4 py-3 text-center text-blue-600 font-black">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-400 italic text-xs max-w-[150px] truncate">
                      {item.remark || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-800">
                      ${item.unitPrice.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center text-slate-400 italic font-medium">
                    No records match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm font-bold text-slate-500">
             {selectedIndices.size} / {data.length} items selected
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all"
            >
              {t.cancel}
            </button>
            <button 
              disabled={selectedIndices.size === 0}
              onClick={handleConfirm}
              className={`flex-1 sm:flex-none px-8 py-2.5 font-black rounded-xl shadow-lg transition-all active:scale-95 ${
                selectedIndices.size > 0 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {t.confirmImport} ({selectedIndices.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
