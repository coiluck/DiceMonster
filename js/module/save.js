// save.js
export function isContinueGame() {
  // Topで「続きから」ボタンを表示するかどうかをjudge!
  const savedData = localStorage.getItem('gameData');

  if (!savedData) {
    return null;
  }

  try {
    // JSON文字列をオブジェクトにパースし、その結果を返す
    const gameData = JSON.parse(savedData);
    return gameData;
  } catch (e) {
    console.error('ゲームデータの読み込み（パース）に失敗しました。', e);
    // 失敗した場合もnullを返す
    return null;
  }
}