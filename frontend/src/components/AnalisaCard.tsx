import { AlertTriangle, Info, CheckCircle, FileText } from 'lucide-react';

const COLORS = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  orange: '#f59e0b',
  teal: '#14b8a6',
  indigo: '#6366f1'
};

export function AnalisaCard({ title, icon, description, chart, table, alertText, status, dynamicText, sources, forceShow }: any) {
  return (
    <div className="glass-panel analisa-card" style={{ marginBottom: '24px', overflow: 'hidden', border: forceShow ? '1px solid rgba(239, 68, 68, 0.5)' : undefined, boxShadow: forceShow ? '0 0 15px rgba(239, 68, 68, 0.1)' : undefined }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px', background: forceShow ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)' }}>
        {icon}
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
        </div>
      </div>

      {forceShow && sources && sources.length > 0 && (
        <div style={{ padding: '16px 24px 0 24px' }}>
          <div className="alert-box alert-warning" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeftColor: '#ef4444' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>
              Analisa ini disembunyikan karena data ({sources.join(', ')}) belum ada di sumber.
            </span>
          </div>
        </div>
      )}
      
      {description && (
        <div style={{ padding: '16px 24px 0 24px' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <FileText size={16} style={{ marginTop: '2px', flexShrink: 0, opacity: 0.6 }} />
            {description}
          </p>
        </div>
      )}
      
      {sources && sources.length > 0 && (
        <div style={{ padding: '0 24px', marginTop: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            <strong>Source yang digunakan:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
              {sources.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      )}

      {dynamicText && (
        <div style={{ padding: '0 24px', marginTop: '16px' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: `4px solid ${COLORS.blue}`, borderRadius: '0 8px 8px 0', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {dynamicText}
          </div>
        </div>
      )}

      {alertText && (
        <div style={{ padding: '16px 24px 0 24px' }}>
          <div className={`alert-box alert-${status}`}>
            {status === 'warning' ? <AlertTriangle size={20} /> : status === 'good' ? <CheckCircle size={20} /> : <Info size={20} />}
            <span>{alertText}</span>
          </div>
        </div>
      )}

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '300px', width: '100%' }}>
          {chart}
        </div>
        <div style={{ overflowX: 'auto' }}>
          {table}
        </div>
      </div>
    </div>
  );
}


