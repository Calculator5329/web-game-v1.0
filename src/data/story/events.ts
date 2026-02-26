import { type GameEvent } from '../../core/types';

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'evt_distress_signal',
    title: 'Distress Signal',
    description: 'Your sensors pick up a distress signal from a nearby vessel. The ship appears to be venting atmosphere — they don\'t have much time.',
    type: 'distress',
    choices: [
      {
        text: 'Respond to the distress call and attempt a rescue.',
        consequences: [
          { type: 'credits', value: -50 },
          { type: 'xp', value: 30 },
          { type: 'reputation', target: 'foundation', value: 5 },
        ],
        outcome: 'You save the crew of a Foundation research vessel. The grateful scientists transfer some credits and share navigational data. Your reputation with the Foundation improves.',
      },
      {
        text: 'Scan for valuables first, then decide.',
        consequences: [
          { type: 'credits', value: 100 },
          { type: 'reputation', target: 'foundation', value: -3 },
        ],
        outcome: 'You salvage some valuable components from the wreckage. By the time you consider rescue, the survivors have already been picked up by another ship. Word gets around about your priorities.',
      },
      {
        text: 'It could be a trap. Continue on your course.',
        consequences: [
          { type: 'reputation', target: 'void_runners', value: 3 },
        ],
        outcome: 'You fly on, and your caution proves wise — or does it? You\'ll never know if those people survived. In the frontier, paranoia and pragmatism are often indistinguishable.',
      },
    ],
  },
  {
    id: 'evt_derelict_ship',
    title: 'Derelict Vessel',
    description: 'A massive derelict ship drifts silently in the void. Its hull bears scorch marks from weapons fire, and its markings belong to no known faction. The ship is old — very old.',
    type: 'discovery',
    choices: [
      {
        text: 'Board the derelict and search for salvage.',
        consequences: [
          { type: 'credits', value: 200 },
          { type: 'xp', value: 40 },
        ],
        outcome: 'You find valuable pre-Federation technology in the cargo hold. The ship\'s logs hint at a civilization that existed between the Architects and humanity. Fascinating — and profitable.',
      },
      {
        text: 'Scan it remotely. No need to risk a boarding.',
        consequences: [
          { type: 'xp', value: 20 },
        ],
        outcome: 'Your scans reveal unusual alloy compositions and energy signatures. You log the coordinates for future investigation and move on.',
      },
      {
        text: 'Leave it. Dead ships carry dead luck.',
        consequences: [],
        outcome: 'Old spacer superstitions have kept many a captain alive. You give the derelict a wide berth and continue on your way.',
      },
    ],
  },
  {
    id: 'evt_pirate_ambush',
    title: 'Pirate Ambush',
    description: 'Three ships drop out of warp directly in your path, weapons hot. A grizzled voice crackles over your comm: "Hand over your cargo and credits, and you might live to regret it."',
    type: 'encounter',
    condition: { minDanger: 4 },
    choices: [
      {
        text: 'Power up weapons. They picked the wrong ship.',
        consequences: [
          { type: 'xp', value: 50 },
          { type: 'reputation', target: 'void_runners', value: -5 },
        ],
        outcome: 'You engage the pirates in combat! Your weapons light up the void as you fight for survival.',
      },
      {
        text: 'Negotiate. Offer them a small portion of your cargo.',
        consequences: [
          { type: 'credits', value: -150 },
          { type: 'reputation', target: 'void_runners', value: 3 },
        ],
        outcome: 'The pirate captain considers your offer and accepts. "Smart choice, spacer. Maybe we\'ll do business again." They take some of your goods and vanish into the dark.',
      },
      {
        text: 'Full power to engines — try to outrun them.',
        consequences: [
          { type: 'xp', value: 20 },
        ],
        outcome: 'Your engines scream as you push them to the limit. After a tense chase through an asteroid field, you manage to lose your pursuers. Your hull took some scrapes, but you\'re alive.',
      },
    ],
  },
  {
    id: 'evt_anomaly',
    title: 'Spatial Anomaly',
    description: 'Your instruments go haywire as you pass through a region of distorted spacetime. Colors shift, and for a moment, you swear you can see the curve of the universe itself. An Architect gate fragment floats nearby, still crackling with residual energy.',
    type: 'anomaly',
    choices: [
      {
        text: 'Approach the gate fragment and attempt to interface with it.',
        consequences: [
          { type: 'xp', value: 80 },
          { type: 'reputation', target: 'synthetics', value: 5 },
        ],
        outcome: 'The fragment responds to your ship\'s proximity, flooding your computers with data in an alien language. Your AI begins translating — it will take time, but this could be incredibly valuable.',
      },
      {
        text: 'Collect the fragment for later study or sale.',
        consequences: [
          { type: 'credits', value: 300 },
          { type: 'xp', value: 30 },
        ],
        outcome: 'You carefully tractor the fragment into your cargo bay. Architect artifacts fetch enormous prices from collectors and researchers alike.',
      },
      {
        text: 'Document everything but don\'t touch it. Architect tech is unpredictable.',
        consequences: [
          { type: 'xp', value: 40 },
          { type: 'reputation', target: 'foundation', value: 5 },
        ],
        outcome: 'You record detailed sensor readings and move on. Sometimes wisdom is knowing what not to touch. The Foundation will appreciate your thoroughness.',
      },
    ],
  },
  {
    id: 'evt_trader_convoy',
    title: 'Merchant Convoy',
    description: 'A Free Traders\' Guild convoy hails you as you pass. Their lead ship offers to share market intelligence in exchange for escort through a dangerous stretch of space.',
    type: 'encounter',
    choices: [
      {
        text: 'Accept the escort mission.',
        consequences: [
          { type: 'credits', value: 250 },
          { type: 'xp', value: 35 },
          { type: 'reputation', target: 'free_traders', value: 8 },
        ],
        outcome: 'You escort the convoy safely through pirate territory. The grateful merchants share detailed price information for nearby markets and pay you handsomely.',
      },
      {
        text: 'Decline politely. You have your own course to follow.',
        consequences: [
          { type: 'reputation', target: 'free_traders', value: -2 },
        ],
        outcome: 'The convoy master nods curtly. "Your loss, Captain." They adjust course and disappear into the void. You hope they make it through safely.',
      },
    ],
  },
  {
    id: 'evt_nebula_storm',
    title: 'Ion Storm',
    description: 'Violent electromagnetic discharges erupt from a nearby nebula, buffeting your ship. Your shields flare as they absorb the energy. Amid the chaos, your sensors detect something unusual inside the storm.',
    type: 'anomaly',
    choices: [
      {
        text: 'Navigate into the storm to investigate.',
        consequences: [
          { type: 'xp', value: 60 },
          { type: 'credits', value: 150 },
        ],
        outcome: 'Fighting through the turbulence, you discover a pocket of calm at the storm\'s center containing rare ionized minerals. Your cargo bay fills with valuable materials.',
      },
      {
        text: 'Ride out the storm at a safe distance.',
        consequences: [
          { type: 'xp', value: 10 },
        ],
        outcome: 'You wait patiently as the storm subsides. Your ship\'s systems return to normal, and you continue on your way — perhaps a little wiser about the dangers of deep space.',
      },
    ],
  },
  {
    id: 'evt_refugee_ship',
    title: 'Refugees',
    description: 'A overcrowded transport ship limps along on failing engines. Refugees from a system ravaged by the faction wars plead for help. Their children press their faces against the viewports.',
    type: 'distress',
    choices: [
      {
        text: 'Share your fuel and supplies to help them reach safety.',
        consequences: [
          { type: 'credits', value: -200 },
          { type: 'xp', value: 50 },
          { type: 'reputation', target: 'foundation', value: 10 },
          { type: 'reputation', target: 'free_traders', value: 5 },
        ],
        outcome: 'You transfer fuel and medical supplies. A tearful elder blesses your ship and gives you a data chip — coordinates to a hidden system, passed down through generations.',
      },
      {
        text: 'Provide what you can spare without compromising your mission.',
        consequences: [
          { type: 'credits', value: -50 },
          { type: 'xp', value: 25 },
          { type: 'reputation', target: 'foundation', value: 3 },
        ],
        outcome: 'You share some rations and patch their life support system. It\'s not much, but it might be enough to get them to the next station.',
      },
      {
        text: 'You can\'t save everyone. Move on.',
        consequences: [
          { type: 'reputation', target: 'foundation', value: -5 },
          { type: 'reputation', target: 'hegemony', value: 3 },
        ],
        outcome: 'You tell yourself there was nothing you could do. The image of those children\'s faces stays with you for a long time.',
      },
    ],
  },
  {
    id: 'evt_hegemony_patrol',
    title: 'Hegemony Patrol',
    description: 'A Hegemony patrol cruiser drops out of warp and demands to inspect your cargo. "Standard procedure, civilian. Power down weapons and prepare for boarding."',
    type: 'encounter',
    condition: { faction: 'hegemony' as never },
    choices: [
      {
        text: 'Comply with the inspection.',
        consequences: [
          { type: 'reputation', target: 'hegemony', value: 5 },
        ],
        outcome: 'The Hegemony officers are thorough but professional. Finding nothing illegal, they let you go with a curt nod. "Carry on, citizen."',
      },
      {
        text: 'Challenge their authority. This is neutral space.',
        consequences: [
          { type: 'reputation', target: 'hegemony', value: -10 },
          { type: 'reputation', target: 'free_traders', value: 5 },
          { type: 'xp', value: 20 },
        ],
        outcome: 'The patrol captain\'s face darkens. "We\'ll remember this, Captain." They power up weapons briefly, then think better of it and jump away. You\'ve made your point — and an enemy.',
      },
    ],
  },
];
