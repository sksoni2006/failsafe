import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import {
  Users, AlertTriangle, ShieldCheck, TrendingUp,
  RefreshCw, BarChart2, PieChart as PieIcon, Activity,
} from 'lucide-react';
import { dashboardAPI } from '../lib/api';
import RiskProfilePanel from '../components/RiskProfilePanel';

// ── Helpers ────────────────────────────────────────────────────────────────
function buildDistributionData(students) {
  const buckets = [
    { range: '0–20%', min: 0, max: 0.2, count: 0 },
    { range: '20–40%', min: 0.2, max: 0.4, count: 0 },
    { range: '40–60%', min: 0.4, max: 0.6, count: 0 },
    { range: '60–80%', min: 0.6, max: 0.8, count: 0 },
    { range: '80–100%', min: 0.8, max: 1.01, count: 0 },
  ];
  students.forEach((s) => {
    const b = buckets.find((b) => s.risk_probability >= b.min && s.risk_probability < b.max);
    if (b) b.count++;
  });
  return buckets;
}

const PIE_COLORS = ['#f43f5e', '#10b981'];

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontFamily="DM Mono" fontWeight="500">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-white/10 rounded-lg px-3.5 py-2.5 shadow-xl">
      {label && <p className="text-xs text-[var(--text-muted)] font-mono mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color || '#e8edf5' }}>
          {p.name}: <span className="font-mono">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <div
      className={`animate-fade-in-up glass-card rounded-xl p-5 border border-white/6 hover:border-white/12 transition-all duration-200 group`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${color} opacity-60`}>
          {sub}
        </span>
      </div>
      <p className="font-display text-3xl font-700 text-white mb-0.5">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
        <BarChart2 size={24} className="text-[var(--text-muted)]" />
      </div>
      <h3 className="font-display text-lg font-600 text-white mb-2">No Data Yet</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs">
        Upload a student CSV file to generate predictions and see analytics here.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dashboardAPI.getAll();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const atRiskCount = students.filter((s) => s.at_risk_prediction === 1).length;
  const safeCount = students.length - atRiskCount;
  const avgRisk = students.length > 0 ? (students.reduce((a, s) => a + s.risk_probability, 0) / students.length * 100).toFixed(1) : '—';
  const pieData = [
    { name: 'At Risk', value: atRiskCount },
    { name: 'Safe', value: safeCount },
  ].filter((d) => d.value > 0);
  const distData = buildDistributionData(students);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-700 text-white">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time student risk analytics and intervention tracking
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 text-sm text-[var(--text-secondary)] hover:text-white transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full spinner mx-auto mb-4" />
            <p className="text-sm text-[var(--text-muted)] font-mono">Loading analytics...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
          <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      ) : students.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Students" value={students.length} sub="total" color="bg-blue-500/15 text-blue-400 border-blue-500/25" delay={0} />
            <StatCard icon={AlertTriangle} label="Students At Risk" value={atRiskCount} sub="at risk" color="bg-rose-500/15 text-rose-400 border-rose-500/25" delay={50} />
            <StatCard icon={ShieldCheck} label="Students Safe" value={safeCount} sub="safe" color="bg-emerald-500/15 text-emerald-400 border-emerald-500/25" delay={100} />
            <StatCard icon={TrendingUp} label="Avg Risk Score" value={`${avgRisk}%`} sub="average" color="bg-amber-500/15 text-amber-400 border-amber-500/25" delay={150} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up stagger-3">
            {/* Pie chart */}
            <div className="lg:col-span-2 glass-card rounded-xl p-5 border border-white/6">
              <div className="flex items-center gap-2 mb-5">
                <PieIcon size={14} className="text-[var(--text-muted)]" />
                <h2 className="font-display text-sm font-600 text-white uppercase tracking-wider">Risk Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    labelLine={false}
                    label={CustomPieLabel}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-xs text-[var(--text-secondary)]">{d.name}</span>
                    <span className="font-mono text-xs text-white font-500">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="lg:col-span-3 glass-card rounded-xl p-5 border border-white/6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 size={14} className="text-[var(--text-muted)]" />
                <h2 className="font-display text-sm font-600 text-white uppercase tracking-wider">Probability Buckets</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distData} barSize={28}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Mono' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                    {distData.map((entry, i) => {
                      const pct = (entry.min + entry.max) / 2;
                      const color = pct >= 0.8 ? '#f43f5e' : pct >= 0.6 ? '#f97316' : pct >= 0.4 ? '#f59e0b' : '#3b82f6';
                      return <Cell key={i} fill={color} opacity={0.85} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Students table */}
          <div className="glass-card rounded-xl border border-white/6 overflow-hidden animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[var(--text-muted)]" />
                <h2 className="font-display text-sm font-600 text-white uppercase tracking-wider">All Students</h2>
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)] bg-white/4 px-2.5 py-1 rounded-full border border-white/6">
                {students.length} records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Student ID', 'Status', 'Risk Probability', 'Top Factor', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const isAtRisk = s.at_risk_prediction === 1;
                    const topFactor = s.top_risk_factors?.[0];
                    return (
                      <tr
                        key={s.student_id ?? i}
                        onClick={() => setSelectedStudent(s)}
                        className="border-b border-white/4 last:border-0 hover:bg-white/3 cursor-pointer transition-colors group animate-fade-in-up"
                        style={{ animationDelay: `${i * 30}ms`, opacity: 0 }}
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">
                            #{s.student_id ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${isAtRisk ? 'bg-rose-500/12 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isAtRisk ? 'bg-rose-400 pulse-dot' : 'bg-emerald-400'}`} />
                            {isAtRisk ? 'At Risk' : 'Safe'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(s.risk_probability * 100).toFixed(0)}%`,
                                  background: isAtRisk ? '#f43f5e' : '#10b981',
                                }}
                              />
                            </div>
                            <span className="font-mono text-xs text-[var(--text-secondary)]">
                              {(s.risk_probability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-[var(--text-muted)] capitalize font-mono">
                            {topFactor ? topFactor.feature.replace(/_/g, ' ') : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors opacity-0 group-hover:opacity-100">
                            View Profile →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Risk profile panel */}
      {selectedStudent && (
        <RiskProfilePanel student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
