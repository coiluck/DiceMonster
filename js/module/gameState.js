// gameState.js
const initialState = {
  round: 0,
  difficulty: 'easy',
  easyStageEnemy: [],
  player: {
    hp: 50,
    maxHp: 50,
    shield: 0,
    damageReduction: 0,
    attack: 0,
    rerollCount: 2,
    skills: ['turn', 'round'],
    skillsPoint: 0,
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