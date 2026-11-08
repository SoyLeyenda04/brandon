// ==================== CÁMARA ====================
const camOverlay = document.getElementById('cameraOverlay');
const video = document.getElementById('cameraVideoElement');
const canvas = document.getElementById('cameraCanvas');
const previewResult = document.getElementById('cameraPreviewResult');
const cameraSwitchBtn = document.getElementById('cameraSwitchBtn');
const cameraFlashBtn = document.getElementById('cameraFlashBtn');

let camStream = null;
let camBlob = null;
let isFrontCamera = false;
let isFlashOn = false;

async function startCamera() {
  try {
    if (camStream) camStream.getTracks().forEach(t => t.stop());

    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: isFrontCamera ? 'user' : 'environment' }
    });
    video.srcObject = camStream;

    if (isFrontCamera) {
      video.style.transform = 'scaleX(-1)';
    } else {
      video.style.transform = 'none';
    }

    isFlashOn = false;
    cameraFlashBtn.classList.remove('flash-active');
  } catch (e) {
    alert('Error al acceder a la cámara. Verifica los permisos.');
  }
}

function stopCamera() {
  if (camStream) {
    camStream.getTracks().forEach(track => track.stop());
    camStream = null;
  }
  camOverlay.classList.remove('active');
}

document.getElementById('cameraBtn').addEventListener('click', () => {
  document.getElementById('attachMenu').classList.remove('active');
  document.getElementById('attachToggleBtn').classList.remove('active');

  camOverlay.classList.add('active');
  previewResult.style.display = 'none';
  video.style.display = 'block';
  document.getElementById('retakeBtn').style.display = 'none';
  document.getElementById('sendMediaBtn').style.display = 'none';
  document.getElementById('captureBtn').style.display = 'block';

  isFrontCamera = false;
  startCamera();
});

cameraSwitchBtn.addEventListener('click', () => {
  isFrontCamera = !isFrontCamera;
  startCamera();
});

cameraFlashBtn.addEventListener('click', async () => {
  if (!camStream) return;

  try {
    const track = camStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.torch) {
      isFlashOn = !isFlashOn;
      await track.applyConstraints({
        advanced: [{ torch: isFlashOn }]
      });

      if (isFlashOn) {
        cameraFlashBtn.classList.add('flash-active');
      } else {
        cameraFlashBtn.classList.remove('flash-active');
      }
    } else {
      alert('El flash no está disponible para esta cámara o dispositivo.');
    }
  } catch (err) {
    console.warn('Error al intentar encender el flash:', err);
  }
});

document.getElementById('captureBtn').addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  if (isFrontCamera) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    camBlob = blob;
    previewResult.src = URL.createObjectURL(blob);
    previewResult.style.display = 'block';
    video.style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'block';
    document.getElementById('sendMediaBtn').style.display = 'block';
    document.getElementById('captureBtn').style.display = 'none';

    if (isFlashOn) {
      const track = camStream.getVideoTracks()[0];
      track.applyConstraints({ advanced: [{ torch: false }] });
      cameraFlashBtn.classList.remove('flash-active');
      isFlashOn = false;
    }
  }, 'image/jpeg', 0.9);
});

document.getElementById('retakeBtn').addEventListener('click', () => {
  camBlob = null;
  previewResult.style.display = 'none';
  video.style.display = 'block';
  document.getElementById('retakeBtn').style.display = 'none';
  document.getElementById('sendMediaBtn').style.display = 'none';
  document.getElementById('captureBtn').style.display = 'block';
});

document.getElementById('sendMediaBtn').addEventListener('click', async () => {
  if (!camBlob) return;
  showUploadOverlay();
  try {
    const url = await uploadToCloudinary(camBlob, 'image');
    await messagesRef.push({
      imageUrl: url,
      userId: user.id,
      userName: user.name,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    stopCamera();
  } catch (e) {
    alert('Error al enviar: ' + e);
  } finally {
    hideUploadOverlay();
  }
});

document.getElementById('closeCameraBtn').addEventListener('click', stopCamera);