import { Jenjang, Fase, CpElement, PhaseGradeSemester } from '../types/curriculum';

export interface PhaseDetails {
  fase: Fase;
  durationYears: number;
  totalSemesters: number;
  grades: {
    gradeName: string;
    gradeCode: string;
    semesters: {
      semester: 1 | 2;
      globalSemester: number;
      label: string;
    }[];
  }[];
}

export function getPhaseDetails(fase: Fase, isSmk4Years = false): PhaseDetails {
  switch (fase) {
    case 'Fase Fondasi':
      return {
        fase: 'Fase Fondasi',
        durationYears: 2,
        totalSemesters: 4,
        grades: [
          {
            gradeName: 'Kelompok A (Usia 4-5 Tahun)',
            gradeCode: 'A',
            semesters: [
              { semester: 1, globalSemester: 1, label: 'Kelompok A - Semester 1' },
              { semester: 2, globalSemester: 2, label: 'Kelompok A - Semester 2' },
            ],
          },
          {
            gradeName: 'Kelompok B (Usia 5-6 Tahun)',
            gradeCode: 'B',
            semesters: [
              { semester: 1, globalSemester: 3, label: 'Kelompok B - Semester 1' },
              { semester: 2, globalSemester: 4, label: 'Kelompok B - Semester 2' },
            ],
          },
        ],
      };

    case 'Fase A':
      return {
        fase: 'Fase A',
        durationYears: 2,
        totalSemesters: 4,
        grades: [
          {
            gradeName: 'Kelas I SD',
            gradeCode: '1',
            semesters: [
              { semester: 1, globalSemester: 1, label: 'Kelas I - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 2, label: 'Kelas I - Semester 2 (Genap)' },
            ],
          },
          {
            gradeName: 'Kelas II SD',
            gradeCode: '2',
            semesters: [
              { semester: 1, globalSemester: 3, label: 'Kelas II - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 4, label: 'Kelas II - Semester 2 (Genap)' },
            ],
          },
        ],
      };

    case 'Fase B':
      return {
        fase: 'Fase B',
        durationYears: 2,
        totalSemesters: 4,
        grades: [
          {
            gradeName: 'Kelas III SD',
            gradeCode: '3',
            semesters: [
              { semester: 1, globalSemester: 1, label: 'Kelas III - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 2, label: 'Kelas III - Semester 2 (Genap)' },
            ],
          },
          {
            gradeName: 'Kelas IV SD',
            gradeCode: '4',
            semesters: [
              { semester: 1, globalSemester: 3, label: 'Kelas IV - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 4, label: 'Kelas IV - Semester 2 (Genap)' },
            ],
          },
        ],
      };

    case 'Fase C':
      return {
        fase: 'Fase C',
        durationYears: 2,
        totalSemesters: 4,
        grades: [
          {
            gradeName: 'Kelas V SD',
            gradeCode: '5',
            semesters: [
              { semester: 1, globalSemester: 1, label: 'Kelas V - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 2, label: 'Kelas V - Semester 2 (Genap)' },
            ],
          },
          {
            gradeName: 'Kelas VI SD',
            gradeCode: '6',
            semesters: [
              { semester: 1, globalSemester: 3, label: 'Kelas VI - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 4, label: 'Kelas VI - Semester 2 (Genap)' },
            ],
          },
        ],
      };

    case 'Fase D':
      return {
        fase: 'Fase D',
        durationYears: 3,
        totalSemesters: 6,
        grades: [
          {
            gradeName: 'Kelas VII SMP',
            gradeCode: '7',
            semesters: [
              { semester: 1, globalSemester: 1, label: 'Kelas VII - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 2, label: 'Kelas VII - Semester 2 (Genap)' },
            ],
          },
          {
            gradeName: 'Kelas VIII SMP',
            gradeCode: '8',
            semesters: [
              { semester: 1, globalSemester: 3, label: 'Kelas VIII - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 4, label: 'Kelas VIII - Semester 2 (Genap)' },
            ],
          },
          {
            gradeName: 'Kelas IX SMP',
            gradeCode: '9',
            semesters: [
              { semester: 1, globalSemester: 5, label: 'Kelas IX - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 6, label: 'Kelas IX - Semester 2 (Genap)' },
            ],
          },
        ],
      };

    case 'Fase E':
      return {
        fase: 'Fase E',
        durationYears: 1,
        totalSemesters: 2,
        grades: [
          {
            gradeName: 'Kelas X SMA/SMK',
            gradeCode: '10',
            semesters: [
              { semester: 1, globalSemester: 1, label: 'Kelas X - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 2, label: 'Kelas X - Semester 2 (Genap)' },
            ],
          },
        ],
      };

    case 'Fase F':
    default:
      if (isSmk4Years) {
        return {
          fase: 'Fase F',
          durationYears: 3,
          totalSemesters: 6,
          grades: [
            {
              gradeName: 'Kelas XI SMK',
              gradeCode: '11',
              semesters: [
                { semester: 1, globalSemester: 1, label: 'Kelas XI - Semester 1 (Ganjil)' },
                { semester: 2, globalSemester: 2, label: 'Kelas XI - Semester 2 (Genap)' },
              ],
            },
            {
              gradeName: 'Kelas XII SMK',
              gradeCode: '12',
              semesters: [
                { semester: 1, globalSemester: 3, label: 'Kelas XII - Semester 1 (Ganjil)' },
                { semester: 2, globalSemester: 4, label: 'Kelas XII - Semester 2 (Genap)' },
              ],
            },
            {
              gradeName: 'Kelas XIII SMK (4 Tahun)',
              gradeCode: '13',
              semesters: [
                { semester: 1, globalSemester: 5, label: 'Kelas XIII - Semester 1 (Ganjil)' },
                { semester: 2, globalSemester: 6, label: 'Kelas XIII - Semester 2 (Genap)' },
              ],
            },
          ],
        };
      }
      return {
        fase: 'Fase F',
        durationYears: 2,
        totalSemesters: 4,
        grades: [
          {
            gradeName: 'Kelas XI SMA/SMK',
            gradeCode: '11',
            semesters: [
              { semester: 1, globalSemester: 1, label: 'Kelas XI - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 2, label: 'Kelas XI - Semester 2 (Genap)' },
            ],
          },
          {
            gradeName: 'Kelas XII SMA/SMK',
            gradeCode: '12',
            semesters: [
              { semester: 1, globalSemester: 3, label: 'Kelas XII - Semester 1 (Ganjil)' },
              { semester: 2, globalSemester: 4, label: 'Kelas XII - Semester 2 (Genap)' },
            ],
          },
        ],
      };
  }
}

export interface CurriculumPreset {
  id: string;
  title: string;
  jenjang: Jenjang;
  grade: string;
  fase: Fase;
  subjectName: string;
  vocationalProgram?: string;
  jpPerWeek: number;
  minutesPerJp: number;
  effectiveWeeks: number;
  targetSemester: 'Fase Penuh (Semua Semester)' | 'Semester 1' | 'Semester 2' | 'Semester 1 & 2';
  regulationRef: string;
  elements: CpElement[];
}

import { ALL_CURRICULUM_PRESETS } from './presetsData';

export const CURRICULUM_PRESETS: CurriculumPreset[] = ALL_CURRICULUM_PRESETS;

export const JENJANG_CONFIG: Record<
  Jenjang,
  {
    label: string;
    allowedFase: Fase[];
    defaultMinutesPerJp: number;
    gradeOptions: string[];
    defaultJpPerWeek: number;
  }
> = {
  PAUD_TK: {
    label: 'TK / PAUD & RA',
    allowedFase: ['Fase Fondasi'],
    defaultMinutesPerJp: 30,
    gradeOptions: ['Fase Fondasi Penuh (TK A & TK B / 2 Tahun)', 'TK A (Usia 4-5 Tahun)', 'TK B (Usia 5-6 Tahun)'],
    defaultJpPerWeek: 15,
  },
  SD_MI: {
    label: 'SD / MI',
    allowedFase: ['Fase A', 'Fase B', 'Fase C'],
    defaultMinutesPerJp: 35,
    gradeOptions: [
      'Fase A Penuh (Kelas I & II / 2 Tahun)',
      'Fase B Penuh (Kelas III & IV / 2 Tahun)',
      'Fase C Penuh (Kelas V & VI / 2 Tahun)',
      'Kelas I',
      'Kelas II',
      'Kelas III',
      'Kelas IV',
      'Kelas V',
      'Kelas VI',
    ],
    defaultJpPerWeek: 4,
  },
  SMP_MTS: {
    label: 'SMP / MTs',
    allowedFase: ['Fase D'],
    defaultMinutesPerJp: 40,
    gradeOptions: ['Fase D Penuh (Kelas VII, VIII, IX / 3 Tahun)', 'Kelas VII', 'Kelas VIII', 'Kelas IX'],
    defaultJpPerWeek: 3,
  },
  SMA_MA: {
    label: 'SMA / MA',
    allowedFase: ['Fase E', 'Fase F'],
    defaultMinutesPerJp: 45,
    gradeOptions: ['Fase E (Kelas X / 1 Tahun)', 'Fase F Penuh (Kelas XI & XII / 2 Tahun)', 'Kelas X', 'Kelas XI', 'Kelas XII'],
    defaultJpPerWeek: 4,
  },
  SMK_MAK: {
    label: 'SMK / MAK',
    allowedFase: ['Fase E', 'Fase F'],
    defaultMinutesPerJp: 45,
    gradeOptions: [
      'Fase E (Kelas X / 1 Tahun)',
      'Fase F Penuh (Kelas XI & XII / 2 Tahun)',
      'Fase F Penuh (Kelas XI, XII, XIII / 3 Tahun)',
      'Kelas X',
      'Kelas XI',
      'Kelas XII',
      'Kelas XIII',
    ],
    defaultJpPerWeek: 12,
  },
};

export function recommendFase(jenjang: Jenjang, grade: string): Fase {
  if (jenjang === 'PAUD_TK') return 'Fase Fondasi';
  if (jenjang === 'SD_MI') {
    if (grade.includes('A') || grade.includes('I') && !grade.includes('III') && !grade.includes('IV') && !grade.includes('V') && !grade.includes('VI')) return 'Fase A';
    if (grade.includes('B') || grade.includes('III') || grade.includes('IV')) return 'Fase B';
    return 'Fase C';
  }
  if (jenjang === 'SMP_MTS') return 'Fase D';
  if (jenjang === 'SMA_MA' || jenjang === 'SMK_MAK') {
    if (grade.includes('E') || grade.includes('X') && !grade.includes('XI') && !grade.includes('XII') && !grade.includes('XIII')) return 'Fase E';
    return 'Fase F';
  }
  return 'Fase D';
}

export function getSubjectRegulationRef(subjectName: string): string {
  const s = (subjectName || '').toLowerCase();
  const isAgama =
    s.includes('agama') ||
    s.includes('pai') ||
    s.includes('akidah') ||
    s.includes('fikih') ||
    s.includes('islam') ||
    s.includes('kristen') ||
    s.includes('katolik') ||
    s.includes('hindu') ||
    s.includes('buddha') ||
    s.includes('khonghucu');

  if (isAgama) {
    return 'Kepka BKPDM Nomor 020 Tahun 2026';
  }
  return 'Kepka BSKAP Nomor 046/H/KR/2025';
}

export function getPresetsForFaseAndJenjang(fase: Fase, jenjang?: Jenjang): CurriculumPreset[] {
  return CURRICULUM_PRESETS.filter((p) => p.fase === fase && (!jenjang || p.jenjang === jenjang));
}

export function findMatchingPreset(
  fase: Fase,
  subjectName: string,
  jenjang?: Jenjang
): CurriculumPreset | undefined {
  if (!subjectName || !subjectName.trim()) return undefined;
  const s = subjectName.trim().toLowerCase();

  // 1. Prioritize same fase and jenjang
  let pool = CURRICULUM_PRESETS.filter((p) => p.fase === fase);
  if (jenjang) {
    const withJenjang = pool.filter((p) => p.jenjang === jenjang);
    if (withJenjang.length > 0) pool = withJenjang;
  }

  // Exact subjectName match
  let found = pool.find((p) => p.subjectName.toLowerCase() === s);
  if (found) return found;

  // Partial match in subjectName
  found = pool.find((p) => p.subjectName.toLowerCase().includes(s) || s.includes(p.subjectName.toLowerCase()));
  if (found) return found;

  // Title match
  found = pool.find((p) => p.title.toLowerCase().includes(s));
  if (found) return found;

  // Specialized keywords
  if (s.includes('pai') || s.includes('agama islam') || s.includes('paibp')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('agama islam') || p.id.includes('pai'));
    if (found) return found;
  }
  if (s.includes('matematik') || s.includes('mtk')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('matematika'));
    if (found) return found;
  }
  if (s.includes('ipa') || s.includes('alam')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('alam') || p.id.includes('ipa'));
    if (found) return found;
  }
  if (s.includes('ips') || s.includes('sosial')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('sosial') || p.id.includes('ips'));
    if (found) return found;
  }
  if (s.includes('pjok') || s.includes('olahraga') || s.includes('jasmani')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('jasmani') || p.id.includes('pjok'));
    if (found) return found;
  }
  if (s.includes('kka') || s.includes('koding') || s.includes('kecerdasan artifisial') || s.includes('ai')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('koding') || p.id.includes('kka'));
    if (found) return found;
  }
  if (s.includes('seni') || s.includes('rupa') || s.includes('musik')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('seni'));
    if (found) return found;
  }
  if (s.includes('pancasila') || s.includes('ppkn')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('pancasila'));
    if (found) return found;
  }
  if (s.includes('inggris') || s.includes('english')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('inggris'));
    if (found) return found;
  }
  if (s.includes('indonesia')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('indonesia'));
    if (found) return found;
  }
  if (s.includes('sunda') || s.includes('jawa') || s.includes('daerah') || s.includes('mulok')) {
    found = pool.find((p) => p.subjectName.toLowerCase().includes('daerah') || p.id.includes('sunda') || p.id.includes('bd'));
    if (found) return found;
  }

  // Fallback: search across any fase
  if (!found) {
    found = CURRICULUM_PRESETS.find(
      (p) => p.subjectName.toLowerCase().includes(s) || s.includes(p.subjectName.toLowerCase())
    );
  }

  return found;
}
