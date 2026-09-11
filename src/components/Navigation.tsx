import React from 'react';
import { LayoutDashboard, FileText, Users, ShieldAlert, History, ArrowRight } from 'lucide-react';

export type AppTab = 'dashboard' | 'bid_detail' | 'bidder_detail' | 'compliance_report' | 'audit_trail';

interface NavigationProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeBidId?: string;
  activeBidderName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeBidId = 'GEM-2026-001',
  activeBidderName,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between">
        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2 text-blue-600" />
            Procurement Dashboard
          </button>

          <button
            onClick={() => onSelectTab('bid_detail')}
            className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'bid_detail'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 mr-2 text-slate-500" />
            Tender Details ({activeBidId})
          </button>

          <button
            onClick={() => onSelectTab('compliance_report')}
            className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'compliance_report'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 mr-2 text-slate-500" />
            Compliance Verification
            {activeBidderName && <span className="ml-1 text-xs text-blue-600 font-normal">({activeBidderName.split(' ')[0]})</span>}
          </button>

          <button
            onClick={() => onSelectTab('audit_trail')}
            className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'audit_trail'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 mr-2 text-slate-500" />
            Audit Trail
          </button>
        </nav>

        {/* Breadcrumb Context Indicator */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 py-2">
          <span>Tender: <strong className="text-slate-800">{activeBidId}</strong></span>
          {activeBidderName && (
            <>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span>Bidder: <strong className="text-blue-700">{activeBidderName}</strong></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
