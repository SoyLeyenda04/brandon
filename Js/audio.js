// ==================== GRABACIÓN DE AUDIO ====================
const messageInput = document.getElementById('messageInput');
const mainSendBtn = document.getElementById('mainSendBtn');
const sendIcon = document.getElementById('sendIcon');
const inputWrapper = document.getElementById('inputWrapper');
const cancelAudioBtn = document.getElementById('cancelAudioBtn');

let audioStream = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let isCanceling = false;
let timerInterval = null;
let seconds = 0;
let isUploading = false;

const iconSendHTML = `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`;
const iconStopHTML = `<rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>`;

async function startRecording() {
  if (isUploading) return;

  try {
    if (!audioStream) {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    mediaRecorder = new MediaRecorder(audioStream);
    audioChunks = [];
    isCanceling = false;

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };

    mediaRecorder.onstop = async () => {
      isRecording = false;
      clearInterval(timerInterval);
      mainSendBtn.classList.remove('recording');
      inputWrapper.classList.remove('recording');
      cancelAudioBtn.classList.remove('visible');
      sendIcon.innerHTML = iconSendHTML;
      messageInput.value = '';
      messageInput.placeholder = 'Escribe un mensaje...';
      messageInput.disabled = false;

      if (isCanceling) { isUploading = false; return; }

      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      isUploading = true;

      showUploadOverlay();
      try {
        const url = await uploadToCloudinary(blob, 'audio');
        await messagesRef.push({
          audioUrl: url,
          userId: user.id,
          userName: user.name,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });
      } catch (e) {
        alert('Error al enviar audio: ' + e);
      } finally {
        hideUploadOverlay();
        isUploading = false;
      }
    };

    mediaRecorder.start();
    isRecording = true;

    mainSendBtn.classList.add('recording');
    inputWrapper.classList.add('recording');
    cancelAudioBtn.classList.add('visible');
    sendIcon.innerHTML = iconStopHTML;
    messageInput.placeholder = 'Grabando...';
    messageInput.disabled = true;

    seconds = 0;
    messageInput.value = '00:00';

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      seconds++;
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      messageInput.value = `${m}:${s}`;
    }, 1000);

  } catch (err) {
    alert('Se necesita permiso del micrófono.');
  }
}

function stopRecording(send = true) {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    isCanceling = !send;
    mediaRecorder.stop();
  }
}

function stopAudioStream() {
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
}

function cancelRecording() {
  if (isRecording) stopRecording(false);
  stopAudioStream();
}

document.getElementById('micBtn').addEventListener('click', () => {
  document.getElementById('attachMenu').classList.remove('active');
  document.getElementById('attachToggleBtn').classList.remove('active');
  startRecording();
});

cancelAudioBtn.addEventListener('click', cancelRecording);

// Envío de texto / stop grabación
mainSendBtn.addEventListener('click', (e) => {
  if (isRecording) {
    stopRecording(true);
    stopAudioStream();
  } else {
    const text = messageInput.value.trim();
    if (text) {
      messagesRef.push({
        text: text,
        userId: user.id,
        userName: user.name,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      }).catch(err => alert("Error al enviar mensaje: " + err.message));
      messageInput.value = '';
    }
  }
});
