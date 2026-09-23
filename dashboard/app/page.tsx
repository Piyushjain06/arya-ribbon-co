import { query } from '@/lib/db';
import { formatINRCompact } from '@/lib/format';
import KpiCard from '@/components/KpiCard';
import SegmentDonut from '@/components/SegmentDonut';
import AtRiskTable from '@/components/AtRiskTable';
import RevenueBar from '@/components/RevenueBar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SegmentRow {
  segment: string;
  clients: string;
  revenue: string;
}

interface AtRiskRow {
  client: string;
  recency: number;
  frequency: number;
  monetary: string;
  segment: string;
}

interface SummaryRow {
  total_clients: string;
  total_revenue: string;
}

// Force dynamic rendering — no caching for live DB data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // ─── Raw SQL Queries via pg pool ────────────────────────────────────────────

  // 1. Segment aggregation: count of clients + sum of revenue per segment
  const segmentRows = await query<SegmentRow>(`
    SELECT
      segment,
      COUNT(*)::text                    AS clients,
      ROUND(SUM(monetary)::numeric, 2)::text AS revenue
    FROM rfm_segments
    GROUP BY segment
    ORDER BY SUM(monetary) DESC
  `);

  // 2. Overall KPI summary
  const [summary] = await query<SummaryRow>(`
    SELECT
      COUNT(*)::text                            AS total_clients,
      ROUND(SUM(monetary)::numeric, 0)::text    AS total_revenue
    FROM rfm_segments
  `);

  // 3. Top 10 At-Risk / Churned clients by monetary value
  const atRiskRows = await query<AtRiskRow>(`
    SELECT client, recency, frequency, monetary, segment
    FROM rfm_segments
    WHERE segment = 'At-Risk / Churned'
    ORDER BY monetary DESC
    LIMIT 10
  `);

  // ─── Derived values ─────────────────────────────────────────────────────────
  const segmentData = segmentRows.map((r) => ({
    segment: r.segment,
    clients: parseInt(r.clients, 10),
    revenue: parseFloat(r.revenue),
  }));

  const totalClients = parseInt(summary?.total_clients ?? '0', 10);
  const totalRevenue = parseFloat(summary?.total_revenue ?? '0');

  const atRiskClients = atRiskRows.map((r) => ({
    client:    r.client,
    recency:   r.recency,
    frequency: r.frequency,
    monetary:  parseFloat(r.monetary),
    segment:   r.segment,
  }));

  return (
    <main className="min-h-screen bg-[#090c12] text-white">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/8 bg-[#090c12]/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Arya Ribbon Company Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* ─── KPI Cards ──────────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Key Metrics</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Total Clients"
              value={totalClients}
              subtitle="Unique B2B clients"
              icon="🏢"
              gradient="bg-gradient-to-br from-violet-500 to-purple-700"
            />
            <KpiCard
              title="Total Revenue"
              value={Math.round(totalRevenue)}
              prefix=""
              formattedValue={formatINRCompact(totalRevenue)}
              subtitle="Lifetime monetary value"
              icon="💰"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
            />
            <KpiCard
              title="Wholesale VIPs"
              value={segmentData.find(s => s.segment === 'Wholesale VIPs')?.clients ?? 0}
              subtitle="High-value segment"
              icon="⭐"
              gradient="bg-gradient-to-br from-indigo-500 to-violet-700"
            />
            <KpiCard
              title="At-Risk Clients"
              value={segmentData.find(s => s.segment === 'At-Risk / Churned')?.clients ?? 0}
              subtitle="Need immediate attention"
              icon="🚨"
              gradient="bg-gradient-to-br from-pink-500 to-rose-700"
            />
          </div>
        </section>

        {/* ─── Charts Row ─────────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Segment Analysis</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SegmentDonut data={segmentData} />
            <RevenueBar data={segmentData} />
          </div>
        </section>

        {/* ─── Segment Summary Strip ──────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {segmentData.map((seg) => {
              const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                'Wholesale VIPs':    { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/20' },
                'Loyal Boutiques':   { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
                'Occasional Buyers': { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
                'At-Risk / Churned': { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'border-pink-500/20' },
              };
              const c = colorMap[seg.segment] ?? { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
              return (
                <div key={seg.segment} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
                  <p className={`text-xs font-bold ${c.text} mb-1 truncate`}>{seg.segment}</p>
                  <p className="text-2xl font-black text-white">{seg.clients}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {formatINRCompact(seg.revenue)} revenue
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── At-Risk Table ──────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Sales Priority</p>
          <AtRiskTable clients={atRiskClients} />
        </section>

        {/* ─── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-slate-600">Arya Ribbon Company</p>
        </footer>
      </div>
    </main>
  );
}
