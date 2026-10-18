import React, { useState } from 'react';
import { LearningObjective, LearningIdentity, CpElement } from '../types/curriculum';
import { calculateTimeDistribution } from '../utils/exportEngine';
import { getPhaseDetails } from '../data/curriculumPresets';
import { apiRegenerateTpItem } from '../services/curriculumApi';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  Filter,
  Check,
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface TpGeneratorViewProps {
  tpList: LearningObjective[];
  setTpList: React.Dispatch<React.SetStateAction<LearningObjective[]>>;
  elements: CpElement[];
  learningIdentity: LearningIdentity;
  onGenerateAtp: () => void;
  isGeneratingAtp: boolean;
  onRegenerateAllTp: () => void;
  isRegeneratingTp: boolean;
}

export const TpGeneratorView: React.FC<TpGeneratorViewProps> = ({
  tpList,
  setTpList,
  elements,
  learningIdentity,
  onGenerateAtp,
  isGeneratingAtp,
  onRegenerateAllTp,
  isRegeneratingTp,
}) => {
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [filterElement, setFilterElement] = useState<string>('all');
  const [editingTp, setEditingTp] = useState<LearningObjective | null>(null);
  const [aiRegenModalTp, setAiRegenModalTp] = useState<LearningObjective | null>(null);
  const [regenInstruction, setRegenInstruction] = useState<string>('');
  const [isRegeneratingSingle, setIsRegeneratingSingle] = useState<boolean>(false);

  const phaseDetails = getPhaseDetails(learningIdentity.fase, learningIdentity.yearsOfStudy === 4);
  const timeCalc = calculateTimeDistribution(learningIdentity, tpList);

  // Filtered TP list
  const filteredList = tpList.filter((tp) => {
    if (filterGrade !== 'all' && tp.suggestedGrade !== filterGrade) return false;
    if (filterSemester !== 'all' && String(tp.suggestedSemester) !== filterSemester) return false;
    if (filterElement !== 'all' && tp.elementName !== filterElement) return false;
    return true;
  });

  // Unique lists for filters
  const gradesList = Array.from(new Set(tpList.map((t) => t.suggestedGrade).filter(Boolean)));
  const elementNames = Array.from(new Set(tpList.map((t) => t.elementName)));

  // Add new TP manually
  const handleAddNewTp = () => {
    const defaultGrade = phaseDetails.grades[0]?.gradeName || 'Kelas';
    const gradeCode = phaseDetails.grades[0]?.gradeCode || '1';
    const nextNum = tpList.filter((t) => t.suggestedGrade === defaultGrade && t.suggestedSemester === 1).length + 1;
    const newCode = `TP-${gradeCode}.1.${String(nextNum).padStart(2, '0')}`;

    const newTp: LearningObjective = {
      id: `tp-${Date.now()}`,
      code: newCode,
      elementId: elements[0]?.id || 'elem-1',
      elementName: elements[0]?.elementName || 'Elemen',
      sourceCpExcerpt: elements[0]?.cpText?.slice(0, 80) || '',
      tpStatement: 'Peserta didik mampu...',
      competency: 'Mengidentifikasi dan menerapkan',
      contentScope: 'Materi pokok...',
      depthLevel: 'Menengah',
      suggestedGrade: defaultGrade,
      suggestedSemester: 1,
      globalSemester: 1,
      recommendedJp: 4,
    };

    setTpList([...tpList, newTp]);
    setEditingTp(newTp);
  };

  // Delete TP
  const handleDeleteTp = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus TP ini?')) {
      setTpList(tpList.filter((t) => t.id !== id));
    }
  };

  // Save edited TP
  const handleSaveEdit = (updated: LearningObjective) => {
    setTpList(tpList.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTp(null);
  };

  // AI Single TP Regeneration
  const handleRegenerateSingleAi = async () => {
    if (!aiRegenModalTp) return;
    setIsRegeneratingSingle(true);
    try {
      const sourceElement = elements.find((e) => e.elementName === aiRegenModalTp.elementName);
      const updated = await apiRegenerateTpItem({
        tpItem: aiRegenModalTp,
        elementCpText: sourceElement?.cpText || '',
        instruction: regenInstruction,
      });

      setTpList(tpList.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
      setAiRegenModalTp(null);
      setRegenInstruction('');
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui TP');
    } finally {
      setIsRegeneratingSingle(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Tujuan Pembelajaran (TP) Satu Fase Penuh
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              {learningIdentity.fase} ({phaseDetails.durationYears} Tahun / {phaseDetails.totalSemesters} Semester)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              {tpList.length} TP Terumuskan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diturunkan dan dipetakan secara sistematis ke setiap tahun ({phaseDetails.grades.map((g) => g.gradeName).join(', ')}) dan semester dengan penomoran unik (TP-Kelas.Sem.No).
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleAddNewTp}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Tambah TP Manual</span>
          </button>

          <button
            onClick={onRegenerateAllTp}
            disabled={isRegeneratingTp}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
            title="Rumuskan ulang seluruh TP satu fase dengan AI"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{isRegeneratingTp ? 'Memproses Seluruh Fase...' : 'Rumuskan Ulang Seluruh Fase'}</span>
          </button>

          <button
            onClick={onGenerateAtp}
            disabled={isGeneratingAtp || tpList.length === 0}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingAtp ? 'Menyusun Alur...' : 'Lanjut: Susun ATP Terpadu (AI) →'}</span>
          </button>
        </div>
      </div>

      {/* Time Allocation Tracker for Full Phase */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
          timeCalc.isOverAllocated
            ? 'bg-red-50 border-red-200 text-red-900'
            : timeCalc.remainingJp === 0
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}
      >
        <div className="flex items-start space-x-3">
          <Clock
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              timeCalc.isOverAllocated
                ? 'text-red-600'
                : timeCalc.remainingJp === 0
                ? 'text-emerald-600'
                : 'text-blue-600'
            }`}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">Alokasi Waktu Satu Fase Penuh ({phaseDetails.totalSemesters} Semester):</span>
              <span className="font-mono font-bold">
                {timeCalc.allocatedJp} / {timeCalc.totalAvailableJp} JP ({timeCalc.allocatedMinutes} /{' '}
                {timeCalc.totalAvailableMinutes} Menit)
              </span>
            </div>
            <p className="mt-0.5 text-slate-600">
              {timeCalc.isOverAllocated ? (
                <span className="text-red-700 font-semibold">
                  Alokasi waktu TP melebihi kapasitas fase sebesar {Math.abs(timeCalc.remainingJp)} JP.
                </span>
              ) : (
                <span>
                  Sisa alokasi waktu kurikulum fase: <strong>{timeCalc.remainingJp} JP</strong> untuk pengayaan &amp; asesmen sumatif akhir fase.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-48 bg-white/80 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all ${
              timeCalc.isOverAllocated ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{
              width: `${Math.min(100, (timeCalc.allocatedJp / (timeCalc.totalAvailableJp || 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Grade and Semester Filter Tabs */}
      <div className="space-y-2">
        {/* Grade tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterGrade('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterGrade === 'all'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            ★ Semua Tahun / Kelas ({tpList.length} TP)
          </button>

          {gradesList.map((g) => (
            <button
              key={g}
              onClick={() => setFilterGrade(g)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterGrade === g
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g} ({tpList.filter((t) => t.suggestedGrade === g).length} TP)
            </button>
          ))}
        </div>

        {/* Semester & Element Sub-filters */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Semester:</span>
            </div>

            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
            >
              <option value="all">Semua Semester</option>
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>

            <select
              value={filterElement}
              onChange={(e) => setFilterElement(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
            >
              <option value="all">Semua Elemen CP</option>
              {elementNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-slate-500">
            Menampilkan <strong>{filteredList.length}</strong> dari {tpList.length} Tujuan Pembelajaran
          </span>
        </div>
      </div>

      {/* Main TP Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-12 text-center">No</th>
              <th className="py-3 px-3 w-28">Kode TP</th>
              <th className="py-3 px-3 w-28">Tahun / Kelas</th>
              <th className="py-3 px-3 w-20 text-center">Semester</th>
              <th className="py-3 px-3 w-32">Nama Elemen</th>
              <th className="py-3 px-4 min-w-[260px]">Rumusan Tujuan Pembelajaran (TP)</th>
              <th className="py-3 px-3 min-w-[150px]">Kompetensi &amp; Materi</th>
              <th className="py-3 px-3 w-16 text-center">Waktu</th>
              <th className="py-3 px-3 w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.map((tp, idx) => (
              <tr key={tp.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                <td className="py-3 px-3">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                    {tp.code}
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900">{tp.suggestedGrade}</td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    Sem {tp.suggestedSemester}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-700">{tp.elementName}</td>
                <td className="py-3 px-4 text-slate-800 leading-relaxed">
                  <p className="font-medium text-slate-900">{tp.tpStatement}</p>
                  {tp.sourceCpExcerpt && (
                    <p className="text-[11px] text-slate-400 mt-0.5 italic line-clamp-1">
                      CP: "{tp.sourceCpExcerpt}"
                    </p>
                  )}
                </td>
                <td className="py-3 px-3 text-slate-700 space-y-0.5">
                  <p className="font-semibold text-blue-900 text-[11px]">{tp.competency}</p>
                  <p className="text-slate-600 text-[11px]">{tp.contentScope}</p>
                </td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">{tp.recommendedJp} JP</td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => setEditingTp(tp)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Tujuan Pembelajaran"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setAiRegenModalTp(tp);
                        setRegenInstruction('');
                      }}
                      className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Sempurnakan dengan AI"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTp(tp.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Hapus TP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingTp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Tujuan Pembelajaran ({editingTp.code})
              </h3>
              <button
                onClick={() => setEditingTp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode TP (e.g. TP-7.1.01)</label>
                  <input
                    type="text"
                    value={editingTp.code}
                    onChange={(e) => setEditingTp({ ...editingTp, code: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={editingTp.suggestedGrade}
                    onChange={(e) => setEditingTp({ ...editingTp, suggestedGrade: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  >
                    {phaseDetails.grades.map((g) => (
                      <option key={g.gradeCode} value={g.gradeName}>
                        {g.gradeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rumusan TP</label>
                <textarea
                  rows={3}
                  value={editingTp.tpStatement}
                  onChange={(e) => setEditingTp({ ...editingTp, tpStatement: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kompetensi (KKO)</label>
                  <input
                    type="text"
                    value={editingTp.competency}
                    onChange={(e) => setEditingTp({ ...editingTp, competency: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lingkup Materi</label>
                  <input
                    type="text"
                    value={editingTp.contentScope}
                    onChange={(e) => setEditingTp({ ...editingTp, contentScope: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editingTp.suggestedSemester}
                    onChange={(e) =>
                      setEditingTp({ ...editingTp, suggestedSemester: Number(e.target.value) })
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
                    value={editingTp.recommendedJp}
                    onChange={(e) =>
                      setEditingTp({ ...editingTp, recommendedJp: Number(e.target.value) || 2 })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingTp(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveEdit(editingTp)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Single TP Regeneration Modal */}
      {aiRegenModalTp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Sempurnakan TP dengan AI ({aiRegenModalTp.code})
                </h3>
              </div>
              <button
                onClick={() => setAiRegenModalTp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-700">Rumusan TP Saat Ini:</p>
                <p className="mt-1 text-slate-800 italic">"{aiRegenModalTp.tpStatement}"</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instruksi / Catatan Penyesuaian Guru:
                </label>
                <textarea
                  rows={3}
                  value={regenInstruction}
                  onChange={(e) => setRegenInstruction(e.target.value)}
                  placeholder="Contoh: Sesuaikan materi untuk semester 2 kelas 7..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAiRegenModalTp(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleRegenerateSingleAi}
                disabled={isRegeneratingSingle}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRegeneratingSingle ? 'Memperbarui...' : 'Perbaiki dengan AI'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA to next step */}
      <div className="flex items-center justify-end pt-3 border-t border-slate-200">
        <button
          onClick={onGenerateAtp}
          disabled={isGeneratingAtp || tpList.length === 0}
          className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingAtp ? 'Menyusun Alur Seluruh Fase...' : 'Lanjutkan ke Generator ATP Terpadu (AI) →'}</span>
        </button>
      </div>
    </div>
  );
};
