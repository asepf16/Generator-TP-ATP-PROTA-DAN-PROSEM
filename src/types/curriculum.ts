export type Jenjang = 'PAUD_TK' | 'SD_MI' | 'SMP_MTS' | 'SMA_MA' | 'SMK_MAK';

export type Fase = 'Fase Fondasi' | 'Fase A' | 'Fase B' | 'Fase C' | 'Fase D' | 'Fase E' | 'Fase F';

export interface SchoolIdentity {
  schoolName: string;
  npsnNsm: string;
  teacherName: string;
  academicYear: string;
  curriculum: string;
  principalName?: string;
  nipTeacher?: string;
  nipPrincipal?: string;
}

export interface LearningIdentity {
  jenjang: Jenjang;
  grade: string; // e.g. "Kelas VII, VIII, IX (Fase Penuh 3 Tahun)"
  fase: Fase;
  subjectName: string;
  vocationalProgram?: string; // Untuk SMK/MAK (Program / Konsentrasi Keahlian)
  yearsOfStudy?: 3 | 4; // Untuk SMK (3 atau 4 tahun)
  targetSemester: 'Fase Penuh (Semua Semester)' | 'Semester 1' | 'Semester 2' | 'Semester 1 & 2';
  effectiveWeeksPerSemester: number; // e.g. 18
  jpPerWeek: number; // e.g. 3
  minutesPerJp: number; // e.g. 40
}

export interface PhaseGradeSemester {
  gradeName: string; // e.g. "Kelas VII"
  gradeCode: string; // e.g. "7"
  semester: 1 | 2;
  globalSemester: number; // e.g. 1 to 6
  label: string; // e.g. "Kelas VII - Semester 1 (Ganjil)"
}

export interface CpElement {
  id: string;
  elementName: string;
  cpText: string;
  elementCode?: string; // e.g. "ALQ", "BIL", "SIM"
}

export interface ElementAnalysis {
  elementId: string;
  elementName: string;
  competencies: string[];
  essentialMaterials: string[];
  keywords: string[];
  depthLevel: string; // e.g. "C1-C4 (Konseptual & Prosedural)"
  characteristics: string;
  summary: string;
}

export interface CrossElementRelation {
  sourceElement: string;
  targetElement: string;
  relationType: 'prerequisite' | 'reinforcement' | 'integration';
  description: string;
}

export interface AnalysisResult {
  elementAnalyses: ElementAnalysis[];
  crossElementRelations: CrossElementRelation[];
  curriculumCoverageSummary: string;
  warnings: {
    elementId?: string;
    message: string;
    severity: 'warning' | 'info' | 'error';
  }[];
  quotaNotice?: string;
  isQuotaFallback?: boolean;
}

export interface LearningObjective {
  id: string;
  code: string; // e.g. "TP-7.1.01", "TP-1.1.01"
  elementId: string;
  elementName: string;
  sourceCpExcerpt: string;
  tpStatement: string; // Rumusan TP operasional
  competency: string; // Kompetensi utama
  contentScope: string; // Lingkup materi
  depthLevel: 'Dasar' | 'Menengah' | 'Kompleks';
  suggestedGrade: string; // e.g. "Kelas VII", "Kelas VIII", "Kelas IX"
  suggestedSemester: number; // 1 or 2
  globalSemester?: number; // 1 to 6
  recommendedJp: number;
}

export interface AtpItem {
  order: number; // Urutan global fase: 1, 2, 3..
  semesterOrder?: string; // e.g. "1.1", "1.2", "2.1", "3.1"
  tpId: string;
  tpCode: string;
  elementName: string;
  tpStatement: string;
  coreConcept: string;
  prerequisites: string;
  grade: string;
  semester: number;
  globalSemester?: number;
  allocatedJp: number;
  evidenceOfAttainment: string; // Bukti ketercapaian / IKTP
  pedagogicalRationale?: string;
}

export interface AtpResult {
  atpList: AtpItem[];
  pedagogicalFlowSummary: string;
  quotaNotice?: string;
  isQuotaFallback?: boolean;
}

export interface TraceabilityItem {
  elementId: string;
  elementName: string;
  cpText: string;
  mappedTpCodes: string[];
  coverageStatus: 'Terakomodasi' | 'Perlu ditinjau' | 'Belum terakomodasi';
  missingSubstances: string[];
  suspectedDuplicates: string[];
  recommendation: string;
}

export interface TraceabilityResult {
  traceability: TraceabilityItem[];
  overallStatus: 'Lengkap' | 'Sebagian' | 'Perlu Perbaikan';
  disclaimer: string;
  quotaNotice?: string;
  isQuotaFallback?: boolean;
}

export interface TimeCalculation {
  effectiveWeeks: number;
  jpPerWeek: number;
  minutesPerJp: number;
  totalSemesters: number;
  totalAvailableJp: number;
  totalAvailableMinutes: number;
  allocatedJp: number;
  allocatedMinutes: number;
  remainingJp: number;
  isOverAllocated: boolean;
  byElement: Record<string, number>;
  byGrade: Record<string, number>;
  bySemester: Record<string, number>; // key: "Kelas VII - Sem 1" etc.
}

export interface ProtaItem {
  no: number;
  tpCode: string;
  atpContent: string; // "Alur Tujuan Pembelajaran (ATP) / Lingkup Materi"
  elementName: string;
  grade: string;
  semester: 1 | 2;
  globalSemester?: number;
  allocatedJp: number;
}

export interface PromesEntry {
  id: string;
  month: string; // Bulan: Juli, Agustus, dll.
  weeks: string; // Minggu ke-: M1 - M2, M3 - M4, M1, dll.
  contentScope: string; // Lingkup Materi / Tujuan Pembelajaran (TP)
  allocatedJp: number | string; // e.g. 8, "8 JP", or "-"
  notes: string; // Keterangan: e.g. "MPLS / Transisi", "Pembelajaran Efektif", "STS", "SAS", "Libur Semester"
  isNonEffective?: boolean;
  tpCode?: string;
  grade?: string;
}

export interface PromesSemester {
  semester: 1 | 2;
  semesterLabel: string; // "Semester 1 (Ganjil)" atau "Semester 2 (Genap)"
  grade: string;
  academicYear: string;
  totalEffectiveWeeks: number;
  totalNonEffectiveWeeks: number;
  totalJp: number;
  entries: PromesEntry[];
}

export interface ProtaPromesResult {
  isApproved: boolean;
  approvalDate?: string;
  academicYear: string;
  protaList: ProtaItem[];
  promesList: PromesSemester[];
  kaldikHighlights?: {
    academicYear: string;
    oddSemesterEffectiveWeeks: number;
    evenSemesterEffectiveWeeks: number;
    notes: string;
  };
}

export interface FullDocumentState {
  schoolIdentity: SchoolIdentity;
  learningIdentity: LearningIdentity;
  elements: CpElement[];
  analysis?: AnalysisResult;
  tpList?: LearningObjective[];
  atpResult?: AtpResult;
  traceability?: TraceabilityResult;
  protaPromes?: ProtaPromesResult;
  teacherNotes?: string;
}
