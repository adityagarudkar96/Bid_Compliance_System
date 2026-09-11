import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  FileText,
  Building2,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Bid, DashboardStats } from '../types/index.ts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentBids: Bid[];
  onSelectBid: (bidId: string) => void;
  onOpenAudit: () => void;
  onQuickVerifyDemo: () => void;
}

const STATUS_COLORS = {
  compliant: '#10b981', // emerald-500
  review: '#f59e0b',    // amber-500
  high_risk: '#ef4444', // red-500
};

const CHECK_COLORS = {
  PASS: '#10b981',
  REVIEW: '#f59e0b',
  FAIL: '#ef4444',
  PENDING: '#94a3b8',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentBids,
  onSelectBid,
  onOpenAudit,
  onQuickVerifyDemo,
}) => {
  const complianceData = stats
    ? [
        { name: 'Compliant (Low Risk)', value: stats.compliant, color: STATUS_COLORS.compliant },
        { name: 'Review Required', value: stats.review_required, color: STATUS_COLORS.review },
        { name: 'High Risk / Flags', value: stats.high_risk, color: STATUS_COLORS.high_risk },
      ]
    : [];

  const checksData = stats
    ? [
        { name: 'Passed', count: stats.checks_distribution.pass, fill: CHECK_COLORS.PASS },
        { name: 'Review', count: stats.checks_distribution.review, fill: CHECK_COLORS.REVIEW },
        { name: 'Failed', count: stats.checks_distribution.fail, fill: CHECK_COLORS.FAIL },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Mandatory Procurement Protocol Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-xl p-5 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3 h-3 text-blue-300" />
              <span>Government e-Marketplace Decision Support System</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Procurement Officer Compliance Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Automated statutory verification across GSTN, CBDT, Ministry of MSME (Udyam), and CPPP Debarment registries.
              Every check is backed by verifiable document coordinates and statutory evidence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onSelectBid('GEM-2026-001')}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <span>Inspect Demo Bid (GEM-2026-001)</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
            <button
              onClick={onQuickVerifyDemo}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Batch Verify Bidders</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Tenders */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Tenders</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.active_bids ?? 3}</span>
            <span className="text-xs text-slate-500 font-medium">Bids in evaluation</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center">
            <span className="text-emerald-600 font-semibold mr-1">Primary:</span> GEM-2026-001
          </div>
        </div>

        {/* Participating Bidders */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Bidders</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.total_bidders ?? 3}</span>
            <span className="text-xs text-slate-500 font-medium">Under GEM-2026-001</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            ABC Tech, XYZ Ind, QuickSupply
          </div>
        </div>

        {/* Compliant (Low Risk) */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Compliant (Low Risk)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-700">{stats?.compliant ?? 1}</span>
            <span className="text-xs text-emerald-600 font-medium">Score ≥ 85%</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" /> All mandatory passed
          </div>
        </div>

        {/* Review Required (Medium Risk) */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Review Required</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-700">{stats?.review_required ?? 1}</span>
            <span className="text-xs text-amber-600 font-medium">Officer attention</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 flex items-center">
            <Clock className="w-3 h-3 mr-1" /> Name variations / Annexures
          </div>
        </div>

        {/* High Risk / Debarred */}
        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-700">High Risk / Flags</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-700">{stats?.high_risk ?? 1}</span>
            <span className="text-xs text-red-600 font-medium">Debarment / Defaulter</span>
          </div>
          <div className="mt-2 text-[11px] text-red-700 flex items-center font-medium">
            1 Active Debarment Flagged
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Distribution Pie */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Bidder Risk Classification</h3>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Evaluation</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Distribution of current bidders by risk classification tier
            </p>
          </div>

          <div className="h-52 w-full my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Bidders`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                <span>Compliant (Low Risk)</span>
              </div>
              <span className="font-semibold text-slate-900">{stats?.compliant ?? 1}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
                <span>Review Required (Medium)</span>
              </div>
              <span className="font-semibold text-slate-900">{stats?.review_required ?? 1}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span>
                <span>High Risk / Flags</span>
              </div>
              <span className="font-semibold text-slate-900">{stats?.high_risk ?? 1}</span>
            </div>
          </div>
        </div>

        {/* Verification Checks Bar Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Total Verification Checks</h3>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Statutory</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Check outcomes across GST, PAN, Udyam, ITR, Local Content, EPFO, and Debarment
            </p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checksData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} checks`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {checksData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>21 total evidence validations performed</span>
            <button onClick={onOpenAudit} className="text-blue-600 hover:text-blue-700 font-medium">
              View Audit Logs →
            </button>
          </div>
        </div>

        {/* Core Principles & Safety Notice */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Statutory Compliance Architecture</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In strict adherence to Government e-Marketplace procurement guidelines, the platform enforces:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 mr-2 shrink-0"></span>
                <span><strong>No Automatic Disqualification:</strong> Algorithms suggest risk levels; the Procurement Officer retains 100% legal decision power.</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 mr-2 shrink-0"></span>
                <span><strong>Verifiable Evidence:</strong> Every extracted figure maps to a source document hash and authenticated government connector.</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 shrink-0"></span>
                <span><strong>Deterministic Rule Layer:</strong> Mathematical entity similarity (RapidFuzz equivalent) distinguishes legitimate corporate naming variations.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Rule Engine v1.0 • GeM MVP</span>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
              Auditable Log Active
            </span>
          </div>
        </div>
      </div>

      {/* Active Tenders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Active Procurement Tenders</h3>
            <p className="text-xs text-slate-500">
              Review published bids currently in technical compliance verification
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectBid('GEM-2026-001')}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
            >
              <span>Inspect GEM-2026-001</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tender Number</th>
                <th className="py-3 px-4">Tender Title & Scope</th>
                <th className="py-3 px-4">Department / Ministry</th>
                <th className="py-3 px-4">Estimated Value</th>
                <th className="py-3 px-4">Bidders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentBids.map((bid) => (
                <tr
                  key={bid.id}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  onClick={() => onSelectBid(bid.id)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {bid.bid_number}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs font-medium text-slate-900">
                    <div className="truncate">{bid.title}</div>
                    <div className="text-[11px] text-slate-500">{bid.category}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {bid.department}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {bid.estimated_value}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {bid.bidders_count} Bidders
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      bid.status === 'VERIFICATION_READY'
                        ? 'bg-blue-100 text-blue-800'
                        : bid.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {bid.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBid(bid.id);
                      }}
                      className="inline-flex items-center px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-blue-700 text-xs font-medium border border-slate-300 transition-colors shadow-2xs"
                    >
                      <span>View Bid</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
