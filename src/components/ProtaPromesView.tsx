import React, { useState, useMemo } from 'react';
import {
  ProtaPromesResult,
  ProtaItem,
  PromesEntry,
  PromesSemester,
  LearningIdentity,
  SchoolIdentity,
} from '../types/curriculum';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  Layers,
  ArrowRight,
  Save,
  X,
  FileSpreadsheet,
  FileText,
  Info,
} from 'lucide-react';

interface ProtaPromesViewProps {
  protaPromes: ProtaPromesResult;
  setProtaPromes: React.Dispatch<React.SetStateAction<ProtaPromesResult | undefined>>;
  learningIdentity: LearningIdentity;
  schoolIdentity: SchoolIdentity;
  onGoToTraceability?: () => void;
  onGoToExport?: () => void;
  onResyncFromAtp: () => void;
}

export const ProtaPromesView: React.FC<ProtaPromesViewProps> = ({
  protaPromes,
  setProtaPromes,
  learningIdentity,
  schoolIdentity,
  onGoToTraceability,
  onGoToExport,
  onResyncFromAtp,
}) => {
  const [activeTab, setActiveTab] = useState<'prota' | 'promes1' | 'promes2' | 'kaldik'>('prota');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [editingProtaId, setEditingProtaId] = useState<number | null>(null);
  const [editingPromesId, setEditingPromesId] = useState<string | null>(null);

  // Draft editing states
  const [editProtaDraft, setEditProtaDraft] = useState<ProtaItem | null>(null);
  const [editPromesDraft, setEditPromesDraft] = useState<PromesEntry | null>(null);
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);

  // Available grades
  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    protaPromes.protaList.forEach((p) => {
      if (p.grade) grades.add(p.grade);
    });
    protaPromes.promesList.forEach((p) => {
      if (p.grade) grades.add(p.grade);
    });
    return Array.from(grades);
  }, [protaPromes]);

  // Filtered Prota
  const displayedProta = useMemo(() => {
    return protaPromes.protaList.filter((item) => {
      if (selectedGradeFilter === 'all') return true;
      return item.grade === selectedGradeFilter;
    });
  }, [protaPromes.protaList, selectedGradeFilter]);

  // Get active Promes for Semester 1 & 2
  const activePromes1 = useMemo(() => {
    return (
      protaPromes.promesList.find(
        (p) =>
          p.semester === 1 &&
          (selectedGradeFilter === 'all' || p.grade === selectedGradeFilter)
      ) || protaPromes.promesList.find((p) => p.semester === 1)
    );
  }, [protaPromes.promesList, selectedGradeFilter]);

  const activePromes2 = useMemo(() => {
    return (
      protaPromes.promesList.find(
        (p) =>
          p.semester === 2 &&
          (selectedGradeFilter === 'all' || p.grade === selectedGradeFilter)
      ) || protaPromes.promesList.find((p) => p.semester === 2)
    );
  }, [protaPromes.promesList, selectedGradeFilter]);

  // Totals calculations
  const totalProtaJp = displayedProta.reduce((acc, curr) => acc + (Number(curr.allocatedJp) || 0), 0);
  const protaSem1Jp = displayedProta
    .filter((p) => p.semester === 1)
    .reduce((acc, curr) => acc + (Number(curr.allocatedJp) || 0), 0);
  const protaSem2Jp = displayedProta
    .filter((p) => p.semester === 2)
    .reduce((acc, curr) => acc + (Number(curr.allocatedJp) || 0), 0);

  // Copy Table Handler
  const handleCopyTable = async (type: 'prota' | 'promes1' | 'promes2') => {
    try {
      let markdown = '';
      if (type === 'prota') {
        const header = `| No. | Alur Tujuan Pembelajaran (ATP) / Lingkup Materi | Semester | Alokasi Waktu (JP) |\n|---|---|---|---|`;
        const rows = displayedProta
          .map(
            (item) =>
              `| ${item.no} | ${item.atpContent} | Semester ${item.semester} | ${item.allocatedJp} JP |`
          )
          .join('\n');
        markdown = `PROGRAM TAHUNAN (PROTA) - ${schoolIdentity.schoolName}\nMata Pelajaran: ${learningIdentity.subjectName} | Tahun Ajaran: ${schoolIdentity.academicYear}\n\n${header}\n${rows}\n| | Total Semester 1: ${protaSem1Jp} JP | Total Semester 2: ${protaSem2Jp} JP | Total 1 Tahun: ${totalProtaJp} JP |`;
      } else {
        const promes = type === 'promes1' ? activePromes1 : activePromes2;
        if (!promes) return;
        const header = `| Bulan | Minggu ke- | Lingkup Materi / Tujuan Pembelajaran (TP) | Alokasi Waktu (JP) | Keterangan |\n|---|---|---|---|---|`;
        const rows = promes.entries
          .map(
            (entry) =>
              `| ${entry.month || '-'} | ${entry.weeks} | ${entry.contentScope} | ${entry.allocatedJp} | ${entry.notes} |`
          )
          .join('\n');
        markdown = `PROGRAM SEMESTER (PROMES) ${promes.semesterLabel.toUpperCase()} - ${schoolIdentity.schoolName}\nMata Pelajaran: ${learningIdentity.subjectName} | Kelas: ${promes.grade} | Tahun Ajaran: ${schoolIdentity.academicYear}\n\n${header}\n${rows}`;
      }

      await navigator.clipboard.writeText(markdown);
      setCopySuccessMsg('Tabel berhasil disalin ke clipboard! Siap ditempel ke Excel atau Word.');
      setTimeout(() => setCopySuccessMsg(null), 3500);
    } catch {
      alert('Gagal menyalin tabel ke clipboard.');
    }
  };

  // Prota Edit Handlers
  const handleStartEditProta = (item: ProtaItem) => {
    setEditingProtaId(item.no);
    setEditProtaDraft({ ...item });
  };

  const handleSaveEditProta = () => {
    if (!editProtaDraft) return;
    const updated = protaPromes.protaList.map((p) =>
      p.no === editProtaDraft.no ? editProtaDraft : p
    );
    setProtaPromes({ ...protaPromes, protaList: updated });
    setEditingProtaId(null);
    setEditProtaDraft(null);
  };

  // Promes Edit Handlers
  const handleStartEditPromes = (entry: PromesEntry) => {
    setEditingPromesId(entry.id);
    setEditPromesDraft({ ...entry });
  };

  const handleSaveEditPromes = (semesterNum: 1 | 2) => {
    if (!editPromesDraft) return;
    const updatedPromesList = protaPromes.promesList.map((promes) => {
      if (promes.semester === semesterNum) {
        return {
          ...promes,
          entries: promes.entries.map((e) =>
            e.id === editPromesDraft.id ? editPromesDraft : e
          ),
        };
      }
      return promes;
    });
    setProtaPromes({ ...protaPromes, promesList: updatedPromesList });
    setEditingPromesId(null);
    setEditPromesDraft(null);
  };

  // Add new Prota row
  const handleAddProtaRow = () => {
    const newNo = protaPromes.protaList.length + 1;
    const newItem: ProtaItem = {
      no: newNo,
      tpCode: `TP-Baru.${newNo}`,
      atpContent: 'Tujuan Pembelajaran / Lingkup Materi Baru',
      elementName: 'Elemen Baru',
      grade: selectedGradeFilter !== 'all' ? selectedGradeFilter : (learningIdentity.grade || 'Kelas'),
      semester: 1,
      allocatedJp: 4,
    };
    setProtaPromes({ ...protaPromes, protaList: [...protaPromes.protaList, newItem] });
    handleStartEditProta(newItem);
  };

  // Add new Promes row
  const handleAddPromesRow = (semesterNum: 1 | 2) => {
    const targetPromes = semesterNum === 1 ? activePromes1 : activePromes2;
    if (!targetPromes) return;

    const newEntry: PromesEntry = {
      id: `promes-custom-${Date.now()}`,
      month: semesterNum === 1 ? 'Oktober' : 'April',
      weeks: 'M-Baru',
      contentScope: 'Lingkup Materi / Tujuan Pembelajaran Tambahan',
      allocatedJp: '4 JP',
      notes: 'Pembelajaran Efektif',
      isNonEffective: false,
      grade: targetPromes.grade,
    };

    const updatedPromesList = protaPromes.promesList.map((promes) => {
      if (promes.semester === semesterNum && promes.grade === targetPromes.grade) {
        return {
          ...promes,
          entries: [...promes.entries, newEntry],
        };
      }
      return promes;
    });

    setProtaPromes({ ...protaPromes, promesList: updatedPromesList });
    handleStartEditPromes(newEntry);
  };

  // Delete Promes row
  const handleDeletePromesRow = (semesterNum: 1 | 2, entryId: string) => {
    const updatedPromesList = protaPromes.promesList.map((promes) => {
      if (promes.semester === semesterNum) {
        return {
          ...promes,
          entries: promes.entries.filter((e) => e.id !== entryId),
        };
      }
      return promes;
    });
    setProtaPromes({ ...protaPromes, promesList: updatedPromesList });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Approval Status */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ATP Telah Disetujui (Approved)</span>
              </span>
              <span className="text-xs text-emerald-200/80">
                • {protaPromes.approvalDate || 'Tanggal Berlaku Tahun Ajaran ' + schoolIdentity.academicYear}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Program Tahunan (Prota) & Program Semester (Promes)</span>
            </h2>
            <p className="text-xs text-teal-100/90 leading-relaxed max-w-3xl">
              Disusun otomatis mengacu pada Alur Tujuan Pembelajaran (ATP) resmi yang telah disepakati dan Kalender Pendidikan (Kaldik) Tahun Ajaran {schoolIdentity.academicYear}. Mencakup alokasi minggu efektif, jeda asesmen (STS/SAS/SAT), dan pembagian rapor.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onResyncFromAtp}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all cursor-pointer"
              title="Sinkronkan ulang data dari ATP terkini"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
              <span>Sinkron Ulang ATP</span>
            </button>
            <button
              onClick={() => handleCopyTable(activeTab === 'prota' ? 'prota' : activeTab === 'promes1' ? 'promes1' : 'promes2')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-700" />
              <span>Salin Tabel Aktif</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-teal-200/80 text-[11px]">Total Alokasi Prota</p>
            <p className="text-base font-extrabold text-white mt-0.5">{totalProtaJp} JP</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-teal-200/80 text-[11px]">Semester 1 (Ganjil)</p>
            <p className="text-base font-extrabold text-emerald-300 mt-0.5">{protaSem1Jp} JP</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-teal-200/80 text-[11px]">Semester 2 (Genap)</p>
            <p className="text-base font-extrabold text-sky-300 mt-0.5">{protaSem2Jp} JP</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-teal-200/80 text-[11px]">Beban Mingguan</p>
            <p className="text-base font-extrabold text-amber-300 mt-0.5">{learningIdentity.jpPerWeek} JP / Minggu</p>
          </div>
        </div>
      </div>

      {copySuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{copySuccessMsg}</span>
        </div>
      )}

      {/* 2. Sub-Navigation Tabs & Grade Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('prota')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'prota'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Program Tahunan (Prota)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {displayedProta.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('promes1')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'promes1'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Program Semester 1 (Ganjil)</span>
          </button>

          <button
            onClick={() => setActiveTab('promes2')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'promes2'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Program Semester 2 (Genap)</span>
          </button>

          <button
            onClick={() => setActiveTab('kaldik')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'kaldik'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kalender Pendidikan (Kaldik)</span>
          </button>
        </div>

        {/* Grade filter (if multi-grade available) */}
        {availableGrades.length > 1 && (
          <div className="flex items-center space-x-2 text-xs self-end md:self-auto">
            <span className="text-slate-500 font-medium">Filter Tingkat/Kelas:</span>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-blue-500"
            >
              <option value="all">Semua Kelas ({availableGrades.join(', ')})</option>
              {availableGrades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. TAB CONTENT: PROGRAM TAHUNAN (PROTA) */}
      {activeTab === 'prota' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Format Resmi Tabel Program Tahunan (Prota)</span>
                <span className="text-xs font-normal text-slate-500">
                  (No. | Alur Tujuan Pembelajaran (ATP) / Lingkup Materi | Semester | Alokasi Waktu (JP))
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {schoolIdentity.schoolName} • Mata Pelajaran: {learningIdentity.subjectName} • Tahun Ajaran {schoolIdentity.academicYear}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddProtaRow}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
              <button
                onClick={() => handleCopyTable('prota')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Tabel Prota</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-12 text-center border-r border-slate-200">No.</th>
                  <th className="py-3 px-4 border-r border-slate-200">
                    Alur Tujuan Pembelajaran (ATP) / Lingkup Materi
                  </th>
                  <th className="py-3 px-3 w-28 text-center border-r border-slate-200">Semester</th>
                  <th className="py-3 px-3 w-32 text-center border-r border-slate-200">Alokasi Waktu (JP)</th>
                  <th className="py-3 px-2 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedProta.map((item) => {
                  const isEditing = editingProtaId === item.no;

                  return (
                    <tr
                      key={item.no}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.semester === 1 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-500 border-r border-slate-200">
                        {item.no}.
                      </td>
                      <td className="py-3 px-4 text-slate-800 border-r border-slate-200">
                        {isEditing && editProtaDraft ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={editProtaDraft.atpContent}
                              onChange={(e) =>
                                setEditProtaDraft({ ...editProtaDraft, atpContent: e.target.value })
                              }
                              className="w-full px-2 py-1 border border-blue-400 rounded-md text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                              <span>Kode: {item.tpCode}</span>
                              <span>• Kelas: {item.grade}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-slate-900 leading-snug">{item.atpContent}</p>
                            <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
                              <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {item.tpCode}
                              </span>
                              <span>• {item.grade}</span>
                              <span>• {item.elementName}</span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center border-r border-slate-200">
                        {isEditing && editProtaDraft ? (
                          <select
                            value={editProtaDraft.semester}
                            onChange={(e) =>
                              setEditProtaDraft({
                                ...editProtaDraft,
                                semester: Number(e.target.value) as 1 | 2,
                              })
                            }
                            className="px-2 py-1 border border-blue-400 rounded text-xs bg-white"
                          >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.semester === 1
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}
                          >
                            Semester {item.semester}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900 border-r border-slate-200">
                        {isEditing && editProtaDraft ? (
                          <div className="flex items-center justify-center space-x-1">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={editProtaDraft.allocatedJp}
                              onChange={(e) =>
                                setEditProtaDraft({
                                  ...editProtaDraft,
                                  allocatedJp: Number(e.target.value) || 0,
                                })
                              }
                              className="w-16 px-1.5 py-1 border border-blue-400 rounded text-xs text-center"
                            />
                            <span>JP</span>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                            {item.allocatedJp} JP
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={handleSaveEditProta}
                              className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"
                              title="Simpan"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProtaId(null);
                                setEditProtaDraft(null);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditProta(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="Edit Baris"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Summary Footer */}
              <tfoot>
                <tr className="bg-emerald-50/70 font-semibold text-emerald-950 border-t border-emerald-200">
                  <td colSpan={2} className="py-2.5 px-4 text-right border-r border-emerald-200">
                    Subtotal Alokasi Waktu Semester 1 (Ganjil):
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-emerald-200">Sem 1</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-800 border-r border-emerald-200">
                    {protaSem1Jp} JP
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-sky-50/70 font-semibold text-sky-950 border-t border-sky-200">
                  <td colSpan={2} className="py-2.5 px-4 text-right border-r border-sky-200">
                    Subtotal Alokasi Waktu Semester 2 (Genap):
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-sky-200">Sem 2</td>
                  <td className="py-2.5 px-3 text-center font-bold text-sky-800 border-r border-sky-200">
                    {protaSem2Jp} JP
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-slate-200 text-slate-900 font-extrabold border-t-2 border-slate-300">
                  <td colSpan={2} className="py-3 px-4 text-right border-r border-slate-300">
                    TOTAL ALOKASI WAKTU 1 TAHUN AJARAN ({schoolIdentity.academicYear}):
                  </td>
                  <td className="py-3 px-3 text-center border-r border-slate-300">1 Tahun</td>
                  <td className="py-3 px-3 text-center text-sm font-black text-blue-900 border-r border-slate-300">
                    {totalProtaJp} JP
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: PROGRAM SEMESTER (PROMES 1 & 2) */}
      {(activeTab === 'promes1' || activeTab === 'promes2') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {(() => {
            const isSem1 = activeTab === 'promes1';
            const semesterNum = isSem1 ? 1 : 2;
            const promes = isSem1 ? activePromes1 : activePromes2;

            if (!promes) {
              return (
                <div className="p-8 text-center text-slate-500">
                  <p>Data Program Semester belum tersedia.</p>
                </div>
              );
            }

            return (
              <>
                {/* Header Promes */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <span>
                        Tabel Program Semester ({promes.semesterLabel}) - {promes.grade}
                      </span>
                      <span className="text-xs font-normal text-slate-500">
                        (Bulan | Minggu ke- | Lingkup Materi / TP | Alokasi Waktu | Keterangan)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isSem1 ? 'Bulan Juli s.d. Desember' : 'Bulan Januari s.d. Juni'} • Alokasi Efektif:{' '}
                      <strong className="text-slate-800">{promes.totalJp} JP</strong> • Minggu Efektif:{' '}
                      <strong className="text-slate-800">{promes.totalEffectiveWeeks} Minggu</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddPromesRow(semesterNum)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Jadwal</span>
                    </button>
                    <button
                      onClick={() => handleCopyTable(isSem1 ? 'promes1' : 'promes2')}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Salin Promes</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-3 px-4 w-28 border-r border-slate-200">Bulan</th>
                        <th className="py-3 px-3 w-28 text-center border-r border-slate-200">Minggu ke-</th>
                        <th className="py-3 px-4 border-r border-slate-200">
                          Lingkup Materi / Tujuan Pembelajaran (TP)
                        </th>
                        <th className="py-3 px-3 w-32 text-center border-r border-slate-200">Alokasi Waktu (JP)</th>
                        <th className="py-3 px-4 w-44 border-r border-slate-200">Keterangan</th>
                        <th className="py-3 px-2 w-16 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {promes.entries.map((entry, idx) => {
                        const isEditing = editingPromesId === entry.id;

                        return (
                          <tr
                            key={entry.id || idx}
                            className={`transition-colors ${
                              entry.isNonEffective
                                ? 'bg-amber-50/40 text-amber-950 font-medium'
                                : 'bg-white hover:bg-slate-50/80 text-slate-800'
                            }`}
                          >
                            <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                              {entry.month ? (
                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">
                                  {entry.month}
                                </span>
                              ) : (
                                <span className="text-slate-300">”</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-700 border-r border-slate-200 align-top whitespace-nowrap">
                              {isEditing && editPromesDraft ? (
                                <input
                                  type="text"
                                  value={editPromesDraft.weeks}
                                  onChange={(e) =>
                                    setEditPromesDraft({ ...editPromesDraft, weeks: e.target.value })
                                  }
                                  className="w-20 px-1 py-0.5 border border-blue-400 rounded text-center text-xs"
                                />
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono">
                                  {entry.weeks}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200 align-top">
                              {isEditing && editPromesDraft ? (
                                <textarea
                                  rows={2}
                                  value={editPromesDraft.contentScope}
                                  onChange={(e) =>
                                    setEditPromesDraft({
                                      ...editPromesDraft,
                                      contentScope: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-blue-400 rounded-md text-xs focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                <div>
                                  <p
                                    className={`leading-snug ${
                                      entry.isNonEffective
                                        ? 'font-bold text-amber-900'
                                        : 'font-semibold text-slate-900'
                                    }`}
                                  >
                                    {entry.contentScope}
                                  </p>
                                  {entry.tpCode && (
                                    <span className="inline-block mt-1 font-mono text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                      {entry.tpCode}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center border-r border-slate-200 align-top">
                              {isEditing && editPromesDraft ? (
                                <input
                                  type="text"
                                  value={editPromesDraft.allocatedJp}
                                  onChange={(e) =>
                                    setEditPromesDraft({
                                      ...editPromesDraft,
                                      allocatedJp: e.target.value,
                                    })
                                  }
                                  className="w-20 px-1 py-0.5 border border-blue-400 rounded text-center text-xs"
                                />
                              ) : entry.allocatedJp === '-' ? (
                                <span className="text-slate-400 font-bold">-</span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                                  {entry.allocatedJp}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200 align-top">
                              {isEditing && editPromesDraft ? (
                                <input
                                  type="text"
                                  value={editPromesDraft.notes}
                                  onChange={(e) =>
                                    setEditPromesDraft({ ...editPromesDraft, notes: e.target.value })
                                  }
                                  className="w-full px-2 py-0.5 border border-blue-400 rounded text-xs"
                                />
                              ) : (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    entry.isNonEffective
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {entry.notes}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center align-top">
                              {isEditing ? (
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    onClick={() => handleSaveEditPromes(semesterNum)}
                                    className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"
                                    title="Simpan"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingPromesId(null);
                                      setEditPromesDraft(null);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Batal"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    onClick={() => handleStartEditPromes(entry)}
                                    className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                                    title="Edit Baris"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePromesRow(semesterNum, entry.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={3} className="py-3 px-4 text-right border-r border-slate-300">
                          Total Alokasi Pembelajaran Efektif ({promes.semesterLabel}):
                        </td>
                        <td className="py-3 px-3 text-center font-black text-emerald-900 text-sm border-r border-slate-300">
                          {promes.totalJp} JP
                        </td>
                        <td colSpan={2} className="py-3 px-4 text-xs text-slate-600">
                          {promes.totalEffectiveWeeks} Minggu Efektif KBM • {promes.totalNonEffectiveWeeks} Minggu Non-Efektif
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 5. TAB CONTENT: KALENDER PENDIDIKAN (KALDIK) BREAKDOWN */}
      {activeTab === 'kaldik' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Rujukan Kalender Pendidikan (Kaldik) Tahun Ajaran {schoolIdentity.academicYear}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Struktur alokasi waktu efektif dan agenda akademik nasional Kemendikdasmen untuk perhitungan Program Tahunan & Semester.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Tahun Ajaran {schoolIdentity.academicYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semester 1 Ganjil Kaldik */}
            <div className="border border-emerald-200 bg-emerald-50/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <h4 className="font-bold text-sm text-emerald-950 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Semester 1 (Ganjil): Juli s.d. Desember</span>
                </h4>
                <span className="text-xs font-semibold text-emerald-800">18 Minggu Efektif</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-700">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Juli (M1-M2):</span>
                  <span>MPLS (Masa Pengenalan Lingkungan Sekolah) & Asesmen Diagnostik Awal</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Juli - Ags:</span>
                  <span>Pembelajaran Efektif TP 1 & TP 2 (HUT RI pada 17 Agustus)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">September (M4):</span>
                  <span>Asesmen Sumatif Tengah Semester (STS) Ganjil</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Okt - Nov:</span>
                  <span>Pembelajaran Efektif TP Lanjutan & Penguatan Karakter/P5</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Desember (M1):</span>
                  <span>Asesmen Sumatif Akhir Semester (SAS / PAS)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Desember (M3):</span>
                  <span>Pembagian Buku Laporan Hasil Belajar (Rapor Ganjil)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Desember (M4-M5):</span>
                  <span>Libur Akhir Semester Ganjil</span>
                </li>
              </ul>
            </div>

            {/* Semester 2 Genap Kaldik */}
            <div className="border border-sky-200 bg-sky-50/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-sky-200">
                <h4 className="font-bold text-sm text-sky-950 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  <span>Semester 2 (Genap): Januari s.d. Juni</span>
                </h4>
                <span className="text-xs font-semibold text-sky-800">18 Minggu Efektif</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-700">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Januari (M1):</span>
                  <span>Awal Masuk Pembelajaran Semester Genap & Refleksi Pembelajaran</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Jan - Mar:</span>
                  <span>Pembelajaran Efektif TP Semester Genap</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Maret (M4):</span>
                  <span>Asesmen Sumatif Tengah Semester (STS Genap)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">April (M1-M2):</span>
                  <span>Prakiraan Libur Hari Raya Idul Fitri & Cuti Bersama</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Mei:</span>
                  <span>Pembelajaran Efektif & Ujian Satuan Pendidikan (Kelas Akhir)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Juni (M1):</span>
                  <span>Asesmen Sumatif Akhir Tahun (SAT / UKK)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Juni (M3):</span>
                  <span>Pembagian Rapor Semester Genap / Kenaikan Kelas / Kelulusan</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-slate-900 w-24 shrink-0">Juni (M4-M5):</span>
                  <span>Libur Akhir Tahun Pelajaran</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 6. Navigation Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-blue-600" />
          <span>
            Prota dan Promes siap dicetak atau diekspor ke Microsoft Word & Excel pada tab Pratinjau & Ekspor.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {onGoToTraceability && (
            <button
              onClick={onGoToTraceability}
              className="inline-flex items-center space-x-1 px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Lihat Peta Keterlacakan (Audit)</span>
            </button>
          )}

          {onGoToExport && (
            <button
              onClick={onGoToExport}
              className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>Lanjut ke Pratinjau & Ekspor Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
