
import React from 'react';
import { UserGroup, WorkItem, VisibleColumns } from '../types';

interface WorkTableProps {
  groups: UserGroup[];
  onDeleteWork: (id: string) => void;
  onEditWork: (work: WorkItem) => void;
  t: any;
  visibleColumns: VisibleColumns;
}

export const WorkTable: React.FC<WorkTableProps> = ({ groups, onDeleteWork, onEditWork, t, visibleColumns }) => {
  if (groups.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xl mx-4 sm:mx-0">
        <p className="text-slate-500 font-medium text-lg">{t.noData}</p>
      </div>
    );
  }

  const grandTotal = groups.reduce((acc, g) => acc + g.totalPrice, 0);

  // Card View for Mobile
  const MobileCardView = () => (
    <div className="space-y-4 sm:hidden px-2 text-slate-900">
      {groups.map((group, groupIdx) => {
        let runningWorkNo = 1;
        return (
          <div key={group.userName} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden animate-in fade-in duration-300">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
              <span className="text-xs font-black text-slate-900 uppercase tracking-tighter flex items-center gap-1">
                <span className="bg-slate-800 text-white rounded-md px-1.5 py-0.5 font-mono text-[9px]">#{groupIdx + 1}</span>
                {group.userName}
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">${Math.round(group.totalPrice).toLocaleString()}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {group.works.map((work, workIdx) => {
                const isAdjusted = work.h < 3;
                const startNo = runningWorkNo;
                const endNo = runningWorkNo + work.quantity - 1;
                const workNoDisplay = work.quantity > 1 ? `${startNo}~${endNo}` : `${startNo}`;
                runningWorkNo += work.quantity;

                return (
                  <div key={work.id} className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black font-mono px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md">No. {workNoDisplay}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 italic font-medium">{work.remark || '-'}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => onEditWork(work)} className="p-1 px-2.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => onDeleteWork(work.id)} className="p-1 px-2.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                    {/* Dimension Grid with Unit Price next to Q'ty */}
                    <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex flex-col text-slate-900"><span className="text-slate-400 uppercase text-[8px] mb-0.5">L</span><span className="text-slate-900 font-extrabold">{work.l || 0}</span></div>
                      <div className="flex flex-col text-slate-900"><span className="text-slate-400 uppercase text-[8px] mb-0.5">W</span><span className="text-slate-900 font-extrabold">{work.w || 0}</span></div>
                      <div className="flex flex-col text-slate-900"><span className="text-slate-400 uppercase text-[8px] mb-0.5">H</span><span className={`font-extrabold ${isAdjusted ? 'text-amber-600' : 'text-slate-900'}`}>{isAdjusted ? 3 : (work.h || 0)}</span></div>
                      <div className="flex flex-col text-blue-600"><span className="text-slate-400 uppercase text-[8px] mb-0.5">Qty</span><span className="text-blue-700 font-extrabold font-mono">{work.quantity || 0}</span></div>
                      <div className="flex flex-col text-slate-900"><span className="text-slate-400 uppercase text-[8px] mb-0.5">{t.colSubtotal}</span><span className="text-slate-800 font-extrabold font-mono">${Math.round(work.unitPrice * work.quantity).toLocaleString()}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="bg-slate-900 rounded-xl p-4 flex justify-between items-center text-white shadow-lg">
        <span className="text-xs font-black uppercase tracking-widest">{t.totalAmount}</span>
        <span className="text-xl font-black">${Math.round(grandTotal).toLocaleString()}</span>
      </div>
    </div>
  );

  return (
    <div id="volume-table-area" className="w-full">
      <MobileCardView />
      <div id="work-table-container" className="hidden sm:block bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest">
                <th className="px-3 py-3 border-r border-slate-100 w-12 text-center">{t.colNo}</th>
                <th className="px-3 py-3 border-r border-slate-100 w-32">{t.colName}</th>
                {visibleColumns.workNo && <th className="px-3 py-3 border-r border-slate-100 w-20 text-center">{t.colWorkNo}</th>}
                {visibleColumns.l && <th className="px-3 py-3 border-r border-slate-100 w-12 text-center">{t.colL}</th>}
                {visibleColumns.w && <th className="px-3 py-3 border-r border-slate-100 w-12 text-center">{t.colW}</th>}
                {visibleColumns.h && <th className="px-3 py-3 border-r border-slate-100 w-12 text-center">{t.colH}</th>}
                {visibleColumns.quantity && <th className="px-3 py-3 border-r border-slate-100 w-16 text-center">{t.colQty}</th>}
                {visibleColumns.remark && <th className="px-3 py-3 border-r border-slate-100 w-24 text-center">{t.colRemark}</th>}
                {visibleColumns.unitPrice && <th className="px-3 py-3 border-r border-slate-100 w-24 text-right">{t.colUnitPrice}</th>}
                {visibleColumns.subtotal && <th className="px-3 py-3 border-r border-slate-100 w-28 text-right">{t.colSubtotal}</th>}
                <th className="px-3 py-3 w-20 text-center">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {groups.map((group, groupIdx) => {
                let runningWorkNo = 1;
                return (
                  <React.Fragment key={group.userName}>
                    {group.works.map((work, workIdx) => {
                      const isAdjusted = work.h < 3;
                      const startNo = runningWorkNo;
                      const endNo = runningWorkNo + work.quantity - 1;
                      const workNoDisplay = work.quantity > 1 ? `${startNo}~${endNo}` : `${startNo}`;
                      runningWorkNo += work.quantity;

                      return (
                        <tr key={work.id} className="hover:bg-slate-50 transition-colors">
                          {workIdx === 0 && (
                            <td rowSpan={group.works.length} className="px-4 py-4 border-r border-slate-100 font-bold text-slate-900 text-center align-top bg-slate-50/50">{groupIdx + 1}</td>
                          )}
                          {workIdx === 0 && (
                            <td rowSpan={group.works.length} className="px-4 py-4 border-r border-slate-100 font-extrabold text-blue-700 align-top bg-slate-50/50">{group.userName}</td>
                          )}
                          {visibleColumns.workNo && <td className="px-4 py-3 border-r border-slate-100 text-center text-slate-500 font-medium whitespace-nowrap">{workNoDisplay}</td>}
                          {visibleColumns.l && <td className="px-4 py-3 border-r border-slate-100 text-center text-slate-900 font-semibold">{work.l || 0}</td>}
                          {visibleColumns.w && <td className="px-4 py-3 border-r border-slate-100 text-center text-slate-900 font-semibold">{work.w || 0}</td>}
                          {visibleColumns.h && (
                            <td className="px-4 py-3 border-r border-slate-100 text-center font-bold">
                              {isAdjusted ? <span className="text-amber-600">3</span> : <span className="text-slate-900">{work.h || 0}</span>}
                            </td>
                          )}
                          {visibleColumns.quantity && <td className="px-4 py-3 border-r border-slate-100 text-center font-bold text-blue-600">{work.quantity || 0}</td>}
                          {visibleColumns.remark && <td className="px-4 py-3 border-r border-slate-100 text-slate-500 text-center italic text-xs truncate max-w-[80px]">{work.remark || '-'}</td>}
                          {visibleColumns.unitPrice && <td className="px-4 py-3 border-r border-slate-100 text-right font-bold text-slate-800">${Math.round(work.unitPrice).toLocaleString()}</td>}
                          {visibleColumns.subtotal && workIdx === 0 && (
                            <td rowSpan={group.works.length} className="px-4 py-4 border-r border-slate-100 text-right font-black text-emerald-700 align-bottom bg-emerald-50">
                              <div className="flex flex-col"><span className="text-[10px] text-emerald-600/60 uppercase tracking-tighter font-bold">Subtotal</span><span className="text-lg">${Math.round(group.totalPrice).toLocaleString()}</span></div>
                            </td>
                          )}
                          <td className="px-4 py-3 text-center space-x-2">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => onEditWork(work)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                              <button onClick={() => onDeleteWork(work.id)} className="text-red-400 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-white text-slate-900 font-black border-t-2 border-slate-200">
                <td colSpan={visibleColumns.subtotal ? 10 : 9} className="px-6 py-8 text-right uppercase tracking-widest text-sm border-r border-slate-100">{t.totalAmount}</td>
                {visibleColumns.subtotal && <td className="px-6 py-8 text-right text-2xl text-blue-700">${Math.round(grandTotal).toLocaleString()}</td>}
                <td className="bg-white border-l border-slate-100"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
