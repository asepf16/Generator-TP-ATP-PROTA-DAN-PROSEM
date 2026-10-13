import React from 'react';
import { TraceabilityResult, CpElement, LearningObjective, AtpItem } from '../types/curriculum';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  FileCheck,
  Info,
} from 'lucide-react';

interface TraceabilityMatrixViewProps {
  traceabilityResult?: TraceabilityResult;
  elements: CpElement[];
  tpList: LearningObjective[];
  atpList: AtpItem[];
  onRevalidate: () => void;
  isValidating: boolean;
  onGoToExport: () => void;
}

export const TraceabilityMatrixView: React.FC<TraceabilityMatrixViewProps> = ({
  traceabilityResult,
  elements,
  tpList,
  atpList,
  onRevalidate,
  isValidating,
  onGoToExport,
}) => {
  const items = traceabilityResult?.traceability || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Peta Keterlacakan (Traceability Matrix) CP → TP → ATP
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              Audit Penjaminan Mutu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Memverifikasi ketercakupan kompetensi &amp; lingkup materi CP agar tidak ada kompetensi esensial yang terlewatkan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRevalidate}
            disabled={isValidating}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{isValidating ? 'Memeriksa Ulang...' : 'Periksa Ulang Keterlacakan'}</span>
          </button>

          <button
            onClick={onGoToExport}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <span>Lanjut: Pratinjau &amp; Ekspor →</span>
          </button>
        </div>
      </div>

      {/* Mandatory Official Disclaimer as required by Section 10 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Pemberitahuan Resmi Ketercakupan Fase:</p>
          <p className="text-amber-800 leading-relaxed italic">
            “Dokumen ini disusun berdasarkan elemen CP yang telah dimasukkan dan belum tentu mencakup seluruh CP mata pelajaran dalam satu fase.”
          </p>
          <p className="text-amber-700 text-[11px] mt-1">
            Status keterlacakan merupakan hasil analisis AI berbantuan kaidah pedagogi, bukan vonis mutlak. Guru memiliki wewenang penuh untuk menelaah, merevisi, dan menyesuaikan rumusan sesuai konteks peserta didik di satuan pendidikan.
          </p>
        </div>
      </div>

      {/* Overall Status Badge */}
      {traceabilityResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-700">Status Ketercakupan Keseluruhan:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                traceabilityResult.overallStatus === 'Lengkap'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : traceabilityResult.overallStatus === 'Sebagian'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}
            >
              {traceabilityResult.overallStatus === 'Lengkap' && '✓ Terakomodasi Lengkap'}
              {traceabilityResult.overallStatus === 'Sebagian' && '⚠ Sebagian Terakomodasi (Perlu Ditinjau)'}
              {traceabilityResult.overallStatus === 'Perlu Perbaikan' && '✗ Perlu Perbaikan Substansi'}
            </span>
          </div>

          <span className="text-slate-500 text-[11px]">
            Diaudit terhadap {elements.length} Elemen, {tpList.length} TP, dan {atpList.length} langkah ATP
          </span>
        </div>
      )}

      {/* Matrix Cards for Each Element */}
      <div className="space-y-4">
        {items.map((item, index) => {
          const statusBg =
            item.coverageStatus === 'Terakomodasi'
              ? 'bg-emerald-50/70 border-emerald-200'
              : item.coverageStatus === 'Perlu ditinjau'
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-red-50/70 border-red-200';

          const badgeClass =
            item.coverageStatus === 'Terakomodasi'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : item.coverageStatus === 'Perlu ditinjau'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-red-100 text-red-800 border-red-300';

          // TP items that belong to this element
          const mappedTps = tpList.filter((t) => item.mappedTpCodes?.includes(t.code) || t.elementName === item.elementName);

          return (
            <div
              key={item.elementId || index}
              className={`bg-white border rounded-xl shadow-xs overflow-hidden transition-all ${
                item.coverageStatus === 'Belum terakomodasi' ? 'border-red-300' : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{item.elementName}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Status Ketercakupan:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                    {item.coverageStatus === 'Terakomodasi' && '✓ Terakomodasi'}
                    {item.coverageStatus === 'Perlu ditinjau' && '⚠ Perlu Ditinjau'}
                    {item.coverageStatus === 'Belum terakomodasi' && '✗ Belum Terakomodasi'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 text-xs">
                {/* 1. CP Sumber */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1">Kutipan CP Sumber:</h4>
                  <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 italic leading-relaxed">
                    "{item.cpText || elements[index]?.cpText}"
                  </p>
                </div>

                {/* 2. TP & Posisi ATP yang mengakomodasi */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Tujuan Pembelajaran (TP) &amp; Posisi Alur (ATP) Pemenuh:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mappedTps.map((tp) => {
                      const atpStep = atpList.find((a) => a.tpCode === tp.code);
                      return (
                        <div
                          key={tp.id}
                          className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200 flex items-start justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-bold text-blue-700 bg-white px-1.5 py-0.2 rounded-sm text-[10px] border border-blue-200">
                                {tp.code}
                              </span>
                              {atpStep && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200">
                                  Alur #{atpStep.order} (Sem {atpStep.semester})
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-800 line-clamp-2">
                              {tp.tpStatement}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold shrink-0">
                            {tp.recommendedJp} JP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Catatan Audit AI */}
                <div className={`p-3.5 rounded-xl border space-y-2 ${statusBg}`}>
                  {item.missingSubstances && item.missingSubstances.length > 0 && (
                    <div>
                      <p className="font-bold text-red-900 flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Substansi CP yang Belum Terakomodasi:</span>
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-red-800 text-[11px]">
                        {item.missingSubstances.map((sub, i) => (
                          <li key={i}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.suspectedDuplicates && item.suspectedDuplicates.length > 0 && (
                    <div>
                      <p className="font-bold text-amber-900 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>TP Diduga Tumpang Tindih / Duplikasi:</span>
                      </p>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        {item.suspectedDuplicates.join(', ')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-slate-900">Rekomendasi Penelaahan Guru:</p>
                    <p className="text-slate-700 mt-0.5 leading-relaxed text-[11px]">
                      {item.recommendation || 'Seluruh materi esensial pada elemen ini telah terpetakan dengan baik pada TP dan alur ATP.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA to Export */}
      <div className="flex items-center justify-end pt-3 border-t border-slate-200">
        <button
          onClick={onGoToExport}
          className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <span>Lanjutkan ke Pratinjau &amp; Ekspor Dokumen →</span>
        </button>
      </div>
    </div>
  );
};
