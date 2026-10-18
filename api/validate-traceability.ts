import { runFallbackTraceability } from '../src/utils/pedagogicalEngine';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { elements, tpList } = req.body || {};
  const result = runFallbackTraceability(elements || [], tpList || []);
  return res.status(200).json(result);
}
