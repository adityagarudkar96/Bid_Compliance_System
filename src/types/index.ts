export type UserRole = 'PROCUREMENT_OFFICER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  created_at: string;
}

export type BidStatus = 'ACTIVE' | 'EVALUATION' | 'VERIFICATION_READY' | 'COMPLETED' | 'CANCELLED';

export interface Bid {
  id: string;
  bid_number: string;
  title: string;
  department: string;
  category: string;
  closing_date: string;
  status: BidStatus;
  estimated_value: string;
  created_at: string;
  bidders_count?: number;
}

export interface Requirement {
  id: string;
  bid_id: string;
  name: string;
  description: string;
  mandatory: boolean;
  verification_source: 'GST' | 'Udyam' | 'PAN' | 'Income Tax' | 'EPFO' | 'ESIC' | 'Debarment' | 'Declaration' | 'OEM' | 'DigiLocker';
  threshold?: string | null;
  weight: number;
  required_documents: string[];
  status: 'PENDING' | 'EXTRACTED' | 'VERIFIED';
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ComplianceStatus = 'COMPLIANT' | 'REVIEW_REQUIRED' | 'HIGH_RISK' | 'PENDING';
export type CheckResult = 'PASS' | 'REVIEW' | 'FAIL' | 'PENDING';
export type OfficerDecision = 'QUALIFY' | 'DO_NOT_QUALIFY' | 'NEEDS_MANUAL_REVIEW' | 'PENDING';

export interface Bidder {
  id: string;
  bid_id: string;
  company_name: string;
  gstin: string;
  pan: string;
  udyam_number: string;
  status: ComplianceStatus;
  compliance_score: number;
  risk_level: RiskLevel;
  last_verified?: string;
  decision?: OfficerDecision;
  decision_reason?: string;
  decision_officer?: string;
  decision_at?: string;
}

export interface BidderDocument {
  id: string;
  bidder_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: string;
  extracted_text?: string;
  uploaded_at: string;
  status: 'UPLOADED' | 'PROCESSED' | 'EXTRACTION_FAILED';
}

export interface DocumentField {
  id: string;
  document_id: string;
  field_name: string;
  field_value: string;
  confidence: number;
  source_document: string;
}

export interface VerificationCheck {
  id: string;
  bidder_id: string;
  requirement_id?: string;
  requirement_name: string;
  source: string;
  document_value: string;
  verified_value: string;
  result: CheckResult;
  confidence: number;
  reason: string;
  timestamp: string;
  verification_id: string;
}

export interface ComplianceResult {
  id: string;
  bidder_id: string;
  verification_id: string;
  score: number;
  risk: RiskLevel;
  status: ComplianceStatus;
  passed: number;
  failed: number;
  review: number;
  pending: number;
  mandatory_failure: boolean;
  generated_at: string;
}

export interface Recommendation {
  id: string;
  bidder_id: string;
  verification_id: string;
  recommendation_text: string;
  reasoning: string[];
  discrepancies: string[];
  generated_at: string;
}

export interface AuditLog {
  id: string;
  verification_id?: string;
  bidder_id?: string;
  actor: string;
  action: string;
  object: string;
  result: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  active_bids: number;
  total_bidders: number;
  compliant: number;
  review_required: number;
  high_risk: number;
  checks_distribution: {
    pass: number;
    review: number;
    fail: number;
    pending: number;
  };
  compliance_distribution: {
    compliant: number;
    review: number;
    high_risk: number;
  };
}
