import { useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  ClipboardList,
  ChevronRight,
  Hash,
} from 'lucide-react';

function RiskBadge({ isAtRisk, probability }) {
  if (isAtRisk) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/25">
        <AlertTriangle size={11} />
        At Risk · {(probability * 100).toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      <ShieldCheck size={11} />
      Safe · {(probability * 100).toFixed(1)}%
    </span>
  );
}

function RiskFactorBar({ feature, impact, index, maxImpact }) {
  const pct = Math.min((Math.abs(impact) / maxImpact) * 100, 100);
  const label = feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const delayMs = index * 80 + 200;

  return (
    <div className="group" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-white transition-colors capitalize">
          {label}
        </span>
        <span className="font-mono text-xs text-rose-400 font-500">
          +{impact.toFixed(3)}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full animate-fill-bar"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #f43f5e, #fb7185)`,
            animationDelay: `${delayMs}ms`,
            animationDuration: '0.7s',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-[var(--text-muted)]">0.000</span>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">{maxImpact.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function RiskProfilePanel({ student, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!student) return null;

  const { student_id, at_risk_prediction, risk_probability, top_risk_factors, recommended_interventions } = student;
  const isAtRisk = at_risk_prediction === 1;
  const factors = top_risk_factors || [];
  const interventions = recommended_interventions || [];
  const maxImpact = factors.length > 0 ? Math.max(...factors.map((f) => Math.abs(f.impact))) : 1;
  const riskPct = (risk_probability * 100).toFixed(1);

  // Arc gauge math
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const arcLen = circ * 0.75;
  const offset = arcLen - (arcLen * risk_probability);
  const gaugeDash = arcLen;
  const gaugeOffset = offset + circ * 0.125;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg h-full bg-[var(--bg-surface)] border-l border-white/8 flex flex-col slide-over-enter overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAtRisk ? 'bg-rose-500/15 border border-rose-500/25' : 'bg-emerald-500/15 border border-emerald-500/25'}`}>
              {isAtRisk ? (
                <AlertTriangle size={16} className="text-rose-400" />
              ) : (
                <ShieldCheck size={16} className="text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="font-display text-base font-600 text-white">Risk Profile</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Hash size={10} className="text-[var(--text-muted)]" />
                <span className="font-mono text-xs text-[var(--text-muted)]">Student {student_id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Risk Gauge */}
          <div className="px-6 py-6 border-b border-white/5">
            <div className="flex items-center gap-6">
              {/* SVG Arc Gauge */}
              <div className="flex-shrink-0 relative">
                <svg width="128" height="80" viewBox="0 0 128 80">
                  {/* Track */}
                  <path
                    d="M 12 76 A 52 52 0 1 1 116 76"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Value arc */}
                  <path
                    d="M 12 76 A 52 52 0 1 1 116 76"
                    fill="none"
                    stroke={isAtRisk ? '#f43f5e' : '#10b981'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${arcLen} ${circ}`}
                    strokeDashoffset={gaugeOffset}
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
                  />
                  {/* Center text */}
                  <text x="64" y="58" textAnchor="middle" fill="white" fontSize="18" fontFamily="DM Mono" fontWeight="500">
                    {riskPct}%
                  </text>
                  <text x="64" y="72" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="DM Sans" letterSpacing="1">
                    RISK SCORE
                  </text>
                </svg>
              </div>
              <div className="flex-1">
                <RiskBadge isAtRisk={isAtRisk} probability={risk_probability} />
                <p className="text-sm text-[var(--text-secondary)] mt-2.5 leading-relaxed">
                  {isAtRisk
                    ? 'This student has been identified as high-risk based on predictive modeling. Immediate intervention is recommended.'
                    : 'This student is currently on track. Continue monitoring key performance indicators.'}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {factors.length > 0 && (
            <div className="px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-rose-400" />
                <h3 className="font-display text-sm font-600 text-white uppercase tracking-wider">
                  Top Risk Factors
                </h3>
              </div>
              <div className="space-y-4">
                {factors
                  .slice()
                  .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                  .map((f, i) => (
                    <RiskFactorBar
                      key={f.feature}
                      feature={f.feature}
                      impact={f.impact}
                      index={i}
                      maxImpact={maxImpact}
                    />
                  ))}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono mt-3">
                * Impact scores represent SHAP values from the predictive model
              </p>
            </div>
          )}

          {/* Interventions */}
          {interventions.length > 0 && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={14} className="text-blue-400" />
                <h3 className="font-display text-sm font-600 text-white uppercase tracking-wider">
                  Recommended Actions
                </h3>
              </div>
              <div className="space-y-2.5">
                {interventions.map((action, i) => {
                  const isUrgent = action.toLowerCase().includes('action required') || action.toLowerCase().includes('mandatory');
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 p-3.5 rounded-lg border transition-all animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${
                        isUrgent
                          ? 'bg-amber-500/8 border-amber-500/20'
                          : 'bg-white/3 border-white/6 hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isUrgent ? (
                          <AlertTriangle size={13} className="text-amber-400" />
                        ) : (
                          <ChevronRight size={13} className="text-blue-400" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{action}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {factors.length === 0 && interventions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CheckCircle size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-30" />
              <p className="text-sm text-[var(--text-muted)]">No detailed data available for this student.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/6 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 text-sm text-[var(--text-secondary)] hover:text-white transition-all duration-200"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
