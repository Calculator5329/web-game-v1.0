import { makeAutoObservable } from 'mobx';
import type { Quest, DialogueNode, GameEvent, StoryConsequence } from '../core/types';
import { QuestStatus, FactionId } from '../core/types';
import { CHAPTERS } from '../data/story/chapters';
import { QUESTS } from '../data/story/quests';
import { RANDOM_EVENTS } from '../data/story/events';
import { randomChoice, randomChance } from '../services/RandomService';
import type { PlayerStore } from './PlayerStore';

export class StoryStore {
  currentChapter: number = 1;
  quests: Quest[] = [];
  completedEvents: string[] = [];
  activeDialogue: DialogueNode[] = [];
  currentDialogueIndex: number = 0;
  activeEvent: GameEvent | null = null;
  flags: Record<string, boolean | string | number> = {};

  private playerStore: PlayerStore;

  constructor(playerStore: PlayerStore) {
    makeAutoObservable(this);
    this.playerStore = playerStore;
  }

  init() {
    this.currentChapter = 1;
    this.quests = QUESTS.map(q => ({
      ...q,
      objectives: q.objectives.map(o => ({ ...o })),
    }));
    this.completedEvents = [];
    this.flags = {};

    this.quests
      .filter(q => q.chapter === 1 && q.status === QuestStatus.Available)
      .forEach(q => { q.status = QuestStatus.Active; });
  }

  loadState(state: { currentChapter: number; quests: Quest[]; flags: Record<string, boolean | string | number>; completedEvents: string[] }) {
    this.currentChapter = state.currentChapter;
    this.quests = state.quests;
    this.flags = state.flags;
    this.completedEvents = state.completedEvents;
  }

  get activeQuests(): Quest[] {
    return this.quests.filter(q => q.status === QuestStatus.Active);
  }

  get completedQuests(): Quest[] {
    return this.quests.filter(q => q.status === QuestStatus.Completed);
  }

  get currentChapterData() {
    return CHAPTERS.find(c => c.id === this.currentChapter);
  }

  get hasActiveDialogue(): boolean {
    return this.activeDialogue.length > 0 && this.currentDialogueIndex < this.activeDialogue.length;
  }

  get currentDialogueNode(): DialogueNode | null {
    if (!this.hasActiveDialogue) return null;
    return this.activeDialogue[this.currentDialogueIndex];
  }

  startChapterDialogue() {
    const chapter = this.currentChapterData;
    if (chapter && chapter.introDialogue.length > 0) {
      this.activeDialogue = chapter.introDialogue;
      this.currentDialogueIndex = 0;
    }
  }

  selectDialogueOption(optionId: string) {
    const node = this.currentDialogueNode;
    if (!node) return;

    const option = node.options.find(o => o.id === optionId);
    if (!option) return;

    if (option.consequences) {
      this.applyConsequences(option.consequences);
    }

    if (option.nextNodeId) {
      const nextIndex = this.activeDialogue.findIndex(n => n.id === option.nextNodeId);
      if (nextIndex >= 0) {
        this.currentDialogueIndex = nextIndex;
      } else {
        this.endDialogue();
      }
    } else {
      this.endDialogue();
    }
  }

  endDialogue() {
    this.activeDialogue = [];
    this.currentDialogueIndex = 0;
  }

  applyConsequences(consequences: StoryConsequence[]) {
    consequences.forEach(c => {
      switch (c.type) {
        case 'credits':
          this.playerStore.addCredits(c.value as number);
          break;
        case 'xp':
          this.playerStore.addXp(c.value as number);
          break;
        case 'reputation':
          if (c.target && typeof c.value === 'number') {
            this.playerStore.addReputation(c.target as FactionId, c.value);
          }
          break;
        case 'flag':
          if (c.target) {
            this.flags[c.target] = c.value;
            this.playerStore.setFlag(c.target, c.value);
          }
          break;
        case 'quest':
          if (typeof c.value === 'string') {
            this.activateQuest(c.value);
          }
          break;
      }
    });
  }

  activateQuest(questId: string) {
    const quest = this.quests.find(q => q.id === questId);
    if (quest && (quest.status === QuestStatus.Locked || quest.status === QuestStatus.Available)) {
      quest.status = QuestStatus.Active;
    }
  }

  updateQuestObjective(questId: string, objectiveId: string, progress: number = 1) {
    const quest = this.quests.find(q => q.id === questId && q.status === QuestStatus.Active);
    if (!quest) return;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.current = Math.min(objective.required, objective.current + progress);
    if (objective.current >= objective.required) {
      objective.completed = true;
    }

    if (quest.objectives.every(o => o.completed)) {
      this.completeQuest(questId);
    }
  }

  completeQuest(questId: string) {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return;

    quest.status = QuestStatus.Completed;
    this.applyConsequences(quest.rewards);
    this.playerStore.recordQuestComplete();

    this.checkChapterProgression();
  }

  checkChapterProgression() {
    const chapterFlag = `chapter_${this.currentChapter}_complete`;
    if (this.flags[chapterFlag] || this.playerStore.hasFlag(chapterFlag)) {
      const nextChapter = CHAPTERS.find(c => c.id === this.currentChapter + 1);
      if (nextChapter) {
        this.currentChapter = nextChapter.id;
        this.quests
          .filter(q => q.chapter === nextChapter.id && q.status === QuestStatus.Locked)
          .forEach(q => { q.status = QuestStatus.Active; });
      }
    }
  }

  onSystemVisited(systemId: string) {
    this.activeQuests.forEach(quest => {
      quest.objectives.forEach(obj => {
        if (obj.type === 'travel' && (obj.target === systemId || obj.target === 'any') && !obj.completed) {
          obj.current = Math.min(obj.required, obj.current + 1);
          if (obj.current >= obj.required) obj.completed = true;
        }
        if (obj.type === 'explore' && (obj.target === systemId || obj.target === 'new_systems') && !obj.completed) {
          obj.current = Math.min(obj.required, obj.current + 1);
          if (obj.current >= obj.required) obj.completed = true;
        }
      });
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(quest.id);
      }
    });
  }

  onTradeCompleted(credits: number) {
    this.activeQuests.forEach(quest => {
      quest.objectives.forEach(obj => {
        if (obj.type === 'trade' && obj.target === 'any' && !obj.completed) {
          obj.current = Math.min(obj.required, obj.current + 1);
          if (obj.current >= obj.required) obj.completed = true;
        }
        if (obj.type === 'trade' && obj.target === 'credits_500' && !obj.completed) {
          obj.current = Math.min(obj.required, obj.current + credits);
          if (obj.current >= obj.required) obj.completed = true;
        }
      });
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(quest.id);
      }
    });
  }

  onCombatWon() {
    this.activeQuests.forEach(quest => {
      quest.objectives.forEach(obj => {
        if (obj.type === 'combat' && !obj.completed) {
          obj.current = Math.min(obj.required, obj.current + 1);
          if (obj.current >= obj.required) obj.completed = true;
        }
      });
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(quest.id);
      }
    });
  }

  tryRandomEvent(dangerLevel: number): GameEvent | null {
    if (this.activeEvent) return null;
    if (!randomChance(0.35)) return null;

    const available = RANDOM_EVENTS.filter(e => {
      if (this.completedEvents.includes(e.id)) return false;
      if (e.condition?.minDanger && dangerLevel < e.condition.minDanger) return false;
      if (e.condition?.maxDanger && dangerLevel > e.condition.maxDanger) return false;
      return true;
    });

    if (available.length === 0) return null;
    this.activeEvent = randomChoice(available);
    return this.activeEvent;
  }

  resolveEvent(choiceIndex: number) {
    if (!this.activeEvent) return null;
    const choice = this.activeEvent.choices[choiceIndex];
    if (!choice) return null;

    this.applyConsequences(choice.consequences);
    this.completedEvents.push(this.activeEvent.id);
    const outcome = choice.outcome;
    this.activeEvent = null;
    return outcome;
  }
}
