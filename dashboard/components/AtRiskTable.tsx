'use client';

import { formatINRCompact } from '@/lib/format';

interface AtRiskClient {
  client: string;
  recency: number;
  frequency: number;
  monetary: number;
  segment: string;
}

interface Props {
  clients: AtRiskClient[];
}

export default function AtRiskTable({ clients }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">At-Risk / Churned Clients</h2>
          <p className="text-xs text-slate-500 mt-0.5">Top 10 by revenue · Priority call list for sales team</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/15 px-3 py-1 text-xs font-semibold text-pink-400 border border-pink-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          Action Needed
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Client</th>
              <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Last Order (days ago)</th>
              <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Orders</th>
              <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue (₹)</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr
                key={c.client}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="py-3 px-3 text-slate-500 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {c.client.split(' ').pop()?.charAt(0) || '?'}
                    </div>
                    <span className="text-slate-200 font-medium text-xs leading-tight">{c.client}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    c.recency > 100
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {c.recency}d
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-slate-300 font-mono text-xs">{c.frequency}</td>
                <td className="py-3 px-3 text-right text-white font-semibold font-mono text-xs">
                  {formatINRCompact(Number(c.monetary))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
