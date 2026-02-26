import { type Quest, QuestStatus } from '../../core/types';

export const QUESTS: Quest[] = [
  // Chapter 1
  {
    id: 'q_first_steps',
    title: 'First Steps',
    description: 'Get your bearings in the galaxy. Visit a trade post, make some credits, and prepare for the journey ahead.',
    chapter: 1,
    status: QuestStatus.Available,
    objectives: [
      { id: 'fs_1', description: 'Visit any star system', type: 'travel', target: 'any', current: 0, required: 1, completed: false },
      { id: 'fs_2', description: 'Complete a trade (buy or sell goods)', type: 'trade', target: 'any', current: 0, required: 1, completed: false },
      { id: 'fs_3', description: 'Earn 500 credits', type: 'trade', target: 'credits_500', current: 0, required: 500, completed: false },
    ],
    rewards: [
      { type: 'credits', value: 200 },
      { type: 'xp', value: 50 },
    ],
    isMain: true,
  },
  {
    id: 'q_follow_signal',
    title: 'Follow the Signal',
    description: 'The mysterious signal leads toward the frontier. Explore at least 3 new systems and reach the Observatory.',
    chapter: 1,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'fsg_1', description: 'Explore 3 new star systems', type: 'explore', target: 'new_systems', current: 0, required: 3, completed: false },
      { id: 'fsg_2', description: 'Reach the Observatory system', type: 'travel', target: 'observatory', current: 0, required: 1, completed: false },
    ],
    rewards: [
      { type: 'credits', value: 500 },
      { type: 'xp', value: 100 },
      { type: 'flag', target: 'chapter_1_complete', value: true },
    ],
    isMain: true,
  },
  // Chapter 2
  {
    id: 'q_meet_foundation',
    title: 'The Scholars\' Request',
    description: 'Director Selene of the Foundation wishes to meet you at Sol Tertius. She may know more about the signal.',
    chapter: 2,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'mf_1', description: 'Travel to Sol Tertius', type: 'travel', target: 'sol_tertius', current: 0, required: 1, completed: false },
      { id: 'mf_2', description: 'Speak with Director Selene', type: 'dialogue', target: 'selene_meeting', current: 0, required: 1, completed: false },
    ],
    rewards: [
      { type: 'reputation', target: 'foundation', value: 10 },
      { type: 'xp', value: 100 },
    ],
    isMain: true,
  },
  {
    id: 'q_deep_archive',
    title: 'Into the Archive',
    description: 'Investigate the Deep Archive, an ancient Architect facility that has begun transmitting after a million years of silence.',
    chapter: 2,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'da_1', description: 'Discover the Deep Archive system', type: 'explore', target: 'deep_archive', current: 0, required: 1, completed: false },
      { id: 'da_2', description: 'Survive the automated defenses (win combat)', type: 'combat', target: 'archive_guardian', current: 0, required: 1, completed: false },
      { id: 'da_3', description: 'Retrieve the Architect data core', type: 'explore', target: 'data_core', current: 0, required: 1, completed: false },
    ],
    rewards: [
      { type: 'credits', value: 1000 },
      { type: 'xp', value: 200 },
      { type: 'flag', target: 'chapter_2_complete', value: true },
    ],
    isMain: true,
  },
  // Chapter 3
  {
    id: 'q_synthetic_contact',
    title: 'Machine Minds',
    description: 'The Synthetic Collective has reached out. ARIA-7 claims to understand the signal. Meet them at Crystallis.',
    chapter: 3,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'sc_1', description: 'Travel to Crystallis', type: 'travel', target: 'crystallis', current: 0, required: 1, completed: false },
      { id: 'sc_2', description: 'Speak with ARIA-7', type: 'dialogue', target: 'aria7_meeting', current: 0, required: 1, completed: false },
    ],
    rewards: [
      { type: 'reputation', target: 'synthetics', value: 15 },
      { type: 'xp', value: 150 },
    ],
    isMain: true,
  },
  {
    id: 'q_protect_gates',
    title: 'Guardians of the Gate',
    description: 'The Hegemony\'s weapons tests threaten the Architect gate network. Find evidence and decide how to act.',
    chapter: 3,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'pg_1', description: 'Gather evidence at Sentinel', type: 'explore', target: 'sentinel', current: 0, required: 1, completed: false },
      { id: 'pg_2', description: 'Win 3 combat encounters', type: 'combat', target: 'any', current: 0, required: 3, completed: false },
    ],
    rewards: [
      { type: 'credits', value: 1500 },
      { type: 'xp', value: 250 },
      { type: 'flag', target: 'chapter_3_complete', value: true },
    ],
    isMain: true,
  },
  // Chapter 4
  {
    id: 'q_faction_war',
    title: 'The Gathering Storm',
    description: 'Factions mobilize for war. Build alliances and prepare for the conflict to come.',
    chapter: 4,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'fw_1', description: 'Reach Friendly reputation with any faction', type: 'dialogue', target: 'friendly_rep', current: 0, required: 1, completed: false },
      { id: 'fw_2', description: 'Complete 5 trades', type: 'trade', target: 'any', current: 0, required: 5, completed: false },
      { id: 'fw_3', description: 'Explore Architect\'s Rest', type: 'explore', target: 'architects_rest', current: 0, required: 1, completed: false },
    ],
    rewards: [
      { type: 'credits', value: 2000 },
      { type: 'xp', value: 300 },
      { type: 'flag', target: 'chapter_4_complete', value: true },
    ],
    isMain: true,
  },
  {
    id: 'q_architects_rest',
    title: 'City of the Ancients',
    description: 'The ruins at Architect\'s Rest hold the key to understanding the Architects\' transcendence.',
    chapter: 4,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'ar_1', description: 'Discover Architect\'s Rest', type: 'explore', target: 'architects_rest', current: 0, required: 1, completed: false },
      { id: 'ar_2', description: 'Survive the Watcher\'s trial (win combat)', type: 'combat', target: 'watcher', current: 0, required: 1, completed: false },
    ],
    rewards: [
      { type: 'xp', value: 400 },
      { type: 'flag', target: 'architect_truth_known', value: true },
    ],
    isMain: true,
  },
  // Chapter 5
  {
    id: 'q_final_choice',
    title: 'Convergence',
    description: 'All roads lead to Terminus. The galaxy\'s fate rests on your choices.',
    chapter: 5,
    status: QuestStatus.Locked,
    objectives: [
      { id: 'fc_1', description: 'Reach Terminus', type: 'travel', target: 'terminus', current: 0, required: 1, completed: false },
      { id: 'fc_2', description: 'Make the final choice', type: 'dialogue', target: 'final_decision', current: 0, required: 1, completed: false },
    ],
    rewards: [
      { type: 'xp', value: 1000 },
      { type: 'flag', target: 'game_complete', value: true },
    ],
    isMain: true,
  },
];
