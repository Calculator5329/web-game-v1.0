import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/RootStore';
import { GameScreen } from '../../core/types';
import { runInAction } from 'mobx';
import { HoloPanel } from '../components/HoloPanel';
import { Button } from '../components/Button';

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, 18);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ animation: 'pulse-glow 0.5s infinite', color: 'var(--cyan)' }}>▊</span>}
    </span>
  );
}

export const StoryView = observer(function StoryView() {
  const store = useStore();
  const { storyStore } = store;
  const [, setTextComplete] = useState(false);

  const dialogueNode = storyStore.currentDialogueNode;
  const event = storyStore.activeEvent;
  const eventOutcome = store.eventOutcome;

  useEffect(() => {
    if (!dialogueNode && !event && !eventOutcome && store.screen === GameScreen.Story) {
      runInAction(() => store.setScreen(GameScreen.Galaxy));
    }
  }, [dialogueNode, event, eventOutcome, store]);

  // Event outcome display
  if (eventOutcome) {
    return (
      <div style={containerStyle}>
        <HoloPanel title="Outcome" accent="var(--cyan)" style={{ maxWidth: '650px', width: '100%' }} glow corners>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
            {eventOutcome}
          </p>
          <Button onClick={() => store.dismissEventOutcome()} fullWidth>
            Continue
          </Button>
        </HoloPanel>
      </div>
    );
  }

  // Random event display
  if (event) {
    return (
      <div style={containerStyle}>
        <HoloPanel title={event.title} accent={
          event.type === 'encounter' ? 'var(--red)' :
          event.type === 'discovery' ? 'var(--cyan)' :
          event.type === 'distress' ? 'var(--amber)' :
          event.type === 'anomaly' ? 'var(--purple)' : 'var(--cyan)'
        } style={{ maxWidth: '650px', width: '100%' }} glow corners scanline>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '12px', fontFamily: 'var(--font-display)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {event.type}
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
            <TypewriterText text={event.description} key={event.id} onComplete={() => setTextComplete(true)} />
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {event.choices.map((choice, i) => (
              <Button key={i} variant="ghost" fullWidth onClick={() => { store.resolveEventChoice(i); setTextComplete(false); }}>
                {choice.text}
              </Button>
            ))}
          </div>
        </HoloPanel>
      </div>
    );
  }

  // Story dialogue
  if (dialogueNode) {
    return (
      <div style={containerStyle}>
        <div style={{ maxWidth: '700px', width: '100%', animation: 'fade-in-up 0.4s ease' }}>
          {/* Chapter header */}
          {storyStore.currentDialogueIndex === 0 && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '3px' }}>
                CHAPTER {storyStore.currentChapter}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cyan)', letterSpacing: '2px', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
                {storyStore.currentChapterData?.title}
              </h2>
            </div>
          )}

          <HoloPanel accent="var(--cyan)" glow corners>
            {/* Speaker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cyan-dim), var(--purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-bright)',
                border: '2px solid var(--cyan)',
              }}>
                {dialogueNode.speaker.charAt(0)}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--cyan)', letterSpacing: '1px' }}>
                  {dialogueNode.speaker}
                </div>
              </div>
            </div>

            {/* Dialogue text */}
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px', minHeight: '60px' }}>
              <TypewriterText text={dialogueNode.text} key={dialogueNode.id} onComplete={() => setTextComplete(true)} />
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dialogueNode.options.map(option => (
                <Button
                  key={option.id}
                  variant="ghost"
                  fullWidth
                  onClick={() => { storyStore.selectDialogueOption(option.id); setTextComplete(false); }}
                  style={{ textAlign: 'left', textTransform: 'none', fontFamily: 'var(--font-ui)', letterSpacing: '0', fontSize: '0.9rem' }}
                >
                  ▸ {option.text}
                </Button>
              ))}
            </div>
          </HoloPanel>
        </div>
      </div>
    );
  }

  return null;
});

const containerStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  background: 'radial-gradient(ellipse at center, rgba(0,20,40,0.8), var(--bg-deep))',
};
