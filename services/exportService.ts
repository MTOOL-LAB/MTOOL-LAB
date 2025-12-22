
import * as XLSX from 'https://esm.sh/xlsx';
import { toJpeg } from 'https://esm.sh/html-to-image';
import { jsPDF } from 'https://esm.sh/jspdf';
import { UserGroup } from '../types';

export const exportToExcel = (groups: UserGroup[]) => {
  const data = groups.flatMap((group, gIdx) => 
    group.works.map((work, wIdx) => ({
      '序號': gIdx + 1,
      '姓名': group.userName,
      '作品編號': wIdx + 1,
      '長 (cm)': work.l,
      '寬 (cm)': work.w,
      '高 (cm)': work.h < 3 ? 3 : work.h,
      '備註': work.remark || '-',
      '單價': work.unitPrice,
      '個人總計': wIdx === 0 ? group.totalPrice : ''
    }))
  );

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '作品清單');
  
  // Calculate grand total
  const total = groups.reduce((acc, g) => acc + g.totalPrice, 0);
  XLSX.utils.sheet_add_aoa(worksheet, [['', '', '', '', '', '', '總計', total]], { origin: -1 });

  XLSX.writeFile(workbook, `作品清單_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.xlsx`);
};

export const exportToJpg = async (elementId: string) => {
  const node = document.getElementById(elementId);
  if (!node) return;

  try {
    const dataUrl = await toJpeg(node, { 
      backgroundColor: '#ffffff',
      quality: 0.95,
      style: {
        transform: 'scale(1)',
        borderRadius: '0'
      }
    });
    const link = document.createElement('a');
    link.download = `作品清單_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.jpg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export JPG:', error);
  }
};

export const exportToPdf = async (elementId: string) => {
  const node = document.getElementById(elementId);
  if (!node) return;

  try {
    const dataUrl = await toJpeg(node, { 
      backgroundColor: '#ffffff',
      quality: 0.95 
    });
    
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => (img.onload = resolve));

    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width, img.height]
    });

    pdf.addImage(dataUrl, 'JPEG', 0, 0, img.width, img.height);
    pdf.save(`作品清單_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
  }
};
