
import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { createWorkItem } from '../services/calculatorService';
import { WorkItem } from '../types';

interface WorkFormProps {
  onAddWork: (work: WorkItem) => void;
  onUpdateWork: (work: WorkItem) => void;
  onCancelEdit: () => void;
  editingWork: WorkItem | null;
}

export const WorkForm: React.FC<WorkFormProps> = ({ 
  onAddWork, 
  onUpdateWork, 
  onCancelEdit, 
  editingWork 
}) => {
  const [name, setName] = useState('');
  const [l, setL] = useState<string>('');
  const [w, setW] = useState<string>('');
  const [h, setH] = useState<string>('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (editingWork) {
      setName(editingWork.name);
      setL(editingWork.l.toString());
      setW(editingWork.w.toString());
      setH(editingWork.h.toString());
      setRemark(editingWork.remark || '');
    } else {
      setL('');
      setW('');
      setH('');
      setRemark('');
    }
  }, [editingWork]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !l || !w || !h) return;

    const newWork = createWorkItem(name, parseFloat(l), parseFloat(w), parseFloat(h), remark);
    
    if (editingWork) {
      onUpdateWork({ ...newWork, id: editingWork.id });
    } else {
      onAddWork(newWork);
    }
    
    // Clear dynamic inputs for faster batch entry
    setL('');
    setW('');
    setH('');
    setRemark('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`bg-white p-6 rounded-xl shadow-2xl border transition-all duration-300 mb-8 ${
        editingWork ? 'border-amber-500 ring-4 ring-amber-500/20' : 'border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-900">
          {editingWork ? '編輯作品資料' : '新增作品資料'}
        </h3>
        {editingWork && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full bg-slate-50 transition-colors"
          >
            取消編輯
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
        <Input 
          label="姓名" 
          placeholder="例如：小明" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          light
        />
        <Input 
          label="長 (L) cm" 
          type="number" 
          step="0.1" 
          placeholder="0" 
          value={l} 
          onChange={(e) => setL(e.target.value)} 
          required 
          light
        />
        <Input 
          label="寬 (W) cm" 
          type="number" 
          step="0.1" 
          placeholder="0" 
          value={w} 
          onChange={(e) => setW(e.target.value)} 
          required 
          light
        />
        <Input 
          label="高 (H) cm" 
          type="number" 
          step="0.1" 
          placeholder="0" 
          value={h} 
          onChange={(e) => setH(e.target.value)} 
          required 
          light
        />
        <Input 
          label="備註 (Remark)" 
          placeholder="作品描述" 
          value={remark} 
          onChange={(e) => setRemark(e.target.value)} 
          light
        />
        <button
          type="submit"
          className={`text-white font-black py-2.5 px-4 rounded-lg shadow-xl transition-all h-[42px] ${
            editingWork ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {editingWork ? '確認修改' : '加入清單'}
        </button>
      </div>
      <p className="mt-4 text-xs text-slate-500 italic font-medium">
        * 註：最小高度為 3cm。若輸入高度小於 3cm，計算時將自動以 3cm 計。
      </p>
    </form>
  );
};
