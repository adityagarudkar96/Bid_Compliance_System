export interface EpfoVerificationResult {
  source: string;
  establishment_code: string;
  establishment_name: string;
  status: 'ACTIVE_COMPLIANT' | 'DEFAULTER' | 'INACTIVE';
  active_members: number;
  last_ecr_month: string;
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

export interface EsicVerificationResult {
  source: string;
  employer_code: string;
  employer_name: string;
  status: 'COMPLIANT' | 'DEFAULTER';
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

export class EpfoConnector {
  static readonly SOURCE = 'MOCK_EPFO_CONNECTOR (Employees Provident Fund Portal)';

  async verify(query: string): Promise<EpfoVerificationResult> {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return {
      source: EpfoConnector.SOURCE,
      establishment_code: `MH/BAN/00${randomSuffix}`,
      establishment_name: query || 'Registered Employer',
      status: 'ACTIVE_COMPLIANT',
      active_members: 142,
      last_ecr_month: 'August 2026',
      verified_at: timestamp,
      evidence_id: `EPFO-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export class EsicConnector {
  static readonly SOURCE = 'MOCK_ESIC_CONNECTOR (ESIC Shram Suvidha Portal)';

  async verify(query: string): Promise<EsicVerificationResult> {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return {
      source: EsicConnector.SOURCE,
      employer_code: `31000${randomSuffix}0000101`,
      employer_name: query || 'Registered Employer',
      status: 'COMPLIANT',
      verified_at: timestamp,
      evidence_id: `ESIC-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export const epfoConnector = new EpfoConnector();
export const esicConnector = new EsicConnector();
