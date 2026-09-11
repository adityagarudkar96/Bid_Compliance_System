export interface IncomeTaxVerificationResult {
  source: string;
  pan: string;
  filing_status: 'FILED_COMPLIANT' | 'DEFAULTER' | 'NOT_FILED';
  recent_assessment_years: string[];
  itr_form: string;
  filing_acknowledgement: string;
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

const MOCK_ITR_DATABASE: Record<string, { status: 'FILED_COMPLIANT' | 'DEFAULTER'; ays: string[]; ack: string }> = {
  'AABCU9603R': {
    status: 'FILED_COMPLIANT',
    ays: ['AY 2025-26', 'AY 2024-25', 'AY 2023-24'],
    ack: 'ITR-ACK-9843210',
  },
  'AAACZ1234F': {
    status: 'FILED_COMPLIANT',
    ays: ['AY 2025-26', 'AY 2024-25', 'AY 2023-24'],
    ack: 'ITR-ACK-7721893',
  },
  'AAEFQ5566G': {
    status: 'DEFAULTER',
    ays: ['AY 2023-24'], // Missed 2 consecutive years!
    ack: 'ITR-ACK-1102938',
  },
};

export class IncomeTaxConnector {
  static readonly SOURCE = 'MOCK_INCOME_TAX_CONNECTOR (CBDT E-Filing System)';

  async verify(pan: string): Promise<IncomeTaxVerificationResult> {
    const cleanPan = (pan || '').trim().toUpperCase();
    const record = MOCK_ITR_DATABASE[cleanPan];
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    if (record) {
      return {
        source: IncomeTaxConnector.SOURCE,
        pan: cleanPan,
        filing_status: record.status,
        recent_assessment_years: record.ays,
        itr_form: 'ITR-6 (Companies)',
        filing_acknowledgement: record.ack,
        verified_at: timestamp,
        evidence_id: `ITR-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    return {
      source: IncomeTaxConnector.SOURCE,
      pan: cleanPan,
      filing_status: 'FILED_COMPLIANT',
      recent_assessment_years: ['AY 2025-26', 'AY 2024-25'],
      itr_form: 'ITR-6',
      filing_acknowledgement: `ITR-ACK-${randomSuffix}`,
      verified_at: timestamp,
      evidence_id: `ITR-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export const incomeTaxConnector = new IncomeTaxConnector();
