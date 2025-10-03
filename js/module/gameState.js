// gameState.js
const initialState = {
  round: 1,
  difficulty: 'easy',
  easyStageEnemy: [],
  forStats: {
    bossName: '',
    totalTurns: 0,
    totalDamage: 0,
  },
  player: {
    hp: 1,
    maxHp: 50,
    shield: 0,
    damageReduction: 0,
    attack: 0,
    reduceSkillPoint: 0,
    maxSkillPoint: 10,
    rerollCount: 2,
    skills: ['hanten', 'mishoji'],
    skillsPoint: 0,
    isAllAttack: false,
    items: [],
  },
  enemies: {
    1: {
      id: 1,
      hp: 10,
      attack: 10,
      attackInThisTurn: 0,
    },
    2: {
      id: 12,
      hp: 10,
      attack: 10,
      attackInThisTurn: 0,
    }
  }
};

export const globalGameState = structuredClone(initialState); // 初期化

export function resetGlobalState() {
  const freshState = structuredClone(initialState);
  Object.keys(freshState).forEach((key) => {
    globalGameState[key] = freshState[key];
  });
}

export function setGlobalGameState(newState) {
  Object.keys(newState).forEach((key) => {
    globalGameState[key] = newState[key];
  });
}