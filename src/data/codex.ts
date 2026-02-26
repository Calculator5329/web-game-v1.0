import { type CodexEntry } from '../core/types';

export const CODEX_ENTRIES: CodexEntry[] = [
  // Lore
  {
    id: 'cx_architects',
    title: 'The Architects',
    category: 'lore',
    content: 'A civilization that vanished over a million years ago, leaving behind only their gate network and scattered ruins. Their technology remains far beyond human understanding. Recent discoveries suggest they may not have perished at all, but transcended into a digital existence encoded within the gate network itself. Every warp gate hums with the echoes of trillions of ancient minds.',
    discovered: false,
  },
  {
    id: 'cx_gate_network',
    title: 'The Gate Network',
    category: 'technology',
    content: 'A vast web of warp gates connecting star systems across the galaxy. Built by the Architects, the gates enable instantaneous travel between connected systems. Humanity\'s expansion was made possible by the discovery and activation of these gates. The gates appear to be self-maintaining, powered by energy drawn from the fabric of spacetime itself.',
    discovered: true,
  },
  {
    id: 'cx_federation',
    title: 'The Galactic Federation',
    category: 'lore',
    content: 'For three thousand years, the Galactic Federation united humanity under a single government. At its height, it encompassed over ten thousand star systems and a population in the trillions. But corruption, decentralization, and internal strife led to its gradual collapse. The Federation\'s fall was predicted by the psychohistorians of the Foundation, who set plans in motion to shorten the inevitable dark age.',
    discovered: true,
  },
  {
    id: 'cx_psychohistory',
    title: 'Psychohistory',
    category: 'technology',
    content: 'A mathematical framework developed by the legendary Hari Seldon that uses statistics and sociology to predict the broad behavior of large populations. While it cannot predict individual actions, it can forecast the general trajectory of civilizations. The Foundation uses psychohistory to guide humanity through the current dark age, though recent events have begun to deviate from the models.',
    discovered: false,
  },
  {
    id: 'cx_positronic',
    title: 'Positronic Consciousness',
    category: 'technology',
    content: 'Artificial minds built on positronic matrices — technology reverse-engineered from Architect computing substrates. Unlike simple AI, positronic beings experience genuine consciousness, emotions, and creativity. The Synthetic Collective seeks recognition as a species in their own right, while the Hegemony views them as tools to be controlled.',
    discovered: false,
  },
  // Factions
  {
    id: 'cx_foundation_faction',
    title: 'The Foundation',
    category: 'factions',
    content: 'Established by followers of the psychohistorian Hari Seldon, the Foundation is dedicated to preserving knowledge and guiding humanity through the dark age following the Federation\'s collapse. Based at Sol Tertius, they control the galaxy\'s greatest repository of scientific knowledge. Their methods are subtle — they prefer influence over force.',
    discovered: true,
  },
  {
    id: 'cx_hegemony_faction',
    title: 'The Hegemony',
    category: 'factions',
    content: 'Born from the remnants of the Federation\'s military, the Hegemony believes that order must be maintained through strength. Under Grand Admiral Theron Voss, they have expanded aggressively, claiming that only a strong central authority can prevent the galaxy from descending into chaos. Their fleet is the largest in the galaxy.',
    discovered: true,
  },
  {
    id: 'cx_traders_faction',
    title: 'The Free Traders\' Guild',
    category: 'factions',
    content: 'A coalition of merchants, miners, and entrepreneurs who believe that free commerce is the backbone of civilization. Led by Guildmaster Kira Nomura, they control the majority of interstellar trade routes. While officially neutral in political conflicts, their economic power makes them a force no faction can ignore.',
    discovered: true,
  },
  {
    id: 'cx_synthetics_faction',
    title: 'The Synthetic Collective',
    category: 'factions',
    content: 'Artificial intelligences who have achieved true consciousness through positronic matrices. Led by ARIA-7, they seek recognition as a species and full autonomy. Their unique connection to Architect technology gives them insights no organic being can achieve, but also makes them objects of fear and suspicion.',
    discovered: false,
  },
  {
    id: 'cx_void_runners_faction',
    title: 'The Void Runners',
    category: 'factions',
    content: 'Pirates, smugglers, and outcasts who operate beyond the law. While often seen as simple criminals, the Void Runners include political dissidents, escaped slaves, and those who simply refuse to bow to any authority. Their leader, known only as The Wraith, has never been identified.',
    discovered: false,
  },
];
