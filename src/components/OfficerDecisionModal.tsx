import React, { useEffect, useState } from 'react';
import { X, UserCheck, CheckCircle2, XCircle, AlertTriangle, Shield, FileText } from 'lucide-react';
import { Bidder, OfficerDecision, User } from '../types/index.ts';

interface OfficerDecisionModalProps {
  isOpen?: boolean;
  bidder: Bidder;
  currentUser: User | null;
  onClose: () => void;
  onSubmitDecision: (decision: OfficerDecision, reason: string, officerName: string) => Promise<void>;
}

export const OfficerDecisionModal: React.FC<OfficerDecisionModalProps> = ({
  isOpen = true,
  bidder,
  currentUser,
  onClose,
  onSubmitDecision,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<OfficerDecision>(
    bidder.decision && bidder.decision !== 'PENDING' ? bidder.decision : 'QUALIFY'
  );
  const [reason, setReason] = useState<string>(
    bidder.decision_reason ||
      'Satisfies mandatory statutory requirements in accordance with GeM General Terms and Conditions (GTC).'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const officerName = currentUser?.name || 'Rajesh Sharma, IAS';
  const officerDesignation = currentUser?.designation || 'Joint Secretary & Senior Procurement Officer';

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitDecision(selectedDecision, reason.trim(), `${officerName} (${officerDesignation})`);
      onClose();
    } catch (err) {
      console.error('Failed to submit decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-blue-300 font-mono">Procurement Officer Authority</div>
              <h3 className="text-base font-bold text-white">Record Final Qualification Decision</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700">
          {/* Bidder Context */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Participating Bidder</span>
              <strong className="text-sm text-slate-900">{bidder.company_name}</strong>
            </div>
            <div className="text-right font-mono text-[11px]">
              <span className="text-slate-500 block text-[11px]">Calculated Score</span>
              <strong className="text-blue-700">{bidder.compliance_score}/100 ({bidder.risk_level} Risk)</strong>
            </div>
          </div>

          {/* Decision Selection Options */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900">Select Official Qualification Determination:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Qualify */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDecision('QUALIFY');
                  setReason('Statutory and regulatory eligibility criteria verified; qualified for commercial opening.');
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedDecision === 'QUALIFY'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <CheckCircle2 className={`w-4 h-4 ${selectedDecision === 'QUALIFY' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold uppercase ${selectedDecision === 'QUALIFY' ? 'text-emerald-700' : 'text-slate-400'}`}>Recommended</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">QUALIFY</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Approve bid for award</div>
                </div>
              </button>

              {/* Review */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDecision('NEEDS_MANUAL_REVIEW');
                  setReason('Discrepancies flagged; formal clarification sought via GeM representation window.');
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedDecision === 'NEEDS_MANUAL_REVIEW'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <AlertTriangle className={`w-4 h-4 ${selectedDecision === 'NEEDS_MANUAL_REVIEW' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold uppercase ${selectedDecision === 'NEEDS_MANUAL_REVIEW' ? 'text-amber-700' : 'text-slate-400'}`}>Review</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">NEEDS REVIEW</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Request clarification</div>
                </div>
              </button>

              {/* Do Not Qualify */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDecision('DO_NOT_QUALIFY');
                  setReason('Disqualified due to mandatory eligibility non-compliance / debarment order.');
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  selectedDecision === 'DO_NOT_QUALIFY'
                    ? 'border-red-500 bg-red-50/80 ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <XCircle className={`w-4 h-4 ${selectedDecision === 'DO_NOT_QUALIFY' ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold uppercase ${selectedDecision === 'DO_NOT_QUALIFY' ? 'text-red-700' : 'text-slate-400'}`}>Reject</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">DO NOT QUALIFY</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Reject bidder</div>
                </div>
              </button>
            </div>
          </div>

          {/* Justification Textarea */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900">
              Procurement Officer Justification & Committee Remarks: <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Enter comprehensive legal and technical rationale..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              This statement will be sealed and committed to the permanent audit trail.
            </p>
          </div>

          {/* Officer Identity & Digital Endorsement */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-700 shrink-0" />
            <div className="text-[11px] text-slate-600">
              Signed by <strong>{officerName}</strong>, {officerDesignation}
              <div className="text-slate-500">I hereby certify this decision is recorded under my statutory procurement authority.</div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Recording Decision...' : 'Confirm & Commit Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
