// changeModal.js
export function changeModal(modalName, scrollContainer, duration = 500, isFlex = false) {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // targetモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById(`modal-${modalName}`).classList.remove('fade-out');
    if (isFlex) {
      document.getElementById(`modal-${modalName}`).style.display = 'flex';
    } else {
      document.getElementById(`modal-${modalName}`).style.display = 'block';
    }
    // スクロールをリセット
    if (scrollContainer) {
      document.querySelector(`${scrollContainer}`).scrollTop = 0;
    }
    document.getElementById(`modal-${modalName}`).classList.add('fade-in');
  }, duration);
}

// 上から重ねるタイプのmodal表示
export function showModal(modalName, scrollContainer) {
  document.getElementById(`modal-${modalName}`).style.display = 'block';
  document.getElementById(`modal-${modalName}`).style.zIndex = '100';
  document.getElementById(`modal-${modalName}`).classList.remove('fade-out');
  document.getElementById(`modal-${modalName}`).classList.add('fade-in');
  if (scrollContainer) {
    document.querySelector(`${scrollContainer}`).scrollTop = 0;
  }
}
export function closeModal(modalName) {
  document.getElementById(`modal-${modalName}`).classList.remove('fade-in');
  document.getElementById(`modal-${modalName}`).classList.add('fade-out');
  setTimeout(() => {
    document.getElementById(`modal-${modalName}`).style.display = 'none';
    document.getElementById(`modal-${modalName}`).style.zIndex = '0';
  }, 500);
}