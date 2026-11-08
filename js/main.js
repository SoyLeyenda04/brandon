// ==================== UI GENERAL ====================
const attachMenu = document.getElementById('attachMenu');
const attachToggleBtn = document.getElementById('attachToggleBtn');

attachToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  attachMenu.classList.toggle('active');
  attachToggleBtn.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (attachMenu.classList.contains('active') && !attachMenu.contains(e.target) && e.target !== attachToggleBtn) {
    attachMenu.classList.remove('active');
    attachToggleBtn.classList.remove('active');
  }
});

// ==================== DETECCIÓN DE CAMBIO DE PESTAÑA ====================
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (typeof isRecording !== 'undefined' && isRecording) cancelRecording();
    if (camOverlay.classList.contains('active')) stopCamera();
  }
});

// ==================== INICIO ====================
checkUser();