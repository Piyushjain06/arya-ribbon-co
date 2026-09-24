'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatINRCompact, formatINRAxis } from '@/lib/format';

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
  'Core Accounts':     '#43BF8E',
  'Occasional Buyers': '#F5A623',
  'At-Risk / Churned': '#E84393',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur">
        <p className="font-semibold text-white mb-1">{label}</p>
        <p className="text-slate-300 text-sm">
          Revenue:{' '}
          <span className="text-white font-bold">
            {formatINRCompact(Number(payload[0].value))}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueBar({ data }: Props) {
  const sorted = [...data].sort((a, b) => Number(b.revenue) - Number(a.revenue));

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl">
      <h2 className="text-lg font-bold text-white mb-1">Revenue by Segment</h2>
      <p className="text-xs text-slate-500 mb-4">Total INR · all time</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={sorted} margin={{ top: 5, right: 10, left: 20, bottom: 5 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="segment"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            width={80}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatINRAxis(Number(v))}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {sorted.map((entry) => (
              <Cell key={entry.segment} fill={COLORS[entry.segment] || '#888'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
