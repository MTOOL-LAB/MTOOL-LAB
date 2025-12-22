
import React, { useState, useEffect, useMemo } from 'react';
import { WorkForm } from './components/WorkForm';
import { WorkTable } from './components/WorkTable';
import { WorkItem, UserGroup } from './types';
import { exportToExcel, exportToPdf, exportToJpg } from './services/exportService';

const App: React.FC = () => {
  const [works, setWorks] = useState<WorkItem[]>(() => {
    try {
      const saved = localStorage.getItem('works_calculator_data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
      return [];
    }
  });

  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [updateDate] = useState(() => new Date().toLocaleDateString('zh-TW'));
  // Use a formKey to force a full reset of the WorkForm internal state when data is cleared
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('works_calculator_data', JSON.stringify(works));
  }, [works]);

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
    // Explicitly check for window.confirm to avoid issues in some environments
    const isConfirmed = window.confirm('您確定要清除所有資料嗎？此操作將會移除清單中所有的紀錄。');
    if (isConfirmed) {
      setWorks([]);
      setEditingWork(null);
      localStorage.removeItem('works_calculator_data');
      setFormKey(prev => prev + 1); // Force-reset the WorkForm component
    }
  };

  const groups = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};
    
    works.forEach(work => {
      if (!grouped[work.name]) {
        grouped[work.name] = [];
      }
      grouped[work.name].push(work);
    });

    return Object.entries(grouped).map(([name, items]): UserGroup => ({
      userName: name,
      works: items,
      totalPrice: items.reduce((acc, cur) => acc + cur.unitPrice, 0)
    }));
  }, [works]);

  return (
    <div className="min-h-screen bg-black text-white py-4 md:py-8 lg:py-12 px-0 sm:px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              作品計算表
            </h1>
            <p className="text-slate-400 mt-2 font-medium tracking-wide">尺寸(單位:cm) (平板高度不足3，以3計算)</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 shadow-lg text-right">
              <span className="block text-[10px] uppercase text-slate-300 font-bold tracking-widest mb-1">系統日期</span>
              <span className="block font-mono font-bold text-blue-300">{updateDate}</span>
            </div>
          </div>
        </header>

        <main>
          <WorkForm 
            key={formKey}
            onAddWork={handleAddWork} 
            editingWork={editingWork} 
            onUpdateWork={handleUpdateWork}
            onCancelEdit={() => setEditingWork(null)}
          />
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">作品清單總表</h2>
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <span className="flex items-center gap-2 text-slate-300 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
                標準輸入
              </span>
              <span className="flex items-center gap-2 text-amber-400 px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
                已調整高度 (最低 3cm)
              </span>
            </div>
          </div>
        </main>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <WorkTable 
          groups={groups} 
          onDeleteWork={handleDeleteWork} 
          onEditWork={handleStartEdit} 
        />
        
        {/* Export and Management Buttons Container */}
        {works.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-end gap-3 px-4 sm:px-0">
            <button 
              type="button"
              onClick={() => exportToExcel(groups)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 border border-emerald-500/50 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              匯出 EXCEL
            </button>
            <button 
              type="button"
              onClick={() => exportToPdf('work-table-container')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 border border-red-500/50 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              匯出 PDF
            </button>
            <button 
              type="button"
              onClick={() => exportToJpg('work-table-container')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 border border-blue-500/50 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              匯出 JPG
            </button>
            <button 
              type="button"
              onClick={handleClearAll}
              className="px-5 py-2.5 bg-white/5 hover:bg-red-600 hover:border-red-500/50 text-slate-300 hover:text-white text-sm font-bold rounded-xl border border-white/10 shadow-lg transition-all active:scale-95"
            >
              清除所有資料
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-0 mt-12">
        <div className="p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
          <h4 className="font-bold text-xl text-blue-300 flex items-center gap-3 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            計算公式說明
          </h4>
          <div className="space-y-3 text-slate-200">
            <p className="text-lg">
              價格 = (長度 × 寬度 × <span className="text-blue-300 font-bold">高</span>) × <span className="text-emerald-400 font-bold">0.1</span>
            </p>
            <div className="h-px bg-white/10 w-full my-4"></div>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
              <li>系統將自動檢查高度，若低於 3cm 則以 <span className="text-amber-400 font-bold">3cm</span> 計算最低材積。</li>
              <li>單價計算後將四捨五入至整數位。</li>
              <li>個人總計為該姓名下所有作品單價之總和。</li>
            </ul>
          </div>
        </div>
        
        <footer className="mt-20 pb-12 text-center text-slate-500 text-sm border-t border-white/5 pt-8">
          &copy; {new Date().getFullYear()} 作品計算系統 | 專業尺寸定價工具
        </footer>
      </div>
    </div>
  );
};

export default App;
