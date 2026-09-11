import { GoogleGenAI } from '@google/genai';
import { Requirement } from '../../src/types/index.ts';

export const DEFAULT_TENDER_REQUIREMENTS: Omit<Requirement, 'id' | 'bid_id'>[] = [
  {
    name: 'GST Registration & Active Status',
    description: 'Bidder must possess valid Goods and Services Tax (GST) registration in Active status.',
    mandatory: true,
    verification_source: 'GST',
    threshold: 'Active Status',
    weight: 20,
    required_documents: ['GST Registration Certificate (REG-06)'],
    status: 'EXTRACTED',
  },
  {
    name: 'Udyam / MSME Registration',
    description: 'Valid Udyam Registration Certificate under Ministry of Micro, Small and Medium Enterprises.',
    mandatory: true,
    verification_source: 'Udyam',
    threshold: 'Micro/Small/Medium Classification',
    weight: 15,
    required_documents: ['Udyam Registration Certificate'],
    status: 'EXTRACTED',
  },
  {
    name: 'Permanent Account Number (PAN)',
    description: 'Valid PAN registered under the same corporate / legal entity name.',
    mandatory: true,
    verification_source: 'PAN',
    threshold: 'Valid & Active',
    weight: 15,
    required_documents: ['Company PAN Card Copy'],
    status: 'EXTRACTED',
  },
  {
    name: 'Income Tax Return (ITR) Compliance',
    description: 'ITR acknowledgement for the last 3 financial years (AY 2023-24, AY 2024-25, AY 2025-26).',
    mandatory: true,
    verification_source: 'Income Tax',
    threshold: '3 Consecutive Years Filed',
    weight: 15,
    required_documents: ['ITR-V Acknowledgement Receipts (3 Years)'],
    status: 'EXTRACTED',
  },
  {
    name: 'Make in India Local Content (>50%)',
    description: 'Self-declaration confirming minimum 50% domestic value addition (Class-I Local Supplier).',
    mandatory: true,
    verification_source: 'Declaration',
    threshold: '>= 50% Local Content',
    weight: 15,
    required_documents: ['Local Content Self-Declaration / CA Certificate'],
    status: 'EXTRACTED',
  },
  {
    name: 'EPFO & ESIC Compliance',
    description: 'Statutory registration and monthly electronic challan return (ECR) compliance.',
    mandatory: false,
    verification_source: 'EPFO',
    threshold: 'Active Establishment Code',
    weight: 10,
    required_documents: ['EPFO Registration & Recent ECR Receipt'],
    status: 'EXTRACTED',
  },
  {
    name: 'Non-Debarment / Blacklisting Declaration',
    description: 'Bidder must not be debarred by GeM, Ministry of Finance, or any Central/State PSU.',
    mandatory: true,
    verification_source: 'Debarment',
    threshold: 'Clean Record (No Active Debarment)',
    weight: 10,
    required_documents: ['Non-Debarment Affidavit on Non-Judicial Stamp Paper'],
    status: 'EXTRACTED',
  },
];

export async function extractTenderRequirements(tenderText: string, bidId: string): Promise<Requirement[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && tenderText && tenderText.length > 50) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are a Government e-Marketplace (GeM) Tender Document Analyzer.
Analyze the following tender specification text and extract all statutory, regulatory, and technical compliance requirements.

Tender text:
${tenderText.substring(0, 8000)}

Extract requirements as a JSON array of objects with keys:
- name: string (e.g. "GST Registration")
- description: string
- mandatory: boolean
- verification_source: "GST" | "Udyam" | "PAN" | "Income Tax" | "EPFO" | "ESIC" | "Debarment" | "Declaration" | "OEM"
- threshold: string or null
- weight: number (summing approximately to 100)
- required_documents: array of strings

Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        const reqList = Array.isArray(parsed) ? parsed : parsed.requirements;
        if (Array.isArray(reqList) && reqList.length > 0) {
          return reqList.map((r, index) => ({
            id: `REQ-${bidId}-${index + 1}`,
            bid_id: bidId,
            name: r.name || `Requirement ${index + 1}`,
            description: r.description || '',
            mandatory: Boolean(r.mandatory),
            verification_source: r.verification_source || 'Declaration',
            threshold: r.threshold || null,
            weight: Number(r.weight) || 10,
            required_documents: Array.isArray(r.required_documents) ? r.required_documents : ['Certificate / Document'],
            status: 'EXTRACTED',
          }));
        }
      }
    } catch (err) {
      console.warn('Gemini tender extraction failed, falling back to standard GeM compliance requirements:', err);
    }
  }

  // Deterministic standard GeM compliance requirements
  return DEFAULT_TENDER_REQUIREMENTS.map((r, index) => ({
    ...r,
    id: `REQ-${bidId}-${index + 1}`,
    bid_id: bidId,
  }));
}
