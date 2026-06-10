
import React, { useState } from 'react';
import { QRCodeCanvas } from 'https://esm.sh/qrcode.react';

interface ShareModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

export const ShareModal: React.FC<ShareModalProps> = ({ url, isOpen, onClose, t }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-black text-slate-900">{t.shareTitle}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-slate-500 text-sm mb-8">{t.shareDesc}</p>

        <div className="flex flex-col items-center gap-8">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
            <QRCodeCanvas 
              value={url} 
              size={200} 
              level="H" 
              includeMargin={true}
              imageSettings={{
                src: "https://raw.githubusercontent.com/google/material-design-icons/master/png/action/calculate/materialicons/48dp/1x/baseline_calculate_black_48dp.png",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              copied 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
            } shadow-lg active:scale-95`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {t.linkCopied}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                {t.copyLink}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
