export interface PanVerificationResult {
  source: string;
  pan: string;
  status: 'VALID_AND_ACTIVE' | 'INOPERATIVE' | 'NOT_FOUND';
  name_on_pan: string;
  category: 'Company' | 'Firm' | 'Individual' | 'Trust';
  aadhaar_seeding_status: 'LINKED' | 'EXEMPTED' | 'NOT_APPLICABLE';
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

const MOCK_PAN_DATABASE: Record<string, { name: string; category: 'Company' | 'Firm'; status: 'VALID_AND_ACTIVE' | 'INOPERATIVE' }> = {
  'AABCU9603R': {
    name: 'ABC Technologies Private Limited',
    category: 'Company',
    status: 'VALID_AND_ACTIVE',
  },
  'AAACZ1234F': {
    name: 'XYZ Industries Private Limited',
    category: 'Company',
    status: 'VALID_AND_ACTIVE',
  },
  'AAEFQ5566G': {
    name: 'QuickSupply Logistics Solutions LLP',
    category: 'Firm',
    status: 'VALID_AND_ACTIVE',
  },
};

export class PanConnector {
  static readonly SOURCE = 'MOCK_PAN_CONNECTOR (Income Tax NSDL/UTI Server)';

  async verify(pan: string): Promise<PanVerificationResult> {
    const cleanPan = (pan || '').trim().toUpperCase();
    const record = MOCK_PAN_DATABASE[cleanPan];
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    if (record) {
      return {
        source: PanConnector.SOURCE,
        pan: cleanPan,
        status: record.status,
        name_on_pan: record.name,
        category: record.category,
        aadhaar_seeding_status: 'EXEMPTED',
        verified_at: timestamp,
        evidence_id: `PAN-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
      return {
        source: PanConnector.SOURCE,
        pan: cleanPan,
        status: 'VALID_AND_ACTIVE',
        name_on_pan: 'Enterprise Legal Entity',
        category: 'Company',
        aadhaar_seeding_status: 'EXEMPTED',
        verified_at: timestamp,
        evidence_id: `PAN-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    return {
      source: PanConnector.SOURCE,
      pan: cleanPan,
      status: 'NOT_FOUND',
      name_on_pan: 'N/A',
      category: 'Company',
      aadhaar_seeding_status: 'NOT_APPLICABLE',
      verified_at: timestamp,
      evidence_id: `PAN-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export const panConnector = new PanConnector();
