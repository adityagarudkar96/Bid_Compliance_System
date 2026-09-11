export interface DebarmentVerificationResult {
  source: string;
  pan_or_cin: string;
  company_name: string;
  is_debarred: boolean;
  status: 'CLEAN' | 'DEBARRED_BLACKLISTED';
  debarment_period?: string;
  issuing_ministry?: string;
  order_reference?: string;
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

const MOCK_DEBARMENT_REGISTRY: Record<string, { debarred: boolean; period?: string; ministry?: string; order?: string }> = {
  // QuickSupply has active debarment flag
  'AAEFQ5566G': {
    debarred: true,
    period: '2025-01-10 to 2027-01-09 (24 Months)',
    ministry: 'Department of Expenditure / GeM Incident Management',
    order: 'DoE/OM-2025/DEB-419',
  },
  'QUICKSUPPLY': {
    debarred: true,
    period: '2025-01-10 to 2027-01-09 (24 Months)',
    ministry: 'Department of Expenditure / GeM Incident Management',
    order: 'DoE/OM-2025/DEB-419',
  },
};

export class DebarmentConnector {
  static readonly SOURCE = 'MOCK_DEBARMENT_CONNECTOR (Central Public Procurement Portal Debarred List & GeM Incident Register)';

  async verify(identifier: string, companyName: string): Promise<DebarmentVerificationResult> {
    const cleanId = (identifier || '').trim().toUpperCase();
    const cleanName = (companyName || '').trim().toUpperCase();

    const isMatch = MOCK_DEBARMENT_REGISTRY[cleanId] || (cleanName.includes('QUICKSUPPLY') ? MOCK_DEBARMENT_REGISTRY['QUICKSUPPLY'] : undefined);

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    if (isMatch && isMatch.debarred) {
      return {
        source: DebarmentConnector.SOURCE,
        pan_or_cin: cleanId,
        company_name: companyName,
        is_debarred: true,
        status: 'DEBARRED_BLACKLISTED',
        debarment_period: isMatch.period,
        issuing_ministry: isMatch.ministry,
        order_reference: isMatch.order,
        verified_at: timestamp,
        evidence_id: `DEB-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    return {
      source: DebarmentConnector.SOURCE,
      pan_or_cin: cleanId,
      company_name: companyName,
      is_debarred: false,
      status: 'CLEAN',
      verified_at: timestamp,
      evidence_id: `DEB-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export const debarmentConnector = new DebarmentConnector();
