// ==================== CLOUDINARY ====================
async function uploadToCloudinary(blob, type) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', blob);
    fd.append('upload_preset', 'chat_images');
    fd.append('cloud_name', 'dymmyqlfw');
    if (type === 'audio') fd.append('folder', 'chat-brandon-audio');
    else fd.append('folder', 'chat-brandon-camera');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dymmyqlfw/upload');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const p = Math.round((e.loaded / e.total) * 100);
        document.getElementById('uploadBar').style.width = p + '%';
        document.getElementById('uploadPercentage').textContent = p + '%';
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url || data.url);
      } else {
        reject('Error al subir a Cloudinary');
      }
    };
    xhr.onerror = () => reject('Error de red');
    xhr.send(fd);
  });
}

function showUploadOverlay() {
  document.getElementById('uploadOverlay').classList.add('active');
  document.getElementById('uploadBar').style.width = '0%';
  document.getElementById('uploadPercentage').textContent = '0%';
}

function hideUploadOverlay() {
  document.getElementById('uploadOverlay').classList.remove('active');
}