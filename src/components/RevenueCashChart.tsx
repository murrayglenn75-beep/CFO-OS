import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { FinancialRecord } from '../types';

const money = (n: number) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n) >= 1_000_000
    ? `${(Math.abs(n) / 1_000_000).toFixed(2)}M`
    : `${(Math.abs(n) / 1000).toFixed(0)}K`}`;

export default function RevenueCashChart({ data }: { data: FinancialRecord[] }) {
  return (
          <div className="chart-wrap">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
              initialDimension={{ width: 800, height: 285 }}
            >
              <AreaChart data={data} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--c-brass)" stopOpacity={0.28}/><stop offset="95%" stopColor="var(--c-brass)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="var(--c-ink-700)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: 'var(--c-slate)', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24}/>
                <YAxis tick={{ fill: 'var(--c-slate)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1_000_000).toFixed(1)}m`}/>
                <Tooltip contentStyle={{ background: 'var(--c-ink-850)', border: '1px solid var(--c-ink-700)', borderRadius: 12 }} formatter={(v: any) => money(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="var(--c-brass)" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="cash" stroke="var(--c-emerald)" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
  );
}

