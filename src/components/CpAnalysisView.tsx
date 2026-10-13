import React, { useState } from 'react';
import { AnalysisResult, LearningIdentity } from '../types/curriculum';
import {
  Sparkles,
  Layers,
  Link as LinkIcon,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Key,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface CpAnalysisViewProps {
  analysis: AnalysisResult;
  learningIdentity: LearningIdentity;
  onGenerateTp: () => void;
  isGeneratingTp: boolean;
  onReanalyze: () => void;
}

export const CpAnalysisView: React.FC<CpAnalysisViewProps> = ({
  analysis,
  learningIdentity,
  onGenerateTp,
  isGeneratingTp,
  onReanalyze,
}) => {
  const [activeTab, setActiveTab] = useState<'per_element' | 'overview'>('per_element');
  const [selectedElementIdx, setSelectedElementIdx] = useState<number>(0);

  const elementAnalyses = analysis.elementAnalyses || [];
  const crossRelations = analysis.crossElementRelations || [];
  const warnings = analysis.warnings || [];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Hasil Analisis Capaian Pembelajaran (CP) Multi-Elemen
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Analisis Kemendikdasmen 2025
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Menganalisis kompetensi esensial, lingkup materi, dan hubungan hierarki pedagogis antarelemen untuk {learningIdentity.subjectName} ({learningIdentity.fase}).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReanalyze}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Analisis Ulang</span>
          </button>

          <button
            onClick={onGenerateTp}
            disabled={isGeneratingTp}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingTp ? 'Merumuskan TP...' : 'Lanjut: Rumuskan TP (AI) →'}</span>
          </button>
        </div>
      </div>

      {/* Warnings Banner if any */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                w.severity === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold">Catatan Penelaahan AI:</p>
                <p className="mt-0.5 leading-relaxed">{w.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Switcher: Per-Element vs Overview */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('per_element')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'per_element'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Analisis Per Elemen ({elementAnalyses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Analisis Keseluruhan &amp; Hubungan Antarelemen</span>
        </button>
      </div>

      {/* TAB 1: Analisis Per Elemen */}
      {activeTab === 'per_element' && (
        <div className="space-y-4">
          {/* Element Selector Pills */}
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-100 rounded-xl">
            {elementAnalyses.map((el, idx) => (
              <button
                key={el.elementId || idx}
                onClick={() => setSelectedElementIdx(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedElementIdx === idx
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Elemen {idx + 1}: {el.elementName}
              </button>
            ))}
          </div>

          {/* Selected Element Detail Card */}
          {elementAnalyses[selectedElementIdx] && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedElementIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {elementAnalyses[selectedElementIdx].elementName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kedalaman / Taksonomi: {elementAnalyses[selectedElementIdx].depthLevel}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {elementAnalyses[selectedElementIdx].characteristics || 'Karakteristik Elemen'}
                </span>
              </div>

              {/* Grid of Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Kompetensi Kunci */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Kompetensi Kunci (Kata Kerja Operasional)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {elementAnalyses[selectedElementIdx].competencies?.map((comp, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md border border-blue-200"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Lingkup Materi Esensial */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Lingkup Materi Esensial</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {elementAnalyses[selectedElementIdx].essentialMaterials?.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Kata Kunci Utama */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-violet-900">
                    <Key className="w-4 h-4 text-violet-600" />
                    <span>Kata Kunci Utama</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {elementAnalyses[selectedElementIdx].keywords?.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs font-mono bg-violet-100 text-violet-800 rounded-sm"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Kedalaman & Karakteristik */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>Karakteristik Pembelajaran</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {elementAnalyses[selectedElementIdx].characteristics || 'Sesuai dengan tahap perkembangan fase.'}
                  </p>
                </div>
              </div>

              {/* Summary Statement */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ringkasan Pedagogis Elemen:</span>
                </h4>
                <p className="text-xs text-blue-950 leading-relaxed">
                  {elementAnalyses[selectedElementIdx].summary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Analisis Keseluruhan & Keterkaitan Antarelemen */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Rangkuman Ketercakupan Kurikulum */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Gambaran Ketercakupan CP Keseluruhan Mata Pelajaran</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {analysis.curriculumCoverageSummary ||
                'Analisis CP mencakup seluruh elemen yang telah dimasukkan, mengintegrasikan kompetensi dasar ke tingkat penerapan komprehensif.'}
            </p>
          </div>

          {/* Hubungan & Prasyarat Antarelemen */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <span>Hubungan, Prasyarat, &amp; Sinergi Antarelemen</span>
            </h3>
            <p className="text-xs text-slate-500">
              Menjelaskan keterkaitan logis antarelemen sehingga alur pembelajaran tidak terkotak-kotak, melainkan berkesinambungan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {crossRelations.length > 0 ? (
                crossRelations.map((rel, idx) => {
                  const badgeColor =
                    rel.relationType === 'prerequisite'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : rel.relationType === 'reinforcement'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  const badgeLabel =
                    rel.relationType === 'prerequisite'
                      ? 'Prasyarat Pedagogis'
                      : rel.relationType === 'reinforcement'
                      ? 'Penguatan Konsep'
                      : 'Integrasi Terpadu';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                          <span className="text-blue-700">{rel.sourceElement}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-indigo-700">{rel.targetElement}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rel.description}</p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-6 text-xs text-slate-400">
                  Tidak ditemukan hubungan prasyarat kaku antar elemen; elemen dapat diajarkan secara paralel atau tematik.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA to next step */}
      <div className="flex items-center justify-end pt-3 border-t border-slate-200">
        <button
          onClick={onGenerateTp}
          disabled={isGeneratingTp}
          className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingTp ? 'Sedang Merumuskan TP...' : 'Lanjutkan ke Generator Tujuan Pembelajaran (TP) →'}</span>
        </button>
      </div>
    </div>
  );
};
