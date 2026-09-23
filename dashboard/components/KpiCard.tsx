'use client';

import { useEffect, useRef } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  gradient: string;
  prefix?: string;
  /** If provided, renders this static string instead of an animated counter */
  formattedValue?: string;
}

export default function KpiCard({ title, value, subtitle, icon, gradient, prefix = '', formattedValue }: KpiCardProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (formattedValue || !numRef.current) return; // skip animation if static value provided
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(numericValue)) return;

    const duration = 1600;
    const startTime = performance.now();
    const start = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (numericValue - start) * eased);
      if (numRef.current) {
        numRef.current.textContent = prefix + current.toLocaleString('en-IN');
      }
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, prefix]);

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Glow orb */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 group-hover:opacity-30 transition-opacity blur-2xl ${gradient}`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white">
            {formattedValue
              ? <span>{formattedValue}</span>
              : <span ref={numRef}>0</span>
            }
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${gradient} bg-opacity-20 text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${gradient} opacity-60`} />
    </div>
  );
}
