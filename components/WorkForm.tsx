
import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { createWorkItem } from '../services/calculatorService';
import { WorkItem } from '../types';

interface WorkFormProps {
  onAddWork: (work: WorkItem) => void;
  onUpdateWork: (work: WorkItem) => void;
  onCancelEdit: () => void;
  editingWork: WorkItem | null;
  t: any;
}

export const WorkForm: React.FC<WorkFormProps> = ({ 
  onAddWork, 
  onUpdateWork, 
  onCancelEdit, 
  editingWork,
  t
}) => {
  const [name, setName] = useState('');
  const [l, setL] = useState<string>('');
  const [w, setW] = useState<string>('');
  const [h, setH] = useState<string>('');
  const [qty, setQty] = useState<string>('1');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (editingWork) {
      setName(editingWork.name);
      setL(editingWork.l.toString());
      setW(editingWork.w.toString());
      setH(editingWork.h.toString());
      setQty(editingWork.quantity.toString());
      setRemark(editingWork.remark || '');
    } else {
      setName(''); // Fixed: Ensure name is cleared when not editing
      setL('');
      setW('');
      setH('');
      setQty('1');
      setRemark('');
    }
  }, [editingWork]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !l || !w || !h) return;

    const quantity = parseInt(qty) || 1;
    const newWork = createWorkItem(name, parseFloat(l), parseFloat(w), parseFloat(h), quantity, remark);
    
    if (editingWork) {
      onUpdateWork({ ...newWork, id: editingWork.id });
    } else {
      onAddWork(newWork);
    }
    
    setL('');
    setW('');
    setH('');
    setQty('1');
    setRemark('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`bg-white p-3 sm:p-4 rounded-xl shadow-2xl border transition-all duration-300 mb-4 sm:mb-6 ${
        editingWork ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900">
          {editingWork ? t.editTitle : t.addTitle}
        </h3>
        {editingWork && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="text-[9px] sm:text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest border border-slate-200 px-2 py-0.5 sm:py-1 rounded-full bg-slate-50 transition-colors"
          >
            {t.cancel}
          </button>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Name Row */}
        <div className="w-full">
          <Input 
            label={t.name} 
            placeholder={t.placeholderName} 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            light
          />
        </div>

        {/* Dimensions Row - Always 3 columns on same line */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Input 
            label={t.length} 
            type="number" 
            step="0.1" 
            placeholder="0" 
            value={l} 
            onChange={(e) => setL(e.target.value)} 
            required 
            light
          />
          <Input 
            label={t.width} 
            type="number" 
            step="0.1" 
            placeholder="0" 
            value={w} 
            onChange={(e) => setW(e.target.value)} 
            required 
            light
          />
          <Input 
            label={t.height} 
            type="number" 
            step="0.1" 
            placeholder="0" 
            value={h} 
            onChange={(e) => setH(e.target.value)} 
            required 
            light
          />
        </div>

        {/* Quantity, Remark and Action Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-end">
          <div className="sm:col-span-2">
            <Input 
              label={t.quantity} 
              type="number" 
              min="1"
              value={qty} 
              onChange={(e) => setQty(e.target.value)} 
              required 
              light
            />
          </div>
          <div className="sm:col-span-7">
            <Input 
              label={t.remark} 
              placeholder={t.placeholderRemark} 
              value={remark} 
              onChange={(e) => setRemark(e.target.value)} 
              light
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className={`text-white font-black py-1.5 sm:py-2 px-3 rounded-lg shadow-xl transition-all h-[34px] sm:h-[38px] text-[10px] sm:text-xs active:scale-95 w-full ${
                editingWork ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {editingWork ? t.saveChanges : t.addToList}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[9px] sm:text-[11px] text-slate-500 italic font-medium">
        {t.minHeightNote}
      </p>
    </form>
  );
};
