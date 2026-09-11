export interface UdyamVerificationResult {
  source: string;
  udyam_number: string;
  enterprise_name: string;
  enterprise_type: 'Micro' | 'Small' | 'Medium' | 'Not Applicable';
  status: 'VALID' | 'EXPIRED' | 'NOT_FOUND';
  major_activity: 'Services' | 'Manufacturing' | 'Trading';
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

const MOCK_UDYAM_DATABASE: Record<string, { name: string; type: 'Micro' | 'Small' | 'Medium'; status: 'VALID' | 'EXPIRED'; activity: 'Services' | 'Manufacturing' }> = {
  'UDYAM-MH-01-0012345': {
    name: 'ABC Technologies Private Limited',
    type: 'Small',
    status: 'VALID',
    activity: 'Services',
  },
  'UDYAM-DL-02-0087654': {
    name: 'XYZ Industries Private Limited',
    type: 'Medium',
    status: 'VALID',
    activity: 'Manufacturing',
  },
  'UDYAM-KR-03-0099881': {
    name: 'QuickSupply Logistics Solutions LLP',
    type: 'Micro',
    status: 'VALID',
    activity: 'Services',
  },
};

export class UdyamConnector {
  static readonly SOURCE = 'MOCK_UDYAM_CONNECTOR (Ministry of MSME Portal)';

  async verify(udyamNumber: string): Promise<UdyamVerificationResult> {
    const cleanUdyam = (udyamNumber || '').trim().toUpperCase();
    const record = MOCK_UDYAM_DATABASE[cleanUdyam];
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    if (record) {
      return {
        source: UdyamConnector.SOURCE,
        udyam_number: cleanUdyam,
        enterprise_name: record.name,
        enterprise_type: record.type,
        status: record.status,
        major_activity: record.activity,
        verified_at: timestamp,
        evidence_id: `UDYAM-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    if (cleanUdyam.startsWith('UDYAM-')) {
      return {
        source: UdyamConnector.SOURCE,
        udyam_number: cleanUdyam,
        enterprise_name: 'Verified Enterprise MSME',
        enterprise_type: 'Small',
        status: 'VALID',
        major_activity: 'Manufacturing',
        verified_at: timestamp,
        evidence_id: `UDYAM-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    return {
      source: UdyamConnector.SOURCE,
      udyam_number: cleanUdyam,
      enterprise_name: 'N/A',
      enterprise_type: 'Not Applicable',
      status: 'NOT_FOUND',
      major_activity: 'Services',
      verified_at: timestamp,
      evidence_id: `UDYAM-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export const udyamConnector = new UdyamConnector();
