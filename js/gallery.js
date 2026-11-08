// ==================== GALERÍA ====================
const imageModal = document.getElementById('imagePreviewModal');
let selectedImage = null;

document.getElementById('galleryBtn').addEventListener('click', () => {
  document.getElementById('attachMenu').classList.remove('active');
  document.getElementById('attachToggleBtn').classList.remove('active');
  document.getElementById('realFileInput').click();
});

document.getElementById('realFileInput').addEventListener('change', (e) => {
  if (!e.target.files[0]) return;
  selectedImage = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('preview').src = ev.target.result;
    imageModal.classList.add('active');
  };
  reader.readAsDataURL(selectedImage);
});

function closeImageModal() {
  imageModal.classList.remove('active');
  selectedImage = null;
  document.getElementById('realFileInput').value = '';
  document.getElementById('imageCaption').value = '';
}
document.getElementById('cancelImageBtn').addEventListener('click', closeImageModal);
document.getElementById('cancelImageBtn2').addEventListener('click', closeImageModal);

document.getElementById('sendImageBtn').addEventListener('click', async () => {
  if (!selectedImage) return;
  showUploadOverlay();
  try {
    const url = await uploadToCloudinary(selectedImage, 'image');
    const caption = document.getElementById('imageCaption').value.trim();
    const payload = {
      imageUrl: url,
      userId: user.id,
      userName: user.name,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    if (caption) payload.text = caption;

    await messagesRef.push(payload);
    closeImageModal();
  } catch (e) {
    alert('Error al enviar imagen: ' + e);
  } finally {
    hideUploadOverlay();
  }
});