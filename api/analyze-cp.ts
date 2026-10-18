import { GoogleGenAI } from '@google/genai';
import { runFallbackAnalysis } from '../src/utils/pedagogicalEngine';

function cleanAndParseJson<T>(rawText: string | undefined): T {
  if (!rawText) throw new Error('Respons AI kosong.');
  const text = rawText.trim();
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    try {
      return JSON.parse(match[1].trim()) as T;
    } catch {
      // ignore
    }
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1)) as T;
    } catch {
      // ignore
    }
  }
  return JSON.parse(text) as T;
}

export default async function handler(req: any, res: any) {
  // Support CORS for serverless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { learningIdentity, elements, forcePedagogical } = req.body || {};

  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return res.status(200).json(runFallbackAnalysis(learningIdentity, []));
  }

  if (forcePedagogical || !process.env.GEMINI_API_KEY) {
    const fallback = runFallbackAnalysis(learningIdentity, elements);
    return res.status(200).json(fallback);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const elementsDescription = elements
      .map(
        (el: any, idx: number) =>
          `[Elemen ${idx + 1}] Nama Elemen: "${el.elementName}"\nTeks CP:\n"""${el.cpText}"""`
      )
      .join('\n\n');

    const prompt = `Anda adalah ahli kurikulum nasional Indonesia (Kemendikdasmen).
Lakukan ANALISIS MENDALAM terhadap Capaian Pembelajaran (CP) per elemen untuk FASE ${learningIdentity?.fase || ''}:
- Rujukan Regulasi CP: Kepka BKPDM No. 020 Tahun 2026 (untuk Pendidikan Agama) dan Kepka BSKAP No. 046 Tahun 2025 (untuk Mapel Lainnya).
- Jenjang: ${learningIdentity?.jenjang} | Mata Pelajaran: ${learningIdentity?.subjectName}
${learningIdentity?.vocationalProgram ? `- Program: ${learningIdentity.vocationalProgram}` : ''}

ELEMEN CP:
${elementsDescription}

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
  "warnings": []
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.35 },
    });

    const parsed = cleanAndParseJson<any>(response.text);
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.warn('[Vercel API] Error analyzing CP, using pedagogical engine fallback:', err?.message);
    const fallback = runFallbackAnalysis(learningIdentity, elements);
    return res.status(200).json(fallback);
  }
}
