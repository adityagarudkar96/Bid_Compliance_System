import React, { useState } from 'react';
import {
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Upload,
  Clock,
  Eye,
  Check,
} from 'lucide-react';
import { Bid, Bidder, Requirement } from '../types/index.ts';

interface BidDetailViewProps {
  bid: Bid;
  requirements: Requirement[];
  bidders: Bidder[];
  onSelectBidder: (bidderId: string) => void;
  onVerifyBidder: (bidderId: string) => void;
  onVerifyAllBidders: () => void;
  onAnalyzeTender: () => void;
  isAnalyzingTender: boolean;
  isVerifyingBatch: boolean;
}

export const BidDetailView: React.FC<BidDetailViewProps> = ({
  bid,
  requirements,
  bidders,
  onSelectBidder,
  onVerifyBidder,
  onVerifyAllBidders,
  onAnalyzeTender,
  isAnalyzingTender,
  isVerifyingBatch,
}) => {
  const [activeTab, setActiveTab] = useState<'bidders' | 'requirements'>('bidders');

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Low Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Medium Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 mr-1 text-red-600" /> High Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Unverified
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            COMPLIANT
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
            REVIEW REQUIRED
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-300">
            HIGH RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
            PENDING
          </span>
        );
    }
  };

  const getDecisionBadge = (decision?: string) => {
    switch (decision) {
      case 'QUALIFY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
            <Check className="w-3 h-3 mr-1" /> QUALIFIED BY OFFICER
          </span>
        );
      case 'DO_NOT_QUALIFY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-2xs">
            <XCircle className="w-3 h-3 mr-1" /> NOT QUALIFIED
          </span>
        );
      case 'NEEDS_MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white shadow-2xs">
            <Clock className="w-3 h-3 mr-1" /> OFFICER REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Awaiting Officer Decision
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Bid Overview Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-xs border border-blue-200">
                {bid.bid_number}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                {bid.department}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium text-xs">
                {bid.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {bid.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Category: <strong className="text-slate-700 ml-1">{bid.category}</strong>
              </span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Closing Date: <strong className="text-slate-700 ml-1">{bid.closing_date}</strong>
              </span>
              <span className="flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Est. Value: <strong className="text-emerald-700 ml-1">{bid.estimated_value}</strong>
              </span>
              <span className="flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Requirements: <strong className="text-slate-700 ml-1">{requirements.length} Extracted</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAnalyzeTender}
              disabled={isAnalyzingTender}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 mr-1.5 text-indigo-600 ${isAnalyzingTender ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingTender ? 'Extracting via Gemini AI...' : 'Re-extract Requirements (AI)'}</span>
            </button>
            <button
              onClick={onVerifyAllBidders}
              disabled={isVerifyingBatch}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 mr-1.5 ${isVerifyingBatch ? 'animate-spin' : ''}`} />
              <span>{isVerifyingBatch ? 'Verifying All Bidders...' : 'Verify All Bidders'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Participating Bidders vs Tender Requirements */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('bidders')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'bidders'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Participating Bidders ({bidders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'requirements'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tender Eligibility Criteria & Weights ({requirements.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Bidders List */}
      {activeTab === 'bidders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bidder Compliance Roster</h3>
              <p className="text-xs text-slate-500">
                Evaluation results across statutory registers and government connectors
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Select any bidder to inspect detailed evidence or record qualification decision
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Company Name & Registration</th>
                  <th className="py-3.5 px-4">Statutory Identifiers</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Compliance Status</th>
                  <th className="py-3.5 px-4">Procurement Officer Decision</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bidders.map((bidder) => (
                  <tr
                    key={bidder.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => onSelectBidder(bidder.id)}
                  >
                    <td className="py-4 px-4 font-medium text-slate-900">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        {bidder.company_name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Last Verified: {bidder.last_verified ? new Date(bidder.last_verified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] space-y-1">
                      <div><span className="text-slate-400 font-sans">GSTIN:</span> <strong className="text-slate-800">{bidder.gstin}</strong></div>
                      <div><span className="text-slate-400 font-sans">PAN:</span> <strong className="text-slate-800">{bidder.pan}</strong></div>
                      <div><span className="text-slate-400 font-sans">Udyam:</span> <strong className="text-slate-800">{bidder.udyam_number}</strong></div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-base font-extrabold ${
                          bidder.compliance_score >= 85
                            ? 'text-emerald-700'
                            : bidder.compliance_score >= 60
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}>
                          {bidder.compliance_score}
                          <span className="text-xs font-normal text-slate-400">/100</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {getRiskBadge(bidder.risk_level)}
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(bidder.status)}
                    </td>

                    <td className="py-4 px-4">
                      {getDecisionBadge(bidder.decision)}
                    </td>

                    <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerifyBidder(bidder.id);
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                        title="Run Verification"
                      >
                        <Play className="w-3 h-3 mr-1 text-blue-600" />
                        <span>Verify</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBidder(bidder.id);
                        }}
                        className="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Tender Requirements */}
      {activeTab === 'requirements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Extracted Tender Requirements</h3>
              <p className="text-xs text-slate-500">
                Rule engine evaluation criteria extracted from tender specification
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Total Weight: {requirements.reduce((acc, r) => acc + r.weight, 0)} Points
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Mandatory</th>
                  <th className="py-3 px-4">Connector Source</th>
                  <th className="py-3 px-4">Eligibility Threshold</th>
                  <th className="py-3 px-4 text-center">Score Weight</th>
                  <th className="py-3 px-4">Required Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requirements.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="font-semibold">{req.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{req.description}</div>
                    </td>

                    <td className="py-3 px-4">
                      {req.mandatory ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                          Mandatory
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                          Optional
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-800 font-semibold">
                      {req.verification_source}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {req.threshold || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {req.weight}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {req.required_documents.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
