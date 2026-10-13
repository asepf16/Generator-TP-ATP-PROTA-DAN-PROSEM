import {
  AtpItem,
  LearningIdentity,
  SchoolIdentity,
  ProtaItem,
  PromesEntry,
  PromesSemester,
  ProtaPromesResult,
} from '../types/curriculum';

export interface KaldikMonthTemplate {
  month: string;
  slots: {
    weeks: string;
    isNonEffective?: boolean;
    defaultTitle?: string;
    defaultNotes?: string;
    weeksSpan: number; // e.g. 2 for "M1 - M2", 1 for "M3"
  }[];
}

// Kalender Pendidikan Nasional (Kaldik) Standar Tahun Ajaran
export const KALDIK_SEMESTER_1_TEMPLATES: KaldikMonthTemplate[] = [
  {
    month: 'Juli',
    slots: [
      {
        weeks: 'M1 - M2',
        isNonEffective: true,
        defaultTitle: 'Asesmen Awal & Persiapan Pembelajaran',
        defaultNotes: 'MPLS / Transisi',
        weeksSpan: 2,
      },
      { weeks: 'M3 - M4', weeksSpan: 2 },
    ],
  },
  {
    month: 'Agustus',
    slots: [
      { weeks: 'M1 - M2', weeksSpan: 2 },
      { weeks: 'M3', defaultNotes: 'Peringatan HUT Kemerdekaan RI', weeksSpan: 1 },
      { weeks: 'M4 - M5', weeksSpan: 2 },
    ],
  },
  {
    month: 'September',
    slots: [
      { weeks: 'M1 - M2', weeksSpan: 2 },
      { weeks: 'M3', weeksSpan: 1 },
      {
        weeks: 'M4',
        isNonEffective: true,
        defaultTitle: 'Asesmen Sumatif Tengah Semester (STS) & Penguatan Karakter',
        defaultNotes: 'STS / Asesmen Tengah Semester',
        weeksSpan: 1,
      },
    ],
  },
  {
    month: 'Oktober',
    slots: [
      { weeks: 'M1 - M2', weeksSpan: 2 },
      { weeks: 'M3 - M4', weeksSpan: 2 },
    ],
  },
  {
    month: 'November',
    slots: [
      { weeks: 'M1 - M2', weeksSpan: 2 },
      { weeks: 'M3 - M4', weeksSpan: 2 },
    ],
  },
  {
    month: 'Desember',
    slots: [
      {
        weeks: 'M1',
        isNonEffective: true,
        defaultTitle: 'Asesmen Sumatif Akhir Semester (SAS / PAS)',
        defaultNotes: 'Sumatif Akhir Semester',
        weeksSpan: 1,
      },
      {
        weeks: 'M2',
        isNonEffective: true,
        defaultTitle: 'Pengolahan Nilai Rapor & Remedial / Pengayaan',
        defaultNotes: 'Remedial & Penilaian',
        weeksSpan: 1,
      },
      {
        weeks: 'M3',
        isNonEffective: true,
        defaultTitle: 'Penyerahan Buku Laporan Hasil Belajar (Rapor)',
        defaultNotes: 'Pembagian Rapor',
        weeksSpan: 1,
      },
      {
        weeks: 'M4 - M5',
        isNonEffective: true,
        defaultTitle: 'Libur Akhir Semester Ganjil',
        defaultNotes: 'Libur Semester',
        weeksSpan: 2,
      },
    ],
  },
];

export const KALDIK_SEMESTER_2_TEMPLATES: KaldikMonthTemplate[] = [
  {
    month: 'Januari',
    slots: [
      {
        weeks: 'M1',
        isNonEffective: true,
        defaultTitle: 'Awal Masuk Pembelajaran Semester Genap & Refleksi',
        defaultNotes: 'Persiapan KBM Genap',
        weeksSpan: 1,
      },
      { weeks: 'M2 - M3', weeksSpan: 2 },
      { weeks: 'M4 - M5', weeksSpan: 2 },
    ],
  },
  {
    month: 'Februari',
    slots: [
      { weeks: 'M1 - M2', weeksSpan: 2 },
      { weeks: 'M3 - M4', weeksSpan: 2 },
    ],
  },
  {
    month: 'Maret',
    slots: [
      { weeks: 'M1 - M2', weeksSpan: 2 },
      { weeks: 'M3', weeksSpan: 1 },
      {
        weeks: 'M4',
        isNonEffective: true,
        defaultTitle: 'Asesmen Sumatif Tengah Semester (STS) Genap',
        defaultNotes: 'STS Genap',
        weeksSpan: 1,
      },
    ],
  },
  {
    month: 'April',
    slots: [
      {
        weeks: 'M1 - M2',
        isNonEffective: true,
        defaultTitle: 'Prakiraan Libur Hari Raya Idul Fitri & Cuti Bersama',
        defaultNotes: 'Libur Hari Raya',
        weeksSpan: 2,
      },
      { weeks: 'M3 - M4', weeksSpan: 2 },
    ],
  },
  {
    month: 'Mei',
    slots: [
      { weeks: 'M1 - M2', weeksSpan: 2 },
      { weeks: 'M3 - M4', defaultNotes: 'KBM Efektif / Asesmen Akhir', weeksSpan: 2 },
    ],
  },
  {
    month: 'Juni',
    slots: [
      {
        weeks: 'M1',
        isNonEffective: true,
        defaultTitle: 'Asesmen Sumatif Akhir Tahun (SAT / UKK)',
        defaultNotes: 'SAT / Penilaian Akhir',
        weeksSpan: 1,
      },
      {
        weeks: 'M2',
        isNonEffective: true,
        defaultTitle: 'Rapat Pleno Kenaikan Kelas & Pengolahan Nilai',
        defaultNotes: 'Pengolahan Nilai',
        weeksSpan: 1,
      },
      {
        weeks: 'M3',
        isNonEffective: true,
        defaultTitle: 'Penyerahan Buku Laporan Hasil Belajar (Rapor Semester Genap)',
        defaultNotes: 'Pembagian Rapor',
        weeksSpan: 1,
      },
      {
        weeks: 'M4 - M5',
        isNonEffective: true,
        defaultTitle: 'Libur Akhir Tahun Ajaran / Kenaikan Kelas',
        defaultNotes: 'Libur Kenaikan Kelas',
        weeksSpan: 2,
      },
    ],
  },
];

/**
 * Generate Program Tahunan (Prota) from approved ATP list
 */
export function generateProta(
  atpList: AtpItem[],
  learningIdentity: LearningIdentity
): ProtaItem[] {
  if (!atpList || atpList.length === 0) return [];

  return atpList.map((atp, index) => {
    // Alur Tujuan Pembelajaran (ATP) / Lingkup Materi
    const content = atp.coreConcept
      ? `${atp.coreConcept}: ${atp.tpStatement}`
      : atp.tpStatement;

    return {
      no: index + 1,
      tpCode: atp.tpCode,
      atpContent: content,
      elementName: atp.elementName,
      grade: atp.grade || learningIdentity.grade || 'Kelas',
      semester: (atp.semester === 2 ? 2 : 1) as 1 | 2,
      globalSemester: atp.globalSemester,
      allocatedJp: Number(atp.allocatedJp) || 4,
    };
  });
}

/**
 * Generate Program Semester (Promes) for a specific semester
 */
export function generatePromesForSemester(
  semester: 1 | 2,
  atpList: AtpItem[],
  learningIdentity: LearningIdentity,
  schoolIdentity: SchoolIdentity,
  targetGrade?: string
): PromesSemester {
  const templates = semester === 1 ? KALDIK_SEMESTER_1_TEMPLATES : KALDIK_SEMESTER_2_TEMPLATES;
  const gradeLabel = targetGrade || learningIdentity.grade || 'Kelas';

  // Filter ATP items for this semester (and grade if specified)
  const semesterAtps = atpList.filter((item) => {
    const semMatch = Number(item.semester) === semester;
    if (!semMatch) return false;
    if (targetGrade && item.grade) {
      return item.grade.includes(targetGrade) || targetGrade.includes(item.grade);
    }
    return true;
  });

  const entries: PromesEntry[] = [];
  let atpIndex = 0;
  let effectiveWeeksCount = 0;
  let nonEffectiveWeeksCount = 0;
  let totalJp = 0;

  templates.forEach((monthTpl) => {
    monthTpl.slots.forEach((slot, sIdx) => {
      const entryId = `promes-sem${semester}-${monthTpl.month}-${sIdx}-${Math.random().toString(36).slice(2, 7)}`;

      if (slot.isNonEffective) {
        nonEffectiveWeeksCount += slot.weeksSpan;
        entries.push({
          id: entryId,
          month: sIdx === 0 ? monthTpl.month : '',
          weeks: slot.weeks,
          contentScope: slot.defaultTitle || 'Kegiatan Non-Efektif',
          allocatedJp: '-',
          notes: slot.defaultNotes || 'Kaldik',
          isNonEffective: true,
          grade: gradeLabel,
        });
      } else {
        effectiveWeeksCount += slot.weeksSpan;
        // Allocate ATP if available
        if (atpIndex < semesterAtps.length) {
          const currentAtp = semesterAtps[atpIndex];
          const jpNum = Number(currentAtp.allocatedJp) || 4;
          totalJp += jpNum;

          // Scope name format: "Kelompok Sosial: Pengertian & Karakteristik" or "Core Concept: TP"
          const scopeTitle = currentAtp.coreConcept
            ? `${currentAtp.coreConcept}: ${currentAtp.tpStatement}`
            : currentAtp.tpStatement;

          entries.push({
            id: entryId,
            month: sIdx === 0 ? monthTpl.month : '',
            weeks: slot.weeks,
            contentScope: scopeTitle,
            allocatedJp: `${jpNum} JP`,
            notes: slot.defaultNotes || 'Pembelajaran Efektif',
            isNonEffective: false,
            tpCode: currentAtp.tpCode,
            grade: currentAtp.grade || gradeLabel,
          });
          atpIndex++;
        } else {
          // Extra effective slot for review/enrichment/cadangan
          const jpPerWeek = Number(learningIdentity.jpPerWeek) || 3;
          const cadanganJp = jpPerWeek * slot.weeksSpan;
          totalJp += cadanganJp;

          entries.push({
            id: entryId,
            month: sIdx === 0 ? monthTpl.month : '',
            weeks: slot.weeks,
            contentScope: 'Cadangan / Remedial / Pengayaan & Asesmen Formatif',
            allocatedJp: `${cadanganJp} JP`,
            notes: 'Cadangan / Pengayaan',
            isNonEffective: false,
            grade: gradeLabel,
          });
        }
      }
    });
  });

  // If there are still remaining ATPs for this semester that didn't fit, append them
  while (atpIndex < semesterAtps.length) {
    const extraAtp = semesterAtps[atpIndex];
    const jpNum = Number(extraAtp.allocatedJp) || 4;
    totalJp += jpNum;

    entries.push({
      id: `promes-sem${semester}-extra-${atpIndex}`,
      month: semester === 1 ? 'November' : 'Mei',
      weeks: 'Tambahan',
      contentScope: extraAtp.coreConcept
        ? `${extraAtp.coreConcept}: ${extraAtp.tpStatement}`
        : extraAtp.tpStatement,
      allocatedJp: `${jpNum} JP`,
      notes: 'Pembelajaran Efektif (Pendalaman)',
      isNonEffective: false,
      tpCode: extraAtp.tpCode,
      grade: extraAtp.grade || gradeLabel,
    });
    atpIndex++;
  }

  return {
    semester,
    semesterLabel: semester === 1 ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)',
    grade: gradeLabel,
    academicYear: schoolIdentity.academicYear || '2025/2026',
    totalEffectiveWeeks: effectiveWeeksCount,
    totalNonEffectiveWeeks: nonEffectiveWeeksCount,
    totalJp,
    entries,
  };
}

/**
 * Generate complete Prota and Promes Result
 */
export function generateFullProtaPromes(
  atpList: AtpItem[],
  learningIdentity: LearningIdentity,
  schoolIdentity: SchoolIdentity,
  isApproved = true
): ProtaPromesResult {
  const protaList = generateProta(atpList, learningIdentity);

  // Determine unique grades if multi-grade phase
  const uniqueGrades = Array.from(
    new Set(atpList.map((a) => a.grade).filter(Boolean))
  );

  const promesList: PromesSemester[] = [];

  if (uniqueGrades.length > 1) {
    // Multi-grade phase (e.g. Kelas VII, VIII, IX)
    uniqueGrades.forEach((g) => {
      promesList.push(generatePromesForSemester(1, atpList, learningIdentity, schoolIdentity, g));
      promesList.push(generatePromesForSemester(2, atpList, learningIdentity, schoolIdentity, g));
    });
  } else {
    // Single grade or combined
    const singleGrade = uniqueGrades[0] || learningIdentity.grade || 'Kelas';
    promesList.push(generatePromesForSemester(1, atpList, learningIdentity, schoolIdentity, singleGrade));
    promesList.push(generatePromesForSemester(2, atpList, learningIdentity, schoolIdentity, singleGrade));
  }

  const academicYear = schoolIdentity.academicYear || '2025/2026';

  return {
    isApproved,
    approvalDate: new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    academicYear,
    protaList,
    promesList,
    kaldikHighlights: {
      academicYear,
      oddSemesterEffectiveWeeks: promesList[0]?.totalEffectiveWeeks || 18,
      evenSemesterEffectiveWeeks: promesList[1]?.totalEffectiveWeeks || 18,
      notes: 'Disusun berdasarkan Kalender Pendidikan Resmi Tahun Berjalan Kemendikdasmen.',
    },
  };
}
