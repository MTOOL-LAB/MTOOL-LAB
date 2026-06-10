
import React, { useState, useEffect } from 'react';
import { CeramicState, CeramicMeasurement, Ceramic3DObject } from '../types';
import { Input } from './Input';
import { exportCeramicProjectToCsv, exportToJpg } from '../services/exportService';

interface CeramicCalculatorProps {
  t: any;
}

export const CeramicCalculator: React.FC<CeramicCalculatorProps> = ({ t }) => {
  const [state, setState] = useState<CeramicState>(() => {
    const saved = localStorage.getItem('ceramic_state_v1');
    return saved ? JSON.parse(saved) : {
      clayName: '',
      shrinkageRate: 12,
      measurements: [
        { id: '1', label: 'Height', wetValue: 10, firedValue: 8.8, mode: 'forward', note: '' }
      ],
      object3D: {
        wetL: 0,
        wetW: 0,
        wetH: 0
      }
    };
  });

  const [testWet, setTestWet] = useState<string>('');
  const [testFired, setTestFired] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('ceramic_state_v1', JSON.stringify(state));
  }, [state]);

  const calculatedTestRate = React.useMemo(() => {
    const wet = parseFloat(testWet);
    const fired = parseFloat(testFired);
    if (!wet || !fired || wet <= fired) return null;
    return (((wet - fired) / wet) * 100).toFixed(2);
  }, [testWet, testFired]);

  const handleRateChange = (rate: number) => {
    const newRate = isNaN(rate) ? 0 : rate;
    const updatedMeasurements = state.measurements.map(m => {
      const r = newRate / 100;
      if (m.mode === 'forward') {
        return { ...m, firedValue: Number((m.wetValue * (1 - r)).toFixed(2)) };
      } else {
        return { ...m, wetValue: Number((m.firedValue / (1 - r)).toFixed(2)) };
      }
    });
    setState(prev => ({ ...prev, shrinkageRate: newRate, measurements: updatedMeasurements }));
  };

  const toggleMode = (id: string) => {
    setState(prev => ({
      ...prev,
      measurements: prev.measurements.map(m => {
        if (m.id !== id) return m;
        const newMode = m.mode === 'forward' ? 'reverse' : 'forward';
        return { ...m, mode: newMode };
      })
    }));
  };

  const updateMeasurement = (id: string, updates: Partial<CeramicMeasurement>) => {
    setState(prev => ({
      ...prev,
      measurements: prev.measurements.map(m => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };
        const rate = prev.shrinkageRate / 100;
        
        if (updates.wetValue !== undefined) {
          updated.firedValue = Number((updates.wetValue * (1 - rate)).toFixed(2));
          updated.mode = 'forward';
        } else if (updates.firedValue !== undefined) {
          updated.wetValue = Number((updates.firedValue / (1 - rate)).toFixed(2));
          updated.mode = 'reverse';
        }
        return updated;
      })
    }));
  };

  const update3DObject = (updates: Partial<Ceramic3DObject>) => {
    setState(prev => ({
      ...prev,
      object3D: { ...prev.object3D, ...updates }
    }));
  };

  const addRow = () => {
    const newId = Date.now().toString();
    setState(prev => ({
      ...prev,
      measurements: [...prev.measurements, { 
        id: newId, 
        label: '', 
        wetValue: 0, 
        firedValue: 0, 
        mode: 'forward', 
        note: '' 
      }]
    }));
  };

  const removeRow = (id: string) => {
    setState(prev => ({
      ...prev,
      measurements: prev.measurements.filter(m => m.id !== id)
    }));
  };

  const applyTestRate = () => {
    if (calculatedTestRate) {
      handleRateChange(parseFloat(calculatedTestRate));
      setTestWet('');
      setTestFired('');
    }
  };

  const getFired3D = (wet: number) => {
    // Show 0.00 instead of --- if value is empty or 0
    const val = (wet || 0) * (1 - state.shrinkageRate / 100);
    return isNaN(val) ? "0.00" : val.toFixed(2);
  };

  return (
    <div className="flex flex-col gap-3 pb-16 w-full max-w-full lg:max-w-5xl mx-auto px-2 sm:px-4 text-slate-900 overflow-x-hidden">
      {/* 1. Configuration Header - Forced side-by-side on mobile */}
      <div className="flex flex-row items-center gap-2 sm:gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800 shadow-inner backdrop-blur-sm">
        <div className="flex-[2]">
          <Input 
            label={t.clayName} 
            placeholder="土名..." 
            value={state.clayName} 
            onChange={(e) => setState(prev => ({ ...prev, clayName: e.target.value }))}
            className="h-8 text-[11px] sm:text-xs"
          />
        </div>
        <div className="flex-1 flex items-end gap-1 sm:gap-2">
          <Input 
            label={t.shrinkageRate} 
            type="number" 
            step="0.1"
            value={state.shrinkageRate} 
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="h-8 text-[11px] sm:text-xs"
          />
          <div className="text-emerald-400 font-black text-sm sm:text-base pb-1">%</div>
        </div>
      </div>

      {/* 2. Shrinkage Test Tool */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-2 sm:p-2.5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1 rounded-lg text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0" />
              </svg>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-tight">{t.testUtility}</h3>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 items-end">
            <Input label={t.testWet} value={testWet} onChange={(e) => setTestWet(e.target.value)} className="h-8 text-[11px]" light />
            <Input label={t.testFired} value={testFired} onChange={(e) => setTestFired(e.target.value)} className="h-8 text-[11px]" light />
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
               <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{t.testResult}</label>
               <button 
                  onClick={applyTestRate}
                  disabled={!calculatedTestRate}
                  className={`bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-50 disabled:text-slate-300 text-white font-black rounded-lg transition-all active:scale-95 text-[10px] h-8 shadow-sm ${!calculatedTestRate ? 'cursor-not-allowed' : ''}`}
                >
                  {calculatedTestRate ? `${calculatedTestRate}% Apply` : 'Pending'}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Measurements Section - Big Obvious Arrows */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden w-full">
        <div className="p-2 sm:p-2.5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1 rounded-lg text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-tight">{t.measurementsTitle}</h3>
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tight px-2">{t.measurementsDesc}</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black text-[9px] uppercase tracking-wider">
                <th className="px-3 py-1.5 w-1/4">{t.itemName}</th>
                <th className="px-3 py-1.5 text-center">{t.wetDim}</th>
                <th className="px-1 py-1.5 text-center w-14"></th>
                <th className="px-3 py-1.5 text-center">{t.firedDim}</th>
                <th className="px-3 py-1.5">{t.remark}</th>
                <th className="px-2 py-1.5 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.measurements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-3 py-1.5">
                    <input className="bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none w-full font-bold text-slate-800 placeholder:text-slate-300 py-0.5 text-xs" placeholder="Label..." value={m.label} onChange={(e) => updateMeasurement(m.id, { label: e.target.value })} />
                  </td>
                  <td className={`px-3 py-1.5 text-center transition-all ${m.mode === 'reverse' ? 'bg-slate-50/80' : ''}`}>
                    <div className="relative inline-block">
                      <input type="number" step="0.1" className={`w-20 text-center px-1 py-1 rounded-md border font-black transition-all text-xs ${m.mode === 'forward' ? 'bg-white border-blue-500 text-blue-700 ring-2 ring-blue-500/5' : 'bg-slate-100 border-slate-200 text-slate-400'}`} value={m.wetValue || ''} onChange={(e) => updateMeasurement(m.id, { wetValue: parseFloat(e.target.value) || 0 })} />
                      <span className="absolute right-0.5 bottom-0.5 text-[7px] font-bold text-slate-400">cm</span>
                    </div>
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    <button 
                      onClick={() => toggleMode(m.id)} 
                      className={`flex items-center justify-center transition-all duration-300 p-1.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:bg-white bg-slate-50 ${m.mode === 'reverse' ? 'rotate-180 bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}
                      title="Toggle Direction"
                    >
                      <svg className={`w-5 h-5 ${m.mode === 'forward' ? 'text-blue-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  </td>
                  <td className={`px-3 py-1.5 text-center transition-all ${m.mode === 'forward' ? 'bg-slate-50/80' : ''}`}>
                    <div className="relative inline-block">
                      <input type="number" step="0.1" className={`w-20 text-center px-1 py-1 rounded-md border font-black transition-all text-xs ${m.mode === 'reverse' ? 'bg-white border-amber-500 text-amber-700 ring-2 ring-amber-500/5' : 'bg-slate-100 border-slate-200 text-slate-400'}`} value={m.firedValue || ''} onChange={(e) => updateMeasurement(m.id, { firedValue: parseFloat(e.target.value) || 0 })} />
                      <span className="absolute right-0.5 bottom-0.5 text-[7px] font-bold text-slate-400">cm</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-xs text-slate-500">
                    <input className="bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none w-full italic py-0.5" placeholder="Note..." value={m.note} onChange={(e) => updateMeasurement(m.id, { note: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button onClick={() => removeRow(m.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Horizontal rows with prominent arrow */}
        <div className="sm:hidden divide-y divide-slate-100">
          {state.measurements.map((m) => (
            <div key={m.id} className="p-2 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <input 
                  className="bg-transparent border-b border-slate-100 focus:border-blue-400 focus:outline-none flex-1 font-bold text-slate-800 placeholder:text-slate-300 py-0.5 text-[10px]" 
                  placeholder="Label..." 
                  value={m.label} 
                  onChange={(e) => updateMeasurement(m.id, { label: e.target.value })} 
                />
                <button onClick={() => removeRow(m.id)} className="text-red-400 p-1 rounded-md bg-red-50"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <div className="flex-1 flex flex-col">
                  <label className="text-[6px] font-black text-slate-400 uppercase mb-0.5 leading-none">Wet</label>
                  <div className="relative">
                    <input type="number" step="0.1" className={`w-full text-center py-1 rounded-md border font-black text-[11px] h-7 ${m.mode === 'forward' ? 'bg-white border-blue-500 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`} value={m.wetValue || ''} onChange={(e) => updateMeasurement(m.id, { wetValue: parseFloat(e.target.value) || 0 })} />
                    <span className="absolute right-0.5 bottom-0.5 text-[5px] text-slate-400 font-bold uppercase">cm</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleMode(m.id)} 
                  className={`mt-2 transition-all duration-300 p-1.5 rounded-xl border shadow-sm ${m.mode === 'reverse' ? 'rotate-180 bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}
                >
                  <svg className={`w-5 h-5 ${m.mode === 'forward' ? 'text-blue-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                
                <div className="flex-1 flex flex-col">
                  <label className="text-[6px] font-black text-slate-400 uppercase mb-0.5 leading-none">Fired</label>
                  <div className="relative">
                    <input type="number" step="0.1" className={`w-full text-center py-1 rounded-md border font-black text-[11px] h-7 ${m.mode === 'reverse' ? 'bg-white border-amber-500 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-400'}`} value={m.firedValue || ''} onChange={(e) => updateMeasurement(m.id, { firedValue: parseFloat(e.target.value) || 0 })} />
                    <span className="absolute right-0.5 bottom-0.5 text-[5px] text-slate-400 font-bold uppercase">cm</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 bg-slate-50/50 flex justify-center border-t border-slate-200">
          <button onClick={addRow} className="flex items-center gap-1 px-4 py-1.5 bg-slate-800 hover:bg-black text-white rounded-full font-bold text-[10px] transition-all active:scale-95"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>{t.addMeasure}</button>
        </div>
      </div>

      {/* 4. 3D Object Rapid Calculator - Large Projections */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden w-full">
        <div className="p-2 sm:p-2.5 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-lg text-white">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-tight">{t.ceramic3DTitle}</h3>
          </div>
          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tight px-2">{t.ceramic3DDesc}</span>
        </div>
        
        <div className="p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-6 grid grid-cols-3 gap-2">
            <div className="relative"><Input label={t.wetL} type="number" light placeholder="0" value={state.object3D.wetL || ''} onChange={(e) => update3DObject({ wetL: parseFloat(e.target.value) || 0 })} className="h-9 text-[11px] pr-5 font-bold" /><span className="absolute right-1 bottom-1.5 text-[7px] font-bold text-slate-400">cm</span></div>
            <div className="relative"><Input label={t.wetW} type="number" light placeholder="0" value={state.object3D.wetW || ''} onChange={(e) => update3DObject({ wetW: parseFloat(e.target.value) || 0 })} className="h-9 text-[11px] pr-5 font-bold" /><span className="absolute right-1 bottom-1.5 text-[7px] font-bold text-slate-400">cm</span></div>
            <div className="relative"><Input label={t.wetH} type="number" light placeholder="0" value={state.object3D.wetH || ''} onChange={(e) => update3DObject({ wetH: parseFloat(e.target.value) || 0 })} className="h-9 text-[11px] pr-5 font-bold" /><span className="absolute right-1 bottom-1.5 text-[7px] font-bold text-slate-400">cm</span></div>
          </div>
          <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <label className="text-[10px] sm:text-[11px] uppercase font-black text-slate-500 tracking-widest mb-4 self-start">{t.firedResult}</label>
            <div className="flex items-center gap-4 sm:gap-6 w-full justify-center">
               <div className="flex flex-col items-center">
                 <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tabular-nums leading-none tracking-tighter drop-shadow-lg">{getFired3D(state.object3D.wetL)}</span>
                 <span className="text-[9px] text-slate-500 font-black uppercase mt-2">L</span>
               </div>
               <span className="text-slate-700 font-light text-2xl sm:text-3xl mt-[-10px]">×</span>
               <div className="flex flex-col items-center">
                 <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tabular-nums leading-none tracking-tighter drop-shadow-lg">{getFired3D(state.object3D.wetW)}</span>
                 <span className="text-[9px] text-slate-500 font-black uppercase mt-2">W</span>
               </div>
               <span className="text-slate-700 font-light text-2xl sm:text-3xl mt-[-10px]">×</span>
               <div className="flex flex-col items-center">
                 <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tabular-nums leading-none tracking-tighter drop-shadow-lg">{getFired3D(state.object3D.wetH)}</span>
                 <span className="text-[9px] text-slate-500 font-black uppercase mt-2">H</span>
               </div>
               <div className="ml-3 self-center">
                  <span className="bg-blue-600 text-white px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest shadow-md">CM</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer - CSV: Green, JPG: Transparent/Outline */}
      <div className="pt-4 border-t border-white/10 flex flex-wrap justify-center gap-3">
        <button 
          onClick={() => exportCeramicProjectToCsv(state, t)} 
          className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
          </svg>
          {t.ceramicExportCurrent}
        </button>
        <button 
          onClick={() => exportToJpg('ceramic-calc-export-container', t)} 
          className="flex-1 sm:flex-none px-6 py-3 bg-transparent hover:bg-white/10 text-white rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 border border-white/20 transition-all active:scale-95"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" />
          </svg>
          {t.ceramicExportJpg}
        </button>
      </div>

      {/* Hidden container for JPEG export */}
      <div className="fixed top-[-9999px] left-[-9999px]">
         <div id="ceramic-calc-export-container" className="p-10 bg-white space-y-10 w-[850px] border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-200 pb-6">
               <div><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ceramic Calculation Report</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{new Date().toLocaleString()}</p></div>
               <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase">Shrinkage Rate</p><p className="text-3xl font-black text-blue-600">{state.shrinkageRate}%</p></div>
            </div>
            <div className="space-y-1"><p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clay Body</p><p className="text-xl font-black text-slate-800">{state.clayName || 'Standard Clay'}</p></div>
            <table className="w-full border-collapse border border-slate-100">
               <thead><tr className="bg-slate-900 text-white text-[10px] font-black uppercase"><th className="p-3 text-left">Item</th><th className="p-3 text-center">Wet (cm)</th><th className="p-3 text-center">Fired (cm)</th><th className="p-3 text-left">Note</th></tr></thead>
               <tbody className="divide-y divide-slate-100">{state.measurements.map(m => (<tr key={m.id} className="text-sm"><td className="p-3 font-bold text-slate-800">{m.label || '---'}</td><td className="p-3 text-center font-black text-blue-600">{m.wetValue}</td><td className="p-3 text-center font-black text-amber-600">{m.firedValue}</td><td className="p-3 text-slate-400 italic text-xs">{m.note || '-'}</td></tr>))}</tbody>
            </table>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex justify-around items-center">
               <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">3D Fired L</p><p className="text-xl font-black text-slate-900">{getFired3D(state.object3D.wetL)}cm</p></div>
               <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">3D Fired W</p><p className="text-xl font-black text-slate-900">{getFired3D(state.object3D.wetW)}cm</p></div>
               <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">3D Fired H</p><p className="text-xl font-black text-slate-900">{getFired3D(state.object3D.wetH)}cm</p></div>
            </div>
         </div>
      </div>
    </div>
  );
};
