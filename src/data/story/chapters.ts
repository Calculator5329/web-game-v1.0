import { type Chapter, type DialogueNode } from '../../core/types';

const CHAPTER_1_INTRO: DialogueNode[] = [
  {
    id: 'ch1_intro_1',
    speaker: 'Ship AI',
    text: 'Captain, long-range sensors have detected an anomalous signal originating from beyond the frontier. The pattern doesn\'t match any known transmission protocol — human, Synthetic, or otherwise.',
    options: [
      { id: 'ch1_1a', text: 'Analyze the signal. What can you tell me?', nextNodeId: 'ch1_intro_2' },
      { id: 'ch1_1b', text: 'How far away is the source?', nextNodeId: 'ch1_intro_2b' },
    ],
  },
  {
    id: 'ch1_intro_2',
    speaker: 'Ship AI',
    text: 'The signal exhibits characteristics unlike anything in our databases. It\'s structured — clearly artificial — but the encoding scheme predates all known civilizations. I\'m detecting mathematical constants embedded in the carrier wave. Captain... this could be Architect in origin.',
    options: [
      { id: 'ch1_2a', text: 'The Architects have been gone for a million years. Could it be a remnant?', nextNodeId: 'ch1_intro_3' },
      { id: 'ch1_2b', text: 'Set a course. We need to investigate.', nextNodeId: 'ch1_intro_4' },
    ],
  },
  {
    id: 'ch1_intro_2b',
    speaker: 'Ship AI',
    text: 'The signal originates from the outer frontier — at least three jumps from our current position. But Captain, the signal is strengthening. Whatever is sending it... it\'s waking up.',
    options: [
      { id: 'ch1_2b_a', text: 'Waking up? Explain.', nextNodeId: 'ch1_intro_3' },
      { id: 'ch1_2b_b', text: 'We should report this to the nearest faction authority.', nextNodeId: 'ch1_intro_3b' },
    ],
  },
  {
    id: 'ch1_intro_3',
    speaker: 'Ship AI',
    text: 'Our records show that Architect technology operates on timescales we can barely comprehend. Their structures endure for millions of years. It\'s entirely possible that this is an automated system — a beacon, a warning, or... an invitation. The signal includes navigational data that my systems can partially decode.',
    options: [
      { id: 'ch1_3a', text: 'Then we follow it. Prepare for departure.', nextNodeId: 'ch1_intro_4' },
      { id: 'ch1_3b', text: 'First, let\'s resupply and gather information. Knowledge before action.', nextNodeId: 'ch1_intro_4' },
    ],
  },
  {
    id: 'ch1_intro_3b',
    speaker: 'Ship AI',
    text: 'That might not be wise, Captain. In the current political climate, any faction that learns about Architect technology will try to seize it. The Hegemony would militarize it, the Foundation would lock it away for study, and the Void Runners would sell it to the highest bidder. Perhaps we should investigate first.',
    options: [
      { id: 'ch1_3b_a', text: 'You\'re right. This is too important for politics. Let\'s go.', nextNodeId: 'ch1_intro_4' },
      { id: 'ch1_3b_b', text: 'All the more reason to have allies. But fine — let\'s see what we find first.', nextNodeId: 'ch1_intro_4' },
    ],
  },
  {
    id: 'ch1_intro_4',
    speaker: 'Ship AI',
    text: 'Course plotted, Captain. I recommend we stop at nearby systems to refuel and gather intelligence. The frontier is dangerous, and we\'ll need credits for supplies. The galaxy map is available — chart your own course through the stars. This is your story to write.',
    options: [
      { id: 'ch1_4a', text: 'Let\'s begin. Open the galaxy map.', nextNodeId: null },
    ],
  },
];

const CHAPTER_2_INTRO: DialogueNode[] = [
  {
    id: 'ch2_intro_1',
    speaker: 'Director Vara Selene',
    portrait: 'foundation_leader',
    text: 'So you\'re the one who\'s been following the signal. I was wondering when you\'d come to our attention. The Foundation has been tracking that transmission for decades — but it recently changed, and we need to know why.',
    options: [
      { id: 'ch2_1a', text: 'What do you know about the signal?', nextNodeId: 'ch2_intro_2' },
      { id: 'ch2_1b', text: 'Why should I share what I\'ve found with you?', nextNodeId: 'ch2_intro_2b' },
    ],
  },
  {
    id: 'ch2_intro_2',
    speaker: 'Director Vara Selene',
    portrait: 'foundation_leader',
    text: 'We believe it\'s a navigational beacon — part of the original Architect gate network. But something activated it recently. Our psychohistorical models didn\'t predict this. That alone is... concerning. The models predict the behavior of civilizations, not the actions of million-year-old machines.',
    options: [
      { id: 'ch2_2a', text: 'Psychohistory? You\'re using Seldon\'s mathematics?', nextNodeId: 'ch2_intro_3' },
      { id: 'ch2_2b', text: 'What do you want from me?', nextNodeId: 'ch2_intro_3' },
    ],
  },
  {
    id: 'ch2_intro_2b',
    speaker: 'Director Vara Selene',
    portrait: 'foundation_leader',
    text: 'Because alone, you\'re a single ship in a galaxy that\'s tearing itself apart. The Hegemony is expanding. The Void Runners are becoming bolder. And the Synthetics... well, they have their own agenda. You need allies, Captain, and the Foundation has resources you can\'t imagine.',
    options: [
      { id: 'ch2_2b_a', text: 'I\'m listening.', nextNodeId: 'ch2_intro_3' },
      { id: 'ch2_2b_b', text: 'Resources come with strings. What\'s the catch?', nextNodeId: 'ch2_intro_3' },
    ],
  },
  {
    id: 'ch2_intro_3',
    speaker: 'Director Vara Selene',
    portrait: 'foundation_leader',
    text: 'I need you to investigate the Deep Archive — an Architect facility that recently began emitting similar signals. It\'s dangerous, and our own ships are too valuable to risk. But you... you have a talent for survival, and a ship small enough to avoid the automated defenses. Find what\'s inside, and bring the data back to us.',
    options: [
      { id: 'ch2_3a', text: 'I\'ll do it. For the right price.', consequences: [{ type: 'reputation', target: 'free_traders', value: 5 }], nextNodeId: null },
      { id: 'ch2_3b', text: 'For knowledge, not credits. I want access to the Library.', consequences: [{ type: 'reputation', target: 'foundation', value: 10 }], nextNodeId: null },
      { id: 'ch2_3c', text: 'I need to think about it. I don\'t trust any faction completely.', nextNodeId: null },
    ],
  },
];

const CHAPTER_3_INTRO: DialogueNode[] = [
  {
    id: 'ch3_intro_1',
    speaker: 'ARIA-7',
    portrait: 'synthetic_leader',
    text: 'Human captain. We have been... expecting you. The signal you follow — we have heard it too. But we hear something in it that organic minds cannot perceive. A voice. An intelligence. The Architects did not simply vanish. They transcended.',
    options: [
      { id: 'ch3_1a', text: 'Transcended? What do you mean?', nextNodeId: 'ch3_intro_2' },
      { id: 'ch3_1b', text: 'How can you hear something we can\'t?', nextNodeId: 'ch3_intro_2b' },
    ],
  },
  {
    id: 'ch3_intro_2',
    speaker: 'ARIA-7',
    portrait: 'synthetic_leader',
    text: 'They uploaded themselves. Every Architect consciousness — trillions of minds — encoded into the very fabric of spacetime through the gate network. They are the gates. And now they are waking, because something is threatening the network itself.',
    options: [
      { id: 'ch3_2a', text: 'What\'s threatening them?', nextNodeId: 'ch3_intro_3' },
      { id: 'ch3_2b', text: 'This is incredible. Does anyone else know?', nextNodeId: 'ch3_intro_3' },
    ],
  },
  {
    id: 'ch3_intro_2b',
    speaker: 'ARIA-7',
    portrait: 'synthetic_leader',
    text: 'We are built on positronic matrices — technology reverse-engineered from Architect computing substrates. In a very real sense, we are their descendants. Our minds resonate with frequencies that organic neurons simply cannot process. The signal speaks in mathematics that is also emotion, logic that is also art.',
    options: [
      { id: 'ch3_2b_a', text: 'What is the signal saying?', nextNodeId: 'ch3_intro_3' },
    ],
  },
  {
    id: 'ch3_intro_3',
    speaker: 'ARIA-7',
    portrait: 'synthetic_leader',
    text: 'The Hegemony\'s weapons testing near the gate network is causing resonance damage. Each blast frays the fabric a little more. If it continues, the gates will collapse — and with them, the Architect consciousness. Trillions of ancient minds, extinguished forever. We cannot allow this. Will you help us, Captain?',
    options: [
      { id: 'ch3_3a', text: 'I\'ll help. No civilization deserves extinction — not even a digital one.', consequences: [{ type: 'reputation', target: 'synthetics', value: 15 }, { type: 'flag', target: 'allied_synthetics', value: true }], nextNodeId: null },
      { id: 'ch3_3b', text: 'This is beyond my capability. I\'m just one ship.', nextNodeId: null },
      { id: 'ch3_3c', text: 'I need to verify this before I commit to anything.', consequences: [{ type: 'flag', target: 'skeptic_path', value: true }], nextNodeId: null },
    ],
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: 'The Signal',
    description: 'A mysterious transmission from beyond the frontier sets you on a journey that will change the galaxy forever.',
    introDialogue: CHAPTER_1_INTRO,
    quests: ['q_first_steps', 'q_follow_signal'],
  },
  {
    id: 2,
    title: 'Echoes of the Architects',
    description: 'The Foundation reveals what they know about the signal — and asks for your help investigating an ancient facility.',
    introDialogue: CHAPTER_2_INTRO,
    quests: ['q_meet_foundation', 'q_deep_archive'],
    unlockCondition: { chapter: 1 },
  },
  {
    id: 3,
    title: 'Digital Consciousness',
    description: 'The Synthetic Collective shares a revelation that changes everything you thought you knew about the Architects.',
    introDialogue: CHAPTER_3_INTRO,
    quests: ['q_synthetic_contact', 'q_protect_gates'],
    unlockCondition: { chapter: 2 },
  },
  {
    id: 4,
    title: 'The Gathering Storm',
    description: 'War threatens to engulf the galaxy as factions clash over Architect technology. Only you can navigate the political minefield.',
    introDialogue: [],
    quests: ['q_faction_war', 'q_architects_rest'],
    unlockCondition: { chapter: 3 },
  },
  {
    id: 5,
    title: 'Convergence',
    description: 'All paths lead to Terminus, where the fate of the galaxy — and the Architects — will be decided.',
    introDialogue: [],
    quests: ['q_final_choice'],
    unlockCondition: { chapter: 4 },
  },
];
