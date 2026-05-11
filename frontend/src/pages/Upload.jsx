import { useState, useCallback, useRef } from 'react';
import {
  Upload as UploadIcon,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Users,
  ChevronRight,
  Loader2,
  BarChart2,
} from 'lucide-react';
import { predictAPI } from '../lib/api';
import RiskProfilePanel from '../components/RiskProfilePanel';

const ACCEPTED_TYPES = ['.csv', 'text/csv', 'application/vnd.ms-excel'];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function ResultRow({ student, index, onClick }) {
  const isAtRisk = student.at_risk_prediction === 1;
  const topFactor = student.top_risk_factors?.[0];
  const interventionCount = student.recommended_interventions?.length ?? 0;

  return (
    <tr
      onClick={onClick}
      className="border-b border-white/4 last:border-0 hover:bg-white/3 cursor-pointer transition-colors group animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <td className="px-5 py-4">
        <span className="font-mono text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">
          #{student.student_id}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isAtRisk ? 'bg-rose-500/12 text-rose-400 border-rose-500/20' : 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAtRisk ? 'bg-rose-400 pulse-dot' : 'bg-emerald-400'}`} />
          {isAtRisk ? 'At Risk' : 'Safe'}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5 max-w-[140px]">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(student.risk_probability * 100).toFixed(0)}%`,
                background: isAtRisk
                  ? `linear-gradient(90deg, #f43f5e, #fb7185)`
                  : `linear-gradient(90deg, #10b981, #34d399)`,
              }}
            />
          </div>
          <span className="font-mono text-xs text-[var(--text-secondary)] flex-shrink-0 w-11 text-right">
            {(student.risk_probability * 100).toFixed(1)}%
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="text-xs text-[var(--text-muted)] capitalize font-mono">
          {topFactor ? topFactor.feature.replace(/_/g, ' ') : '—'}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {interventionCount} action{interventionCount !== 1 ? 's' : ''}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <button className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors opacity-0 group-hover:opacity-100">
          Profile <ChevronRight size={11} />
        </button>
      </td>
    </tr>
  );
}

export default function Upload() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext !== 'csv') {
      setError('Only .csv files are accepted.');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
    setLoading(true);
    setProgress(0);
    try {
      const data = await predictAPI.uploadCSV(f, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 90));
      });
      setProgress(100);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to process file. Please check your CSV format.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const onFileChange = useCallback((e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
    e.target.value = '';
  }, [processFile]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setProgress(0);
  };

  const atRiskCount = result?.data?.filter((s) => s.at_risk_prediction === 1).length ?? 0;
  const safeCount = (result?.data?.length ?? 0) - atRiskCount;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-display text-2xl lg:text-3xl font-700 text-white">Upload Data</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Process a student CSV file through the AI prediction pipeline
        </p>
      </div>

      {/* Upload zone */}
      <div className="animate-fade-in-up stagger-1">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
            ${dragging
              ? 'border-blue-400/60 bg-blue-500/8 drag-active scale-[1.005]'
              : loading
              ? 'border-white/10 bg-white/2 cursor-wait'
              : file && !error
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : error
              ? 'border-rose-500/40 bg-rose-500/5'
              : 'border-white/10 bg-white/2 hover:border-white/25 hover:bg-white/4'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            {loading ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mb-4">
                  <Loader2 size={24} className="text-blue-400 spinner" />
                </div>
                <p className="font-display text-base font-600 text-white mb-1">Processing file...</p>
                <p className="text-sm text-[var(--text-muted)] mb-5 font-mono">{file?.name}</p>
                <div className="w-64 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs font-mono text-[var(--text-muted)] mt-2">{progress}% complete</p>
              </>
            ) : result ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-4">
                  <CheckCircle size={24} className="text-emerald-400" />
                </div>
                <p className="font-display text-base font-600 text-white mb-1">
                  Processed successfully
                </p>
                <p className="text-sm text-[var(--text-muted)] font-mono mb-3">{file?.name} · {formatFileSize(file?.size ?? 0)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors border border-white/10 rounded-full px-3 py-1.5 hover:border-white/20"
                >
                  <X size={12} /> Upload another file
                </button>
              </>
            ) : (
              <>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${dragging ? 'bg-blue-500/20 border-blue-500/40 scale-110' : 'bg-white/5 border-white/10'} border`}>
                  <UploadIcon size={24} className={dragging ? 'text-blue-400' : 'text-[var(--text-muted)]'} />
                </div>
                <p className="font-display text-base font-600 text-white mb-1">
                  {dragging ? 'Release to upload' : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  or <span className="text-blue-400 hover:text-blue-300 transition-colors">browse to select</span>
                </p>
                <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] font-mono">
                  <span className="flex items-center gap-1.5">
                    <FileText size={11} /> CSV format only
                  </span>
                  <span className="w-px h-3 bg-white/10" />
                  <span>Max 50MB</span>
                  <span className="w-px h-3 bg-white/10" />
                  <span>UTF-8 encoded</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 mt-3 animate-scale-in">
            <AlertTriangle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && result.data?.length > 0 && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Processed', value: result.students_processed ?? result.data.length, icon: Users, color: 'text-blue-400 bg-blue-500/12 border-blue-500/20' },
              { label: 'At Risk', value: atRiskCount, icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/12 border-rose-500/20' },
              { label: 'Safe', value: safeCount, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20' },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <div key={label} className={`glass-card rounded-xl p-4 border animate-fade-in-up ${color.split(' ').slice(2).join(' ')}`} style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 border ${color}`}>
                  <Icon size={14} />
                </div>
                <p className="font-display text-2xl font-700 text-white">{value}</p>
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
              </div>
            ))}
          </div>

          {/* Results table */}
          <div className="glass-card rounded-xl border border-white/6 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
              <BarChart2 size={14} className="text-[var(--text-muted)]" />
              <h2 className="font-display text-sm font-600 text-white uppercase tracking-wider">
                Prediction Results
              </h2>
              <span className="ml-auto font-mono text-xs text-[var(--text-muted)] bg-white/4 px-2.5 py-1 rounded-full border border-white/6">
                Click row to expand
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Student ID', 'Status', 'Risk Score', 'Top Factor', 'Actions', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((student, i) => (
                    <ResultRow
                      key={student.student_id ?? i}
                      student={student}
                      index={i}
                      onClick={() => setSelectedStudent(student)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Risk profile panel */}
      {selectedStudent && (
        <RiskProfilePanel
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
