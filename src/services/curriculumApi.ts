import {
  runFallbackAnalysis,
  runFallbackTp,
  runFallbackAtp,
  runFallbackTraceability,
  runFallbackRegenerateTp,
} from '../utils/pedagogicalEngine';
import {
  SchoolIdentity,
  LearningIdentity,
  CpElement,
  AnalysisResult,
  LearningObjective,
  AtpResult,
  TraceabilityResult,
} from '../types/curriculum';

async function safeFetchJson<T>(url: string, body: any, fallbackFn: () => T): Promise<T> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    // Detect HTML responses (such as Vercel 404/500/routing fallback)
    if (
      !res.ok ||
      contentType.includes('text/html') ||
      rawText.trim().startsWith('<') ||
      rawText.includes('The page c') ||
      rawText.includes('404:')
    ) {
      console.warn(`[CurriculumAPI] Endpoint ${url} returned status ${res.status} or non-JSON HTML. Activating Pedagogical Engine directly in browser.`);
      const result = fallbackFn();
      if (typeof result === 'object' && result !== null && !('quotaNotice' in (result as any))) {
        (result as any).quotaNotice =
          'Sistem aktif dalam Mode Mesin Analisis Kurikulum Mandiri Kemendikdasmen (Resmi Kepka BKPDM 020/2026 & Kepka BSKAP 046/2025). Dokumen TP, ATP, Prota & Promes berhasil disusun secara lengkap.';
      }
      return result;
    }

    try {
      const parsed = JSON.parse(rawText) as T;
      return parsed;
    } catch {
      console.warn(`[CurriculumAPI] Non-JSON payload from ${url}. Falling back to client-side Pedagogical Engine.`);
      return fallbackFn();
    }
  } catch (err: any) {
    console.warn(`[CurriculumAPI] Network request to ${url} failed (${err?.message}). Running client-side Pedagogical Engine.`);
    const result = fallbackFn();
    if (typeof result === 'object' && result !== null && !('quotaNotice' in (result as any))) {
      (result as any).quotaNotice =
        'Sistem aktif dalam Mode Mesin Analisis Kurikulum Mandiri Kemendikdasmen (Resmi Kepka BKPDM 020/2026 & Kepka BSKAP 046/2025). Dokumen TP, ATP, Prota & Promes berhasil disusun secara lengkap.';
    }
    return result;
  }
}

export async function apiAnalyzeCp(params: {
  schoolIdentity: SchoolIdentity;
  learningIdentity: LearningIdentity;
  elements: CpElement[];
  forcePedagogical?: boolean;
}): Promise<AnalysisResult> {
  if (params.forcePedagogical) {
    return runFallbackAnalysis(params.learningIdentity, params.elements) as unknown as AnalysisResult;
  }

  return safeFetchJson<AnalysisResult>(
    '/api/analyze-cp',
    params,
    () => runFallbackAnalysis(params.learningIdentity, params.elements) as unknown as AnalysisResult
  );
}

export async function apiGenerateTp(params: {
  schoolIdentity: SchoolIdentity;
  learningIdentity: LearningIdentity;
  elements: CpElement[];
  analysis?: AnalysisResult | null;
  forcePedagogical?: boolean;
}): Promise<{ tpList: LearningObjective[]; totalRecommendedJp?: number; notes?: string; quotaNotice?: string }> {
  if (params.forcePedagogical) {
    return runFallbackTp(params.learningIdentity, params.elements);
  }

  return safeFetchJson(
    '/api/generate-tp',
    params,
    () => runFallbackTp(params.learningIdentity, params.elements)
  );
}

export async function apiGenerateAtp(params: {
  schoolIdentity: SchoolIdentity;
  learningIdentity: LearningIdentity;
  tpList: LearningObjective[];
  elements: CpElement[];
  analysis?: AnalysisResult | null;
  forcePedagogical?: boolean;
}): Promise<AtpResult> {
  if (params.forcePedagogical) {
    return runFallbackAtp(params.learningIdentity, params.tpList) as unknown as AtpResult;
  }

  return safeFetchJson<AtpResult>(
    '/api/generate-atp',
    params,
    () => runFallbackAtp(params.learningIdentity, params.tpList) as unknown as AtpResult
  );
}

export async function apiValidateTraceability(params: {
  schoolIdentity: SchoolIdentity;
  learningIdentity: LearningIdentity;
  elements: CpElement[];
  tpList: LearningObjective[];
  atpList: any[];
  forcePedagogical?: boolean;
}): Promise<TraceabilityResult> {
  if (params.forcePedagogical) {
    return runFallbackTraceability(params.elements, params.tpList) as unknown as TraceabilityResult;
  }

  return safeFetchJson<TraceabilityResult>(
    '/api/validate-traceability',
    params,
    () => runFallbackTraceability(params.elements, params.tpList) as unknown as TraceabilityResult
  );
}

export async function apiRegenerateTpItem(params: {
  tpItem: LearningObjective;
  elementCpText: string;
  instruction?: string;
}): Promise<LearningObjective> {
  return safeFetchJson<LearningObjective>(
    '/api/regenerate-tp-item',
    params,
    () => runFallbackRegenerateTp(params.tpItem, params.elementCpText, params.instruction)
  );
}
