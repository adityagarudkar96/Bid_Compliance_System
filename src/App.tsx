import React, { useEffect, useState } from 'react';
import { ApiClient } from './api/client.ts';
import { Header } from './components/Header.tsx';
import { AppTab, Navigation } from './components/Navigation.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { BidDetailView } from './components/BidDetailView.tsx';
import { ComplianceReportView } from './components/ComplianceReportView.tsx';
import { AuditTrailView } from './components/AuditTrailView.tsx';
import { EvidenceModal } from './components/EvidenceModal.tsx';
import { OfficerDecisionModal } from './components/OfficerDecisionModal.tsx';
import { VerificationModal } from './components/VerificationModal.tsx';
import { DocumentUploadModal } from './components/DocumentUploadModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import {
  AuditLog,
  Bid,
  Bidder,
  BidderDocument,
  ComplianceResult,
  DashboardStats,
  OfficerDecision,
  Recommendation,
  Requirement,
  User,
  VerificationCheck,
} from './types/index.ts';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'USR-OFFICER-001',
    name: 'Rajesh Sharma, IAS',
    email: 'officer@gem-demo.gov.in',
    role: 'PROCUREMENT_OFFICER',
    department: 'Department of Information Technology',
    designation: 'Joint Secretary & Senior Procurement Officer',
    created_at: new Date().toISOString(),
  });

  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [selectedBidId, setSelectedBidId] = useState<string>('GEM-2026-001');
  const [selectedBidderId, setSelectedBidderId] = useState<string>('BIDDER-B'); // Demo BIDDER B has the interesting 91% name variation

  // Data State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [currentBidder, setCurrentBidder] = useState<Bidder | null>(null);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [documents, setDocuments] = useState<BidderDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals & Loaders
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedEvidenceCheck, setSelectedEvidenceCheck] = useState<VerificationCheck | null>(null);
  const [evidenceDetails, setEvidenceDetails] = useState<any | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifyingBidderName, setVerifyingBidderName] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAnalyzingTender, setIsAnalyzingTender] = useState(false);
  const [isVerifyingBatch, setIsVerifyingBatch] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Initial Load & Route check
  useEffect(() => {
    // Check if user visited /login directly
    if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname.endsWith('/login'))) {
      setIsLoginModalOpen(true);
    }

    loadDashboard();
    loadBidDetails(selectedBidId);
    loadBidderDetails(selectedBidderId);
    loadAuditTrail();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await ApiClient.getDashboard();
      setStats(data.stats);
      setRecentBids(data.recent_bids);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadBidDetails = async (bidId: string) => {
    try {
      const data = await ApiClient.getBid(bidId);
      setCurrentBid(data.bid);
      setRequirements(data.requirements);
      setBidders(data.bidders);
    } catch (err) {
      console.error('Failed to load bid:', err);
    }
  };

  const loadBidderDetails = async (bidderId: string) => {
    try {
      const data = await ApiClient.getBidder(bidderId);
      setCurrentBidder(data.bidder);
      setComplianceResult(data.compliance);
      setRecommendation(data.recommendation);
      setChecks(data.checks);
      setDocuments(data.documents);
    } catch (err) {
      console.error('Failed to load bidder:', err);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const data = await ApiClient.getAuditTrail();
      setAuditLogs(data.audit_logs);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
    }
  };

  // User Actions
  const handleSelectBid = (bidId: string) => {
    setSelectedBidId(bidId);
    loadBidDetails(bidId);
    setCurrentTab('bid_detail');
  };

  const handleSelectBidder = (bidderId: string) => {
    setSelectedBidderId(bidderId);
    loadBidderDetails(bidderId);
    setCurrentTab('compliance_report');
  };

  const handleRunVerifyBidder = async (bidderId: string) => {
    const targetBidder = bidders.find((b) => b.id === bidderId) || currentBidder;
    setVerifyingBidderName(targetBidder?.company_name || 'Participating Bidder');
    setIsVerificationModalOpen(true);

    try {
      const result = await ApiClient.verifyBidder(bidderId);
      await loadBidderDetails(bidderId);
      await loadBidDetails(selectedBidId);
      await loadDashboard();
      await loadAuditTrail();
      showToast(`Verification completed for ${targetBidder?.company_name}. Score: ${result.score}/100 (${result.risk} Risk)`);
    } catch (err: any) {
      console.error('Verification failed:', err);
      showToast('Verification failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleVerifyAllBidders = async () => {
    setIsVerifyingBatch(true);
    try {
      await ApiClient.verifyAllBidders(selectedBidId);
      await loadBidDetails(selectedBidId);
      await loadDashboard();
      await loadAuditTrail();
      showToast('All 3 participating bidders verified against GSTN, Udyam, CBDT, and CPPP registries.');
    } catch (err: any) {
      console.error('Batch verification failed:', err);
      showToast('Batch verification error: ' + (err.message || 'Unknown error'));
    } finally {
      setIsVerifyingBatch(false);
    }
  };

  const handleAnalyzeTender = async () => {
    setIsAnalyzingTender(true);
    try {
      const res = await ApiClient.analyzeTender(selectedBidId);
      setRequirements(res.requirements);
      await loadAuditTrail();
      showToast('Tender specifications analyzed; 7 statutory eligibility criteria verified.');
    } catch (err: any) {
      console.error('Tender analysis error:', err);
      showToast('Tender extraction error: ' + (err.message || 'Failed'));
    } finally {
      setIsAnalyzingTender(false);
    }
  };

  const handleOpenEvidence = async (checkId: string) => {
    try {
      const data = await ApiClient.getEvidence(checkId);
      setSelectedEvidenceCheck(data.check);
      setEvidenceDetails(data.evidence_details);
      setIsEvidenceModalOpen(true);
    } catch (err) {
      console.error('Failed to load evidence:', err);
    }
  };

  const handleSubmitOfficerDecision = async (
    decision: OfficerDecision,
    reason: string,
    officerName: string
  ) => {
    if (!currentBidder) return;
    try {
      await ApiClient.submitOfficerDecision(currentBidder.id, decision, reason, officerName);
      await loadBidderDetails(currentBidder.id);
      await loadBidDetails(selectedBidId);
      await loadDashboard();
      await loadAuditTrail();
      showToast(`Official determination '${decision}' committed to GeM audit trail.`);
    } catch (err: any) {
      console.error('Failed to submit decision:', err);
      showToast('Failed to commit decision: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUploadDocument = async (data: {
    document_type: string;
    file_name: string;
    file_text?: string;
    file_size?: string;
  }) => {
    if (!currentBidder) return;
    try {
      await ApiClient.uploadDocument(currentBidder.id, data);
      await loadBidderDetails(currentBidder.id);
      await loadAuditTrail();
      showToast(`Document '${data.file_name}' uploaded and parsed successfully.`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast('Upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    const res = await ApiClient.login(email, pass);
    setCurrentUser(res.user);
    setIsLoginModalOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname.endsWith('/login')) {
      window.history.replaceState(null, '', '/');
    }
    showToast(`Welcome back, ${res.user.name}. Authenticated session established.`);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname.endsWith('/login')) {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleLogout = () => {
    ApiClient.setToken(null);
    setCurrentUser(null);
    showToast('Officer session logged out.');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 max-w-md bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 flex items-center justify-between">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Primary Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeBidId={selectedBidId}
        activeBidderName={currentBidder?.company_name}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* VIEW 1: Procurement Dashboard */}
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            recentBids={recentBids}
            onSelectBid={handleSelectBid}
            onOpenAudit={() => setCurrentTab('audit_trail')}
            onQuickVerifyDemo={handleVerifyAllBidders}
          />
        )}

        {/* VIEW 2: Tender Details */}
        {currentTab === 'bid_detail' && currentBid && (
          <BidDetailView
            bid={currentBid}
            requirements={requirements}
            bidders={bidders}
            onSelectBidder={handleSelectBidder}
            onVerifyBidder={handleRunVerifyBidder}
            onVerifyAllBidders={handleVerifyAllBidders}
            onAnalyzeTender={handleAnalyzeTender}
            isAnalyzingTender={isAnalyzingTender}
            isVerifyingBatch={isVerifyingBatch}
          />
        )}

        {/* VIEW 3: Bidder Compliance Verification Report */}
        {currentTab === 'compliance_report' && currentBidder && (
          <ComplianceReportView
            bidder={currentBidder}
            compliance={complianceResult}
            checks={checks}
            recommendation={recommendation}
            documents={documents}
            onOpenEvidence={handleOpenEvidence}
            onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
            onReverify={() => handleRunVerifyBidder(currentBidder.id)}
            onUploadDocument={() => setIsUploadModalOpen(true)}
            isVerifying={isVerificationModalOpen}
            onBackToBid={() => setCurrentTab('bid_detail')}
          />
        )}

        {/* VIEW 4: Statutory Audit Trail */}
        {currentTab === 'audit_trail' && (
          <AuditTrailView
            logs={auditLogs}
            onRefresh={loadAuditTrail}
            selectedBidderId={selectedBidderId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">GeM AI-Powered Bid Compliance Verification Platform</span> — Government e-Marketplace
          </div>
          <div className="text-[11px] text-slate-400">
            Core Protocol: AI verifies • Evidence supports • Rules evaluate • Procurement Officer decides
          </div>
        </div>
      </footer>

      {/* Evidence Modal */}
      {isEvidenceModalOpen && selectedEvidenceCheck && (
        <EvidenceModal
          check={selectedEvidenceCheck}
          evidenceDetails={evidenceDetails}
          onClose={() => {
            setIsEvidenceModalOpen(false);
            setSelectedEvidenceCheck(null);
          }}
        />
      )}

      {/* Officer Decision Modal */}
      {isDecisionModalOpen && currentBidder && (
        <OfficerDecisionModal
          isOpen={isDecisionModalOpen}
          bidder={currentBidder}
          currentUser={currentUser}
          onClose={() => setIsDecisionModalOpen(false)}
          onSubmitDecision={handleSubmitOfficerDecision}
        />
      )}

      {/* Real-time Verification Progress Modal */}
      <VerificationModal
        bidderName={verifyingBidderName}
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onComplete={() => {
          setIsVerificationModalOpen(false);
          setCurrentTab('compliance_report');
        }}
      />

      {/* Document Upload Modal */}
      {currentBidder && (
        <DocumentUploadModal
          bidderName={currentBidder.company_name}
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadDocument}
        />
      )}

      {/* Officer Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLogin={handleLogin}
      />
    </div>
  );
}
