import React, { useState, useMemo } from 'react';
import { CurriculumPreset } from '../data/curriculumPresets';
import { Jenjang } from '../types/curriculum';
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Building,
  School,
  Wrench,
  Baby,
} from 'lucide-react';

interface TemplateCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: CurriculumPreset[];
  onSelectPreset: (preset: CurriculumPreset) => void;
}

export const TemplateCatalogModal: React.FC<TemplateCatalogModalProps> = ({
  isOpen,
  onClose,
  presets,
  onSelectPreset,
}) => {
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedPresetId, setExpandedPresetId] = useState<string | null>(null);

  const jenjangCategories = [
    { id: 'ALL', label: 'Semua Jenjang', icon: Sparkles, count: presets.length },
    { id: 'SD_MI', label: 'SD / MI', icon: School, count: presets.filter((p) => p.jenjang === 'SD_MI').length },
    { id: 'SMP_MTS', label: 'SMP / MTs', icon: GraduationCap, count: presets.filter((p) => p.jenjang === 'SMP_MTS').length },
    { id: 'SMA_MA', label: 'SMA / MA', icon: Building, count: presets.filter((p) => p.jenjang === 'SMA_MA').length },
    { id: 'SMK_MAK', label: 'SMK / MAK', icon: Wrench, count: presets.filter((p) => p.jenjang === 'SMK_MAK').length },
    { id: 'PAUD_TK', label: 'PAUD / TK', icon: Baby, count: presets.filter((p) => p.jenjang === 'PAUD_TK').length },
  ];

  const filteredPresets = useMemo(() => {
    return presets.filter((preset) => {
      // 1. Jenjang filter
      if (selectedJenjangFilter !== 'ALL' && preset.jenjang !== selectedJenjangFilter) {
        return false;
      }
      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = preset.title.toLowerCase().includes(q);
        const matchSubject = preset.subjectName.toLowerCase().includes(q);
        const matchFase = preset.fase.toLowerCase().includes(q);
        const matchProgram = preset.vocationalProgram?.toLowerCase().includes(q);
        const matchElement = preset.elements.some(
          (e) => e.elementName.toLowerCase().includes(q) || e.cpText.toLowerCase().includes(q)
        );
        return matchTitle || matchSubject || matchFase || matchProgram || matchElement;
      }
      return true;
    });
  }, [presets, selectedJenjangFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <BookOpen className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Katalog Template Resmi Kurikulum Nasional
              </h2>
              <p className="text-xs text-blue-100">
                Pilihan Lengkap Mata Pelajaran SD, SMP, SMA, SMK & PAUD • Kepka BSKAP 046/2025 & Kepka BKPDM 020/2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Katalog"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Filter & Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          {/* Jenjang Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {jenjangCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedJenjangFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedJenjangFilter(cat.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mata pelajaran, elemen, topik materi (misal: Matematika, IPAS, PAI, RPL, Fisika, Otomotif)..."
              className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/50 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>
              Menampilkan <strong>{filteredPresets.length}</strong> template mata pelajaran
            </span>
            <span className="text-[11px] text-blue-700 font-medium">
              Klik "Terapkan Template" untuk mengisi formulir & memuat CP resmi secara otomatis
            </span>
          </div>

          {filteredPresets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Tidak ada template yang cocok</h3>
              <p className="text-xs text-slate-500 mt-1">
                Coba ubah kata kunci pencarian atau pilih kategori jenjang yang lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((preset) => {
                const isExpanded = expandedPresetId === preset.id;
                const isAgama = preset.subjectName.toLowerCase().includes('agama') || preset.subjectName.toLowerCase().includes('pai');

                return (
                  <div
                    key={preset.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {preset.fase}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {preset.jenjang.replace('_', ' / ')}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isAgama
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {preset.regulationRef}
                        </span>
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {preset.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tingkat: <span className="font-semibold text-slate-700">{preset.grade}</span>
                          {preset.vocationalProgram && (
                            <> • Program: <span className="font-semibold text-slate-700">{preset.vocationalProgram}</span></>
                          )}
                        </p>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {preset.jpPerWeek} JP/Minggu ({preset.minutesPerJp} Menit)
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium text-blue-700">
                            {preset.elements.length} Elemen CP Resmi
                          </span>
                        </div>
                      </div>

                      {/* Element chips preview */}
                      <div className="flex flex-wrap gap-1">
                        {preset.elements.map((el, i) => (
                          <span
                            key={el.id || i}
                            className="inline-block text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-700 font-medium"
                          >
                            {el.elementName}
                          </span>
                        ))}
                      </div>

                      {/* Expandable CP details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs bg-slate-50/80 p-3 rounded-lg">
                          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                            Rincian Elemen & Teks CP Resmi:
                          </p>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {preset.elements.map((el, idx) => (
                              <div key={el.id || idx} className="bg-white p-2 rounded border border-slate-200 text-[11px]">
                                <span className="font-bold text-blue-800">
                                  {idx + 1}. {el.elementName}
                                </span>
                                <p className="text-slate-600 mt-0.5 line-clamp-3 leading-relaxed">
                                  {el.cpText}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedPresetId(isExpanded ? null : preset.id)}
                        className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                      >
                        <span>{isExpanded ? 'Sembunyikan CP' : 'Pratinjau CP'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset);
                          onClose();
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terapkan Template</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <p>
            Semua rumusan CP mengacu pada naskah resmi <strong>Kepka BSKAP No. 046 Tahun 2025</strong> dan <strong>Kepka BKPDM No. 020 Tahun 2026</strong>.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
