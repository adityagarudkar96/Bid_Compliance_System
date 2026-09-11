export interface GstVerificationResult {
  source: string;
  gstin: string;
  status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'NOT_FOUND';
  legal_name: string;
  trade_name: string;
  registration_date: string;
  taxpayer_type: string;
  state_jurisdiction: string;
  verified_at: string;
  evidence_id: string;
  is_mock: boolean;
}

// In-memory mock database of registered GSTINs
const MOCK_GSTN_DATABASE: Record<string, { legal_name: string; trade_name: string; status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED'; state: string; reg_date: string }> = {
  '27AABCU9603R1ZM': {
    legal_name: 'ABC Technologies Private Limited',
    trade_name: 'ABC Technologies',
    status: 'ACTIVE',
    state: 'Maharashtra',
    reg_date: '2018-04-12',
  },
  '07AAACZ1234F1Z8': {
    legal_name: 'XYZ Industries Private Limited',
    trade_name: 'XYZ Industries',
    status: 'ACTIVE',
    state: 'Delhi',
    reg_date: '2019-08-20',
  },
  '29AAEFQ5566G1ZQ': {
    legal_name: 'QuickSupply Logistics Solutions LLP',
    trade_name: 'QuickSupply',
    status: 'SUSPENDED',
    state: 'Karnataka',
    reg_date: '2021-02-15',
  },
  '27ABCDE1234F1Z5': {
    legal_name: 'ABC Technologies Private Limited',
    trade_name: 'ABC Technologies',
    status: 'ACTIVE',
    state: 'Maharashtra',
    reg_date: '2018-04-12',
  },
};

export class GstConnector {
  static readonly SOURCE = 'MOCK_GST_CONNECTOR (GSTN API Setu Gateway)';

  /**
   * Verifies a GSTIN with mock GSTN database.
   * Replace this implementation with authorized GSTN / API Setu credentials in production.
   */
  async verify(gstin: string): Promise<GstVerificationResult> {
    const cleanGst = (gstin || '').trim().toUpperCase();
    const record = MOCK_GSTN_DATABASE[cleanGst];

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    if (record) {
      return {
        source: GstConnector.SOURCE,
        gstin: cleanGst,
        status: record.status,
        legal_name: record.legal_name,
        trade_name: record.trade_name,
        registration_date: record.reg_date,
        taxpayer_type: 'Regular',
        state_jurisdiction: record.state,
        verified_at: timestamp,
        evidence_id: `GST-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    // Default fallback mock if format resembles valid GST (15 chars)
    if (cleanGst.length === 15) {
      return {
        source: GstConnector.SOURCE,
        gstin: cleanGst,
        status: 'ACTIVE',
        legal_name: 'Verified Enterprise India Private Limited',
        trade_name: 'Enterprise Hub',
        registration_date: '2020-01-01',
        taxpayer_type: 'Regular',
        state_jurisdiction: 'Central Hub',
        verified_at: timestamp,
        evidence_id: `GST-EV-${randomSuffix}`,
        is_mock: true,
      };
    }

    return {
      source: GstConnector.SOURCE,
      gstin: cleanGst,
      status: 'NOT_FOUND',
      legal_name: 'N/A',
      trade_name: 'N/A',
      registration_date: '',
      taxpayer_type: '',
      state_jurisdiction: '',
      verified_at: timestamp,
      evidence_id: `GST-EV-${randomSuffix}`,
      is_mock: true,
    };
  }
}

export const gstConnector = new GstConnector();
