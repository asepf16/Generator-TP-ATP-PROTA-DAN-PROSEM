import React from 'react';
import {
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Printer,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Calendar,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onReset: () => void;
  onExportDocx: () => void;
  onExportXlsx: () => void;
  onPrint: () => void;
  onCopyTable: () => void;
  hasTp: boolean;
  hasAtp: boolean;
  hasAnalysis: boolean;
  hasProtaPromes?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onReset,
  onExportDocx,
  onExportXlsx,
  onPrint,
  onCopyTable,
  hasTp,
  hasAtp,
  hasAnalysis,
  hasProtaPromes = false,
}) => {
  const steps = [
    { id: 'identity', label: '1. Identitas & CP Elemen', icon: BookOpen },
    { id: 'analysis', label: '2. Analisis CP', icon: Sparkles, disabled: !hasAnalysis },
    { id: 'tp', label: '3. Tujuan Pembelajaran (TP)', icon: FileText, disabled: !hasTp },
    { id: 'atp', label: '4. Alur TP (ATP Terpadu)', icon: FileSpreadsheet, disabled: !hasAtp },
    {
      id: 'prota_promes',
      label: '5. Program Tahunan & Semester (Prota & Promes)',
      icon: Calendar,
      disabled: !hasAtp,
    },
    { id: 'traceability', label: '6. Peta Keterlacakan', icon: ShieldCheck, disabled: !hasTp },
    { id: 'export', label: '7. Pratinjau & Ekspor', icon: Download, disabled: !hasTp },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              TP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  SMART TP & ATP GENERATOR MULTIJENJANG
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Kemendikdasmen Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500">
                PPA Revisi 2025 • Kepka BKPDM 020/2026 (Pendidikan Agama) &amp; Kepka BSKAP 046/2025 (Mapel Lainnya)
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Mulai Ulang / Bersihkan Formulir"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {hasTp && (
              <>
                <button
                  onClick={onCopyTable}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
                  title="Salin Tabel Format Markdown / Dokumen"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Tabel</span>
                </button>

                <button
                  onClick={onExportDocx}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg shadow-xs transition-colors"
                  title="Unduh Dokumen Microsoft Word (.docx)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Word (.docx)</span>
                </button>

                <button
                  onClick={onExportXlsx}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg shadow-xs transition-colors"
                  title="Unduh Lembar Kerja Microsoft Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  onClick={onPrint}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
                  title="Cetak Dokumen atau Simpan PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cetak / PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Steps Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentTab === step.id;
            return (
              <button
                key={step.id}
                onClick={() => !step.disabled && setCurrentTab(step.id)}
                disabled={step.disabled}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : step.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : step.disabled ? 'text-slate-300' : 'text-slate-500'}`} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
