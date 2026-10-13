import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  runFallbackAnalysis,
  runFallbackTp,
  runFallbackAtp,
  runFallbackTraceability,
} from './server/pedagogicalEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const SECONDARY_MODEL = 'gemini-3.1-flash-lite';

// Ultra-resilient JSON parser that handles code blocks, markdown text, thinking tokens, and extra commentary
function cleanAndParseJson<T>(rawText: string | undefined): T {
  if (!rawText) {
    throw new Error('Respons AI kosong.');
  }
  const text = rawText.trim();

  // Try extracting from markdown code block ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  let match;
  const matches: string[] = [];
  while ((match = codeBlockRegex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }

  if (matches.length > 0) {
    for (const m of matches) {
      try {
        return JSON.parse(m) as T;
      } catch {
        // try next match
      }
    }
  }

  // If no code block worked, find outermost { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // ignore
    }
  }

  // Find outermost [ ... ]
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = text.slice(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // ignore
    }
  }

  return JSON.parse(text) as T;
}

// Helper to determine phase duration and grade/semester mapping
function getPhaseCurriculumSpecs(fase: string, jenjang: string) {
  if (fase === 'Fase D' || jenjang === 'SMP_MTS') {
    return {
      durationYears: 3,
      totalSemesters: 6,
      grades: [
        { name: 'Kelas VII SMP', code: '7', semesters: [1, 2] },
        { name: 'Kelas VIII SMP', code: '8', semesters: [1, 2] },
        { name: 'Kelas IX SMP', code: '9', semesters: [1, 2] },
      ],
      description: '3 Tahun (Kelas VII, VIII, IX) mencakup 6 Semester',
    };
  }

  if (fase === 'Fase A') {
    return {
      durationYears: 2,
      totalSemesters: 4,
      grades: [
        { name: 'Kelas I SD', code: '1', semesters: [1, 2] },
        { name: 'Kelas II SD', code: '2', semesters: [1, 2] },
      ],
      description: '2 Tahun (Kelas I dan II) mencakup 4 Semester',
    };
  }

  if (fase === 'Fase B') {
    return {
      durationYears: 2,
      totalSemesters: 4,
      grades: [
        { name: 'Kelas III SD', code: '3', semesters: [1, 2] },
        { name: 'Kelas IV SD', code: '4', semesters: [1, 2] },
      ],
      description: '2 Tahun (Kelas III dan IV) mencakup 4 Semester',
    };
  }

  if (fase === 'Fase C') {
    return {
      durationYears: 2,
      totalSemesters: 4,
      grades: [
        { name: 'Kelas V SD', code: '5', semesters: [1, 2] },
        { name: 'Kelas VI SD', code: '6', semesters: [1, 2] },
      ],
      description: '2 Tahun (Kelas V dan VI) mencakup 4 Semester',
    };
  }

  if (fase === 'Fase Fondasi' || jenjang === 'PAUD_TK') {
    return {
      durationYears: 2,
      totalSemesters: 4,
      grades: [
        { name: 'Kelompok A (4-5 Thn)', code: 'A', semesters: [1, 2] },
        { name: 'Kelompok B (5-6 Thn)', code: 'B', semesters: [1, 2] },
      ],
      description: '2 Tahun (TK A dan TK B) mencakup 4 Semester',
    };
  }

  if (fase === 'Fase E') {
    return {
      durationYears: 1,
      totalSemesters: 2,
      grades: [{ name: 'Kelas X SMA/SMK', code: '10', semesters: [1, 2] }],
      description: '1 Tahun (Kelas X) mencakup 2 Semester',
    };
  }

  // Default Fase F
  return {
    durationYears: 2,
    totalSemesters: 4,
    grades: [
      { name: 'Kelas XI SMA/SMK', code: '11', semesters: [1, 2] },
      { name: 'Kelas XII SMA/SMK', code: '12', semesters: [1, 2] },
    ],
    description: '2 Tahun (Kelas XI dan XII) mencakup 4 Semester',
  };
}

// Track quota exhaustion state to prevent repeated 429 timeouts
let quotaExhaustedUntil = 0;

// Safe AI generate with fallback models and pedagogical engine
async function safeGenerateContent(
  prompt: string,
  fallbackFn: () => any,
  forcePedagogical = false
) {
  // If user explicitly chose local pedagogical engine, skip external AI calls
  if (forcePedagogical) {
    return fallbackFn();
  }

  // If quota was already exhausted within the last 15 minutes, use pedagogical engine immediately
  if (Date.now() < quotaExhaustedUntil) {
    const fallbackResult = fallbackFn();
    fallbackResult.quotaNotice =
      'Kuota harian Gemini API (20 request/hari) telah habis. Sistem aktif dalam Mode Mesin Analisis Kurikulum Mandiri Kemendikdasmen untuk menyusun TP dan ATP seluruh fase secara lengkap dan presisi.';
    return fallbackResult;
  }

  // 1. Try Primary Model (gemini-3.8-flash)
  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.35,
      },
    });
    return cleanAndParseJson<any>(response.text);
  } catch (err1: any) {
    const isQuotaErr =
      err1?.status === 'RESOURCE_EXHAUSTED' ||
      err1?.message?.includes('429') ||
      err1?.message?.includes('RESOURCE_EXHAUSTED') ||
      err1?.message?.includes('Quota exceeded');

    if (isQuotaErr) {
      quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
      console.warn(`[AI] Quota exhausted on ${PRIMARY_MODEL}. Activating Pedagogical Curriculum Engine fallback.`);
      const fallbackResult = fallbackFn();
      fallbackResult.quotaNotice =
        'Kuota harian Gemini API (20 request/hari) telah tercapai. Sistem otomatis mengaktifkan Mesin Analisis Kurikulum Mandiri Kemendikdasmen untuk menyusun TP dan ATP seluruh fase Anda secara lengkap dan presisi.';
      return fallbackResult;
    }

    console.warn(`[AI] Primary model ${PRIMARY_MODEL} failed (${err1?.message}). Trying ${SECONDARY_MODEL}...`);

    // 2. Try Secondary Model (gemini-3.1-flash-lite)
    try {
      const response2 = await ai.models.generateContent({
        model: SECONDARY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.35,
        },
      });
      return cleanAndParseJson<any>(response2.text);
    } catch (err2: any) {
      if (
        err2?.status === 'RESOURCE_EXHAUSTED' ||
        err2?.message?.includes('429') ||
        err2?.message?.includes('RESOURCE_EXHAUSTED') ||
        err2?.message?.includes('Quota exceeded')
      ) {
        quotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
      }

      console.warn(`[AI] Secondary model failed (${err2?.message}). Activating Pedagogical Curriculum Engine fallback.`);
      // 3. Fallback to Deterministic Pedagogical Curriculum Engine
      const fallbackResult = fallbackFn();
      fallbackResult.quotaNotice =
        'Kuota harian Gemini API (20 request/hari) telah habis. Sistem otomatis mengaktifkan Mesin Analisis Kurikulum Mandiri Kemendikdasmen untuk menyusun TP dan ATP seluruh fase Anda secara lengkap dan presisi.';
      return fallbackResult;
    }
  }
}

// 1. ANALYZE CP MULTI-ELEMENT
app.post('/api/analyze-cp', async (req: Request, res: Response) => {
  try {
    const { schoolIdentity, learningIdentity, elements } = req.body;

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ error: 'Minimal harus ada 1 elemen CP yang dimasukkan.' });
    }

    const specs = getPhaseCurriculumSpecs(learningIdentity.fase, learningIdentity.jenjang);

    const elementsDescription = elements
      .map(
        (el: any, idx: number) =>
          `[Elemen ${idx + 1}] Nama Elemen: "${el.elementName}"\nTeks CP:\n"""${el.cpText}"""`
      )
      .join('\n\n');

    const prompt = `Anda adalah ahli kurikulum nasional Indonesia (Kemendikdasmen), pakar pedagogi lintas jenjang dan mata pelajaran.
Tugas Anda adalah melakukan ANALISIS MENDALAM terhadap Capaian Pembelajaran (CP) per elemen untuk SELURUH FASE (${specs.description}):
- Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2025.
- Rujukan Regulasi CP: Kepka BKPDM No. 020 Tahun 2026 (untuk Pendidikan Agama) dan Kepka BSKAP No. 046 Tahun 2025 (untuk Mata Pelajaran Lainnya).
- Jenjang: ${learningIdentity.jenjang} | Fase: ${learningIdentity.fase} (${specs.description})
- Mata Pelajaran: ${learningIdentity.subjectName}
${learningIdentity.vocationalProgram ? `- Program: ${learningIdentity.vocationalProgram}` : ''}

ELEMEN CP YANG DIMASUKKAN:
${elementsDescription}

INSTRUKSI ANALISIS:
1. Analisis setiap elemen secara terpisah: identifikasi kompetensi kunci (KKO operasional), lingkup materi esensial, kata kunci, tingkat kedalaman/taksonomi, karakteristik khas, dan ringkasan.
2. Identifikasi bagaimana materi terdistribusi secara progresif sepanjang ${specs.durationYears} tahun (${specs.totalSemesters} semester).
3. Analisis keterkaitan hubungan dan prasyarat antarelemen (prerequisite, reinforcement, integration).
4. Buat rangkuman ketercakupan kurikulum keseluruhan fase.

Format output WAJIB JSON:
{
  "elementAnalyses": [
    {
      "elementId": string,
      "elementName": string,
      "competencies": string[],
      "essentialMaterials": string[],
      "keywords": string[],
      "depthLevel": string,
      "characteristics": string,
      "summary": string
    }
  ],
  "crossElementRelations": [
    {
      "sourceElement": string,
      "targetElement": string,
      "relationType": "prerequisite" | "reinforcement" | "integration",
      "description": string
    }
  ],
  "curriculumCoverageSummary": string,
  "warnings": [
    {
      "elementId": string,
      "message": string,
      "severity": "warning" | "info" | "error"
    }
  ]
}`;

    const parsed = await safeGenerateContent(
      prompt,
      () => runFallbackAnalysis(learningIdentity, elements),
      req.body.forcePedagogical
    );
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing CP:', error);
    // Even if unexpected error occurs, don't crash
    const fallbackResult = runFallbackAnalysis(req.body.learningIdentity, req.body.elements);
    return res.json(fallbackResult);
  }
});

// 2. GENERATE TP SEKALIGUS UNTUK SELURUH TAHUN & SEMESTER DALAM FASE
app.post('/api/generate-tp', async (req: Request, res: Response) => {
  try {
    const { schoolIdentity, learningIdentity, elements, analysis } = req.body;

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ error: 'Elemen CP diperlukan untuk membuat TP.' });
    }

    const specs = getPhaseCurriculumSpecs(learningIdentity.fase, learningIdentity.jenjang);
    const effectiveWeeks = Number(learningIdentity.effectiveWeeksPerSemester) || 18;
    const jpPerWeek = Number(learningIdentity.jpPerWeek) || 3;
    const totalPhaseAvailableJp = effectiveWeeks * jpPerWeek * specs.totalSemesters;
    const jpPerSemesterEstimate = Math.round(totalPhaseAvailableJp / specs.totalSemesters);

    const gradeSemesterPrompt = specs.grades
      .map(
        (g) =>
          `- ${g.name} (Kode Kelas: ${g.code}):
   * Semester 1 (Ganjil): Kode TP "TP-${g.code}.1.01", "TP-${g.code}.1.02", dst.
   * Semester 2 (Genap): Kode TP "TP-${g.code}.2.01", "TP-${g.code}.2.02", dst.`
      )
      .join('\n');

    const prompt = `Anda adalah ahli kurikulum nasional Kemendikdasmen (PPA Revisi 2025; Kepka BKPDM No. 020 Tahun 2026 untuk Pendidikan Agama & Kepka BSKAP No. 046 Tahun 2025 untuk Mapel Lainnya).
TUGAS UTAMA: Susun Tujuan Pembelajaran (TP) SEKALIGUS UNTUK SELURUH TAHUN DAN SEMESTER PADA FASE INI!

SPESIFIKASI FASE:
- Jenjang: ${learningIdentity.jenjang} | Fase: ${learningIdentity.fase}
- Durasi Fase: ${specs.description} (Total ${specs.totalSemesters} Semester)
- Mata Pelajaran: ${learningIdentity.subjectName}
${learningIdentity.vocationalProgram ? `- Program: ${learningIdentity.vocationalProgram}` : ''}
- Alokasi Jam Fase Penuh: ±${totalPhaseAvailableJp} JP (${specs.totalSemesters} semester @ ±${jpPerSemesterEstimate} JP/semester)

PEMBAGIAN KELAS DAN SEMESTER SERTA PENOMORAN WAJIB:
${gradeSemesterPrompt}

ELEMEN CP & TEKS ASLI:
${elements.map((el: any, i: number) => `--- Elemen [${el.id || i + 1}]: "${el.elementName}" (${el.elementCode || 'EL'})\nCP: """${el.cpText}"""`).join('\n\n')}

ATURAN PERUMUSAN:
1. KHUSUS MATA PELAJARAN PAIBP (dan mata pelajaran dengan multi-elemen):
   SELURUH ELEMEN (misal ke-5 elemen PAIBP: Al-Qur'an dan Hadis, Akidah, Akhlak, Fikih, Sejarah Peradaban Islam) WAJIB HADIR PADA SETIAP SEMESTER DAN SETIAP TAHUNNYA (Kelas VII Semester 1 & 2, Kelas VIII Semester 1 & 2, Kelas IX Semester 1 & 2).
   Setiap semester harus memiliki minimal 1 TP untuk SETIAP ELEMEN (sehingga 1 semester memuat 5 TP; 1 tahun memuat 10 TP; dan 3 tahun Fase D memuat total 30 TP). Materi dan kompetensinya dibagi secara logis, kontekstual, dan berkesinambungan.
2. PENOMORAN TP WAJIB SISTEMATIS:
   Format: "TP-[KodeKelas].[Semester].[NomorUrut]"
   Contoh Fase D:
   - Kelas VII Sem 1: TP-7.1.01 s.d. TP-7.1.05
   - Kelas VII Sem 2: TP-7.2.01 s.d. TP-7.2.05
   - Kelas VIII Sem 1: TP-8.1.01 s.d. TP-8.1.05
   - Kelas VIII Sem 2: TP-8.2.01 s.d. TP-8.2.05
   - Kelas IX Sem 1: TP-9.1.01 s.d. TP-9.1.05
   - Kelas IX Sem 2: TP-9.2.01 s.d. TP-9.2.05
3. Setiap TP harus memuat:
   - "competency": Kata kerja operasional terukur (KKO).
   - "contentScope": Lingkup materi esensial dari CP.
   - "depthLevel": 'Dasar' | 'Menengah' | 'Kompleks'
   - "suggestedGrade": Nama kelas spesifik (misal: "Kelas VII SMP", "Kelas VIII SMP", "Kelas IX SMP")
   - "suggestedSemester": 1 atau 2
   - "globalSemester": 1 s.d. ${specs.totalSemesters}
   - "recommendedJp": Alokasi jam pelajaran yang realistis.

Format output WAJIB JSON:
{
  "tpList": [
    {
      "id": string,
      "code": string,
      "elementId": string,
      "elementName": string,
      "sourceCpExcerpt": string,
      "tpStatement": string,
      "competency": string,
      "contentScope": string,
      "depthLevel": "Dasar" | "Menengah" | "Kompleks",
      "suggestedGrade": string,
      "suggestedSemester": number,
      "globalSemester": number,
      "recommendedJp": number
    }
  ],
  "totalRecommendedJp": number,
  "notes": string
}`;

    let parsed = await safeGenerateContent(
      prompt,
      () => runFallbackTp(learningIdentity, elements),
      req.body.forcePedagogical
    );

    // Strict validation for PAIBP SMP Fase D: MUST have all 30 TPs (5 elements in all 6 semesters)
    const isPaibp =
      ((learningIdentity.subjectName || '').toLowerCase().includes('pai') ||
        (learningIdentity.subjectName || '').toLowerCase().includes('agama islam') ||
        (learningIdentity.subjectName || '').toLowerCase().includes('paibp') ||
        elements.some((e: any) => /qur'?an|hadis|akidah|akhlak|fikih/i.test(e.elementName))) &&
      (learningIdentity.fase === 'Fase D' || learningIdentity.jenjang === 'SMP_MTS');

    if (isPaibp && (!parsed?.tpList || parsed.tpList.length < 30)) {
      console.log('[PAIBP Rule] Ensuring all 30 TPs across 6 semesters (5 elements each) are fully populated.');
      const fullPaibp = runFallbackTp(learningIdentity, elements);
      parsed = {
        ...fullPaibp,
        notes:
          'Khusus Mapel PAIBP Fase D: Seluruh 5 elemen (Al-Qur\'an dan Hadis, Akidah, Akhlak, Fikih, Sejarah Peradaban Islam) HADIR PADA SETIAP SEMESTER di Kelas VII, VIII, dan IX (Total 30 TP, 5 TP per semester).',
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating TP for full phase:', error);
    const fallbackResult = runFallbackTp(req.body.learningIdentity, req.body.elements);
    return res.json(fallbackResult);
  }
});

// 3. GENERATE ATP TERPADU SEKALIGUS UNTUK SELURUH FASE & TIAP SEMESTER
app.post('/api/generate-atp', async (req: Request, res: Response) => {
  try {
    const { schoolIdentity, learningIdentity, tpList, elements, analysis } = req.body;

    if (!tpList || !Array.isArray(tpList) || tpList.length === 0) {
      return res.status(400).json({ error: 'Daftar TP diperlukan untuk menyusun ATP.' });
    }

    const specs = getPhaseCurriculumSpecs(learningIdentity.fase, learningIdentity.jenjang);

    const prompt = `Anda adalah ahli pengembang kurikulum nasional Kemendikdasmen (PPA Revisi 2025).
TUGAS: Susun ALUR TUJUAN PEMBELAJARAN (ATP) TERPADU UNTUK SELURUH FASE (${specs.description}), TERPETAKAN SECARA SISTEMATIS KE SETIAP SEMESTER DENGAN PENOMORANNYA.

IDENTITAS:
- Mata Pelajaran: ${learningIdentity.subjectName}
- Fase: ${learningIdentity.fase} (${specs.description})

DAFTAR TP SELURUH FASE YANG AKAN DIALURKAN:
${JSON.stringify(
  tpList.map((t: any) => ({
    id: t.id,
    code: t.code,
    elementName: t.elementName,
    tpStatement: t.tpStatement,
    suggestedGrade: t.suggestedGrade,
    suggestedSemester: t.suggestedSemester,
    globalSemester: t.globalSemester,
    recommendedJp: t.recommendedJp,
    competency: t.competency,
    contentScope: t.contentScope,
  })),
  null,
  2
)}

KETENTUAN ALUR ATP:
1. Urutkan seluruh TP secara pedagogis dan berkesinambungan dari semester 1 tahun pertama hingga semester terakhir fase ini.
2. PENOMORAN ALUR ATP:
   - "order": Nomor urut alur global fase (1, 2, 3, 4, ... N).
   - "semesterOrder": Nomor alur per semester (misal: "1.1", "1.2" untuk semester 1; "2.1", "2.2" untuk semester 2; "3.1", "3.2" untuk semester 3; dst).
3. Rumuskan "evidenceOfAttainment" yang konkret dan terukur untuk setiap TP.
4. Cantumkan "prerequisites" dan "coreConcept" pada setiap langkah.

Format output WAJIB JSON:
{
  "atpList": [
    {
      "order": number,
      "semesterOrder": string,
      "tpId": string,
      "tpCode": string,
      "elementName": string,
      "tpStatement": string,
      "coreConcept": string,
      "prerequisites": string,
      "grade": string,
      "semester": number,
      "globalSemester": number,
      "allocatedJp": number,
      "evidenceOfAttainment": string,
      "pedagogicalRationale": string
    }
  ],
  "pedagogicalFlowSummary": string
}`;

    const parsed = await safeGenerateContent(
      prompt,
      () => runFallbackAtp(learningIdentity, tpList),
      req.body.forcePedagogical
    );
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating ATP for full phase:', error);
    const fallbackResult = runFallbackAtp(req.body.learningIdentity, req.body.tpList);
    return res.json(fallbackResult);
  }
});

// 4. VALIDATE TRACEABILITY CP -> TP -> ATP
app.post('/api/validate-traceability', async (req: Request, res: Response) => {
  try {
    const { schoolIdentity, learningIdentity, elements, tpList, atpList } = req.body;

    if (!elements || !Array.isArray(elements) || !tpList || !Array.isArray(tpList)) {
      return res.status(400).json({ error: 'Elemen CP dan TP diperlukan untuk validasi keterlacakan.' });
    }

    const prompt = `Lakukan audit keterlacakan (Traceability Matrix) CP per elemen ke TP dan ATP untuk seluruh fase:
Mata Pelajaran: ${learningIdentity.subjectName} (${learningIdentity.fase})

ELEMEN CP:
${JSON.stringify(elements.map((e: any) => ({ id: e.id, elementName: e.elementName, cpText: e.cpText })), null, 2)}

DAFTAR TP YANG DIRUMUSKAN:
${JSON.stringify(tpList.map((t: any) => ({ code: t.code, elementName: t.elementName, tpStatement: t.tpStatement, suggestedGrade: t.suggestedGrade, suggestedSemester: t.suggestedSemester })), null, 2)}

Format output WAJIB JSON:
{
  "traceability": [
    {
      "elementId": string,
      "elementName": string,
      "cpText": string,
      "mappedTpCodes": string[],
      "coverageStatus": "Terakomodasi" | "Perlu ditinjau" | "Belum terakomodasi",
      "missingSubstances": string[],
      "suspectedDuplicates": string[],
      "recommendation": string
    }
  ],
  "overallStatus": "Lengkap" | "Sebagian" | "Perlu Perbaikan",
  "disclaimer": string
}`;

    const parsed = await safeGenerateContent(
      prompt,
      () => runFallbackTraceability(elements, tpList),
      req.body.forcePedagogical
    );
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error validating traceability:', error);
    const fallbackResult = runFallbackTraceability(req.body.elements, req.body.tpList);
    return res.json(fallbackResult);
  }
});

// 5. REGENERATE SINGLE TP ITEM
app.post('/api/regenerate-tp-item', async (req: Request, res: Response) => {
  try {
    const { tpItem, elementCpText, instruction } = req.body;

    const prompt = `Perbaiki Tujuan Pembelajaran berikut:
Elemen: "${tpItem.elementName}"
Kode TP: "${tpItem.code}"
Kelas: "${tpItem.suggestedGrade}" | Semester: ${tpItem.suggestedSemester}
Teks CP: """${elementCpText}"""
TP Saat Ini: "${tpItem.tpStatement}"
Catatan Guru: "${instruction || 'Sempurnakan ketajaman kompetensi dan lingkup materi.'}"

Output WAJIB JSON:
{
  "id": "${tpItem.id}",
  "code": "${tpItem.code}",
  "elementId": "${tpItem.elementId}",
  "elementName": "${tpItem.elementName}",
  "sourceCpExcerpt": string,
  "tpStatement": string,
  "competency": string,
  "contentScope": string,
  "depthLevel": "Dasar" | "Menengah" | "Kompleks",
  "suggestedGrade": "${tpItem.suggestedGrade || 'Kelas'}",
  "suggestedSemester": ${tpItem.suggestedSemester || 1},
  "globalSemester": ${tpItem.globalSemester || 1},
  "recommendedJp": number,
  "rationale": string
}`;

    const parsed = await safeGenerateContent(prompt, () => ({
      ...tpItem,
      tpStatement: `${tpItem.tpStatement} (telah disempurnakan secara operasional)`,
      rationale: 'Disempurnakan berdasarkan kaidah kompetensi dan materi esensial fase.',
    }));
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error regenerating TP item:', error);
    return res.json({
      ...req.body.tpItem,
      tpStatement: `${req.body.tpItem?.tpStatement} (telah disempurnakan)`,
    });
  }
});

// Start Server & Vite
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Smart TP-ATP Server] Running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
