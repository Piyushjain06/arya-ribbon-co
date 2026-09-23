'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatINRCompact } from '@/lib/format';

interface SegmentData {
  segment: string;
  clients: number;
  revenue: number;
}

interface Props {
  data: SegmentData[];
}

const COLORS: Record<string, string> = {
  'Wholesale VIPs':    '#6C63FF',
  'Loyal Boutiques':   '#43BF8E',
  'Occasional Buyers': '#F5A623',
  'At-Risk / Churned': '#E84393',
};

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as SegmentData;
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur">
        <p className="font-semibold text-white mb-1">{d.segment}</p>
        <p className="text-slate-300 text-sm">Clients: <span className="text-white font-bold">{d.clients}</span></p>
        <p className="text-slate-300 text-sm">
          Revenue: <span className="text-white font-bold">{formatINRCompact(Number(d.revenue))}</span>
        </p>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap justify-center gap-3 mt-4">
    {payload.map((entry: { color: string; value: string }, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-slate-300 text-xs font-medium">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function SegmentDonut({ data }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
      <h2 className="text-lg font-bold text-white mb-1">Client Segment Distribution</h2>
      <p className="text-xs text-slate-500 mb-4">K-Means RFM clustering · 4 segments</p>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="clients"
            nameKey="segment"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={3}
            labelLine={false}
            label={renderCustomLabel}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.segment}
                fill={COLORS[entry.segment] || '#888'}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
