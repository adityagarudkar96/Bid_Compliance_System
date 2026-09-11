export interface DigiLockerVerificationResult {
  source: string;
  document_uri: string;
  issuer: string;
  verification_status: 'AUTHENTICATED' | 'SIGNATURE_INVALID' | 'NOT_FOUND';
  signed_by: string;
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

export class DigiLockerConnector {
  static readonly SOURCE = 'MOCK_DIGILOCKER_CONNECTOR (National DigiLocker Entity Locker Gateway)';

  async verify(docId: string, issuerName = 'Government Entity'): Promise<DigiLockerVerificationResult> {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return {
      source: DigiLockerConnector.SOURCE,
      document_uri: `in.gov.digilocker.doc.${docId || randomSuffix}`,
      issuer: issuerName,
      verification_status: 'AUTHENTICATED',
      signed_by: 'Authorized Controller of Certifying Authorities (CCA)',
      verified_at: timestamp,
      evidence_id: `DL-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export const digilockerConnector = new DigiLockerConnector();
