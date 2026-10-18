import { GoogleGenAI } from '@google/genai';
import { runFallbackTp } from '../src/utils/pedagogicalEngine';

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { learningIdentity, elements, forcePedagogical } = req.body || {};

  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return res.status(200).json(runFallbackTp(learningIdentity, []));
  }

  if (forcePedagogical || !process.env.GEMINI_API_KEY) {
    const fallback = runFallbackTp(learningIdentity, elements);
    return res.status(200).json(fallback);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const isPaibp =
      ((learningIdentity?.subjectName || '').toLowerCase().includes('pai') ||
        (learningIdentity?.subjectName || '').toLowerCase().includes('agama islam') ||
        (learningIdentity?.subjectName || '').toLowerCase().includes('paibp')) &&
      (learningIdentity?.fase === 'Fase D' || learningIdentity?.jenjang === 'SMP_MTS');

    if (isPaibp) {
      // For PAIBP SMP Fase D, use the authentic 30 TP engine directly for complete accuracy
      return res.status(200).json(runFallbackTp(learningIdentity, elements));
    }

    const prompt = `Anda adalah ahli kurikulum nasional Kemendikdasmen (PPA Revisi 2025; Kepka BKPDM No. 020 Tahun 2026 & Kepka BSKAP No. 046 Tahun 2025).
Susun Tujuan Pembelajaran (TP) untuk SELURUH SEMESTER PADA FASE INI (${learningIdentity?.fase}):
- Mata Pelajaran: ${learningIdentity?.subjectName}
- Jenjang: ${learningIdentity?.jenjang}
ELEMEN CP:
${elements.map((el: any) => `- Elemen "${el.elementName}": """${el.cpText}"""`).join('\n')}

Format output JSON:
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.35 },
    });

    const parsed = cleanAndParseJson<any>(response.text);
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.warn('[Vercel API] Error generating TP, using fallback:', err?.message);
    const fallback = runFallbackTp(learningIdentity, elements);
    return res.status(200).json(fallback);
  }
}
