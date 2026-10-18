import { GoogleGenAI } from '@google/genai';
import { runFallbackAtp } from '../src/utils/pedagogicalEngine';

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

  const { learningIdentity, tpList, forcePedagogical } = req.body || {};

  if (!tpList || !Array.isArray(tpList) || tpList.length === 0) {
    return res.status(200).json(runFallbackAtp(learningIdentity, []));
  }

  if (forcePedagogical || !process.env.GEMINI_API_KEY) {
    const fallback = runFallbackAtp(learningIdentity, tpList);
    return res.status(200).json(fallback);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `Anda adalah ahli pengembang kurikulum Kemendikdasmen (PPA Revisi 2025).
Susun Alur Tujuan Pembelajaran (ATP) terpadu:
Fase: ${learningIdentity?.fase} | Mapel: ${learningIdentity?.subjectName}
Daftar TP:
${JSON.stringify(tpList.map((t: any) => ({ code: t.code, tpStatement: t.tpStatement, grade: t.suggestedGrade, semester: t.suggestedSemester })))}

Format output JSON:
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.35 },
    });

    const parsed = cleanAndParseJson<any>(response.text);
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.warn('[Vercel API] Error generating ATP, using fallback:', err?.message);
    const fallback = runFallbackAtp(learningIdentity, tpList);
    return res.status(200).json(fallback);
  }
}
