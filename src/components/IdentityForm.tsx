import React, { useState } from 'react';
import { SchoolIdentity, LearningIdentity, Jenjang, Fase } from '../types/curriculum';
import {
  JENJANG_CONFIG,
  recommendFase,
  CURRICULUM_PRESETS,
  CurriculumPreset,
  getPhaseDetails,
  getSubjectRegulationRef,
} from '../data/curriculumPresets';
import { TemplateCatalogModal } from './TemplateCatalogModal';
import { Building2, BookOpen, Clock, Sparkles, Layers, Info, Calendar, ShieldCheck } from 'lucide-react';

interface IdentityFormProps {
  schoolIdentity: SchoolIdentity;
  setSchoolIdentity: React.Dispatch<React.SetStateAction<SchoolIdentity>>;
  learningIdentity: LearningIdentity;
  setLearningIdentity: React.Dispatch<React.SetStateAction<LearningIdentity>>;
  onLoadPreset: (preset: CurriculumPreset) => void;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({
  schoolIdentity,
  setSchoolIdentity,
  learningIdentity,
  setLearningIdentity,
  onLoadPreset,
}) => {
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const jenjangConfig = JENJANG_CONFIG[learningIdentity.jenjang];
  const phaseDetails = getPhaseDetails(learningIdentity.fase, learningIdentity.yearsOfStudy === 4);

  const handleJenjangChange = (newJenjang: Jenjang) => {
    const config = JENJANG_CONFIG[newJenjang];
    const defaultGrade = config.gradeOptions[0];
    const recFase = recommendFase(newJenjang, defaultGrade);

    setLearningIdentity((prev) => ({
      ...prev,
      jenjang: newJenjang,
      grade: defaultGrade,
      fase: recFase,
      minutesPerJp: config.defaultMinutesPerJp,
      jpPerWeek: config.defaultJpPerWeek,
      vocationalProgram: newJenjang === 'SMK_MAK' ? (prev.vocationalProgram || 'Rekayasa Perangkat Lunak') : undefined,
      yearsOfStudy: newJenjang === 'SMK_MAK' ? 3 : undefined,
    }));
  };

  const handleGradeChange = (newGrade: string) => {
    const recFase = recommendFase(learningIdentity.jenjang, newGrade);
    setLearningIdentity((prev) => ({
      ...prev,
      grade: newGrade,
      fase: recFase,
    }));
  };

  const totalPhaseJp =
    (Number(learningIdentity.effectiveWeeksPerSemester) || 18) *
    (Number(learningIdentity.jpPerWeek) || 3) *
    phaseDetails.totalSemesters;

  const totalPhaseMinutes = totalPhaseJp * (Number(learningIdentity.minutesPerJp) || 40);

  return (
    <div className="space-y-6">
      {/* Official Preset Selector Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-950">
                Pilih Contoh Kurikulum Resmi Kemendikdasmen &amp; Kemenag ({CURRICULUM_PRESETS.length} Template Lengkap)
              </h3>
              <p className="text-xs text-blue-800 mt-0.5">
                Rujukan regulasi resmi: <strong>Kepka BKPDM No. 020 Tahun 2026</strong> (Pendidikan Agama) dan <strong>Kepka BSKAP No. 046 Tahun 2025</strong> (Mata Pelajaran Lainnya).
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsCatalogOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Katalog Semua Mapel ({CURRICULUM_PRESETS.length})</span>
            </button>

            <select
              aria-label="Pilih Template Resmi BSKAP"
              onChange={(e) => {
                const found = CURRICULUM_PRESETS.find((p) => p.id === e.target.value);
                if (found) onLoadPreset(found);
              }}
              defaultValue=""
              className="text-xs bg-white border border-blue-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium shadow-xs max-w-[260px] truncate"
            >
              <option value="" disabled>
                -- Pilih Cepat Template --
              </option>
              <optgroup label="🏫 SD / MI (Fase A, B, C)">
                {CURRICULUM_PRESETS.filter((p) => p.jenjang === 'SD_MI').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎓 SMP / MTs (Fase D)">
                {CURRICULUM_PRESETS.filter((p) => p.jenjang === 'SMP_MTS').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏛️ SMA / MA (Fase E & F)">
                {CURRICULUM_PRESETS.filter((p) => p.jenjang === 'SMA_MA').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚙️ SMK / MAK (Fase E & F Kejuruan)">
                {CURRICULUM_PRESETS.filter((p) => p.jenjang === 'SMK_MAK').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🧸 PAUD / TK (Fase Fondasi)">
                {CURRICULUM_PRESETS.filter((p) => p.jenjang === 'PAUD_TK').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Modal Katalog Lengkap */}
      <TemplateCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        presets={CURRICULUM_PRESETS}
        onSelectPreset={onLoadPreset}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Identitas Satuan Pendidikan */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              A. Identitas Satuan Pendidikan
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah / Madrasah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolIdentity.schoolName}
                onChange={(e) => setSchoolIdentity((p) => ({ ...p, schoolName: e.target.value }))}
                placeholder="Contoh: SMP Negeri 1 Nusantara"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NPSN / NSM <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={schoolIdentity.npsnNsm}
                  onChange={(e) => setSchoolIdentity((p) => ({ ...p, npsnNsm: e.target.value }))}
                  placeholder="Contoh: 20108920"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolIdentity.academicYear}
                  onChange={(e) => setSchoolIdentity((p) => ({ ...p, academicYear: e.target.value }))}
                  placeholder="2025/2026"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Guru Pengampu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schoolIdentity.teacherName}
                  onChange={(e) => setSchoolIdentity((p) => ({ ...p, teacherName: e.target.value }))}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kurikulum Digunakan
                </label>
                <input
                  type="text"
                  value={schoolIdentity.curriculum}
                  onChange={(e) => setSchoolIdentity((p) => ({ ...p, curriculum: e.target.value }))}
                  placeholder="Kurikulum Merdeka (PPA 2025)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Kepala Sekolah <span className="text-slate-400 font-normal">(Untuk Lembar Pengesahan)</span>
                </label>
                <input
                  type="text"
                  value={schoolIdentity.principalName || ''}
                  onChange={(e) => setSchoolIdentity((p) => ({ ...p, principalName: e.target.value }))}
                  placeholder="Drs. H. Ahmad Fauzi, M.Pd."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  NIP Guru <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={schoolIdentity.nipTeacher || ''}
                  onChange={(e) => setSchoolIdentity((p) => ({ ...p, nipTeacher: e.target.value }))}
                  placeholder="19850101 201001 1 008"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* B. Identitas Pembelajaran & Cakupan Fase Penuh */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              B. Identitas Pembelajaran &amp; Cakupan Fase
            </h2>
          </div>

          <div className="space-y-4">
            {/* Jenjang Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenjang Pendidikan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {(Object.keys(JENJANG_CONFIG) as Jenjang[]).map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => handleJenjangChange(j)}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      learningIdentity.jenjang === j
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {JENJANG_CONFIG[j].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fase & Cakupan Tahun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fase Kurikulum <span className="text-red-500">*</span>
                </label>
                <select
                  value={learningIdentity.fase}
                  onChange={(e) =>
                    setLearningIdentity((p) => ({
                      ...p,
                      fase: e.target.value as Fase,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-blue-900 bg-blue-50/50"
                >
                  {jenjangConfig.allowedFase.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cakupan Tahun &amp; Kelas
                </label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{phaseDetails.durationYears} Tahun ({phaseDetails.totalSemesters} Semester)</span>
                  <span className="px-1.5 py-0.5 rounded-sm bg-blue-200 text-blue-900 text-[10px]">
                    Satu Fase Penuh
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Grade Breakdown Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Rincian Kelas dan Semester yang Akan Disusun Sekaligus:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {phaseDetails.grades.map((g) => (
                  <div key={g.gradeCode} className="p-2 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                    <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">
                      {g.gradeName}
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      {g.semesters.map((s) => (
                        <div key={s.semester} className="flex justify-between">
                          <span>Semester {s.semester}:</span>
                          <span className="font-mono text-blue-700 font-semibold">
                            TP-{g.gradeCode}.{s.semester}.xx
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mata Pelajaran & SMK Program */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={learningIdentity.jenjang === 'SMK_MAK' ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran / Bidang Pengembangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={learningIdentity.subjectName}
                  onChange={(e) => setLearningIdentity((p) => ({ ...p, subjectName: e.target.value }))}
                  placeholder="Contoh: Matematika, Bahasa Indonesia, PAI, RPL"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                />
                <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Rujukan Dokumen CP:{' '}
                    <strong className="text-blue-900">
                      {getSubjectRegulationRef(learningIdentity.subjectName)}
                    </strong>
                  </span>
                </div>
              </div>

              {learningIdentity.jenjang === 'SMK_MAK' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program / Konsentrasi Keahlian (SMK)
                  </label>
                  <input
                    type="text"
                    value={learningIdentity.vocationalProgram || ''}
                    onChange={(e) => setLearningIdentity((p) => ({ ...p, vocationalProgram: e.target.value }))}
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Waktu Pembelajaran */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1 mb-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">Alokasi Waktu Pembelajaran Mingguan</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Minggu Efektif / Sem.
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={learningIdentity.effectiveWeeksPerSemester}
                    onChange={(e) =>
                      setLearningIdentity((p) => ({
                        ...p,
                        effectiveWeeksPerSemester: Number(e.target.value) || 18,
                      }))
                    }
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    JP per Minggu
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={learningIdentity.jpPerWeek}
                    onChange={(e) =>
                      setLearningIdentity((p) => ({
                        ...p,
                        jpPerWeek: Number(e.target.value) || 3,
                      }))
                    }
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Durasi 1 JP (Menit)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={learningIdentity.minutesPerJp}
                    onChange={(e) =>
                      setLearningIdentity((p) => ({
                        ...p,
                        minutesPerJp: Number(e.target.value) || 40,
                      }))
                    }
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Time Calculation info badge */}
              <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Total Jam Pelajaran Satu Fase Penuh ({phaseDetails.totalSemesters} Semester):{' '}
                    <strong className="font-bold text-blue-950">{totalPhaseJp} JP</strong> ({totalPhaseMinutes} menit)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
