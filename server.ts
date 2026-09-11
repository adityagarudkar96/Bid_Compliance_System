import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

import { db } from './server/db.ts';
import { gstConnector } from './server/connectors/gst_connector.ts';
import { udyamConnector } from './server/connectors/udyam_connector.ts';
import { panConnector } from './server/connectors/pan_connector.ts';
import { incomeTaxConnector } from './server/connectors/income_tax_connector.ts';
import { epfoConnector, esicConnector } from './server/connectors/epfo_connector.ts';
import { digilockerConnector } from './server/connectors/digilocker_connector.ts';
import { debarmentConnector } from './server/connectors/debarment_connector.ts';
import { evaluateComplianceRules } from './server/compliance/rule_engine.ts';
import { calculateComplianceScore, classifyRisk } from './server/compliance/score_engine.ts';
import { generateExplainableRecommendation } from './server/compliance/recommendation_engine.ts';
import { extractTenderRequirements, DEFAULT_TENDER_REQUIREMENTS } from './server/ai/tender_extractor.ts';
import { extractDocumentFields } from './server/ai/document_extractor.ts';
import { Bid, Bidder, BidderDocument, ComplianceResult, OfficerDecision, Recommendation, VerificationCheck } from './src/types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'gem-procurement-officer-secret-key-2026';
const PORT = 3000;

async function startServer() {
  const app = express();

  // Standard Middlewares
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS Headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // JWT Auth Middleware helper
  const authenticateOfficer = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // In demo mode, if no auth token provided, treat as demo officer for seamless UX
      (req as any).user = {
        id: 'USR-OFFICER-001',
        name: 'Rajesh Sharma, IAS',
        role: 'PROCUREMENT_OFFICER',
        email: 'officer@gem-demo.gov.in',
      };
      return next();
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      next();
    } catch {
      // Fallback to demo officer
      (req as any).user = {
        id: 'USR-OFFICER-001',
        name: 'Rajesh Sharma, IAS',
        role: 'PROCUREMENT_OFFICER',
        email: 'officer@gem-demo.gov.in',
      };
      next();
    }
  };

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'GeM AI-Powered Bid Compliance Verification Platform',
      version: '1.0.0-mvp',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Authentication: POST /auth/login, /api/auth/login, /login, /api/login
  const handleLogin = (req: Request, res: Response) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        demo_credentials: {
          email: 'officer@gem-demo.gov.in',
          password: 'Demo@123',
        },
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // Validate against demo credentials (supports standard or common case variations)
    const isDemoOfficer =
      cleanEmail === 'officer@gem-demo.gov.in' ||
      cleanEmail === 'officer@gem.gov.in' ||
      cleanEmail === 'officer' ||
      cleanEmail === 'admin' ||
      cleanEmail === 'demo';

    const isDemoPassword =
      cleanPass === 'Demo@123' ||
      cleanPass.toLowerCase() === 'demo@123' ||
      cleanPass === 'Demo@1234' ||
      cleanPass === 'admin' ||
      cleanPass === 'password';

    if (isDemoOfficer && isDemoPassword) {
      const officer = Array.from(db.users.values()).find((u) => u.email === cleanEmail) || {
        id: 'USR-OFFICER-001',
        name: 'Rajesh Sharma, IAS',
        email: 'officer@gem-demo.gov.in',
        role: 'PROCUREMENT_OFFICER' as const,
        department: 'Department of Information Technology',
        designation: 'Joint Secretary & Senior Procurement Officer',
        created_at: '2026-01-15T09:00:00Z',
      };

      const token = jwt.sign(
        {
          id: officer.id,
          name: officer.name,
          email: officer.email,
          role: 'PROCUREMENT_OFFICER',
          department: officer.department,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      db.recordAudit(
        officer.name,
        'Officer Login',
        'GeM Compliance Portal',
        'SUCCESS (Session Established)',
        undefined,
        undefined,
        { ip: req.ip, email: cleanEmail }
      );

      return res.json({
        token,
        user: officer,
        message: 'Authentication successful. Officer session established.',
      });
    }

    return res.status(401).json({
      error: 'Invalid credentials. Please use demo credentials: officer@gem-demo.gov.in / Demo@123',
      demo_credentials: {
        email: 'officer@gem-demo.gov.in',
        password: 'Demo@123',
      },
    });
  };

  app.post('/api/auth/login', handleLogin);
  app.post('/auth/login', handleLogin);
  app.post('/api/login', handleLogin);
  app.post('/login', handleLogin);

  const handleGetLoginInfo = (req: Request, res: Response, next: NextFunction) => {
    // If browser requesting HTML, pass to SPA Vite middleware
    if (req.accepts('html') && !req.xhr && !req.headers.accept?.includes('application/json')) {
      return next();
    }
    res.json({
      status: 'ok',
      endpoint: '/login',
      method: 'POST',
      description: 'GeM Procurement Officer Authentication endpoint',
      demo_credentials: {
        email: 'officer@gem-demo.gov.in',
        password: 'Demo@123',
      },
    });
  };
  app.get('/api/auth/login', handleGetLoginInfo);
  app.get('/api/login', handleGetLoginInfo);
  app.get('/auth/login', handleGetLoginInfo);
  app.get('/login', handleGetLoginInfo);

  // 2. Dashboard Statistics: GET /dashboard and /api/dashboard
  const handleDashboard = (_req: Request, res: Response) => {
    const stats = db.getDashboardStats();
    const recentBids = Array.from(db.bids.values()).slice(0, 5);
    res.json({
      stats,
      recent_bids: recentBids,
    });
  };

  app.get('/api/dashboard', handleDashboard);
  app.get('/dashboard', handleDashboard);

  // 3. Bids Listing & Creation: GET & POST /bids, /api/bids
  const handleGetBids = (req: Request, res: Response) => {
    const department = req.query.department as string;
    const status = req.query.status as string;
    const search = (req.query.search as string || '').toLowerCase();

    let bids = Array.from(db.bids.values());

    if (department && department !== 'ALL') {
      bids = bids.filter((b) => b.department.toLowerCase().includes(department.toLowerCase()));
    }
    if (status && status !== 'ALL') {
      bids = bids.filter((b) => b.status === status);
    }
    if (search) {
      bids = bids.filter(
        (b) =>
          b.bid_number.toLowerCase().includes(search) ||
          b.title.toLowerCase().includes(search) ||
          b.department.toLowerCase().includes(search)
      );
    }

    res.json({ bids });
  };

  const handleCreateBid = (req: Request, res: Response) => {
    const { bid_number, title, department, category, closing_date, estimated_value } = req.body;
    if (!bid_number || !title) {
      return res.status(400).json({ error: 'Bid number and title are required' });
    }

    const newBid: Bid = {
      id: bid_number.trim().toUpperCase(),
      bid_number: bid_number.trim().toUpperCase(),
      title: title.trim(),
      department: department || 'Department of Information Technology',
      category: category || 'General Procurement',
      closing_date: closing_date || '31 Dec 2026',
      status: 'VERIFICATION_READY',
      estimated_value: estimated_value || '₹ 1,00,00,000',
      created_at: new Date().toISOString(),
      bidders_count: 0,
    };

    db.bids.set(newBid.id, newBid);

    db.recordAudit(
      'Procurement Officer',
      'Create / Import Bid',
      `Bid ${newBid.bid_number}`,
      'Bid Registered'
    );

    res.status(201).json({ bid: newBid });
  };

  app.get('/api/bids', handleGetBids);
  app.get('/bids', handleGetBids);
  app.post('/api/bids', authenticateOfficer, handleCreateBid);
  app.post('/bids', authenticateOfficer, handleCreateBid);

  // 4. Bid Details & Tender Analysis: GET /bids/:bid_id and POST /bids/:bid_id/analyze
  const handleGetBidById = (req: Request, res: Response) => {
    const bidId = req.params.bid_id;
    const bid = db.bids.get(bidId);
    if (!bid) {
      return res.status(404).json({ error: `Bid ${bidId} not found` });
    }
    const requirements = db.requirements.get(bidId) || [];
    const bidders = Array.from(db.bidders.values()).filter((b) => b.bid_id === bidId);

    res.json({
      bid,
      requirements,
      bidders,
    });
  };

  const handleAnalyzeTender = async (req: Request, res: Response) => {
    const bidId = req.params.bid_id;
    const bid = db.bids.get(bidId);
    if (!bid) {
      return res.status(404).json({ error: `Bid ${bidId} not found` });
    }

    const tenderText = req.body.tender_text || `TENDER DOCUMENT: ${bid.title} (${bid.bid_number})
Department: ${bid.department}
Eligibility criteria: Mandatory GST registration in Active status. Udyam / MSME registration certificate required for preference benefits. Company PAN card. Income tax returns for last 3 financial years. Minimum 50% domestic local content declaration. EPFO/ESIC compliance. Non-debarment declaration.`;

    try {
      const extractedReqs = await extractTenderRequirements(tenderText, bidId);
      db.requirements.set(bidId, extractedReqs);

      db.recordAudit(
        'AI Tender Extractor (Gemini)',
        'Extracted Tender Requirements',
        `Bid ${bid.bid_number}`,
        `${extractedReqs.length} compliance requirements extracted`
      );

      res.json({
        bid_id: bidId,
        requirements: extractedReqs,
        message: 'Tender analyzed and structured requirements extracted successfully.',
      });
    } catch (err: any) {
      console.error('Error analyzing tender:', err);
      res.status(500).json({ error: 'Failed to analyze tender document: ' + (err.message || String(err)) });
    }
  };

  app.get('/api/bids/:bid_id', handleGetBidById);
  app.get('/bids/:bid_id', handleGetBidById);
  app.post('/api/bids/:bid_id/analyze', authenticateOfficer, handleAnalyzeTender);
  app.post('/bids/:bid_id/analyze', authenticateOfficer, handleAnalyzeTender);

  // Requirements endpoint: GET /bids/:bid_id/requirements
  const handleGetRequirements = (req: Request, res: Response) => {
    const bidId = req.params.bid_id;
    const requirements = db.requirements.get(bidId) || [];
    res.json({ requirements });
  };
  app.get('/api/bids/:bid_id/requirements', handleGetRequirements);
  app.get('/bids/:bid_id/requirements', handleGetRequirements);

  // Bidders for tender: GET /bids/:bid_id/bidders
  const handleGetBidBidders = (req: Request, res: Response) => {
    const bidId = req.params.bid_id;
    const bidders = Array.from(db.bidders.values()).filter((b) => b.bid_id === bidId);
    res.json({ bidders });
  };
  app.get('/api/bids/:bid_id/bidders', handleGetBidBidders);
  app.get('/bids/:bid_id/bidders', handleGetBidBidders);

  // 5. Bidder Details: GET /bidders/:bidder_id
  const handleGetBidder = (req: Request, res: Response) => {
    const bidderId = req.params.bidder_id;
    const bidder = db.bidders.get(bidderId);
    if (!bidder) {
      return res.status(404).json({ error: `Bidder ${bidderId} not found` });
    }
    const documents = db.documents.get(bidderId) || [];
    const compliance = db.complianceResults.get(bidderId) || null;
    const recommendation = db.recommendations.get(bidderId) || null;
    const checks = db.verificationChecks.get(bidderId) || [];

    res.json({
      bidder,
      documents,
      compliance,
      recommendation,
      checks,
    });
  };
  app.get('/api/bidders/:bidder_id', handleGetBidder);
  app.get('/bidders/:bidder_id', handleGetBidder);

  // 6. Document Upload: POST /bidders/:bidder_id/documents
  const handleUploadDocument = async (req: Request, res: Response) => {
    const bidderId = req.params.bidder_id;
    const bidder = db.bidders.get(bidderId);
    if (!bidder) {
      return res.status(404).json({ error: `Bidder ${bidderId} not found` });
    }

    const { document_type, file_name, file_text, file_size } = req.body;
    if (!document_type || !file_name) {
      return res.status(400).json({ error: 'Document type and file name are required' });
    }

    const docId = `DOC-${bidderId}-${Date.now().toString().slice(-4)}`;
    const newDoc: BidderDocument = {
      id: docId,
      bidder_id: bidderId,
      document_type,
      file_name,
      file_url: `/mock-documents/${file_name}`,
      file_size: file_size || '1.2 MB',
      extracted_text: file_text || `Document ${file_name} for ${bidder.company_name}`,
      uploaded_at: new Date().toISOString(),
      status: 'PROCESSED',
    };

    const currentDocs = db.documents.get(bidderId) || [];
    currentDocs.push(newDoc);
    db.documents.set(bidderId, currentDocs);

    // Extract structured fields
    const extractionResult = await extractDocumentFields(document_type, file_name, file_text);

    db.recordAudit(
      'Procurement Officer',
      'Uploaded Bidder Document',
      `${newDoc.document_type} (${newDoc.file_name})`,
      'Uploaded & Processed',
      bidderId
    );

    res.status(201).json({
      document: newDoc,
      extraction: extractionResult,
      message: 'Document uploaded and structured fields extracted.',
    });
  };
  app.post('/api/bidders/:bidder_id/documents', authenticateOfficer, handleUploadDocument);
  app.post('/bidders/:bidder_id/documents', authenticateOfficer, handleUploadDocument);

  // 7. Verification Execution: POST /bidders/:bidder_id/verify and MOST IMPORTANT API: POST /api/v1/compliance/verify
  const executeVerification = async (bidderId: string, bidId?: string) => {
    const bidder = db.bidders.get(bidderId);
    if (!bidder) {
      throw new Error(`Bidder ${bidderId} not found`);
    }

    const targetBidId = bidId || bidder.bid_id;
    const requirements = db.requirements.get(targetBidId) || DEFAULT_TENDER_REQUIREMENTS.map((r, i) => ({
      ...r,
      id: `REQ-${targetBidId}-${i + 1}`,
      bid_id: targetBidId,
    }));

    const uploadedDocs = db.documents.get(bidderId) || [];
    const formattedDocs = uploadedDocs.map((d) => ({
      type: d.document_type,
      extracted_fields: {
        company_name: bidder.company_name,
        gstin: bidder.gstin,
        pan: bidder.pan,
        udyam_number: bidder.udyam_number,
      },
    }));

    const verificationId = `VER-${Math.floor(10000 + Math.random() * 90000)}`;

    db.recordAudit(
      'Procurement Officer',
      'Triggered Verification Engine',
      `Bidder ${bidder.company_name}`,
      `Verification Session ${verificationId} Started`,
      bidderId,
      verificationId
    );

    // Query Government Connectors in parallel
    const [gstData, panData, udyamData, itrData, epfoData, esicData, debarmentData, digilockerData] =
      await Promise.all([
        gstConnector.verify(bidder.gstin),
        panConnector.verify(bidder.pan),
        udyamConnector.verify(bidder.udyam_number),
        incomeTaxConnector.verify(bidder.pan),
        epfoConnector.verify(bidder.company_name),
        esicConnector.verify(bidder.company_name),
        debarmentConnector.verify(bidder.pan, bidder.company_name),
        digilockerConnector.verify(bidder.id, 'GeM Verified Issuer'),
      ]);

    db.recordAudit(
      'Mock Government Connectors',
      'Queried External Statutory Sources',
      'GSTN, Udyam, PAN, CBDT, CPPP, EPFO',
      'Received 8 Verification Evidence Payloads',
      bidderId,
      verificationId
    );

    // Run Cross-Verification & Deterministic Rules
    const evaluatedChecks = evaluateComplianceRules({
      bidder_name: bidder.company_name,
      gstin: bidder.gstin,
      pan: bidder.pan,
      udyam_number: bidder.udyam_number,
      requirements,
      uploaded_documents: formattedDocs,
      government_data: {
        gst: gstData,
        pan: panData,
        udyam: udyamData,
        income_tax: itrData,
        epfo: epfoData,
        esic: esicData,
        debarment: debarmentData,
        digilocker: digilockerData,
      },
    });

    // Attach timestamp and verification_id to each check
    const timestamp = new Date().toISOString();
    const finalChecks: VerificationCheck[] = evaluatedChecks.map((c, idx) => ({
      id: `CHK-${bidderId}-${idx + 1}`,
      bidder_id: bidderId,
      requirement_id: c.requirement_id,
      requirement_name: c.requirement_name,
      source: c.source,
      document_value: c.document_value,
      verified_value: c.verified_value,
      result: c.result,
      confidence: c.confidence,
      reason: c.reason,
      timestamp,
      verification_id: verificationId,
    }));

    db.verificationChecks.set(bidderId, finalChecks);

    // Score Engine
    const scoreResult = calculateComplianceScore(evaluatedChecks);

    // Risk Engine
    const riskResult = classifyRisk(scoreResult, debarmentData.is_debarred);

    // Update bidder record
    bidder.compliance_score = scoreResult.score;
    bidder.risk_level = riskResult.risk_level;
    bidder.status = riskResult.compliance_status;
    bidder.last_verified = timestamp;
    db.bidders.set(bidderId, bidder);

    // Compliance Result Record
    const complianceResult: ComplianceResult = {
      id: `RES-${bidderId}`,
      bidder_id: bidderId,
      verification_id: verificationId,
      score: scoreResult.score,
      risk: riskResult.risk_level,
      status: riskResult.compliance_status,
      passed: scoreResult.passed_count,
      failed: scoreResult.failed_count,
      review: scoreResult.review_count,
      pending: scoreResult.pending_count,
      mandatory_failure: scoreResult.mandatory_failure,
      generated_at: timestamp,
    };
    db.complianceResults.set(bidderId, complianceResult);

    // Explainable Recommendation Engine
    const recOutput = await generateExplainableRecommendation(
      bidder.company_name,
      evaluatedChecks,
      scoreResult,
      riskResult
    );

    const recommendation: Recommendation = {
      id: `REC-${bidderId}`,
      bidder_id: bidderId,
      verification_id: verificationId,
      recommendation_text: recOutput.recommendation_text,
      reasoning: recOutput.reasoning,
      discrepancies: recOutput.discrepancies,
      generated_at: timestamp,
    };
    db.recommendations.set(bidderId, recommendation);

    db.recordAudit(
      'Risk & Recommendation Engine',
      'Compliance Evaluation Completed',
      bidder.company_name,
      `Score: ${scoreResult.score}% | Risk: ${riskResult.risk_level} | Status: ${riskResult.compliance_status}`,
      bidderId,
      verificationId
    );

    return {
      score: scoreResult.score,
      risk: riskResult.risk_level,
      status: riskResult.compliance_status,
      passed: scoreResult.passed_count,
      review: scoreResult.review_count,
      failed: scoreResult.failed_count,
      mandatory_failure: scoreResult.mandatory_failure,
      recommendation: recOutput.recommendation_text,
      verification_id: verificationId,
      checks: finalChecks,
      compliance: complianceResult,
      full_recommendation: recommendation,
    };
  };

  app.post('/api/bidders/:bidder_id/verify', authenticateOfficer, async (req, res) => {
    try {
      const result = await executeVerification(req.params.bidder_id);
      res.json(result);
    } catch (err: any) {
      console.error('Verification error:', err);
      res.status(500).json({ error: err.message || 'Verification failed' });
    }
  });

  app.post('/bidders/:bidder_id/verify', authenticateOfficer, async (req, res) => {
    try {
      const result = await executeVerification(req.params.bidder_id);
      res.json(result);
    } catch (err: any) {
      console.error('Verification error:', err);
      res.status(500).json({ error: err.message || 'Verification failed' });
    }
  });

  // Verify All Bidders in a bid
  app.post('/api/bids/:bid_id/verify-all', authenticateOfficer, async (req, res) => {
    const bidId = req.params.bid_id;
    const bid = db.bids.get(bidId);
    if (!bid) {
      return res.status(404).json({ error: `Bid ${bidId} not found` });
    }
    const bidders = Array.from(db.bidders.values()).filter((b) => b.bid_id === bidId);

    const results = [];
    for (const b of bidders) {
      try {
        const r = await executeVerification(b.id, bidId);
        results.push({ bidder_id: b.id, company_name: b.company_name, result: r });
      } catch (err: any) {
        results.push({ bidder_id: b.id, company_name: b.company_name, error: err.message });
      }
    }

    res.json({
      bid_id: bidId,
      total_bidders: bidders.length,
      results,
      message: 'Batch verification executed across all bidders.',
    });
  });

  // The Explicit Endpoint from spec: POST /api/v1/compliance/verify
  app.post('/api/v1/compliance/verify', async (req, res) => {
    const { bid_id, bidder_id, documents } = req.body;
    if (!bidder_id) {
      return res.status(400).json({ error: 'bidder_id is required' });
    }

    try {
      let bidder = db.bidders.get(bidder_id);
      if (!bidder) {
        // Create dynamic bidder entry if not exists
        bidder = {
          id: bidder_id,
          bid_id: bid_id || 'GEM-2026-001',
          company_name: 'Dynamic Bidder Enterprise',
          gstin: '27ABCDE1234F1Z5',
          pan: 'ABCDE1234F',
          udyam_number: 'UDYAM-MH-01-0099999',
          status: 'PENDING',
          compliance_score: 0,
          risk_level: 'MEDIUM',
        };
        db.bidders.set(bidder_id, bidder);
      }

      const result = await executeVerification(bidder_id, bid_id);
      res.json({
        score: result.score,
        risk: result.risk,
        status: result.status,
        passed: result.passed,
        review: result.review,
        failed: result.failed,
        mandatory_failure: result.mandatory_failure,
        recommendation: result.recommendation,
        verification_id: result.verification_id,
      });
    } catch (err: any) {
      console.error('Compliance verify endpoint error:', err);
      res.status(500).json({ error: err.message || 'Compliance verification failed' });
    }
  });

  // 8. Compliance Report: GET /bidders/:bidder_id/compliance
  const handleGetCompliance = (req: Request, res: Response) => {
    const bidderId = req.params.bidder_id;
    const bidder = db.bidders.get(bidderId);
    if (!bidder) {
      return res.status(404).json({ error: `Bidder ${bidderId} not found` });
    }
    const compliance = db.complianceResults.get(bidderId);
    const checks = db.verificationChecks.get(bidderId) || [];
    const recommendation = db.recommendations.get(bidderId);

    res.json({
      bidder,
      compliance,
      checks,
      recommendation,
    });
  };
  app.get('/api/bidders/:bidder_id/compliance', handleGetCompliance);
  app.get('/bidders/:bidder_id/compliance', handleGetCompliance);

  // 9. Evidence Viewer: GET /checks/:check_id/evidence
  const handleGetEvidence = (req: Request, res: Response) => {
    const checkId = req.params.check_id;
    let foundCheck: VerificationCheck | undefined;

    for (const checkList of db.verificationChecks.values()) {
      const match = checkList.find((c) => c.id === checkId);
      if (match) {
        foundCheck = match;
        break;
      }
    }

    if (!foundCheck) {
      return res.status(404).json({ error: `Verification check ${checkId} not found` });
    }

    res.json({
      check: foundCheck,
      evidence_details: {
        verification_id: foundCheck.verification_id,
        requirement: foundCheck.requirement_name,
        source: foundCheck.source,
        document_value: foundCheck.document_value,
        verified_value: foundCheck.verified_value,
        confidence: `${Math.round(foundCheck.confidence * 100)}%`,
        result: foundCheck.result,
        reason: foundCheck.reason,
        timestamp: foundCheck.timestamp,
        is_mock_connector: true,
        connector_disclaimer:
          'Data provided by Mock Government Connector Layer. In production, this verifies against authenticated API Setu / GSTN / CBDT / CPPP endpoints.',
      },
    });
  };
  app.get('/api/checks/:check_id/evidence', handleGetEvidence);
  app.get('/checks/:check_id/evidence', handleGetEvidence);

  // 10. Audit Trail: GET /bidders/:bidder_id/audit and Global /api/audit
  const handleGetAudit = (req: Request, res: Response) => {
    const bidderId = req.params.bidder_id;
    if (bidderId && bidderId !== 'all') {
      const logs = db.auditLogs.filter((l) => l.bidder_id === bidderId || !l.bidder_id);
      return res.json({ audit_logs: logs });
    }
    res.json({ audit_logs: db.auditLogs });
  };
  app.get('/api/bidders/:bidder_id/audit', handleGetAudit);
  app.get('/bidders/:bidder_id/audit', handleGetAudit);
  app.get('/api/audit', (_req, res) => {
    res.json({ audit_logs: db.auditLogs });
  });

  // 11. Procurement Officer Final Decision: POST /bidders/:bidder_id/decision
  const handleOfficerDecision = (req: Request, res: Response) => {
    const bidderId = req.params.bidder_id;
    const bidder = db.bidders.get(bidderId);
    if (!bidder) {
      return res.status(404).json({ error: `Bidder ${bidderId} not found` });
    }

    const { decision, reason, officer_name } = req.body;
    if (!decision || !['QUALIFY', 'DO_NOT_QUALIFY', 'NEEDS_MANUAL_REVIEW'].includes(decision)) {
      return res.status(400).json({ error: 'Valid decision (QUALIFY, DO_NOT_QUALIFY, NEEDS_MANUAL_REVIEW) is required' });
    }

    const officer = (req as any).user?.name || officer_name || 'Rajesh Sharma, IAS (Procurement Officer)';
    const timestamp = new Date().toISOString();

    bidder.decision = decision as OfficerDecision;
    bidder.decision_reason = reason || 'Procurement Officer determined eligibility based on verified compliance evidence.';
    bidder.decision_officer = officer;
    bidder.decision_at = timestamp;
    db.bidders.set(bidderId, bidder);

    db.recordAudit(
      officer,
      `Officer Final Decision: ${decision}`,
      bidder.company_name,
      `Decision: ${decision} | Reason: ${bidder.decision_reason}`,
      bidderId,
      undefined,
      { decision, reason }
    );

    res.json({
      bidder,
      message: `Procurement Officer decision '${decision}' successfully recorded in official audit trail.`,
    });
  };
  app.post('/api/bidders/:bidder_id/decision', authenticateOfficer, handleOfficerDecision);
  app.post('/bidders/:bidder_id/decision', authenticateOfficer, handleOfficerDecision);

  // ==========================================
  // VITE / STATIC CLIENT MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GeM AI Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
