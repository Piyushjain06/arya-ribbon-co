'use client';

import { formatINRCompact } from '@/lib/format';

export interface DefaulterRow {
  client: string;
  unpaid_dues: string | number;
  unpaid_invoices: string | number;
}

interface Props {
  defaulters: DefaulterRow[];
}

export default function DefaultersTable({ defaulters }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Financial Risk: Top Defaulters</h2>
          <p className="text-xs text-slate-500 mt-0.5">Top 10 accounts with pending or overdue invoices</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          High Risk
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
              <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Client Name</th>
              <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Unpaid Invoices</th>
              <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Total Outstanding Dues (₹)</th>
            </tr>
          </thead>
          <tbody>
            {defaulters.map((d, i) => (
              <tr
                key={d.client}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="py-3 px-3 text-slate-500 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {d.client.split(' ').pop()?.charAt(0) || '!'}
                    </div>
                    <span className="text-slate-200 font-medium text-xs leading-tight">{d.client}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400">
                    {d.unpaid_invoices}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-rose-400 font-bold font-mono text-xs">
                  {formatINRCompact(Number(d.unpaid_dues))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
