import React, { useEffect, useState } from 'react';
import { X, Shield, Lock, Mail, UserCheck, Zap, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('officer@gem-demo.gov.in');
  const [password, setPassword] = useState('Demo@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
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
    setError(null);
    setIsLoading(true);

    try {
      await onLogin(email.trim(), password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onLogin('officer@gem-demo.gov.in', 'Demo@123');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('officer@gem-demo.gov.in');
    setPassword('Demo@123');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Government e-Marketplace</div>
              <h3 className="text-base font-bold text-white">Officer Portal Access</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close login dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium flex flex-col gap-1">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-left font-bold text-blue-700 hover:underline inline-flex items-center gap-1 mt-1"
              >
                Click here to authenticate with verified demo credentials <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* 1-Click Instant Demo Login Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Instant Demo Access</span>
              </div>
              <span className="text-[11px] text-blue-700 font-mono block mt-0.5">
                Rajesh Sharma, IAS (officer@gem-demo.gov.in)
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>1-Click Login</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Or sign in with credentials
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-900">Official Government Email (GeM ID):</label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Autofill demo
              </button>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@gem-demo.gov.in"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Password / Security Pin:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-2/3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Authorized for Government of India procurement officers. Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">Esc</kbd> or click outside to dismiss.
          </p>
        </form>
      </div>
    </div>
  );
};
