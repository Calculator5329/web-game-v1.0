import { type CSSProperties, type ReactNode, useState } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'success' | 'ghost' | 'amber';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

const variantColors: Record<ButtonVariant, { bg: string; border: string; text: string; glow: string }> = {
  primary: { bg: 'rgba(0,240,255,0.1)', border: 'var(--cyan)', text: 'var(--cyan)', glow: 'var(--glow-cyan)' },
  danger: { bg: 'rgba(255,61,113,0.1)', border: 'var(--red)', text: 'var(--red)', glow: 'var(--glow-red)' },
  success: { bg: 'rgba(0,230,118,0.1)', border: 'var(--green)', text: 'var(--green)', glow: 'var(--glow-green)' },
  ghost: { bg: 'transparent', border: 'var(--border)', text: 'var(--text-secondary)', glow: 'none' },
  amber: { bg: 'rgba(255,167,38,0.1)', border: 'var(--amber)', text: 'var(--amber)', glow: '0 0 10px rgba(255,167,38,0.3)' },
};

const sizes: Record<string, CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '0.8rem' },
  md: { padding: '10px 22px', fontSize: '0.95rem' },
  lg: { padding: '14px 32px', fontSize: '1.1rem' },
};

export function Button({ children, onClick, variant = 'primary', disabled, fullWidth, size = 'md', style }: ButtonProps) {
  const [hover, setHover] = useState(false);
  const v = variantColors[variant];
  const s = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...s,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: disabled ? 'var(--text-dim)' : v.text,
        background: disabled ? 'rgba(50,50,70,0.3)' : hover ? v.bg.replace('0.1', '0.2') : v.bg,
        border: `1px solid ${disabled ? 'var(--text-dim)' : v.border}`,
        borderRadius: 'var(--radius)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s ease',
        boxShadow: hover && !disabled ? v.glow : 'none',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
