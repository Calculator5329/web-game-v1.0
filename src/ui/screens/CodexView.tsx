import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { HoloPanel } from '../components/HoloPanel';
import { CODEX_ENTRIES } from '../../data/codex';
import type { Quest } from '../../core/types';
import { QuestStatus } from '../../core/types';

type Tab = 'quests' | 'codex' | 'history';

const statusColors: Record<string, string> = {
  [QuestStatus.Active]: 'var(--cyan)',
  [QuestStatus.Completed]: 'var(--green)',
  [QuestStatus.Failed]: 'var(--red)',
  [QuestStatus.Locked]: 'var(--text-dim)',
  [QuestStatus.Available]: 'var(--amber)',
};

function QuestCard({ quest }: { quest: Quest }) {
  const [expanded, setExpanded] = useState(quest.status === QuestStatus.Active);

  return (
    <div
      style={{
        padding: '10px', marginBottom: '8px', background: 'rgba(0,0,0,0.2)',
        borderRadius: 'var(--radius)', borderLeft: `3px solid ${statusColors[quest.status]}`,
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: statusColors[quest.status], letterSpacing: '0.5px' }}>
          {quest.isMain ? '★ ' : ''}{quest.title}
        </span>
        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: statusColors[quest.status], textTransform: 'uppercase' }}>
          {quest.status}
        </span>
      </div>
      {expanded && (
        <div style={{ marginTop: '8px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
            {quest.description}
          </p>
          {quest.objectives.map(obj => (
            <div key={obj.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '0.75rem' }}>
              <span style={{ color: obj.completed ? 'var(--green)' : 'var(--text-dim)' }}>
                {obj.completed ? '✓' : '○'}
              </span>
              <span style={{ color: obj.completed ? 'var(--text-dim)' : 'var(--text-secondary)', textDecoration: obj.completed ? 'line-through' : 'none' }}>
                {obj.description}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {obj.current}/{obj.required}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const CodexView = observer(function CodexView() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('quests');

  const allQuests = store.storyStore.quests.filter(q => q.status !== QuestStatus.Locked);
  const tradeHistory = store.playerStore.player.tradeHistory.slice(-20).reverse();

  return (
    <div style={{ height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
        {(['quests', 'codex', 'history'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', fontFamily: 'var(--font-display)', fontSize: '0.7rem',
            letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
            background: tab === t ? 'rgba(0,240,255,0.1)' : 'transparent',
            color: tab === t ? 'var(--cyan)' : 'var(--text-dim)',
            border: `1px solid ${tab === t ? 'var(--border-bright)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            transition: 'all 0.2s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'quests' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--cyan)', letterSpacing: '1px', marginBottom: '12px' }}>
              CHAPTER {store.storyStore.currentChapter}: {store.storyStore.currentChapterData?.title}
            </h3>
            {allQuests.length === 0 ? (
              <p style={{ color: 'var(--text-dim)' }}>No quests yet.</p>
            ) : (
              allQuests.map(q => <QuestCard key={q.id} quest={q} />)
            )}
          </div>
        )}

        {tab === 'codex' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['lore', 'factions', 'technology', 'systems', 'species'].map(cat => {
              const entries = CODEX_ENTRIES.filter(e => e.category === cat);
              if (entries.length === 0) return null;
              return (
                <HoloPanel key={cat} title={cat} accent="var(--purple)" corners>
                  {entries.map(entry => (
                    <div key={entry.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: entry.discovered || store.playerStore.player.visitedSystems.length > 3 ? 'var(--text-primary)' : 'var(--text-dim)', letterSpacing: '0.5px' }}>
                        {entry.title}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                        {entry.discovered || store.playerStore.player.visitedSystems.length > 3
                          ? entry.content
                          : '[Undiscovered — explore the galaxy to learn more]'}
                      </p>
                    </div>
                  ))}
                </HoloPanel>
              );
            })}
          </div>
        )}

        {tab === 'history' && (
          <HoloPanel title="Trade History" accent="var(--gold)" corners scanline>
            {tradeHistory.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No trades recorded yet.</p>
            ) : (
              <div style={{ fontSize: '0.75rem' }}>
                {tradeHistory.map((record, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: record.type === 'buy' ? 'var(--red)' : 'var(--green)' }}>
                      {record.type === 'buy' ? 'BUY' : 'SELL'}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{record.commodityId.replace(/_/g, ' ')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>×{record.quantity}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{record.pricePerUnit * record.quantity} CR</span>
                  </div>
                ))}
              </div>
            )}
          </HoloPanel>
        )}
      </div>
    </div>
  );
});
