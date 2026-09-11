import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Sparkles, Database, FileText, Shield, ArrowRight, X } from 'lucide-react';

interface VerificationModalProps {
  bidderName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface Step {
  id: number;
  label: string;
  detail: string;
  icon: any;
}

const STEPS: Step[] = [
  {
    id: 1,
    label: 'Document Extraction & Parsing',
    detail: 'Parsing GST REG-06, PAN, Udyam, and Local Content declarations...',
    icon: FileText,
  },
  {
    id: 2,
    label: 'Government Registry Connectors',
    detail: 'Cross-querying GSTN Gateway, Ministry of MSME, CBDT, & CPPP Debarment Registry...',
    icon: Database,
  },
  {
    id: 3,
    label: 'Deterministic Rules & Entity Matching',
    detail: 'Executing RapidFuzz corporate name similarity and statutory eligibility rules...',
    icon: Shield,
  },
  {
    id: 4,
    label: 'Score Engine & Risk Assessment',
    detail: 'Weighting compliance points & enforcing mandatory failure safeguards...',
    icon: Clock,
  },
  {
    id: 5,
    label: 'AI Recommendation Generation',
    detail: 'Formulating structured explainable advisory for Procurement Officer...',
    icon: Sparkles,
  },
];

export const VerificationModal: React.FC<VerificationModalProps> = ({
  bidderName,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setIsFinished(false);
      return;
    }

    // Step simulation progression
    const t1 = setTimeout(() => setCurrentStep(2), 700);
    const t2 = setTimeout(() => setCurrentStep(3), 1500);
    const t3 = setTimeout(() => setCurrentStep(4), 2200);
    const t4 = setTimeout(() => setCurrentStep(5), 2900);
    const t5 = setTimeout(() => {
      setIsFinished(true);
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-blue-300 font-mono">Real-Time Verification Engine</div>
              <h3 className="text-sm font-bold text-white truncate max-w-xs">{bidderName}</h3>
            </div>
          </div>
          {isFinished && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-4 text-xs">
          {STEPS.map((step) => {
            const isDone = currentStep > step.id || isFinished;
            const isCurrent = currentStep === step.id && !isFinished;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border flex items-start space-x-3 transition-all ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : isCurrent
                    ? 'border-blue-300 bg-blue-50/60 shadow-xs'
                    : 'border-slate-100 bg-slate-50/40 opacity-50'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className={`font-bold ${isDone ? 'text-emerald-900' : isCurrent ? 'text-blue-950' : 'text-slate-500'}`}>
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isFinished ? 'Verification complete. Evidence committed.' : 'Executing statutory verification...'}
          </div>
          {isFinished ? (
            <button
              onClick={() => {
                onClose();
                onComplete();
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <span>View Compliance Report</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          ) : (
            <span className="text-xs font-semibold text-blue-600 animate-pulse">
              Processing step {currentStep} of 5...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
