
import React from 'react';
import { UserGroup, WorkItem } from '../types';

interface WorkTableProps {
  groups: UserGroup[];
  onDeleteWork: (id: string) => void;
  onEditWork: (work: WorkItem) => void;
}

export const WorkTable: React.FC<WorkTableProps> = ({ groups, onDeleteWork, onEditWork }) => {
  if (groups.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xl mx-4 sm:mx-0">
        <p className="text-slate-500 font-medium text-lg">尚未新增任何作品。請使用上方表單開始輸入。</p>
      </div>
    );
  }

  const grandTotal = groups.reduce((acc, g) => acc + g.totalPrice, 0);

  return (
    <div id="work-table-container" className="bg-white rounded-none sm:rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white border-b-2 border-slate-200 text-slate-900 font-black text-base uppercase tracking-wider">
              <th className="px-4 py-4 border-r border-slate-100 w-12 text-center">序號</th>
              <th className="px-4 py-4 border-r border-slate-100 w-32">姓名</th>
              <th className="px-4 py-4 border-r border-slate-100 w-24 text-center">作品編號</th>
              <th className="px-4 py-4 border-r border-slate-100 w-16 text-center">長</th>
              <th className="px-4 py-4 border-r border-slate-100 w-16 text-center">寬</th>
              <th className="px-4 py-4 border-r border-slate-100 w-16 text-center">高</th>
              <th className="px-4 py-4 border-r border-slate-100 w-20 text-center">備註</th>
              <th className="px-4 py-4 border-r border-slate-100 w-28 text-right">單價</th>
              <th className="px-4 py-4 border-r border-slate-100 w-32 text-right">個人總計</th>
              <th className="px-4 py-4 w-24 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {groups.map((group, groupIdx) => (
              <React.Fragment key={group.userName}>
                {group.works.map((work, workIdx) => {
                  const isAdjusted = work.h < 3;
                  return (
                    <tr key={work.id} className="hover:bg-slate-50 transition-colors">
                      {workIdx === 0 && (
                        <td 
                          rowSpan={group.works.length} 
                          className="px-4 py-4 border-r border-slate-100 font-bold text-slate-900 text-center align-top bg-slate-50/50"
                        >
                          {groupIdx + 1}
                        </td>
                      )}
                      
                      {workIdx === 0 && (
                        <td 
                          rowSpan={group.works.length} 
                          className="px-4 py-4 border-r border-slate-100 font-extrabold text-blue-700 align-top bg-slate-50/50"
                        >
                          {group.userName}
                        </td>
                      )}

                      <td className="px-4 py-3 border-r border-slate-100 text-center text-slate-500 font-medium">
                        {workIdx + 1}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-center text-slate-900 font-semibold">{work.l}</td>
                      <td className="px-4 py-3 border-r border-slate-100 text-center text-slate-900 font-semibold">{work.w}</td>
                      <td className="px-4 py-3 border-r border-slate-100 text-center font-bold">
                        {isAdjusted ? (
                          <span className="text-amber-600" title={`原始高度: ${work.h}cm`}>
                            3
                          </span>
                        ) : (
                          <span className="text-slate-900">{work.h}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-slate-500 text-center italic text-xs truncate max-w-[80px]">
                        {work.remark || '-'}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100 text-right font-bold text-slate-800">
                        ${work.unitPrice.toLocaleString()}
                      </td>

                      {workIdx === 0 && (
                        <td 
                          rowSpan={group.works.length} 
                          className="px-4 py-4 border-r border-slate-100 text-right font-black text-emerald-700 align-bottom pb-6 bg-emerald-50"
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] text-emerald-600/60 uppercase tracking-tighter font-bold">Subtotal</span>
                            <span className="text-lg">${group.totalPrice.toLocaleString()}</span>
                          </div>
                        </td>
                      )}
                      
                      <td className="px-4 py-3 text-center space-x-2">
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={() => onEditWork(work)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                            title="編輯資料"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => onDeleteWork(work.id)}
                            className="text-red-400 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                            title="移除此項"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-white text-slate-900 font-black border-t-2 border-slate-200">
              <td colSpan={8} className="px-6 py-8 text-right uppercase tracking-widest text-sm border-r border-slate-100">總計金額 (Total)</td>
              <td className="px-6 py-8 text-right text-2xl text-blue-700">
                ${grandTotal.toLocaleString()}
              </td>
              <td className="bg-white border-l border-slate-100"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
