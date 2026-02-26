import { type ReactNode, type CSSProperties } from 'react';

interface PanelProps {
  children: ReactNode;
  title?: string;
  accent?: string;
  style?: CSSProperties;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

const baseStyle: CSSProperties = {
  background: 'var(--bg-panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '16px',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '0.75rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--border)',
};

export function Panel({ children, title, accent = 'var(--cyan)', style, className, glow, onClick }: PanelProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...(glow ? { boxShadow: `0 0 15px ${accent}22, inset 0 0 15px ${accent}08` } : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />
      {title && (
        <div style={{ ...titleStyle, color: accent }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
