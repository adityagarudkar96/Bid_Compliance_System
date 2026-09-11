import React from 'react';
import { Shield, UserCheck, AlertCircle, FileCheck, LogOut, Sparkles } from 'lucide-react';
import { User } from '../types/index.ts';

interface HeaderProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenLogin, onLogout }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Ministry Ribbon */}
      <div className="bg-slate-950 px-4 sm:px-6 py-1 text-xs text-slate-300 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-amber-400">Government of India</span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline">Ministry of Commerce and Industry</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400">Government e-Marketplace (GeM)</span>
        </div>
        <div className="flex items-center space-x-3 mt-0.5 sm:mt-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Mock Connectors Active (GSTN, Udyam, CBDT, CPPP)
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg tracking-wider text-white shadow-sm ring-2 ring-blue-400/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                GeM Compliance Engine
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  AI-Assisted
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Tender-Specific, Evidence-Backed Bid Compliance Verification
            </p>
          </div>
        </div>

        {/* Principle Banner (Desktop) */}
        <div className="hidden lg:flex flex-col items-center justify-center px-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-md">
          <div className="text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
            <span className="text-blue-400 font-semibold">AI verifies</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">Evidence supports</span>
            <span className="text-slate-500">•</span>
            <span className="text-indigo-400 font-semibold">Rules evaluate</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold underline decoration-amber-500/60">Officer decides</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Zero autonomous disqualification • Purely officer decision-support
          </span>
        </div>

        {/* User / Authentication Status */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white flex items-center justify-end space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[11px] text-slate-400">{currentUser.designation || 'Procurement Officer'}</div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Officer Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
