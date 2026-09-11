import React, { useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Database, Clock, Key } from 'lucide-react';
import { VerificationCheck } from '../types/index.ts';

interface EvidenceModalProps {
  check: VerificationCheck | null;
  evidenceDetails: any | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ check, evidenceDetails, onClose }) => {
  useEffect(() => {
    if (!check) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [check, onClose]);

  if (!check) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-blue-300 font-mono">Verification Evidence Coordinates</div>
              <h3 className="text-base font-bold text-white">{check.requirement_name}</h3>
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Metadata Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block font-sans">Verification ID:</span>
              <strong className="text-slate-900">{check.verification_id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Confidence:</span>
              <strong className="text-blue-700">{Math.round(check.confidence * 100)}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Result:</span>
              <strong className={check.result === 'PASS' ? 'text-emerald-700' : check.result === 'REVIEW' ? 'text-amber-700' : 'text-red-700'}>
                {check.result}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Timestamp:</span>
              <strong className="text-slate-800">{new Date(check.timestamp).toLocaleTimeString()}</strong>
            </div>
          </div>

          {/* Side-by-Side Comparison Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bidder Document Value */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Extracted Document Value</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-800 break-all leading-relaxed shadow-2xs">
                {check.document_value}
              </div>
              <p className="text-[11px] text-slate-500">
                Extracted by OCR & Document Understanding engine from bidder submission.
              </p>
            </div>

            {/* Authoritative Verified Source Value */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-blue-950 font-bold">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Verified Government Value</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-blue-200 font-mono text-xs text-blue-900 font-medium break-all leading-relaxed shadow-2xs">
                {check.verified_value}
              </div>
              <p className="text-[11px] text-blue-700">
                Retrieved directly from {check.source}.
              </p>
            </div>
          </div>

          {/* Reason & Cross-Verification Findings */}
          <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-xs">Evaluation Finding & Cross-Verification Logic:</span>
            <p className="text-slate-700 leading-relaxed">{check.reason}</p>
          </div>

          {/* Architecture Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
            <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Connector Layer Notice:</strong> Current response provided via authorized Mock Government Connector.
              In production deployment, this interface queries live authorized API Setu / GSTN / CBDT endpoints using enterprise credentials.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
