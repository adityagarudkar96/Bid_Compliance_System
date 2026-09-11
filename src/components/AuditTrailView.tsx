import React, { useState } from 'react';
import { History, Shield, Search, Filter, ArrowDownUp, RefreshCw, FileText } from 'lucide-react';
import { AuditLog } from '../types/index.ts';

interface AuditTrailViewProps {
  logs: AuditLog[];
  onRefresh: () => void;
  selectedBidderId?: string;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs, onRefresh, selectedBidderId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.verification_id && log.verification_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesActor =
      actorFilter === 'ALL' || log.actor.toLowerCase().includes(actorFilter.toLowerCase());

    return matchesSearch && matchesActor;
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-900 text-white">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Statutory Audit Log
                </span>
                <span className="text-xs text-slate-500 font-mono">Immutable Ledger</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Government Procurement Verification Audit Trail
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Complete, tamper-evident log recording all document extractions, external government connector inquiries,
          deterministic rule evaluations, and Procurement Officer sign-offs.
        </p>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by action, company name, result, or verification ID..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 bg-white"
            >
              <option value="ALL">All Actors</option>
              <option value="Procurement Officer">Procurement Officer</option>
              <option value="Mock">Government Connectors</option>
              <option value="Engine">Compliance Engines</option>
              <option value="AI">AI Extractor / Gemini</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Object / Bidder</th>
                <th className="py-3 px-4">Result / Findings</th>
                <th className="py-3 px-4">Verification ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>

                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${
                      log.actor.includes('Officer')
                        ? 'bg-blue-100 text-blue-800'
                        : log.actor.includes('Connector')
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.actor.includes('Engine')
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.actor}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans font-bold text-slate-800 whitespace-nowrap">
                    {log.action}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-700 max-w-xs truncate">
                    {log.object}
                  </td>

                  <td className="py-3.5 px-4 font-sans text-slate-900 max-w-md">
                    <span className={`font-medium ${
                      log.result.includes('FAIL') || log.result.includes('FLAG') || log.result.includes('Suspended')
                        ? 'text-red-700 font-bold'
                        : log.result.includes('REVIEW')
                        ? 'text-amber-700 font-bold'
                        : 'text-slate-800'
                    }`}>
                      {log.result}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-blue-700 font-semibold whitespace-nowrap">
                    {log.verification_id || '—'}
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
