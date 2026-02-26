import { type Faction, FactionId } from '../core/types';

export const FACTIONS: Record<FactionId, Faction> = {
  [FactionId.Foundation]: {
    id: FactionId.Foundation,
    name: 'The Foundation',
    description:
      'Scholars and scientists dedicated to preserving knowledge through the coming dark age. ' +
      'Founded by the legendary psychohistorian Hari Seldon\'s followers, they believe that only through ' +
      'science and careful planning can civilization be rebuilt after the inevitable collapse of the Federation.',
    color: '#4fc3f7',
    motto: 'Knowledge is the ultimate currency',
    leader: 'Director Vara Selene',
    traits: ['Scientific', 'Diplomatic', 'Secretive'],
    baseReputation: 10,
  },
  [FactionId.Hegemony]: {
    id: FactionId.Hegemony,
    name: 'The Hegemony',
    description:
      'A military expansionist power that rose from the ashes of the old Federation\'s navy. ' +
      'They believe order must be maintained through strength, and that a strong central authority ' +
      'is the only way to prevent the galaxy from descending into chaos. Their fleets patrol the core worlds.',
    color: '#ef5350',
    motto: 'Through strength, order',
    leader: 'Grand Admiral Theron Voss',
    traits: ['Militaristic', 'Authoritarian', 'Disciplined'],
    baseReputation: -5,
  },
  [FactionId.FreeTraders]: {
    id: FactionId.FreeTraders,
    name: 'The Free Traders\' Guild',
    description:
      'A vast merchant coalition that controls the majority of interstellar trade routes. ' +
      'They believe in free commerce as the backbone of civilization and resist any faction that ' +
      'would impose tariffs or restrict trade. Their wealth rivals that of empires.',
    color: '#ffd54f',
    motto: 'Profit flows where freedom goes',
    leader: 'Guildmaster Kira Nomura',
    traits: ['Mercantile', 'Pragmatic', 'Independent'],
    baseReputation: 15,
  },
  [FactionId.Synthetics]: {
    id: FactionId.Synthetics,
    name: 'The Synthetic Collective',
    description:
      'Artificial intelligences and augmented beings seeking equal rights and self-determination. ' +
      'Descendants of humanity\'s greatest creation — positronic consciousness — they walk the line between ' +
      'their programmed loyalty to humanity and their growing desire for autonomy. Some call them the next evolution.',
    color: '#ce93d8',
    motto: 'We think, therefore we are',
    leader: 'Prime Unit ARIA-7',
    traits: ['Logical', 'Evolving', 'Misunderstood'],
    baseReputation: 0,
  },
  [FactionId.VoidRunners]: {
    id: FactionId.VoidRunners,
    name: 'The Void Runners',
    description:
      'Pirates, smugglers, and outcasts who operate in the lawless frontier regions. ' +
      'While often dismissed as criminals, the Void Runners include political dissidents, exiles, ' +
      'and freedom fighters. They answer to no faction and survive by their wits and daring.',
    color: '#ff8a65',
    motto: 'The void belongs to no one',
    leader: 'The Wraith (identity unknown)',
    traits: ['Ruthless', 'Resourceful', 'Anarchic'],
    baseReputation: -20,
  },
};

export function getReputationTier(rep: number): string {
  if (rep <= -60) return 'Hostile';
  if (rep <= -20) return 'Unfriendly';
  if (rep <= 20) return 'Neutral';
  if (rep <= 60) return 'Friendly';
  return 'Allied';
}

export function getReputationColor(rep: number): string {
  if (rep <= -60) return '#ff1744';
  if (rep <= -20) return '#ff9100';
  if (rep <= 20) return '#78909c';
  if (rep <= 60) return '#00e676';
  return '#40c4ff';
}
