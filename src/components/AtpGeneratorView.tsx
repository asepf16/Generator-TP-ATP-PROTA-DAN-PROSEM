import React, { useState } from 'react';
import { AtpResult, AtpItem, LearningIdentity } from '../types/curriculum';
import { getPhaseDetails } from '../data/curriculumPresets';
import {
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Calendar,
  RotateCcw,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Edit2,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface AtpGeneratorViewProps {
  atpResult: AtpResult;
  setAtpResult: React.Dispatch<React.SetStateAction<AtpResult | undefined>>;
  learningIdentity: LearningIdentity;
  onValidateTraceability: () => void;
  isValidatingTraceability: boolean;
  onRegenerateAtp: () => void;
  isRegeneratingAtp: boolean;
  onApproveAndGenerateProtaPromes?: () => void;
  isAtpApproved?: boolean;
}

export const AtpGeneratorView: React.FC<AtpGeneratorViewProps> = ({
  atpResult,
  setAtpResult,
  learningIdentity,
  onValidateTraceability,
  isValidatingTraceability,
  onRegenerateAtp,
  isRegeneratingAtp,
  onApproveAndGenerateProtaPromes,
  isAtpApproved = false,
}) => {
  const [viewMode, setViewMode] = useState<'integrated' | 'by_semester' | 'by_element'>('integrated');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<AtpItem | null>(null);

  const phaseDetails = getPhaseDetails(learningIdentity.fase, learningIdentity.yearsOfStudy === 4);
  const atpList = atpResult?.atpList || [];

  // Move ATP Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...atpList];
    const temp = newList[index - 1];
    newList[index - 1] = newList[index];
    newList[index] = temp;
    newList.forEach((item, i) => {
      item.order = i + 1;
    });
    setAtpResult((prev) => (prev ? { ...prev, atpList: newList } : undefined));
  };

  // Move ATP Down
  const handleMoveDown = (index: number) => {
    if (index === atpList.length - 1) return;
    const newList = [...atpList];
    const temp = newList[index + 1];
    newList[index + 1] = newList[index];
    newList[index] = temp;
    newList.forEach((item, i) => {
      item.order = i + 1;
    });
    setAtpResult((prev) => (prev ? { ...prev, atpList: newList } : undefined));
  };

  // Save Edit
  const handleSaveEdit = (updated: AtpItem) => {
    const newList = atpList.map((item) => (item.tpId === updated.tpId ? updated : item));
    setAtpResult((prev) => (prev ? { ...prev, atpList: newList } : undefined));
    setEditingItem(null);
  };

  const totalAllocatedJp = atpList.reduce((acc, curr) => acc + (Number(curr.allocatedJp) || 0), 0);

  // Groupings
  const groupedBySemester = atpList.reduce((acc, item) => {
    const key = `${item.grade || 'Kelas'} - Sem ${item.semester || 1}`;
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, AtpItem[]>);

  const groupedByElement = atpList.reduce((acc, item) => {
    acc[item.elementName] = acc[item.elementName] || [];
    acc[item.elementName].push(item);
    return acc;
  }, {} as Record<string, AtpItem[]>);

  // Filtered by semester if selected
  const displayedList = atpList.filter((item) => {
    if (selectedSemesterFilter === 'all') return true;
    const key = `${item.grade || 'Kelas'} - Sem ${item.semester || 1}`;
    return key === selectedSemesterFilter;
  });

  return (
    <div className="space-y-5">
      {/* View Header */}
      {/* Approval Status Card */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
        isAtpApproved
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : 'bg-amber-50/80 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-start space-x-2.5">
          <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isAtpApproved ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div>
            <p className="font-bold">
              {isAtpApproved
                ? 'Alur Tujuan Pembelajaran (ATP) Telah Disetujui ✓'
                : 'Persetujuan Alur Tujuan Pembelajaran (ATP):'}
            </p>
            <p className="text-slate-600 mt-0.5">
              {isAtpApproved
                ? 'ATP ini telah disepakati dan siap ditransformasikan ke Program Tahunan (Prota) dan Program Semester (Promes).'
                : 'Setelah Anda memeriksa urutan dan alokasi JP per semester, setujui ATP untuk menyusun Program Tahunan (Prota) & Program Semester (Promes) sesuai Kalender Pendidikan.'}
            </p>
          </div>
        </div>

        {onApproveAndGenerateProtaPromes && (
          <button
            onClick={onApproveAndGenerateProtaPromes}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-bold shadow-xs whitespace-nowrap transition-all cursor-pointer ${
              isAtpApproved
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isAtpApproved ? 'Buka Prota & Promes →' : 'Setujui & Susun Prota / Promes →'}</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Alur Tujuan Pembelajaran (ATP) Terpadu Satu Fase
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              {phaseDetails.durationYears} Tahun / {phaseDetails.totalSemesters} Semester
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Alur berkesinambungan mencakup seluruh tahun dan semester fase ini, dilengkapi penomoran alur fase dan penomoran semester (e.g. Alur 1.1, 1.2, 2.1...).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRegenerateAtp}
            disabled={isRegeneratingAtp}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
            title="Susun ulang alur tanpa menghapus TP"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{isRegeneratingAtp ? 'Menyusun Ulang...' : 'Susun Ulang Alur'}</span>
          </button>

          {onApproveAndGenerateProtaPromes && (
            <button
              onClick={onApproveAndGenerateProtaPromes}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Susun Prota-Promes</span>
            </button>
          )}

          <button
            onClick={onValidateTraceability}
            disabled={isValidatingTraceability}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{isValidatingTraceability ? 'Mengaudit...' : 'Audit Keterlacakan'}</span>
          </button>
        </div>
      </div>

      {/* Pedagogical Flow Summary Card */}
      {atpResult?.pedagogicalFlowSummary && (
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-sky-50/80 border border-blue-200 rounded-xl p-4 shadow-xs space-y-1.5 text-xs">
          <div className="flex items-center space-x-2 text-blue-900 font-bold">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Rasional Pedagogis Alur Pembelajaran Fase {learningIdentity.fase} ({phaseDetails.durationYears} Tahun):</span>
          </div>
          <p className="text-blue-950 leading-relaxed text-justify">
            {atpResult.pedagogicalFlowSummary}
          </p>
        </div>
      )}

      {/* View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-100 rounded-xl">
        <div className="flex space-x-1">
          <button
            onClick={() => setViewMode('integrated')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'integrated'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            ★ ATP Terpadu Seluruh Fase (Tampilan Utama)
          </button>

          <button
            onClick={() => setViewMode('by_semester')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'by_semester'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            ATP Berdasarkan Semester &amp; Kelas
          </button>

          <button
            onClick={() => setViewMode('by_element')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'by_element'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            ATP Berdasarkan Elemen CP
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium px-2">
          Total Alokasi ATP: <strong>{totalAllocatedJp} JP</strong>
        </span>
      </div>

      {/* VIEW 1: ATP TERPADU SELURUH FASE (UTAMA) */}
      {viewMode === 'integrated' && (
        <div className="space-y-3">
          {/* Semester quick filter */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold">Filter Semester:</span>
            <select
              value={selectedSemesterFilter}
              onChange={(e) => setSelectedSemesterFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
            >
              <option value="all">Tampilkan Semua Semester ({atpList.length} Alur)</option>
              {Object.keys(groupedBySemester).map((semKey) => (
                <option key={semKey} value={semKey}>
                  {semKey} ({groupedBySemester[semKey]?.length} Alur)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 w-14 text-center">Urutan Fase</th>
                  <th className="py-3 px-3 w-16 text-center">Alur Sem.</th>
                  <th className="py-3 px-3 w-28">Kode TP</th>
                  <th className="py-3 px-3 w-28">Tahun / Kelas</th>
                  <th className="py-3 px-3 w-20 text-center">Semester</th>
                  <th className="py-3 px-3 w-32">Nama Elemen</th>
                  <th className="py-3 px-4 min-w-[240px]">Tujuan Pembelajaran (TP)</th>
                  <th className="py-3 px-3 min-w-[150px]">Konsep &amp; Prasyarat</th>
                  <th className="py-3 px-3 w-16 text-center">Waktu</th>
                  <th className="py-3 px-4 min-w-[200px]">Bukti Ketercapaian (IKTP)</th>
                  <th className="py-3 px-3 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedList.map((atp, index) => (
                  <tr key={atp.tpId || index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                        {atp.order}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-sm text-[11px]">
                        {atp.semesterOrder || `${atp.semester}.${(index % 4) + 1}`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                        {atp.tpCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{atp.grade}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        Sem {atp.semester}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{atp.elementName}</td>
                    <td className="py-3 px-4 text-slate-800 leading-relaxed">
                      <p className="font-medium text-slate-900">{atp.tpStatement}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-700 space-y-0.5 text-[11px]">
                      <p>
                        <strong>Konsep:</strong> {atp.coreConcept}
                      </p>
                      {atp.prerequisites && (
                        <p className="text-slate-500">
                          <strong>Prasyarat:</strong> {atp.prerequisites}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{atp.allocatedJp} JP</td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed">
                      <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 text-[11px]">
                        {atp.evidenceOfAttainment}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded-md disabled:opacity-20"
                          title="Naikkan Urutan"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === atpList.length - 1}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded-md disabled:opacity-20"
                          title="Turunkan Urutan"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingItem(atp)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit ATP"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: ATP BERDASARKAN SEMESTER & KELAS */}
      {viewMode === 'by_semester' && (
        <div className="space-y-6">
          {Object.entries(groupedBySemester).map(([semLabel, items]) => (
            <div key={semLabel} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">{semLabel}</h3>
                </div>
                <span className="text-xs text-slate-600 font-semibold bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {items.length} TP • Total {items.reduce((a, b) => a + (Number(b.allocatedJp) || 0), 0)} JP
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((it) => (
                  <div key={it.tpId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm font-mono">
                          Alur Sem: {it.semesterOrder || '-'} (Fase #{it.order})
                        </span>
                        <span className="font-mono text-slate-600 font-semibold">{it.tpCode}</span>
                        <span className="text-slate-700 font-bold">• {it.elementName}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">
                          {it.allocatedJp} JP
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 leading-relaxed">{it.tpStatement}</p>
                      <p className="text-[11px] text-slate-600">
                        <strong>Konsep Inti:</strong> {it.coreConcept} | <strong>Prasyarat:</strong>{' '}
                        {it.prerequisites || '-'}
                      </p>
                    </div>

                    <div className="md:w-72 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-950">
                      <strong>Bukti Ketercapaian:</strong> {it.evidenceOfAttainment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: ATP BERDASARKAN ELEMEN CP */}
      {viewMode === 'by_element' && (
        <div className="space-y-6">
          {Object.entries(groupedByElement).map(([elemName, items]) => (
            <div key={elemName} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Elemen: {elemName}</h3>
                <span className="text-xs text-slate-500">
                  {items.length} TP • {items.reduce((a, b) => a + (Number(b.allocatedJp) || 0), 0)} JP
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((it) => (
                  <div key={it.tpId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm font-mono">
                          Alur #{it.order} ({it.tpCode})
                        </span>
                        <span className="text-slate-700 font-medium">
                          {it.grade} - Sem {it.semester}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">{it.tpStatement}</p>
                      <p className="text-[11px] text-slate-600">
                        <strong>Konsep:</strong> {it.coreConcept} | <strong>Prasyarat:</strong> {it.prerequisites || '-'}
                      </p>
                    </div>

                    <div className="md:w-72 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-950">
                      <strong>Bukti Ketercapaian:</strong> {it.evidenceOfAttainment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit ATP Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Langkah Alur Pembelajaran ({editingItem.tpCode})
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Alur Semester (e.g. 1.1)</label>
                  <input
                    type="text"
                    value={editingItem.semesterOrder || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, semesterOrder: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <input
                    type="text"
                    value={editingItem.grade}
                    onChange={(e) => setEditingItem({ ...editingItem, grade: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rumusan TP</label>
                <textarea
                  rows={2}
                  value={editingItem.tpStatement}
                  onChange={(e) => setEditingItem({ ...editingItem, tpStatement: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Konsep / Materi Inti</label>
                  <input
                    type="text"
                    value={editingItem.coreConcept}
                    onChange={(e) => setEditingItem({ ...editingItem, coreConcept: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prasyarat / Keterkaitan</label>
                  <input
                    type="text"
                    value={editingItem.prerequisites}
                    onChange={(e) => setEditingItem({ ...editingItem, prerequisites: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editingItem.semester}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, semester: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value={1}>Semester 1 (Ganjil)</option>
                    <option value={2}>Semester 2 (Genap)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alokasi Waktu (JP)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editingItem.allocatedJp}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, allocatedJp: Number(e.target.value) || 2 })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bukti Ketercapaian yang Disarankan (IKTP)
                </label>
                <textarea
                  rows={3}
                  value={editingItem.evidenceOfAttainment}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, evidenceOfAttainment: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveEdit(editingItem)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA to next step */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onValidateTraceability}
          disabled={isValidatingTraceability}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{isValidatingTraceability ? 'Mengaudit...' : 'Audit Peta Keterlacakan (CP-TP-ATP)'}</span>
        </button>

        {onApproveAndGenerateProtaPromes && (
          <button
            onClick={onApproveAndGenerateProtaPromes}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isAtpApproved
                ? 'Buka Program Tahunan & Semester (Prota & Promes) →'
                : 'Setujui ATP & Susun Program Tahunan / Semester (Prota & Promes) →'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
