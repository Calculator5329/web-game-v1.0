import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';

const typeColors: Record<string, string> = {
  info: 'var(--cyan)',
  success: 'var(--green)',
  warning: 'var(--amber)',
  danger: 'var(--red)',
};

export const Notifications = observer(function Notifications() {
  const store = useStore();

  if (store.notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '20px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '360px',
    }}>
      {store.notifications.map(n => (
        <div
          key={n.id}
          style={{
            background: 'var(--bg-panel)',
            border: `1px solid ${typeColors[n.type]}44`,
            borderLeft: `3px solid ${typeColors[n.type]}`,
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: typeColors[n.type],
            backdropFilter: 'blur(10px)',
            animation: 'slide-in 0.3s ease',
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
});
