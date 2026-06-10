
import * as XLSX from 'https://esm.sh/xlsx';
import { toJpeg } from 'https://esm.sh/html-to-image';
import { jsPDF } from 'https://esm.sh/jspdf';
import { UserGroup, WorkItem, HistoryEntry, CeramicLogEntry, CeramicState } from '../types';
import { createWorkItem } from './calculatorService';

export const exportToExcel = (groups: UserGroup[], t: any) => {
  const data = groups.flatMap((group, gIdx) => {
    let runningWorkNo = 1;
    return group.works.map((work, wIdx) => {
      const startNo = runningWorkNo;
      const endNo = runningWorkNo + work.quantity - 1;
      const workNoDisplay = work.quantity > 1 ? `${startNo}~${endNo}` : `${startNo}`;
      runningWorkNo += work.quantity;

      return {
        [t.colNo]: gIdx + 1,
        [t.colName]: group.userName,
        [t.colWorkNo]: workNoDisplay,
        [`${t.colL} (cm)`]: work.l,
        [`${t.colW} (cm)`]: work.w,
        [`${t.colH} (cm)`]: work.h,
        [t.colQty]: work.quantity || 1,
        [t.colRemark]: work.remark || '-',
        [t.colUnitPrice]: work.unitPrice,
        ['小計 (Row Subtotal)']: work.unitPrice * (work.quantity || 1),
        [t.colSubtotal]: wIdx === 0 ? group.totalPrice : ''
      };
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, t.tableTitle);
  
  const total = groups.reduce((acc, g) => acc + g.totalPrice, 0);
  XLSX.utils.sheet_add_aoa(worksheet, [['', '', '', '', '', '', '', '', t.totalAmount, total]], { origin: -1 });

  const fileName = `${t.title}_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToCsv = (groups: UserGroup[], t: any) => {
  const headers = [
    t.colNo, t.colName, t.colWorkNo, t.colL, t.colW, t.colH, t.colQty, t.colRemark, t.colUnitPrice, t.colSubtotal
  ];

  const rows = groups.flatMap((group, gIdx) => {
    let runningWorkNo = 1;
    return group.works.map((work, wIdx) => {
      const startNo = runningWorkNo;
      const endNo = runningWorkNo + work.quantity - 1;
      const workNoDisplay = work.quantity > 1 ? `${startNo}~${endNo}` : `${startNo}`;
      runningWorkNo += work.quantity;

      return [
        gIdx + 1,
        `"${group.userName.replace(/"/g, '""')}"`,
        workNoDisplay,
        work.l,
        work.w,
        work.h,
        work.quantity,
        `"${(work.remark || '-').replace(/"/g, '""')}"`,
        work.unitPrice,
        wIdx === 0 ? group.totalPrice : ''
      ];
    });
  });

  const csvContent = "\ufeff" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${t.title}_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportHistoryToExcel = (history: HistoryEntry[], t: any) => {
  const data = history.flatMap(entry => 
    entry.data.map(work => ({
      'Record Name': entry.name,
      'Timestamp': entry.timestamp,
      [t.colName]: work.name,
      [`${t.colL} (cm)`]: work.l,
      [`${t.colW} (cm)`]: work.w,
      [`${t.colH} (cm)`]: work.h,
      [t.colQty]: work.quantity,
      [t.colRemark]: work.remark,
      [t.colUnitPrice]: work.unitPrice,
      'Subtotal': work.unitPrice * (work.quantity || 1),
      'Record Total': entry.totalAmount
    }))
  );

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'History');
  XLSX.writeFile(workbook, `History_${new Date().getTime()}.xlsx`);
};

export const exportHistoryToCsv = (history: HistoryEntry[], t: any) => {
  const headers = ['Record Name', 'Timestamp', t.colName, t.colL, t.colW, t.colH, t.colQty, t.colRemark, t.colUnitPrice, 'Subtotal', 'Record Total'];
  
  const rows = history.flatMap(entry => 
    entry.data.map(work => [
      `"${entry.name.replace(/"/g, '""')}"`,
      entry.timestamp,
      `"${work.name.replace(/"/g, '""')}"`,
      work.l,
      work.w,
      work.h,
      work.quantity,
      `"${(work.remark || '-').replace(/"/g, '""')}"`,
      work.unitPrice,
      work.unitPrice * (work.quantity || 1),
      entry.totalAmount
    ])
  );

  const csvContent = "\ufeff" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `History_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCeramicHistoryToCsv = (logs: CeramicLogEntry[], t: any) => {
  const headers = [
    'Record Name', 'Timestamp', 'Clay Name', 'Shrinkage Rate (%)', 
    'Item Label', 'Wet Value (cm)', 'Fired Value (cm)', 'Mode', 'Note'
  ];

  const rows = logs.flatMap(log => {
    return log.state.measurements.map(m => [
      `"${log.recordName.replace(/"/g, '""')}"`,
      log.timestamp,
      `"${(log.state.clayName || 'Unknown').replace(/"/g, '""')}"`,
      log.state.shrinkageRate,
      `"${(m.label || 'Unnamed').replace(/"/g, '""')}"`,
      m.wetValue,
      m.firedValue,
      m.mode,
      `"${(m.note || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = "\ufeff" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Ceramic_History_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCeramicProjectToCsv = (state: CeramicState, t: any) => {
  const headers = ['Item Label', 'Wet Value (cm)', 'Fired Value (cm)', 'Mode', 'Note'];
  const rows = state.measurements.map(m => [
    `"${(m.label || 'Unnamed').replace(/"/g, '""')}"`,
    m.wetValue,
    m.firedValue,
    m.mode,
    `"${(m.note || '').replace(/"/g, '""')}"`
  ]);
  
  // Also include 3D object
  if (state.object3D.wetL || state.object3D.wetW || state.object3D.wetH) {
    const rate = 1 - state.shrinkageRate/100;
    rows.push(['3D Object L', state.object3D.wetL, (state.object3D.wetL * rate).toFixed(2), 'forward', '']);
    rows.push(['3D Object W', state.object3D.wetW, (state.object3D.wetW * rate).toFixed(2), 'forward', '']);
    rows.push(['3D Object H', state.object3D.wetH, (state.object3D.wetH * rate).toFixed(2), 'forward', '']);
  }

  const clayInfo = [['Clay Name', state.clayName || 'Unknown'], ['Shrinkage Rate (%)', state.shrinkageRate]];
  
  const csvContent = "\ufeff" + 
    clayInfo.map(r => r.join(',')).join('\n') + '\n\n' +
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Ceramic_Calc_${state.clayName || 'Project'}_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseFile = async (file: File): Promise<WorkItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet);

        const imported = json.map(row => {
          const name = row['姓名'] || row['Name'] || row['userName'] || 'Unknown';
          const l = parseFloat(row['長'] || row['Length'] || row['L'] || 0);
          const w = parseFloat(row['寬'] || row['Width'] || row['W'] || 0);
          const h = parseFloat(row['高'] || row['Height'] || row['H'] || 0);
          const q = parseInt(row['數量'] || row['Quantity'] || row['Qty'] || 1);
          const r = row['備註'] || row['Remark'] || '';
          
          if (isNaN(l) || isNaN(w) || isNaN(h)) return null;
          return createWorkItem(name, l, w, h, q, r);
        }).filter(item => item !== null) as WorkItem[];

        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

export const exportToJpg = async (elementId: string, t: any) => {
  const node = document.getElementById(elementId);
  if (!node) return;
  try {
    const dataUrl = await toJpeg(node, { backgroundColor: '#ffffff', quality: 0.95 });
    const link = document.createElement('a');
    link.download = `${t.title}_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export JPG:', error);
  }
};

export const exportToPdf = async (elementId: string, t: any) => {
  const node = document.getElementById(elementId);
  if (!node) return;
  try {
    const dataUrl = await toJpeg(node, { backgroundColor: '#ffffff', quality: 0.95 });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => (img.onload = resolve));
    const pdf = new jsPDF({ orientation: img.width > img.height ? 'landscape' : 'portrait', unit: 'px', format: [img.width, img.height] });
    pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
    pdf.save(`${t.title}_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
  }
};

export interface AppBackupState {
  works: WorkItem[];
  ceramicState: CeramicState;
  lang: string;
  activeTab: string;
  visibleColumns: VisibleColumns;
}

export const exportToJsl = (state: AppBackupState, t: any) => {
  const backup = {
    version: '1.0.0',
    generator: 'Work Dimension Calculator',
    timestamp: new Date().toISOString(),
    state: state
  };
  const jsonContent = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `work_calc_backup_${new Date().toISOString().split('T')[0]}.jsl`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToOfflineHtml = (state: AppBackupState, t: any) => {
  const backup = {
    version: '1.0.0',
    generator: 'Work Dimension Calculator',
    timestamp: new Date().toISOString(),
    state: state
  };

  const offlineHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>作品計算系統 (離線版 / Offline Calculator)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', 'Noto Sans TC', sans-serif; }
    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
  </style>
</head>
<body class="bg-black text-white py-4 md:py-6 lg:py-8 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div id="app-container"></div>
  </div>

  <script id="offline-data-json" type="application/json">
${JSON.stringify(backup, null, 2)}
  </script>

  <script>
    const translations = {
      zh: {
        title: '作品計算系統 (離線版 📴)',
        subtitle: '尺寸(單位:cm) (平板高度不足3，以3計算)',
        ceramicTitle: '陶藝縮率計算 (離線版 📴)',
        ceramicSubtitle: '計算黏土燒製前後的尺寸變化',
        tabVolume: '作品材積',
        tabCeramic: '陶藝縮率',
        clayName: '土名',
        shrinkageRate: '總收縮率 (%)',
        testUtility: '縮率測試工具',
        testWet: '測試片原始長度 (cm)',
        testFired: '測試片燒成長度 (cm)',
        testResult: '計算得出縮率',
        modeForward: '正向計算 (濕 → 乾)',
        modeReverse: '逆向計算 (乾 → 濕)',
        itemName: '項目名稱',
        wetDim: '胚體尺寸 (Wet)',
        firedDim: '成品尺寸 (Fired)',
        addMeasure: '新增測量項',
        forwardTooltip: '輸入胚體尺寸，計算燒成尺寸',
        reverseTooltip: '輸入目標成品尺寸，計算需製作尺寸',
        ceramic3DTitle: '3D 作品快速計算 (L*W*H)',
        ceramic3DDesc: '輸入濕坯尺寸，預測燒成後的最終大小',
        measurementsTitle: '尺寸變換明細表',
        measurementsDesc: '細部尺寸精確換算',
        wetL: '濕坯長 (Wet L)',
        wetW: '濕坯寬 (Wet W)',
        wetH: '濕坯高 (Wet H)',
        firedResult: '預期燒成尺寸 (Expected Fired Size)',
        addTitle: '新增作品資料',
        editTitle: '編輯作品資料',
        cancel: '取消編輯',
        name: '姓名',
        length: '長 (L) cm',
        width: '寬 (W) cm',
        height: '高 (H) cm',
        quantity: '數量 (Qty)',
        remark: '備註 (Remark)',
        addToList: '加入清單',
        saveChanges: '確認修改',
        minHeightNote: '* 註：最小高度為 3cm。若輸入高度小於 3cm，計算時將自動以 3cm 計。',
        tableTitle: '作品清單總表',
        noData: '尚未新增任何作品。',
        colNo: '序號',
        colName: '姓名',
        colWorkNo: '作品編號',
        colL: '長',
        colW: '寬',
        colH: '高',
        colQty: '數量',
        colRemark: '備註',
        colUnitPrice: '單價',
        colSubtotal: '個人總計',
        colActions: '操作',
        totalAmount: '總計金額',
        clearAll: '清除所有資料',
        clearConfirm: '您確定要清除所有資料嗎？',
        placeholderName: '例如：拉坯大碗',
        placeholderRemark: '備註內容',
        switchLang: 'English',
        exportJsl: '匯出 JSL 狀態檔',
        importJsl: '匯入 JSL 狀態檔',
        importSuccess: '🎉 狀態導入成功！資料已更新。',
        importFailed: '❌ 導入失敗，請確保檔案格式正確 (.jsl)'
      },
      en: {
        title: 'Work Calculator (Offline 📴)',
        subtitle: 'Dimensions (cm) (Min height: 3cm)',
        ceramicTitle: 'Ceramic Shrinkage (Offline 📴)',
        ceramicSubtitle: 'Calculate dimension changes before and after firing',
        tabVolume: 'Volume Calc',
        tabCeramic: 'Shrinkage Calc',
        clayName: 'Clay Body',
        shrinkageRate: 'Shrinkage (%)',
        testUtility: 'Shrinkage Test Tool',
        testWet: 'Wet Sample (cm)',
        testFired: 'Fired Sample (cm)',
        testResult: 'Calculated Rate',
        modeForward: 'Forward (Wet → Fired)',
        modeReverse: 'Reverse (Fired → Wet)',
        itemName: 'Item Name',
        wetDim: 'Wet Dim (Green)',
        firedDim: 'Fired Dim (Final)',
        addMeasure: 'Add Row',
        forwardTooltip: 'Input wet size to calculate fired size',
        reverseTooltip: 'Input target fired size to calculate required wet size',
        ceramic3DTitle: '3D Object Rapid Calc (L*W*H)',
        ceramic3DDesc: 'Enter wet dimensions to predict fired results',
        measurementsTitle: 'Dimension Breakdown',
        measurementsDesc: 'Precise individual dimension conversion',
        wetL: 'Wet L',
        wetW: 'Wet W',
        wetH: 'Wet H',
        firedResult: 'Expected Fired Size',
        addTitle: 'Add Entry',
        editTitle: 'Edit Entry',
        cancel: 'Cancel',
        name: 'Name',
        length: 'Length (cm)',
        width: 'Width (cm)',
        height: 'Height (cm)',
        quantity: 'Qty',
        remark: 'Remark',
        addToList: 'Add to List',
        saveChanges: 'Save Changes',
        minHeightNote: '* Note: Min height is 3cm for volume pricing.',
        tableTitle: 'Work Inventory List',
        noData: 'No entries yet.',
        colNo: 'No.',
        colName: 'Name',
        colWorkNo: 'Work #',
        colL: 'L',
        colW: 'W',
        colH: 'H',
        colQty: 'Qty',
        colRemark: 'Remark',
        colUnitPrice: 'Price',
        colSubtotal: 'Subtotal',
        colActions: 'Actions',
        totalAmount: 'Grand Total',
        clearAll: 'Clear All',
        clearConfirm: 'Are you sure you want to clear all data?',
        placeholderName: 'e.g., Large Bowl',
        placeholderRemark: 'Notes',
        switchLang: '中文',
        exportJsl: 'Export JSL State',
        importJsl: 'Import JSL State',
        importSuccess: '🎉 State imported successfully! Your application data is fully restored.',
        importFailed: '❌ Import failed. Please make sure the file is a valid .jsl state backup.'
      }
    };

    // Application state
    let state = {
      works: [],
      ceramicState: {
        clayName: '',
        shrinkageRate: 12,
        measurements: [{ id: '1', label: 'Height', wetValue: 10, firedValue: 8.8, mode: 'forward', note: '' }],
        object3D: { wetL: 0, wetW: 0, wetH: 0 }
      },
      lang: 'zh',
      activeTab: 'volume',
      visibleColumns: { workNo: true, l: true, w: true, h: true, quantity: true, remark: true, unitPrice: true, subtotal: true }
    };

    // Form states
    let editingWorkId = null;
    let volumeForm = { name: '', l: '', w: '', h: '', quantity: 1, remark: '' };
    let testSlab = { wet: '', fired: '', calculatedRate: null };

    // Initialize state
    function init() {
      const saved = localStorage.getItem('works_calculator_offline_state_v1');
      if (saved) {
        try {
          state = JSON.parse(saved);
        } catch (e) {
          loadBakedData();
        }
      } else {
        loadBakedData();
      }
    }

    function loadBakedData() {
      try {
        const bakedElement = document.getElementById('offline-data-json');
        if (bakedElement) {
          const baked = JSON.parse(bakedElement.textContent);
          if (baked && baked.state) {
            state = baked.state;
          }
        }
      } catch (e) {
        console.error("Failed to load baked state", e);
      }
    }

    function saveState() {
      localStorage.setItem('works_calculator_offline_state_v1', JSON.stringify(state));
    }

    // Calculations
    const MIN_HEIGHT = 3;
    const PRICE_FACTOR = 0.1;

    function getAdjustedHeight(h) {
      return Math.max(MIN_HEIGHT, h);
    }

    function calculateUnitPrice(l, w, h) {
      return l * w * getAdjustedHeight(h) * PRICE_FACTOR;
    }

    // UI renderer
    function render() {
      const parent = document.getElementById('app-container');
      const t = translations[state.lang];

      let groups = [];
      const grouped = {};
      state.works.forEach(work => {
        const name = work.name || 'Unknown';
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(work);
      });
      groups = Object.entries(grouped).map(([name, items]) => ({
        userName: name,
        works: items,
        totalPrice: items.reduce((acc, cur) => acc + (cur.unitPrice * (cur.quantity || 1)), 0)
      }));
      const grandTotal = groups.reduce((acc, g) => acc + g.totalPrice, 0);

      // Render App Structure
      parent.innerHTML = \`
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div class="flex-1">
            <h1 class="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <div class="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2V5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              \${state.activeTab === 'volume' ? t.title : t.ceramicTitle}
            </h1>
            <p class="text-slate-400 mt-1 text-xs sm:text-sm font-medium tracking-wide">
              \${state.activeTab === 'volume' ? t.subtitle : t.ceramicSubtitle}
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <button 
              onclick="window.switchLang()"
              class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/20 transition-all font-black text-xs uppercase"
            >
              \${t.switchLang}
            </button>
          </div>
        </header>

        <!-- Tab selection -->
        <div class="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-8 w-fit">
          <button 
            onclick="window.switchTab('volume')"
            class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all \${
              state.activeTab === 'volume' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            \${t.tabVolume}
          </button>
          <button 
            onclick="window.switchTab('ceramic')"
            class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all \${
              state.activeTab === 'ceramic' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path>
            </svg>
            \${t.tabCeramic}
          </button>
        </div>

        <!-- Main Display Content -->
        \${state.activeTab === 'volume' ? renderVolumeContent(groups, grandTotal, t) : renderCeramicContent(t)}

        <!-- Backup and State Tools Section -->
        <div class="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
            <div>
              <h3 class="text-lg font-black text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                \${t.exportJsl} / 備份管理
              </h3>
              <p class="text-xs text-slate-400 mt-1">匯出本離線版的所有狀態 (包含材積作品列表與縮率設定) 為 JSL，亦可重新上傳載入。</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <input type="file" id="import-offline-file" class="hidden" accept=".jsl,.json" onchange="window.importOfflineJsl(event)">
              <button 
                onclick="document.getElementById('import-offline-file').click()"
                class="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black rounded-lg border border-white/20 transition-all text-xs flex items-center gap-2"
              >
                \${t.importJsl}
              </button>
              <button 
                onclick="window.exportOfflineJsl()"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg transition-all text-xs flex items-center gap-2 shadow-lg shadow-blue-500/10"
              >
                \${t.exportJsl}
              </button>
            </div>
          </div>
        </div>

        <footer class="mt-16 py-8 border-t border-white/5 text-center">
          <p class="text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2025 作品計算系統 | OFFLINE MODE CLIENT</p>
        </footer>
      \`;
    }

    function renderVolumeContent(groups, grandTotal, t) {
      return \`
        <div class="space-y-8">
          <!-- Form -->
          <div class="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h2 class="text-xl font-black text-slate-900 border-b pb-3 mb-6 flex items-center gap-2">
              \${editingWorkId ? t.editTitle : t.addTitle}
            </h2>
            <form onsubmit="window.submitVolumeForm(event)" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-tight">\${t.name}</label>
                  <input required class="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="\${t.placeholderName}" value="\${volumeForm.name}" oninput="volumeForm.name = this.value">
                </div>
                <div>
                  <label class="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-tight">\${t.length}</label>
                  <input required type="number" step="any" min="0" class="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none" placeholder="L" value="\${volumeForm.l}" oninput="volumeForm.l = this.value">
                </div>
                <div>
                  <label class="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-tight">\${t.width}</label>
                  <input required type="number" step="any" min="0" class="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none" placeholder="W" value="\${volumeForm.w}" oninput="volumeForm.w = this.value">
                </div>
                <div>
                  <label class="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-tight">\${t.height}</label>
                  <input required type="number" step="any" min="0" class="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none" placeholder="H" value="\${volumeForm.h}" oninput="volumeForm.h = this.value">
                </div>
                <div>
                  <label class="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-tight">\${t.quantity}</label>
                  <input required type="number" min="1" class="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none" placeholder="Qty" value="\${volumeForm.quantity}" oninput="volumeForm.quantity = this.value">
                </div>
              </div>
              <div>
                <label class="block text-xs font-black text-slate-500 uppercase mb-1.5 tracking-tight">\${t.remark}</label>
                <input class="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none" placeholder="\${t.placeholderRemark}" value="\${volumeForm.remark}" oninput="volumeForm.remark = this.value">
              </div>

              <div class="flex items-center justify-between pt-2">
                <span class="text-xs font-semibold text-slate-400">\${t.minHeightNote}</span>
                <div class="flex gap-3">
                  \${editingWorkId ? \`<button type="button" onclick="window.cancelEdit()" class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">\${t.cancel}</button>\` : ''}
                  <button type="submit" class="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm shadow-xl transition-all">
                    \${editingWorkId ? t.saveChanges : t.addToList}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- List Table -->
          <div class="space-y-6">
            <h2 class="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-3">
              \${t.tableTitle}
            </h2>

            \${groups.length === 0 ? \`
              <div class="text-center py-16 bg-white/5 border border-white/10 rounded-3xl text-slate-500">
                <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2M5 13V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                \${t.noData}
              </div>
            \` : \`
              <div class="space-y-6">
                \${groups.map((group, gIdx) => {
                  let runningWorkNo = 1;
                  return \`
                    <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                      <div class="bg-white/10 px-6 py-3 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                        <span class="font-black text-white text-sm">#\${gIdx + 1} \${group.userName}</span>
                        <div class="flex items-center gap-3">
                          <span class="text-xs font-bold text-slate-400">小計:</span>
                          <span class="font-black text-blue-400 font-mono">\$\${Math.round(group.totalPrice).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs">
                          <thead>
                            <tr class="bg-white/5 border-b border-white/10 text-slate-400 font-extrabold uppercase tracking-wide">
                              <th class="px-6 py-3">\${t.colWorkNo}</th>
                              <th class="px-4 py-3 text-center">\${t.colL}</th>
                              <th class="px-4 py-3 text-center">\${t.colW}</th>
                              <th class="px-4 py-3 text-center">\${t.colH}</th>
                              <th class="px-4 py-3 text-center">\${t.colQty}</th>
                              <th class="px-6 py-3">\${t.colRemark}</th>
                              <th class="px-6 py-3 text-right">\${t.colUnitPrice}</th>
                              <th class="px-6 py-3 text-right">\${t.colSubtotal}</th>
                              <th class="px-6 py-3 text-center w-24">⚙️</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-white/5">
                            \${group.works.map((work) => {
                              const startNo = runningWorkNo;
                              const endNo = runningWorkNo + work.quantity - 1;
                              const workNoDisplay = work.quantity > 1 ? \`\${startNo}~\${endNo}\` : \`\${startNo}\`;
                              runningWorkNo += work.quantity;

                              return \`
                                <tr class="hover:bg-white/5 transition-all">
                                  <td class="px-6 py-4 font-mono select-all font-bold text-slate-300">\${workNoDisplay}</td>
                                  <td class="px-4 py-4 text-center font-bold">\${work.l}</td>
                                  <td class="px-4 py-4 text-center font-bold">\${work.w}</td>
                                  <td class="px-4 py-4 text-center text-slate-400">\${work.h}</td>
                                  <td class="px-4 py-4 text-center font-bold font-mono">\${work.quantity}</td>
                                  <td class="px-6 py-4 text-slate-300 font-medium">\${work.remark || '-'}</td>
                                  <td class="px-6 py-4 text-right font-bold text-slate-300 font-mono">\$\${Math.round(work.unitPrice).toLocaleString()}</td>
                                  <td class="px-6 py-4 text-right font-black text-white font-mono">\$\${Math.round(work.unitPrice * work.quantity).toLocaleString()}</td>
                                  <td class="px-6 py-4 text-center">
                                    <div class="inline-flex gap-2">
                                      <button onclick="window.editWorkItem('\${work.id}')" class="p-1 px-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-md transition-all font-bold text-[10px]">Edit</button>
                                      <button onclick="window.deleteWorkItem('\${work.id}')" class="p-1 px-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-md transition-all font-bold text-[10px]">Del</button>
                                    </div>
                                  </td>
                                </tr>
                              \`;
                            }).join('')}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  \`;
                }).join('')}

                <!-- Total section -->
                <div class="p-6 bg-slate-900 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <button onclick="window.clearAllWorks()" class="px-5 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white transition-all rounded-xl text-xs font-black">\${t.clearAll}</button>
                  <div class="text-right">
                    <span class="text-xs text-slate-400 uppercase tracking-widest block font-black mb-1">\${t.totalAmount}</span>
                    <span class="text-3xl font-black text-blue-500 font-mono">\$\${Math.round(grandTotal).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            \`}
          </div>
        </div>
      \`;
    }

    function renderCeramicContent(t) {
      const stateObj = state.ceramicState;
      const shrinkageFactor = 1 - (stateObj.shrinkageRate / 100);

      const resolvedFiredL = stateObj.object3D.wetL ? (stateObj.object3D.wetL * shrinkageFactor).toFixed(2) : '0.00';
      const resolvedFiredW = stateObj.object3D.wetW ? (stateObj.object3D.wetW * shrinkageFactor).toFixed(2) : '0.00';
      const resolvedFiredH = stateObj.object3D.wetH ? (stateObj.object3D.wetH * shrinkageFactor).toFixed(2) : '0.00';

      return \`
        <div class="flex flex-col gap-6 text-slate-900 max-w-5xl mx-auto pb-12">
          <!-- Rate Header card -->
          <div class="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-white">
            <div>
              <label class="block text-[10px] font-black uppercase text-slate-400 mb-1">\${t.clayName}</label>
              <input type="text" class="w-full h-10 bg-black border border-white/20 rounded-xl px-3 font-bold text-xs" value="\${stateObj.clayName}" placeholder="例如: 瓷泥" oninput="window.changeClayName(this.value)">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase text-slate-400 mb-1">\${t.shrinkageRate}</label>
              <div class="flex items-center gap-2">
                <input type="number" step="0.1" class="w-full h-10 bg-black border border-white/20 rounded-xl px-3 font-black text-xs text-emerald-400" value="\${stateObj.shrinkageRate}" oninput="window.changeShrinkageRate(parseFloat(this.value) || 0)">
                <span class="font-extrabold text-sm text-emerald-400">%</span>
              </div>
            </div>
          </div>

          <!-- Slab Test Helper tool -->
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg p-5">
            <h3 class="text-sm font-black text-slate-900 border-b pb-2.5 mb-4 flex items-center gap-2">
              <span class="bg-emerald-600 p-1 text-white rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0l-.628.288a2 2 0 01-1.947 0l-.628-.288a2 2 0 00-1.947 0"></path></svg></span>
              \${t.testUtility}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">\${t.testWet}</label>
                <input type="number" step="any" class="w-full h-10 bg-slate-50 border rounded-xl px-3 text-xs font-bold" value="\${testSlab.wet}" placeholder="10" oninput="window.updateTestSlabField('wet', this.value)">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">\${t.testFired}</label>
                <input type="number" step="any" class="w-full h-10 bg-slate-50 border rounded-xl px-3 text-xs font-bold" value="\${testSlab.fired}" placeholder="8.8" oninput="window.updateTestSlabField('fired', this.value)">
              </div>
              <div class="col-span-2 sm:col-span-1">
                <button onclick="window.applyTestSlab()" \${testSlab.calculatedRate ? '' : 'disabled'} class="w-full h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  \${testSlab.calculatedRate ? testSlab.calculatedRate + '% Apply' : 'Pending'}
                </button>
              </div>
            </div>
          </div>

          <!-- Detailed dimension table -->
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div class="bg-slate-900 px-5 py-3 text-white flex justify-between items-center">
              <span class="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                \${t.measurementsTitle}
              </span>
              <span class="text-[9px] text-slate-400 uppercase tracking-widest">\${t.measurementsDesc}</span>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-slate-100 border-b text-slate-500 font-extrabold uppercase tracking-wide">
                    <th class="px-4 py-2.5 w-1/4">\${t.itemName}</th>
                    <th class="px-4 py-2.5 text-center">\${t.wetDim}</th>
                    <th class="px-2 py-2.5 text-center w-14"></th>
                    <th class="px-4 py-2.5 text-center">\${t.firedDim}</th>
                    <th class="px-4 py-2.5">\${t.remark}</th>
                    <th class="px-4 py-2.5 text-center w-14">⚙️</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  \${stateObj.measurements.map((m) => {
                    return \`
                      <tr class="hover:bg-slate-50">
                        <td class="px-4 py-3">
                          <input type="text" class="w-full bg-transparent border-b border-transparent focus:border-slate-300 font-bold focus:outline-none" value="\${m.label}" placeholder="標籤名稱" oninput="window.changeCeramicRow('\${m.id}', 'label', this.value)">
                        </td>
                        <td class="px-4 py-3 transition-colors \${m.mode === 'reverse' ? 'bg-slate-50' : ''}">
                          <div class="relative max-w-[120px] mx-auto">
                            <input type="number" step="any" class="w-full text-center py-1 rounded-md border font-black text-xs \${m.mode === 'forward' ? 'border-blue-500 text-blue-700 font-bold bg-white ring-2 ring-blue-100' : 'bg-slate-100 border-slate-200 text-slate-400'}" value="\${m.wetValue || ''}" oninput="window.changeCeramicRow('\${m.id}', 'wetValue', parseFloat(this.value) || 0)">
                            <span class="absolute right-1 bottom-1 text-[8px] text-slate-400 uppercase">cm</span>
                          </div>
                        </td>
                        <td class="px-2 py-3 text-center">
                          <button onclick="window.toggleCeramicRowMode('\${m.id}')" class="p-1 rounded bg-slate-100 hover:bg-slate-200 border text-slate-700 transition-all shadow-sm">
                            <svg class="w-4 h-4 \${m.mode === 'reverse' ? 'rotate-180' : ''} transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          </button>
                        </td>
                        <td class="px-4 py-3 transition-colors \${m.mode === 'forward' ? 'bg-slate-50' : ''}">
                          <div class="relative max-w-[120px] mx-auto">
                            <input type="number" step="any" class="w-full text-center py-1 rounded-md border font-black text-xs \${m.mode === 'reverse' ? 'border-amber-500 text-amber-700 font-bold bg-white ring-2 ring-amber-100' : 'bg-slate-100 border-slate-200 text-slate-400'}" value="\${m.firedValue || ''}" oninput="window.changeCeramicRow('\${m.id}', 'firedValue', parseFloat(this.value) || 0)">
                            <span class="absolute right-1 bottom-1 text-[8px] text-slate-400 uppercase">cm</span>
                          </div>
                        </td>
                        <td class="px-4 py-3">
                          <input type="text" class="w-full bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none placeholder-slate-300" value="\${m.note || ''}" placeholder="\${t.placeholderRemark}" oninput="window.changeCeramicRow('\${m.id}', 'note', this.value)">
                        </td>
                        <td class="px-4 py-3 text-center">
                          <button onclick="window.removeCeramicRow('\${m.id}')" class="text-slate-300 hover:text-red-500"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </td>
                      </tr>
                    \`;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="p-3 bg-slate-50 border-t flex justify-center">
              <button onclick="window.addCeramicRow()" class="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-black text-white rounded-full font-bold text-[10px] shadow transition-all active:scale-95">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                \${t.addMeasure}
              </button>
            </div>
          </div>

          <!-- 3D Rapid sizing tool -->
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg p-5">
            <h3 class="text-sm font-black text-slate-900 border-b pb-2.5 mb-4 flex items-center gap-2">
              <span class="bg-indigo-600 p-1 text-white rounded-lg"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg></span>
              \${t.ceramic3DTitle}
            </h3>
            <p class="text-[10px] text-slate-400 mb-4 font-medium">\${t.ceramic3DDesc}</p>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div class="md:col-span-6 grid grid-cols-3 gap-3">
                <div class="relative">
                  <label class="block text-[8px] font-black text-slate-400 mb-1">\${t.wetL}</label>
                  <input type="number" step="any" class="w-full h-10 bg-slate-50 border rounded-xl px-3 font-bold text-xs" value="\${stateObj.object3D.wetL || ''}" placeholder="0" oninput="window.change3DObjectField('wetL', parseFloat(this.value) || 0)">
                  <span class="absolute right-1.5 bottom-2 text-[8px] text-slate-400 uppercase font-black">cm</span>
                </div>
                <div class="relative">
                  <label class="block text-[8px] font-black text-slate-400 mb-1">\${t.wetW}</label>
                  <input type="number" step="any" class="w-full h-10 bg-slate-50 border rounded-xl px-3 font-bold text-xs" value="\${stateObj.object3D.wetW || ''}" placeholder="0" oninput="window.change3DObjectField('wetW', parseFloat(this.value) || 0)">
                  <span class="absolute right-1.5 bottom-2 text-[8px] text-slate-400 uppercase font-black">cm</span>
                </div>
                <div class="relative">
                  <label class="block text-[8px] font-black text-slate-400 mb-1">\${t.wetH}</label>
                  <input type="number" step="any" class="w-full h-10 bg-slate-50 border rounded-xl px-3 font-bold text-xs" value="\${stateObj.object3D.wetH || ''}" placeholder="0" oninput="window.change3DObjectField('wetH', parseFloat(this.value) || 0)">
                  <span class="absolute right-1.5 bottom-2 text-[8px] text-slate-400 uppercase font-black">cm</span>
                </div>
              </div>

              <!-- Output Box -->
              <div class="md:col-span-6 bg-slate-900 text-white rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-xl flex flex-col justify-center">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <label class="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-3">\${t.firedResult}</label>
                <div class="flex items-center gap-3 justify-center">
                  <div class="flex flex-col items-center">
                    <span class="text-3xl font-black font-mono tracking-tight">\${resolvedFiredL}</span>
                    <span class="text-[8px] text-slate-400 mt-1 uppercase font-black">L</span>
                  </div>
                  <span class="text-slate-600 text-xl font-bold mt-[-5px]">×</span>
                  <div class="flex flex-col items-center">
                    <span class="text-3xl font-black font-mono tracking-tight">\${resolvedFiredW}</span>
                    <span class="text-[8px] text-slate-400 mt-1 uppercase font-black">W</span>
                  </div>
                  <span class="text-slate-600 text-xl font-bold mt-[-5px]">×</span>
                  <div class="flex flex-col items-center">
                    <span class="text-3xl font-black font-mono tracking-tight">\${resolvedFiredH}</span>
                    <span class="text-[8px] text-slate-400 mt-1 uppercase font-black">H</span>
                  </div>
                  <span class="ml-2 bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">CM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    // App interaction handlers
    window.switchLang = function() {
      state.lang = state.lang === 'zh' ? 'en' : 'zh';
      saveState();
      render();
    };

    window.switchTab = function(tab) {
      state.activeTab = tab;
      saveState();
      render();
    };

    // Volume Calculations & forms
    window.submitVolumeForm = function(e) {
      e.preventDefault();
      
      const parsedL = parseFloat(volumeForm.l) || 0;
      const parsedW = parseFloat(volumeForm.w) || 0;
      const parsedH = parseFloat(volumeForm.h) || 0;
      const parsedQty = parseInt(volumeForm.quantity) || 1;
      
      const unitPrice = calculateUnitPrice(parsedL, parsedW, parsedH);
      const adjustedH = getAdjustedHeight(parsedH);

      if (editingWorkId) {
        state.works = state.works.map(w => w.id === editingWorkId ? {
          ...w,
          name: volumeForm.name,
          l: parsedL,
          w: parsedW,
          h: parsedH,
          adjustedH: adjustedH,
          quantity: parsedQty,
          unitPrice: unitPrice,
          remark: volumeForm.remark
        } : w);
        editingWorkId = null;
      } else {
        const newWork = {
          id: 'off-' + Date.now().toString() + Math.random().toString(36).substr(2,6),
          name: volumeForm.name,
          l: parsedL,
          w: parsedW,
          h: parsedH,
          adjustedH: adjustedH,
          quantity: parsedQty,
          unitPrice: unitPrice,
          remark: volumeForm.remark
        };
        state.works.push(newWork);
      }

      // Reset form (keeping Name for rapid entry ease)
      volumeForm.l = '';
      volumeForm.w = '';
      volumeForm.h = '';
      volumeForm.quantity = 1;
      volumeForm.remark = '';

      saveState();
      render();
    };

    window.editWorkItem = function(id) {
      const work = state.works.find(w => w.id === id);
      if (!work) return;
      editingWorkId = id;
      volumeForm = {
        name: work.name,
        l: work.l,
        w: work.w,
        h: work.h,
        quantity: work.quantity,
        remark: work.remark || ''
      };
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.cancelEdit = function() {
      editingWorkId = null;
      volumeForm.l = '';
      volumeForm.w = '';
      volumeForm.h = '';
      volumeForm.quantity = 1;
      volumeForm.remark = '';
      render();
    };

    window.deleteWorkItem = function(id) {
      state.works = state.works.filter(w => w.id !== id);
      if (editingWorkId === id) editingWorkId = null;
      saveState();
      render();
    };

    window.clearAllWorks = function() {
      const t = translations[state.lang];
      if (confirm(t.clearConfirm)) {
        state.works = [];
        editingWorkId = null;
        saveState();
        render();
      }
    };

    // Ceramic Calculator actions
    window.changeClayName = function(val) {
      state.ceramicState.clayName = val;
      saveState();
    };

    window.changeShrinkageRate = function(val) {
      state.ceramicState.shrinkageRate = val;
      const rateFactor = 1 - (val / 100);
      
      // Re-calculate all measurements
      state.ceramicState.measurements = state.ceramicState.measurements.map(m => {
        if (m.mode === 'forward') {
          return { ...m, firedValue: Number((m.wetValue * rateFactor).toFixed(2)) };
        } else {
          return { ...m, wetValue: Number((m.firedValue / rateFactor).toFixed(2)) };
        }
      });
      
      saveState();
      render();
    };

    window.updateTestSlabField = function(field, val) {
      testSlab[field] = val;
      const wet = parseFloat(testSlab.wet);
      const fired = parseFloat(testSlab.fired);
      if (wet && fired && wet > fired) {
        testSlab.calculatedRate = (((wet - fired) / wet) * 100).toFixed(2);
      } else {
        testSlab.calculatedRate = null;
      }
      render();
    };

    window.applyTestSlab = function() {
      if (testSlab.calculatedRate) {
        window.changeShrinkageRate(parseFloat(testSlab.calculatedRate));
        testSlab.wet = '';
        testSlab.fired = '';
        testSlab.calculatedRate = null;
        render();
      }
    };

    window.addCeramicRow = function() {
      const newId = Date.now().toString();
      state.ceramicState.measurements.push({
        id: newId,
        label: '',
        wetValue: 0,
        firedValue: 0,
        mode: 'forward',
        note: ''
      });
      saveState();
      render();
    };

    window.removeCeramicRow = function(id) {
      state.ceramicState.measurements = state.ceramicState.measurements.filter(m => m.id !== id);
      saveState();
      render();
    };

    window.changeCeramicRow = function(id, field, val) {
      const shrinkageRate = state.ceramicState.shrinkageRate;
      const rateFactor = 1 - (shrinkageRate / 100);

      state.ceramicState.measurements = state.ceramicState.measurements.map(m => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: val };
        
        if (field === 'wetValue') {
          updated.firedValue = Number((val * rateFactor).toFixed(2));
          updated.mode = 'forward';
        } else if (field === 'firedValue') {
          updated.wetValue = Number((val / rateFactor).toFixed(2));
          updated.mode = 'reverse';
        }
        return updated;
      });
      saveState();
      render();
    };

    window.toggleCeramicRowMode = function(id) {
      state.ceramicState.measurements = state.ceramicState.measurements.map(m => {
        if (m.id !== id) return m;
        return { ...m, mode: m.mode === 'forward' ? 'reverse' : 'forward' };
      });
      saveState();
      render();
    };

    window.change3DObjectField = function(field, val) {
      state.ceramicState.object3D[field] = val;
      saveState();
      render();
    };

    // JSL backups
    window.exportOfflineJsl = function() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        version: "1.0.0",
        generator: "Work Dimension Calculator (Offline)",
        timestamp: new Date().toISOString(),
        state: state
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "work_calc_backup_offline_" + new Date().toISOString().split('T')[0] + ".jsl");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.removeChild(downloadAnchor);
    };

    window.importOfflineJsl = function(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const content = JSON.parse(e.target.result);
          if (content && content.state) {
            state = content.state;
            saveState();
            render();
            alert(translations[state.lang].importSuccess || "Loaded successfully!");
          } else {
            alert(translations[state.lang].importFailed || "Failed to import!");
          }
        } catch(err) {
          alert("Error parsing file. Ensure it is a valid .jsl backup!");
        }
      };
      reader.readAsText(file);
    };

    // App Bootstrap
    init();
    render();
  </script>
</body>
</html>`;

  const blob = new Blob([offlineHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `work_calc_offline_${new Date().toISOString().split('T')[0]}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

