import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Building2,
  Play,
  Check,
  ExternalLink,
  Shield,
  Layers,
  Upload,
  UserCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Bidder, BidderDocument, ComplianceResult, Recommendation, VerificationCheck } from '../types/index.ts';

interface ComplianceReportViewProps {
  bidder: Bidder;
  compliance: ComplianceResult | null;
  checks: VerificationCheck[];
  recommendation: Recommendation | null;
  documents: BidderDocument[];
  onOpenEvidence: (checkId: string) => void;
  onOpenDecisionModal: () => void;
  onReverify: () => void;
  onUploadDocument: () => void;
  isVerifying: boolean;
  onBackToBid: () => void;
}

export const ComplianceReportView: React.FC<ComplianceReportViewProps> = ({
  bidder,
  compliance,
  checks,
  recommendation,
  documents,
  onOpenEvidence,
  onOpenDecisionModal,
  onReverify,
  onUploadDocument,
  isVerifying,
  onBackToBid,
}) => {
  const score = compliance?.score ?? bidder.compliance_score;
  const risk = compliance?.risk ?? bidder.risk_level;
  const status = compliance?.status ?? bidder.status;

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToBid}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Back to Tender"
          >
            ←
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Bidder Compliance Report
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {bidder.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {bidder.company_name}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onUploadDocument}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={onReverify}
            disabled={isVerifying}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 mr-1.5 text-blue-400 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying...' : 'Re-Run Verification Engine'}</span>
          </button>
          <button
            onClick={onOpenDecisionModal}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            <span>Record Officer Decision</span>
          </button>
        </div>
      </div>

      {/* Mandatory Failure Banner (if applicable) */}
      {compliance?.mandatory_failure && (
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start space-x-3 shadow-xs">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-red-900 text-sm">
              Mandatory Statutory Requirement Failure Detected
            </h4>
            <p className="text-red-800">
              One or more mandatory eligibility requirements (e.g. Active GST, Non-Debarment, or ITR filing) failed verification.
              In accordance with rule engine protocol, risk has been locked to <strong>HIGH</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Scorecard & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Risk Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Compliance Scorecard
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Ver. {compliance?.verification_id || 'VER-CURRENT'}
              </span>
            </div>

            <div className="my-5 flex items-center justify-center">
              <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-8 border-slate-100 shadow-inner">
                <div className="text-center">
                  <span className={`text-4xl font-black ${
                    score >= 85 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {score}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 block -mt-1">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Risk Assessment:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                risk === 'LOW' ? 'bg-emerald-100 text-emerald-800' : risk === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }`}>
                {risk} RISK
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Compliance Status:</span>
              <span className="font-bold text-slate-800">{status.replace('_', ' ')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px]">
              <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                <div className="text-sm font-bold">{compliance?.passed ?? checks.filter(c => c.result === 'PASS').length}</div>
                <div>Passed</div>
              </div>
              <div className="p-1.5 rounded bg-amber-50 text-amber-800 font-semibold">
                <div className="text-sm font-bold">{compliance?.review ?? checks.filter(c => c.result === 'REVIEW').length}</div>
                <div>Review</div>
              </div>
              <div className="p-1.5 rounded bg-red-50 text-red-800 font-semibold">
                <div className="text-sm font-bold">{compliance?.failed ?? checks.filter(c => c.result === 'FAIL').length}</div>
                <div>Failed</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Explainable Recommendation Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  AI Recommendation & Advisory
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Grounding: Deterministic Rules + Gemini
              </span>
            </div>

            {/* Core Recommendation Callout */}
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm font-medium text-slate-100">
              <span className="text-amber-400 font-bold block text-xs uppercase mb-1">Recommendation</span>
              "{recommendation?.recommendation_text || 'Manual review recommended before final qualification.'}"
            </div>

            {/* Reasoning Bullets */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Statutory Reasoning:</span>
              <ul className="space-y-1 text-xs text-slate-300 pl-1">
                {(recommendation?.reasoning || [
                  'Most statutory identifiers are verified.',
                  'Entity name variation was detected.',
                  'Local content requires additional confirmation.',
                  'No automatic disqualification has been applied.',
                  'Final decision remains with Procurement Officer.',
                ]).map((bullet, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mandatory Safeguard Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center text-amber-300 font-semibold">
              <Info className="w-4 h-4 mr-1.5 text-amber-400 shrink-0" />
              <span>Final decision remains with Procurement Officer.</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Zero autonomous disqualification applied
            </span>
          </div>
        </div>
      </div>

      {/* Officer Decision Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Procurement Officer Official Decision</div>
            <div className="text-sm font-bold text-slate-900">
              {bidder.decision === 'QUALIFY' && (
                <span className="text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Qualified for Commercial Evaluation
                </span>
              )}
              {bidder.decision === 'DO_NOT_QUALIFY' && (
                <span className="text-red-700 flex items-center">
                  <XCircle className="w-4 h-4 mr-1 text-red-600" /> Disqualified / Rejected
                </span>
              )}
              {bidder.decision === 'NEEDS_MANUAL_REVIEW' && (
                <span className="text-amber-700 flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-amber-600" /> Under Manual Clarification / Review
                </span>
              )}
              {(!bidder.decision || bidder.decision === 'PENDING') && (
                <span className="text-slate-600">
                  Decision Pending (Officer action required)
                </span>
              )}
            </div>
            {bidder.decision_reason && (
              <div className="text-xs text-slate-600 italic mt-0.5">
                "{bidder.decision_reason}" — {bidder.decision_officer}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onOpenDecisionModal}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
        >
          <span>{bidder.decision && bidder.decision !== 'PENDING' ? 'Update Officer Decision' : 'Submit Decision'}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </button>
      </div>

      {/* Detailed Verification Checks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Statutory Verification Matrix & Evidence
            </h3>
            <p className="text-xs text-slate-500">
              Comparison between bidder-submitted documents and authoritative government connectors
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {checks.length} Verification Checks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Requirement & Connector</th>
                <th className="py-3.5 px-4">Document Value</th>
                <th className="py-3.5 px-4">Verified Government Value</th>
                <th className="py-3.5 px-4 text-center">Confidence</th>
                <th className="py-3.5 px-4">Result</th>
                <th className="py-3.5 px-4 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {checks.map((check) => (
                <tr key={check.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-4 font-medium text-slate-900 max-w-xs">
                    <div className="font-bold text-slate-900">{check.requirement_name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{check.source}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-slate-800 max-w-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                      {check.document_value}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-slate-800 max-w-xs">
                    <div className="bg-blue-50/60 p-2 rounded border border-blue-200/60 text-blue-950 font-medium">
                      {check.verified_value}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    {Math.round(check.confidence * 100)}%
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    {check.result === 'PASS' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PASS
                      </span>
                    )}
                    {check.result === 'REVIEW' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> REVIEW
                      </span>
                    )}
                    {check.result === 'FAIL' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" /> FAIL
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onOpenEvidence(check.id)}
                      className="inline-flex items-center px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 text-blue-700 text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
                    >
                      <span>Evidence Details</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bidder Uploaded Tender Submissions</h3>
            <p className="text-xs text-slate-500">
              Tender document artifacts processed by OCR and AI Document Extractor
            </p>
          </div>
          <button
            onClick={onUploadDocument}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors"
          >
            <Upload className="w-3 h-3 mr-1" />
            <span>Upload New Document</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{doc.document_type}</div>
                <div className="text-[11px] text-slate-500 truncate font-mono">{doc.file_name}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{doc.file_size}</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
