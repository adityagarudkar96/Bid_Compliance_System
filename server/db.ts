import {
  AuditLog,
  Bid,
  Bidder,
  BidderDocument,
  CheckResult,
  ComplianceResult,
  DashboardStats,
  DocumentField,
  OfficerDecision,
  Recommendation,
  Requirement,
  User,
  VerificationCheck,
} from '../src/types/index.ts';
import { DEFAULT_TENDER_REQUIREMENTS } from './ai/tender_extractor.ts';

// In-Memory Database Store (with persistent state across app lifecycle)
class InMemoryDatabase {
  users: Map<string, User> = new Map();
  bids: Map<string, Bid> = new Map();
  requirements: Map<string, Requirement[]> = new Map();
  bidders: Map<string, Bidder> = new Map();
  documents: Map<string, BidderDocument[]> = new Map(); // bidder_id -> docs
  documentFields: Map<string, DocumentField[]> = new Map(); // doc_id -> fields
  verificationChecks: Map<string, VerificationCheck[]> = new Map(); // bidder_id -> checks
  complianceResults: Map<string, ComplianceResult> = new Map(); // bidder_id -> result
  recommendations: Map<string, Recommendation> = new Map(); // bidder_id -> rec
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Seed Procurement Officer
    const officer: User = {
      id: 'USR-OFFICER-001',
      name: 'Rajesh Sharma, IAS',
      email: 'officer@gem-demo.gov.in',
      role: 'PROCUREMENT_OFFICER',
      department: 'Department of Information Technology',
      designation: 'Joint Secretary & Senior Procurement Officer',
      created_at: '2026-01-15T09:00:00Z',
    };
    this.users.set(officer.id, officer);

    // 2. Seed Primary Demo Tender GEM-2026-001
    const tender1: Bid = {
      id: 'GEM-2026-001',
      bid_number: 'GEM-2026-001',
      title: 'Supply and Commissioning of Enterprise Networking & Data Center Hardware',
      department: 'Department of Information Technology',
      category: 'IT & Telecommunications Hardware',
      closing_date: '30 Sep 2026',
      status: 'VERIFICATION_READY',
      estimated_value: '₹ 4,85,00,000',
      created_at: '2026-08-01T10:00:00Z',
      bidders_count: 3,
    };
    this.bids.set(tender1.id, tender1);

    // Seed Secondary Bids for realistic dashboard
    const tender2: Bid = {
      id: 'GEM-2026-042',
      bid_number: 'GEM-2026-042',
      title: 'Procurement of High-Performance Computing Servers and Storage SAN',
      department: 'Ministry of Electronics & IT',
      category: 'Server Infrastructure',
      closing_date: '15 Oct 2026',
      status: 'ACTIVE',
      estimated_value: '₹ 8,20,00,000',
      created_at: '2026-08-10T11:30:00Z',
      bidders_count: 5,
    };
    this.bids.set(tender2.id, tender2);

    const tender3: Bid = {
      id: 'GEM-2026-088',
      bid_number: 'GEM-2026-088',
      title: 'Optical Fiber Cable Infrastructure & Active Switching Nodes',
      department: 'Department of Telecommunications',
      category: 'Networking Infrastructure',
      closing_date: '28 Oct 2026',
      status: 'EVALUATION',
      estimated_value: '₹ 3,45,00,000',
      created_at: '2026-08-15T14:15:00Z',
      bidders_count: 4,
    };
    this.bids.set(tender3.id, tender3);

    // 3. Seed Requirements for GEM-2026-001
    const reqs: Requirement[] = DEFAULT_TENDER_REQUIREMENTS.map((r, i) => ({
      ...r,
      id: `REQ-GEM-2026-001-${i + 1}`,
      bid_id: tender1.id,
    }));
    this.requirements.set(tender1.id, reqs);

    // 4. Seed Bidders for GEM-2026-001
    const bidderA: Bidder = {
      id: 'BIDDER-A',
      bid_id: tender1.id,
      company_name: 'ABC Technologies Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      udyam_number: 'UDYAM-MH-01-0012345',
      status: 'COMPLIANT',
      compliance_score: 96,
      risk_level: 'LOW',
      last_verified: '2026-09-10T10:30:00Z',
      decision: 'PENDING',
    };

    const bidderB: Bidder = {
      id: 'BIDDER-B',
      bid_id: tender1.id,
      company_name: 'XYZ Industries Pvt Ltd',
      gstin: '07AAACZ1234F1Z8',
      pan: 'AAACZ1234F',
      udyam_number: 'UDYAM-DL-02-0087654',
      status: 'REVIEW_REQUIRED',
      compliance_score: 82,
      risk_level: 'MEDIUM',
      last_verified: '2026-09-10T10:32:00Z',
      decision: 'PENDING',
    };

    const bidderC: Bidder = {
      id: 'BIDDER-C',
      bid_id: tender1.id,
      company_name: 'QuickSupply Pvt Ltd',
      gstin: '29AAEFQ5566G1ZQ',
      pan: 'AAEFQ5566G',
      udyam_number: 'UDYAM-KR-03-0099881',
      status: 'HIGH_RISK',
      compliance_score: 38,
      risk_level: 'HIGH',
      last_verified: '2026-09-10T10:35:00Z',
      decision: 'PENDING',
    };

    this.bidders.set(bidderA.id, bidderA);
    this.bidders.set(bidderB.id, bidderB);
    this.bidders.set(bidderC.id, bidderC);

    // 5. Seed Documents for Bidders
    const docListA: BidderDocument[] = [
      {
        id: 'DOC-A-1',
        bidder_id: bidderA.id,
        document_type: 'GST Certificate (REG-06)',
        file_name: 'abc_gst_reg06.pdf',
        file_url: '/mock-documents/abc_gst.pdf',
        file_size: '1.4 MB',
        extracted_text: 'GSTIN: 27AABCU9603R1ZM Legal Name: ABC Technologies Private Limited Status: Active',
        uploaded_at: '2026-09-08T14:20:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-A-2',
        bidder_id: bidderA.id,
        document_type: 'Udyam Certificate',
        file_name: 'abc_udyam_cert.pdf',
        file_url: '/mock-documents/abc_udyam.pdf',
        file_size: '850 KB',
        extracted_text: 'UDYAM-MH-01-0012345 ABC Technologies Private Limited Enterprise: Small',
        uploaded_at: '2026-09-08T14:21:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-A-3',
        bidder_id: bidderA.id,
        document_type: 'Company PAN Card',
        file_name: 'abc_pan_card.jpg',
        file_url: '/mock-documents/abc_pan.jpg',
        file_size: '620 KB',
        extracted_text: 'PAN: AABCU9603R Name: ABC Technologies Private Limited',
        uploaded_at: '2026-09-08T14:22:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-A-4',
        bidder_id: bidderA.id,
        document_type: 'Local Content Declaration',
        file_name: 'abc_local_content_declaration.pdf',
        file_url: '/mock-documents/abc_local_content.pdf',
        file_size: '980 KB',
        extracted_text: 'Local Content: 68% Class-I Local Supplier CA Certificate Certified',
        uploaded_at: '2026-09-08T14:23:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-A-5',
        bidder_id: bidderA.id,
        document_type: 'Debarment Declaration',
        file_name: 'abc_non_debarment_affidavit.pdf',
        file_url: '/mock-documents/abc_affidavit.pdf',
        file_size: '1.1 MB',
        extracted_text: 'Non-debarment sworn affidavit on Rs 100 Stamp Paper. Clean record confirmed.',
        uploaded_at: '2026-09-08T14:25:00Z',
        status: 'PROCESSED',
      },
    ];
    this.documents.set(bidderA.id, docListA);

    const docListB: BidderDocument[] = [
      {
        id: 'DOC-B-1',
        bidder_id: bidderB.id,
        document_type: 'GST Certificate (REG-06)',
        file_name: 'xyz_gst_certificate.pdf',
        file_url: '/mock-documents/xyz_gst.pdf',
        file_size: '1.2 MB',
        extracted_text: 'GSTIN: 07AAACZ1234F1Z8 Trade Name: XYZ Industries Pvt Ltd',
        uploaded_at: '2026-09-09T09:10:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-B-2',
        bidder_id: bidderB.id,
        document_type: 'Udyam Certificate',
        file_name: 'xyz_udyam_reg.pdf',
        file_url: '/mock-documents/xyz_udyam.pdf',
        file_size: '920 KB',
        extracted_text: 'UDYAM-DL-02-0087654 XYZ Industries Private Limited Enterprise: Medium',
        uploaded_at: '2026-09-09T09:12:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-B-3',
        bidder_id: bidderB.id,
        document_type: 'Company PAN Card',
        file_name: 'xyz_pan.png',
        file_url: '/mock-documents/xyz_pan.png',
        file_size: '540 KB',
        extracted_text: 'PAN: AAACZ1234F XYZ Industries Pvt Ltd',
        uploaded_at: '2026-09-09T09:14:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-B-4',
        bidder_id: bidderB.id,
        document_type: 'Local Content Declaration',
        file_name: 'xyz_local_content_claim.pdf',
        file_url: '/mock-documents/xyz_local_content.pdf',
        file_size: '760 KB',
        extracted_text: 'Self-declaration 52% local content claim. CA Annexure pending.',
        uploaded_at: '2026-09-09T09:15:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-B-5',
        bidder_id: bidderB.id,
        document_type: 'Debarment Declaration',
        file_name: 'xyz_affidavit.pdf',
        file_url: '/mock-documents/xyz_affidavit.pdf',
        file_size: '1.0 MB',
        extracted_text: 'Non-debarment self-declaration. No blacklisting orders on record.',
        uploaded_at: '2026-09-09T09:16:00Z',
        status: 'PROCESSED',
      },
    ];
    this.documents.set(bidderB.id, docListB);

    const docListC: BidderDocument[] = [
      {
        id: 'DOC-C-1',
        bidder_id: bidderC.id,
        document_type: 'GST Certificate (REG-06)',
        file_name: 'quicksupply_gst.pdf',
        file_url: '/mock-documents/quick_gst.pdf',
        file_size: '800 KB',
        extracted_text: 'GSTIN: 29AAEFQ5566G1ZQ QuickSupply Logistics Solutions LLP',
        uploaded_at: '2026-09-09T16:00:00Z',
        status: 'PROCESSED',
      },
      {
        id: 'DOC-C-2',
        bidder_id: bidderC.id,
        document_type: 'Debarment Declaration',
        file_name: 'quicksupply_declaration.pdf',
        file_url: '/mock-documents/quick_debarment.pdf',
        file_size: '500 KB',
        extracted_text: 'Standard non-debarment declaration',
        uploaded_at: '2026-09-09T16:05:00Z',
        status: 'PROCESSED',
      },
    ];
    this.documents.set(bidderC.id, docListC);

    // 6. Seed Verification Checks
    // Bidder A Checks (All PASS, Score 96)
    const checksA: VerificationCheck[] = [
      {
        id: 'CHK-A-1',
        bidder_id: bidderA.id,
        requirement_name: 'GST Registration',
        source: 'Mock GST Verification Connector (GSTN API Setu Gateway)',
        document_value: '27AABCU9603R1ZM (ABC Technologies Pvt Ltd)',
        verified_value: '27AABCU9603R1ZM (ABC Technologies Private Limited - ACTIVE)',
        result: 'PASS',
        confidence: 0.98,
        reason: 'Active GST registration verified. High similarity match with statutory record.',
        timestamp: '2026-09-10T10:30:10Z',
        verification_id: 'VER-89101',
      },
      {
        id: 'CHK-A-2',
        bidder_id: bidderA.id,
        requirement_name: 'Udyam / MSME Registration',
        source: 'Mock Udyam Connector (Ministry of MSME)',
        document_value: 'UDYAM-MH-01-0012345',
        verified_value: 'UDYAM-MH-01-0012345 (Small Enterprise - Services)',
        result: 'PASS',
        confidence: 0.99,
        reason: 'Valid Udyam certificate verified with MSME database.',
        timestamp: '2026-09-10T10:30:15Z',
        verification_id: 'VER-89101',
      },
      {
        id: 'CHK-A-3',
        bidder_id: bidderA.id,
        requirement_name: 'Permanent Account Number (PAN)',
        source: 'Mock PAN Connector (Income Tax NSDL)',
        document_value: 'AABCU9603R',
        verified_value: 'AABCU9603R (ABC Technologies Private Limited - Active)',
        result: 'PASS',
        confidence: 0.98,
        reason: 'Valid and active PAN identifier match.',
        timestamp: '2026-09-10T10:30:20Z',
        verification_id: 'VER-89101',
      },
      {
        id: 'CHK-A-4',
        bidder_id: bidderA.id,
        requirement_name: 'Income Tax Return (ITR) Compliance',
        source: 'Mock Income Tax Connector (CBDT)',
        document_value: 'ITR-V Acknowledgement Receipts',
        verified_value: 'CBDT: Filed & Compliant (AY 2025-26, 2024-25, 2023-24)',
        result: 'PASS',
        confidence: 0.97,
        reason: 'ITR filings confirmed compliant for all 3 preceding assessment years.',
        timestamp: '2026-09-10T10:30:25Z',
        verification_id: 'VER-89101',
      },
      {
        id: 'CHK-A-5',
        bidder_id: bidderA.id,
        requirement_name: 'Make in India Local Content (>50%)',
        source: 'Self-Declaration & CA Verification Portal',
        document_value: '68% Local Content Self-Declaration',
        verified_value: 'Class-I Local Supplier Criteria Satisfied',
        result: 'PASS',
        confidence: 0.94,
        reason: 'Local content declared exceeds mandatory 50% threshold.',
        timestamp: '2026-09-10T10:30:30Z',
        verification_id: 'VER-89101',
      },
      {
        id: 'CHK-A-6',
        bidder_id: bidderA.id,
        requirement_name: 'EPFO & ESIC Compliance',
        source: 'Mock EPFO / ESIC Connector (Shram Suvidha)',
        document_value: 'Statutory Labor Clearance',
        verified_value: 'Active Establishment Code (MH/BAN/004821)',
        result: 'PASS',
        confidence: 0.96,
        reason: 'Monthly ECR filings verified up-to-date.',
        timestamp: '2026-09-10T10:30:35Z',
        verification_id: 'VER-89101',
      },
      {
        id: 'CHK-A-7',
        bidder_id: bidderA.id,
        requirement_name: 'Non-Debarment / Blacklisting Declaration',
        source: 'Mock Debarment Connector (CPPP / GeM Incident Register)',
        document_value: 'Non-Debarment Affidavit',
        verified_value: 'Clean Record (No debarment orders found)',
        result: 'PASS',
        confidence: 0.99,
        reason: 'Entity has clean record on all government procurement portals.',
        timestamp: '2026-09-10T10:30:40Z',
        verification_id: 'VER-89101',
      },
    ];
    this.verificationChecks.set(bidderA.id, checksA);

    // Bidder B Checks (Demo Discrepancy: Score 82, Risk MEDIUM, Status REVIEW_REQUIRED)
    const checksB: VerificationCheck[] = [
      {
        id: 'CHK-B-1',
        bidder_id: bidderB.id,
        requirement_name: 'GST Registration',
        source: 'Mock GST Verification Connector (GSTN API Setu Gateway)',
        document_value: 'XYZ Industries Pvt Ltd (07AAACZ1234F1Z8)',
        verified_value: 'XYZ Industries Private Limited (07AAACZ1234F1Z8 - ACTIVE)',
        result: 'REVIEW',
        confidence: 0.91,
        reason: 'Entity name variation detected (91% similarity: "XYZ Industries Pvt Ltd" vs "XYZ Industries Private Limited"). Manual verification recommended.',
        timestamp: '2026-09-10T10:32:10Z',
        verification_id: 'VER-89231',
      },
      {
        id: 'CHK-B-2',
        bidder_id: bidderB.id,
        requirement_name: 'Udyam / MSME Registration',
        source: 'Mock Udyam Connector (Ministry of MSME)',
        document_value: 'UDYAM-DL-02-0087654',
        verified_value: 'UDYAM-DL-02-0087654 (Medium Enterprise - Manufacturing)',
        result: 'PASS',
        confidence: 0.99,
        reason: 'Valid Udyam registration confirmed.',
        timestamp: '2026-09-10T10:32:15Z',
        verification_id: 'VER-89231',
      },
      {
        id: 'CHK-B-3',
        bidder_id: bidderB.id,
        requirement_name: 'Permanent Account Number (PAN)',
        source: 'Mock PAN Connector (Income Tax NSDL)',
        document_value: 'AAACZ1234F (XYZ Industries Pvt Ltd)',
        verified_value: 'AAACZ1234F (XYZ Industries Private Limited)',
        result: 'PASS',
        confidence: 0.98,
        reason: 'Identifier match verified. Legal entity name variation tracked to GSTN.',
        timestamp: '2026-09-10T10:32:20Z',
        verification_id: 'VER-89231',
      },
      {
        id: 'CHK-B-4',
        bidder_id: bidderB.id,
        requirement_name: 'Income Tax Return (ITR) Compliance',
        source: 'Mock Income Tax Connector (CBDT)',
        document_value: 'ITR Returns Acknowledged',
        verified_value: 'CBDT: Compliant (AY 2025-26, 2024-25, 2023-24)',
        result: 'PASS',
        confidence: 0.97,
        reason: 'ITR filings confirmed compliant for required assessment years.',
        timestamp: '2026-09-10T10:32:25Z',
        verification_id: 'VER-89231',
      },
      {
        id: 'CHK-B-5',
        bidder_id: bidderB.id,
        requirement_name: 'Make in India Local Content (>50%)',
        source: 'Self-Declaration & CA Verification Portal',
        document_value: 'Declaration present (52% Local Content claim)',
        verified_value: 'Declaration present (Verification pending CA certification audit)',
        result: 'REVIEW',
        confidence: 0.88,
        reason: 'Local-content declaration requires additional verification / statutory auditor certificate review.',
        timestamp: '2026-09-10T10:32:30Z',
        verification_id: 'VER-89231',
      },
      {
        id: 'CHK-B-6',
        bidder_id: bidderB.id,
        requirement_name: 'EPFO & ESIC Compliance',
        source: 'Mock EPFO / ESIC Connector (Shram Suvidha)',
        document_value: 'Statutory Labor Clearance',
        verified_value: 'Active Establishment Code (DL/CPM/002341)',
        result: 'PASS',
        confidence: 0.96,
        reason: 'Monthly ECR filings verified up-to-date.',
        timestamp: '2026-09-10T10:32:35Z',
        verification_id: 'VER-89231',
      },
      {
        id: 'CHK-B-7',
        bidder_id: bidderB.id,
        requirement_name: 'Non-Debarment / Blacklisting Declaration',
        source: 'Mock Debarment Connector (CPPP / GeM Incident Register)',
        document_value: 'Non-Debarment Affidavit Submitted',
        verified_value: 'Clean Record (No active debarment orders)',
        result: 'PASS',
        confidence: 0.99,
        reason: 'No debarment records found.',
        timestamp: '2026-09-10T10:32:40Z',
        verification_id: 'VER-89231',
      },
    ];
    this.verificationChecks.set(bidderB.id, checksB);

    // Bidder C Checks (QuickSupply: Score 38, Risk HIGH, Status HIGH_RISK)
    const checksC: VerificationCheck[] = [
      {
        id: 'CHK-C-1',
        bidder_id: bidderC.id,
        requirement_name: 'GST Registration',
        source: 'Mock GST Verification Connector (GSTN API Setu Gateway)',
        document_value: '29AAEFQ5566G1ZQ',
        verified_value: '29AAEFQ5566G1ZQ [Status: SUSPENDED]',
        result: 'FAIL',
        confidence: 0.99,
        reason: 'GST registration has been SUSPENDED by tax authority for non-compliance.',
        timestamp: '2026-09-10T10:35:10Z',
        verification_id: 'VER-89345',
      },
      {
        id: 'CHK-C-2',
        bidder_id: bidderC.id,
        requirement_name: 'Udyam / MSME Registration',
        source: 'Mock Udyam Connector (Ministry of MSME)',
        document_value: 'UDYAM-KR-03-0099881',
        verified_value: 'UDYAM-KR-03-0099881 (Micro Enterprise - Services)',
        result: 'PASS',
        confidence: 0.99,
        reason: 'Valid MSME registration.',
        timestamp: '2026-09-10T10:35:15Z',
        verification_id: 'VER-89345',
      },
      {
        id: 'CHK-C-3',
        bidder_id: bidderC.id,
        requirement_name: 'Permanent Account Number (PAN)',
        source: 'Mock PAN Connector (Income Tax NSDL)',
        document_value: 'AAEFQ5566G',
        verified_value: 'AAEFQ5566G (QuickSupply Logistics Solutions LLP)',
        result: 'PASS',
        confidence: 0.98,
        reason: 'PAN record is valid.',
        timestamp: '2026-09-10T10:35:20Z',
        verification_id: 'VER-89345',
      },
      {
        id: 'CHK-C-4',
        bidder_id: bidderC.id,
        requirement_name: 'Income Tax Return (ITR) Compliance',
        source: 'Mock Income Tax Connector (CBDT)',
        document_value: 'ITR Receipts',
        verified_value: 'CBDT Portal: DEFAULTER (Missed AY 2025-26 & AY 2024-25)',
        result: 'FAIL',
        confidence: 0.98,
        reason: 'Bidder failed to submit ITR for last 2 mandatory financial years.',
        timestamp: '2026-09-10T10:35:25Z',
        verification_id: 'VER-89345',
      },
      {
        id: 'CHK-C-5',
        bidder_id: bidderC.id,
        requirement_name: 'Make in India Local Content (>50%)',
        source: 'Self-Declaration & CA Verification Portal',
        document_value: '18% Local Content Claimed',
        verified_value: 'Non-compliant (< 50% Threshold)',
        result: 'FAIL',
        confidence: 0.95,
        reason: 'Declared local content (18%) is strictly below minimum tender requirement (50%).',
        timestamp: '2026-09-10T10:35:30Z',
        verification_id: 'VER-89345',
      },
      {
        id: 'CHK-C-6',
        bidder_id: bidderC.id,
        requirement_name: 'EPFO & ESIC Compliance',
        source: 'Mock EPFO / ESIC Connector (Shram Suvidha)',
        document_value: 'Statutory Labor Declaration',
        verified_value: 'Active Compliant',
        result: 'PASS',
        confidence: 0.95,
        reason: 'Labor registrations active.',
        timestamp: '2026-09-10T10:35:35Z',
        verification_id: 'VER-89345',
      },
      {
        id: 'CHK-C-7',
        bidder_id: bidderC.id,
        requirement_name: 'Non-Debarment / Blacklisting Declaration',
        source: 'Mock Debarment Connector (CPPP / GeM Incident Register)',
        document_value: 'Self-Declaration Submitted',
        verified_value: 'CRITICAL FLAG: Debarred by Department of Expenditure (Order: DoE/OM-2025/DEB-419)',
        result: 'FAIL',
        confidence: 0.99,
        reason: 'CRITICAL: Entity is actively debarred/blacklisted for 24 months due to past contract default.',
        timestamp: '2026-09-10T10:35:40Z',
        verification_id: 'VER-89345',
      },
    ];
    this.verificationChecks.set(bidderC.id, checksC);

    // 7. Seed Compliance Results
    const resA: ComplianceResult = {
      id: 'RES-A',
      bidder_id: bidderA.id,
      verification_id: 'VER-89101',
      score: 96,
      risk: 'LOW',
      status: 'COMPLIANT',
      passed: 7,
      failed: 0,
      review: 0,
      pending: 0,
      mandatory_failure: false,
      generated_at: '2026-09-10T10:30:45Z',
    };
    this.complianceResults.set(bidderA.id, resA);

    const resB: ComplianceResult = {
      id: 'RES-B',
      bidder_id: bidderB.id,
      verification_id: 'VER-89231',
      score: 82,
      risk: 'MEDIUM',
      status: 'REVIEW_REQUIRED',
      passed: 5,
      failed: 0,
      review: 2,
      pending: 0,
      mandatory_failure: false,
      generated_at: '2026-09-10T10:32:45Z',
    };
    this.complianceResults.set(bidderB.id, resB);

    const resC: ComplianceResult = {
      id: 'RES-C',
      bidder_id: bidderC.id,
      verification_id: 'VER-89345',
      score: 38,
      risk: 'HIGH',
      status: 'HIGH_RISK',
      passed: 3,
      failed: 4,
      review: 0,
      pending: 0,
      mandatory_failure: true,
      generated_at: '2026-09-10T10:35:45Z',
    };
    this.complianceResults.set(bidderC.id, resC);

    // 8. Seed Recommendations
    const recA: Recommendation = {
      id: 'REC-A',
      bidder_id: bidderA.id,
      verification_id: 'VER-89101',
      recommendation_text: 'Statutory compliance satisfied. All mandatory eligibility requirements verified with official government databases.',
      reasoning: [
        'All statutory identifiers (GSTIN, PAN, Udyam) match verified registry records with >98% confidence.',
        'Income Tax Return compliance confirmed for 3 consecutive assessment years.',
        'Make in India Class-I supplier criteria verified (68% domestic value addition).',
        'No debarment, blacklisting, or vigilance flags exist on any central/state portal.',
        'Final decision remains with the Procurement Officer.',
      ],
      discrepancies: [],
      generated_at: '2026-09-10T10:30:50Z',
    };
    this.recommendations.set(bidderA.id, recA);

    const recB: Recommendation = {
      id: 'REC-B',
      bidder_id: bidderB.id,
      verification_id: 'VER-89231',
      recommendation_text: 'Manual review recommended before final qualification.',
      reasoning: [
        'Most statutory identifiers are verified and active.',
        'Entity name variation was detected (91% similarity between "XYZ Industries Pvt Ltd" and "XYZ Industries Private Limited").',
        'Local content requires additional confirmation / statutory auditor certification.',
        'No automatic disqualification has been applied.',
        'Final decision remains with the Procurement Officer.',
      ],
      discrepancies: [
        'Entity name variation: Document shows "XYZ Industries Pvt Ltd", Government record shows "XYZ Industries Private Limited" (91% similarity).',
        'Local-content self-declaration requires confirmation of CA certification annexure.',
      ],
      generated_at: '2026-09-10T10:32:50Z',
    };
    this.recommendations.set(bidderB.id, recB);

    const recC: Recommendation = {
      id: 'REC-C',
      bidder_id: bidderC.id,
      verification_id: 'VER-89345',
      recommendation_text: 'Disqualification or formal explanation clarification recommended due to critical non-compliance and active debarment.',
      reasoning: [
        'Critical debarment / blacklisting flag recorded on Department of Expenditure registry (Order DoE/OM-2025/DEB-419).',
        'GST registration is actively SUSPENDED on the GSTN portal.',
        'Income Tax return defaulter for the last two financial years.',
        'Local content percentage (18%) violates minimum mandatory tender threshold (50%).',
        'Final decision remains with the Procurement Officer.',
      ],
      discrepancies: [
        'Active 24-month debarment order from Department of Expenditure.',
        'Suspended GST registration status.',
        'Missing ITR filings for AY 2024-25 and AY 2025-26.',
        'Local content deficiency (18% vs 50% required).',
      ],
      generated_at: '2026-09-10T10:35:50Z',
    };
    this.recommendations.set(bidderC.id, recC);

    // 9. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'AUD-001',
        verification_id: 'VER-89101',
        bidder_id: bidderA.id,
        timestamp: '2026-09-10T10:30:00Z',
        actor: 'Procurement Officer (Rajesh Sharma, IAS)',
        action: 'Triggered Full Verification',
        object: 'ABC Technologies Pvt Ltd (GEM-2026-001)',
        result: 'Engine Started',
      },
      {
        id: 'AUD-002',
        verification_id: 'VER-89101',
        bidder_id: bidderA.id,
        timestamp: '2026-09-10T10:30:10Z',
        actor: 'AI Document Extractor',
        action: 'Extracted GSTIN & Legal Name',
        object: 'abc_gst_reg06.pdf',
        result: 'Extracted 27AABCU9603R1ZM (Confidence 0.98)',
      },
      {
        id: 'AUD-003',
        verification_id: 'VER-89101',
        bidder_id: bidderA.id,
        timestamp: '2026-09-10T10:30:15Z',
        actor: 'Mock GST Connector',
        action: 'Queried GSTN Gateway',
        object: '27AABCU9603R1ZM',
        result: 'Verified ACTIVE (Evidence GST-EV-48192)',
      },
      {
        id: 'AUD-004',
        verification_id: 'VER-89101',
        bidder_id: bidderA.id,
        timestamp: '2026-09-10T10:30:40Z',
        actor: 'Compliance Rule Engine',
        action: 'Evaluated Statutory Rules',
        object: '7 Tender Requirements',
        result: '7 PASS, 0 REVIEW, 0 FAIL',
      },
      {
        id: 'AUD-005',
        verification_id: 'VER-89101',
        bidder_id: bidderA.id,
        timestamp: '2026-09-10T10:30:45Z',
        actor: 'Risk Engine',
        action: 'Calculated Score & Risk Classification',
        object: 'ABC Technologies Pvt Ltd',
        result: 'Score 96% | Risk LOW | Status COMPLIANT',
      },
      {
        id: 'AUD-006',
        verification_id: 'VER-89231',
        bidder_id: bidderB.id,
        timestamp: '2026-09-10T10:32:00Z',
        actor: 'Procurement Officer (Rajesh Sharma, IAS)',
        action: 'Triggered Full Verification',
        object: 'XYZ Industries Pvt Ltd (GEM-2026-001)',
        result: 'Engine Started',
      },
      {
        id: 'AUD-007',
        verification_id: 'VER-89231',
        bidder_id: bidderB.id,
        timestamp: '2026-09-10T10:32:10Z',
        actor: 'Entity Similarity Engine',
        action: 'Compared Entity Names',
        object: 'Document vs GSTN Legal Name',
        result: 'Similarity 91% (Flagged REVIEW for Legal Suffix Variation)',
      },
      {
        id: 'AUD-008',
        verification_id: 'VER-89231',
        bidder_id: bidderB.id,
        timestamp: '2026-09-10T10:32:45Z',
        actor: 'Risk Engine',
        action: 'Calculated Score & Risk Classification',
        object: 'XYZ Industries Pvt Ltd',
        result: 'Score 82% | Risk MEDIUM | Status REVIEW_REQUIRED',
      },
      {
        id: 'AUD-009',
        verification_id: 'VER-89231',
        bidder_id: bidderB.id,
        timestamp: '2026-09-10T10:32:50Z',
        actor: 'AI Recommendation Engine',
        action: 'Generated Explainable Recommendation',
        object: 'XYZ Industries Pvt Ltd',
        result: 'Manual review recommended before final qualification',
      },
      {
        id: 'AUD-010',
        verification_id: 'VER-89345',
        bidder_id: bidderC.id,
        timestamp: '2026-09-10T10:35:10Z',
        actor: 'Mock GST Connector',
        action: 'Queried GSTN Gateway',
        object: '29AAEFQ5566G1ZQ',
        result: 'FAIL: Status SUSPENDED',
      },
      {
        id: 'AUD-011',
        verification_id: 'VER-89345',
        bidder_id: bidderC.id,
        timestamp: '2026-09-10T10:35:40Z',
        actor: 'Mock Debarment Connector',
        action: 'Checked CPPP / GeM Debarred Registry',
        object: 'QuickSupply Logistics Solutions LLP',
        result: 'CRITICAL FLAG: Debarred by Department of Expenditure (Order DoE/OM-2025/DEB-419)',
      },
      {
        id: 'AUD-012',
        verification_id: 'VER-89345',
        bidder_id: bidderC.id,
        timestamp: '2026-09-10T10:35:45Z',
        actor: 'Risk Engine',
        action: 'Enforced Mandatory Failure Rule',
        object: 'QuickSupply Pvt Ltd',
        result: 'Score 38% | Risk HIGH | Status HIGH_RISK',
      },
    ];
  }

  // Helper Query Methods
  getDashboardStats(): DashboardStats {
    const allBidders = Array.from(this.bidders.values());
    let compliant = 0;
    let review_required = 0;
    let high_risk = 0;

    for (const b of allBidders) {
      if (b.status === 'COMPLIANT') compliant++;
      else if (b.status === 'REVIEW_REQUIRED') review_required++;
      else if (b.status === 'HIGH_RISK') high_risk++;
    }

    // Tally checks distribution across all checks
    let pass = 0;
    let review = 0;
    let fail = 0;
    let pending = 0;

    for (const checkList of this.verificationChecks.values()) {
      for (const c of checkList) {
        if (c.result === 'PASS') pass++;
        else if (c.result === 'REVIEW') review++;
        else if (c.result === 'FAIL') fail++;
        else pending++;
      }
    }

    return {
      active_bids: this.bids.size,
      total_bidders: allBidders.length,
      compliant,
      review_required,
      high_risk,
      checks_distribution: {
        pass,
        review,
        fail,
        pending,
      },
      compliance_distribution: {
        compliant,
        review: review_required,
        high_risk,
      },
    };
  }

  recordAudit(actor: string, action: string, object: string, result: string, bidder_id?: string, verification_id?: string, metadata?: Record<string, any>) {
    const log: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      verification_id,
      bidder_id,
      actor,
      action,
      object,
      result,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const db = new InMemoryDatabase();
