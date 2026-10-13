import React, { useState, useEffect } from 'react';
import {
  SchoolIdentity,
  LearningIdentity,
  CpElement,
  AnalysisResult,
  LearningObjective,
  AtpResult,
  TraceabilityResult,
  ProtaPromesResult,
  FullDocumentState,
} from './types/curriculum';
import { CURRICULUM_PRESETS, CurriculumPreset } from './data/curriculumPresets';
import { exportToDocx, exportToXlsx, copyTableToClipboard } from './utils/exportEngine';
import { generateFullProtaPromes } from './utils/protaPromesGenerator';

import { Header } from './components/Header';
import { IdentityForm } from './components/IdentityForm';
import { ElementsCpManager } from './components/ElementsCpManager';
import { CpAnalysisView } from './components/CpAnalysisView';
import { TpGeneratorView } from './components/TpGeneratorView';
import { AtpGeneratorView } from './components/AtpGeneratorView';
import { ProtaPromesView } from './components/ProtaPromesView';
import { TraceabilityMatrixView } from './components/TraceabilityMatrixView';
import { ExportView } from './components/ExportView';
import { AlertCircle, Loader2, Sparkles, CheckCircle2, Zap } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'smart_tp_atp_draft_v1';

export default function App() {
  // 1. Initial State with an official default preset (PAI & Budi Pekerti SMP Fase D)
  const defaultPreset = CURRICULUM_PRESETS[0];

  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity>({
    schoolName: 'SMP Negeri 1 Indonesia',
    npsnNsm: '20108920',
    teacherName: 'Ahmad Syafi\'i, S.Pd.I.',
    academicYear: '2025/2026',
    curriculum: 'Kurikulum Merdeka (Kep BSKAP 046/2025)',
    principalName: 'Dra. Hj. Nurul Hidayah, M.Pd.',
    nipTeacher: '19870412 201101 1 007',
  });

  const [learningIdentity, setLearningIdentity] = useState<LearningIdentity>({
    jenjang: defaultPreset.jenjang,
    grade: defaultPreset.grade,
    fase: defaultPreset.fase,
    subjectName: defaultPreset.subjectName,
    vocationalProgram: defaultPreset.vocationalProgram,
    targetSemester: defaultPreset.targetSemester,
    effectiveWeeksPerSemester: defaultPreset.effectiveWeeks,
    jpPerWeek: defaultPreset.jpPerWeek,
    minutesPerJp: defaultPreset.minutesPerJp,
  });

  const [elements, setElements] = useState<CpElement[]>(defaultPreset.elements);
  const [analysis, setAnalysis] = useState<AnalysisResult | undefined>();
  const [tpList, setTpList] = useState<LearningObjective[]>([]);
  const [atpResult, setAtpResult] = useState<AtpResult | undefined>();
  const [protaPromesResult, setProtaPromesResult] = useState<ProtaPromesResult | undefined>();
  const [isAtpApproved, setIsAtpApproved] = useState<boolean>(false);
  const [traceability, setTraceability] = useState<TraceabilityResult | undefined>();
  const [teacherNotes, setTeacherNotes] = useState<string>('');

  // UI Navigation & Loading states
  const [currentTab, setCurrentTab] = useState<string>('identity');
  const [engineMode, setEngineMode] = useState<'ai' | 'pedagogical'>('ai');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingTp, setIsGeneratingTp] = useState<boolean>(false);
  const [isGeneratingAtp, setIsGeneratingAtp] = useState<boolean>(false);
  const [isValidatingTraceability, setIsValidatingTraceability] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);

  const isPaibp =
    ((learningIdentity.subjectName || '').toLowerCase().includes('pai') ||
      (learningIdentity.subjectName || '').toLowerCase().includes('agama islam') ||
      (learningIdentity.subjectName || '').toLowerCase().includes('paibp') ||
      elements.some((e: any) => /qur'?an|hadis|akidah|akhlak|fikih/i.test(e.elementName))) &&
    (learningIdentity.fase === 'Fase D' || learningIdentity.jenjang === 'SMP_MTS');

  // Check draft existence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) setHasDraft(true);
    } catch {
      // ignore
    }
  }, []);

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const fullDraft: FullDocumentState = {
        schoolIdentity,
        learningIdentity,
        elements,
        analysis,
        tpList,
        atpResult,
        traceability,
        protaPromes: protaPromesResult,
        teacherNotes,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fullDraft));
      setHasDraft(true);
      alert('Draf berhasil disimpan di peramban Anda!');
    } catch (e: any) {
      alert('Gagal menyimpan draf: ' + e?.message);
    }
  };

  // Load Draft from LocalStorage
  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      const draft: FullDocumentState = JSON.parse(saved);
      if (draft.schoolIdentity) setSchoolIdentity(draft.schoolIdentity);
      if (draft.learningIdentity) setLearningIdentity(draft.learningIdentity);
      if (draft.elements) setElements(draft.elements);
      if (draft.analysis) setAnalysis(draft.analysis);
      if (draft.tpList) setTpList(draft.tpList);
      if (draft.atpResult) setAtpResult(draft.atpResult);
      if (draft.protaPromes) {
        setProtaPromesResult(draft.protaPromes);
        setIsAtpApproved(draft.protaPromes.isApproved);
      }
      if (draft.traceability) setTraceability(draft.traceability);
      if (draft.teacherNotes) setTeacherNotes(draft.teacherNotes);
      alert('Draf berhasil dimuat kembali!');
    } catch (e: any) {
      alert('Gagal memuat draf: ' + e?.message);
    }
  };

  // Load an official preset
  const handleLoadPreset = (preset: CurriculumPreset) => {
    setLearningIdentity((prev) => ({
      ...prev,
      jenjang: preset.jenjang,
      grade: preset.grade,
      fase: preset.fase,
      subjectName: preset.subjectName,
      vocationalProgram: preset.vocationalProgram,
      jpPerWeek: preset.jpPerWeek,
      minutesPerJp: preset.minutesPerJp,
      effectiveWeeksPerSemester: preset.effectiveWeeks,
      targetSemester: preset.targetSemester,
    }));
    setElements(preset.elements);
    // Reset downstream AI results to prevent stale data
    setAnalysis(undefined);
    setTpList([]);
    setAtpResult(undefined);
    setProtaPromesResult(undefined);
    setIsAtpApproved(false);
    setTraceability(undefined);
    setCurrentTab('identity');
  };

  // 4. Approve ATP & Generate Prota & Promes
  const handleApproveAndGenerateProtaPromes = () => {
    const list = atpResult?.atpList || [];
    if (list.length === 0) {
      setErrorMsg('Alur Tujuan Pembelajaran (ATP) belum tersedia untuk disetujui.');
      return;
    }

    setIsAtpApproved(true);
    const result = generateFullProtaPromes(list, learningIdentity, schoolIdentity, true);
    setProtaPromesResult(result);
    setCurrentTab('prota_promes');
  };

  // Re-sync Prota & Promes if ATP was updated
  const handleResyncProtaPromes = () => {
    const list = atpResult?.atpList || [];
    if (list.length === 0) return;
    const result = generateFullProtaPromes(list, learningIdentity, schoolIdentity, true);
    setProtaPromesResult(result);
  };

  // Reset all
  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data kembali ke template awal?')) {
      handleLoadPreset(CURRICULUM_PRESETS[0]);
    }
  };

  // 1. Analyze All CP Elements via Backend
  const handleAnalyzeAll = async () => {
    const emptyElems = elements.filter((el) => !el.cpText.trim());
    if (emptyElems.length > 0) {
      setErrorMsg(`Ada ${emptyElems.length} elemen yang teks CP-nya masih kosong.`);
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze-cp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolIdentity,
          learningIdentity,
          elements,
          forcePedagogical: engineMode === 'pedagogical',
        }),
      });

      const data = await res.json();
      if (!res.ok && !data?.tpList && !data?.elementAnalyses) {
        throw new Error(data?.error || 'Gagal melakukan analisis CP.');
      }

      if (data.quotaNotice) setQuotaNotice(data.quotaNotice);
      setAnalysis(data);
      setCurrentTab('analysis');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat melakukan analisis CP.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze single element
  const handleAnalyzeSingle = async (el: CpElement) => {
    if (!el.cpText.trim()) {
      alert('Teks CP elemen ini masih kosong.');
      return;
    }
    setErrorMsg(null);
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-cp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolIdentity,
          learningIdentity,
          elements: [el],
          forcePedagogical: engineMode === 'pedagogical',
        }),
      });

      const data = await res.json();
      if (!res.ok && !data?.elementAnalyses) {
        throw new Error(data?.error || 'Gagal menganalisis elemen ini.');
      }

      if (data.quotaNotice) setQuotaNotice(data.quotaNotice);
      setAnalysis(data);
      setCurrentTab('analysis');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat menganalisis elemen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Generate TP via Backend
  const handleGenerateTp = async () => {
    setErrorMsg(null);
    setIsGeneratingTp(true);

    try {
      const res = await fetch('/api/generate-tp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolIdentity,
          learningIdentity,
          elements,
          analysis,
          forcePedagogical: engineMode === 'pedagogical',
        }),
      });

      const data = await res.json();
      if (!res.ok && !data?.tpList) {
        throw new Error(data?.error || 'Gagal merumuskan Tujuan Pembelajaran (TP).');
      }

      if (data.quotaNotice) setQuotaNotice(data.quotaNotice);
      setTpList(data.tpList || []);
      setCurrentTab('tp');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat menghasilkan TP.');
    } finally {
      setIsGeneratingTp(false);
    }
  };

  // 3. Generate ATP Terpadu via Backend
  const handleGenerateAtp = async () => {
    if (!tpList || tpList.length === 0) {
      setErrorMsg('Daftar TP belum tersedia untuk menyusun ATP.');
      return;
    }

    setErrorMsg(null);
    setIsGeneratingAtp(true);

    try {
      const res = await fetch('/api/generate-atp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolIdentity,
          learningIdentity,
          tpList,
          elements,
          analysis,
          forcePedagogical: engineMode === 'pedagogical',
        }),
      });

      const data = await res.json();
      if (!res.ok && !data?.atpList) {
        throw new Error(data?.error || 'Gagal menyusun Alur Tujuan Pembelajaran (ATP).');
      }

      if (data.quotaNotice) setQuotaNotice(data.quotaNotice);
      setAtpResult(data);
      setCurrentTab('atp');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat menyusun ATP.');
    } finally {
      setIsGeneratingAtp(false);
    }
  };

  // 4. Validate Traceability Matrix via Backend
  const handleValidateTraceability = async () => {
    setErrorMsg(null);
    setIsValidatingTraceability(true);

    try {
      const res = await fetch('/api/validate-traceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolIdentity,
          learningIdentity,
          elements,
          tpList,
          atpList: atpResult?.atpList || [],
          forcePedagogical: engineMode === 'pedagogical',
        }),
      });

      const data = await res.json();
      if (!res.ok && !data?.traceability) {
        throw new Error(data?.error || 'Gagal mengaudit keterlacakan CP-TP-ATP.');
      }

      if (data.quotaNotice) setQuotaNotice(data.quotaNotice);
      setTraceability(data);
      setCurrentTab('traceability');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat memvalidasi keterlacakan.');
    } finally {
      setIsValidatingTraceability(false);
    }
  };

  // Current document state bundle
  const currentDocState: FullDocumentState = {
    schoolIdentity,
    learningIdentity,
    elements,
    analysis,
    tpList,
    atpResult,
    traceability,
    protaPromes: protaPromesResult,
    teacherNotes,
  };

  // Export handlers
  const handleExportDocx = () => exportToDocx(currentDocState);
  const handleExportXlsx = () => exportToXlsx(currentDocState);
  const handlePrint = () => window.print();
  const handleCopyTable = () => copyTableToClipboard(tpList);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Header with Navigation & Export Toolbar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onReset={handleReset}
        onExportDocx={handleExportDocx}
        onExportXlsx={handleExportXlsx}
        onPrint={handlePrint}
        onCopyTable={handleCopyTable}
        hasTp={tpList.length > 0}
        hasAtp={Boolean(atpResult?.atpList?.length)}
        hasAnalysis={Boolean(analysis?.elementAnalyses?.length)}
        hasProtaPromes={Boolean(protaPromesResult?.protaList?.length)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Engine Mode & Curriculum Rules Bar */}
        <div className="mb-5 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-slate-700">Pilihan Mesin Generator:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
              <button
                type="button"
                onClick={() => setEngineMode('ai')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  engineMode === 'ai'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🤖 AI Gemini (Auto-Fallback)
              </button>
              <button
                type="button"
                onClick={() => setEngineMode('pedagogical')}
                className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                  engineMode === 'pedagogical'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Mesin Kurikulum Mandiri (Bebas Batas Kuota & Cepat)
              </button>
            </div>
          </div>

          {isPaibp && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Standar PAIBP Fase D:</strong> 5 Elemen (Al-Qur'an & Hadis, Akidah, Akhlak, Fikih, SPI) disebar lengkap di tiap Semester (Kelas VII, VIII, IX = 30 TP).
              </span>
            </div>
          )}
        </div>
        {/* Quota fallback info banner */}
        {quotaNotice && (
          <div className="mb-5 p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start space-x-3 text-xs text-sky-950 shadow-xs">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Mode Analisis Kurikulum Mandiri Kemendikdasmen Aktif:</p>
              <p className="mt-0.5 leading-relaxed text-sky-900">{quotaNotice}</p>
            </div>
            <button
              onClick={() => setQuotaNotice(null)}
              className="text-sky-500 hover:text-sky-700 font-bold px-1 text-sm cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-xs text-red-900 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Informasi Sistem:</p>
              <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-700 font-bold px-1 text-sm cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Global Loading Overlay */}
        {(isAnalyzing || isGeneratingTp || isGeneratingAtp || isValidatingTraceability) && (
          <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {isAnalyzing && 'Menganalisis CP Multi-Elemen untuk Seluruh Fase...'}
                  {isGeneratingTp && `Merumuskan TP Seluruh Fase ${learningIdentity.fase} (Semua Tahun & Semester)...`}
                  {isGeneratingAtp && `Menyusun Alur ATP Terpadu Seluruh Semester dengan Penomoran...`}
                  {isValidatingTraceability && 'Mengaudit Peta Keterlacakan CP-TP-ATP Seluruh Fase...'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Menerapkan kaidah Panduan Pembelajaran dan Asesmen Revisi 2025 Kemendikdasmen (Kep BSKAP 046/2025).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: IDENTITAS & ELEMEN CP */}
        {currentTab === 'identity' && (
          <div className="space-y-6">
            <IdentityForm
              schoolIdentity={schoolIdentity}
              setSchoolIdentity={setSchoolIdentity}
              learningIdentity={learningIdentity}
              setLearningIdentity={setLearningIdentity}
              onLoadPreset={handleLoadPreset}
            />

            <ElementsCpManager
              elements={elements}
              setElements={setElements}
              onAnalyzeAll={handleAnalyzeAll}
              onAnalyzeSingle={handleAnalyzeSingle}
              isAnalyzing={isAnalyzing}
              onSaveDraft={handleSaveDraft}
              onLoadDraft={handleLoadDraft}
              hasDraft={hasDraft}
            />
          </div>
        )}

        {/* TAB 2: ANALISIS CP */}
        {currentTab === 'analysis' && analysis && (
          <CpAnalysisView
            analysis={analysis}
            learningIdentity={learningIdentity}
            onGenerateTp={handleGenerateTp}
            isGeneratingTp={isGeneratingTp}
            onReanalyze={handleAnalyzeAll}
          />
        )}

        {/* TAB 3: TUJUAN PEMBELAJARAN (TP) */}
        {currentTab === 'tp' && (
          <TpGeneratorView
            tpList={tpList}
            setTpList={setTpList}
            elements={elements}
            learningIdentity={learningIdentity}
            onGenerateAtp={handleGenerateAtp}
            isGeneratingAtp={isGeneratingAtp}
            onRegenerateAllTp={handleGenerateTp}
            isRegeneratingTp={isGeneratingTp}
          />
        )}

        {/* TAB 4: ALUR TUJUAN PEMBELAJARAN (ATP) */}
        {currentTab === 'atp' && atpResult && (
          <AtpGeneratorView
            atpResult={atpResult}
            setAtpResult={setAtpResult}
            learningIdentity={learningIdentity}
            onValidateTraceability={handleValidateTraceability}
            isValidatingTraceability={isValidatingTraceability}
            onRegenerateAtp={handleGenerateAtp}
            isRegeneratingAtp={isGeneratingAtp}
            onApproveAndGenerateProtaPromes={handleApproveAndGenerateProtaPromes}
            isAtpApproved={isAtpApproved}
          />
        )}

        {/* TAB 5: PROGRAM TAHUNAN & SEMESTER (PROTA & PROMES) */}
        {currentTab === 'prota_promes' && protaPromesResult && (
          <ProtaPromesView
            protaPromes={protaPromesResult}
            setProtaPromes={setProtaPromesResult}
            learningIdentity={learningIdentity}
            schoolIdentity={schoolIdentity}
            onGoToTraceability={() => setCurrentTab('traceability')}
            onGoToExport={() => setCurrentTab('export')}
            onResyncFromAtp={handleResyncProtaPromes}
          />
        )}

        {/* TAB 5: PETA KETERLACAKAN (TRACEABILITY MATRIX) */}
        {currentTab === 'traceability' && (
          <TraceabilityMatrixView
            traceabilityResult={traceability}
            elements={elements}
            tpList={tpList}
            atpList={atpResult?.atpList || []}
            onRevalidate={handleValidateTraceability}
            isValidating={isValidatingTraceability}
            onGoToExport={() => setCurrentTab('export')}
          />
        )}

        {/* TAB 6: PRATINJAU & EKSPOR */}
        {currentTab === 'export' && (
          <ExportView
            documentState={currentDocState}
            setTeacherNotes={setTeacherNotes}
            onExportDocx={handleExportDocx}
            onExportXlsx={handleExportXlsx}
            onPrint={handlePrint}
            onCopyTable={handleCopyTable}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            SMART TP &amp; ATP GENERATOR MULTIJENJANG • Sesuai Standar Resmi Kemendikdasmen (PPA Revisi 2025, Kepka BKPDM 020/2026 &amp; Kepka BSKAP 046/2025)
          </p>
          <p className="text-[11px] text-slate-400">
            Didesain untuk Guru TK/PAUD, SD/MI, SMP/MTs, SMA/MA, dan SMK/MAK
          </p>
        </div>
      </footer>
    </div>
  );
}
