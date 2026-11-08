// ==================== CHAT ====================
const chatMessages = document.getElementById('chatMessages');
const displayedIds = new Set();
let chatInitialized = false;

function initChat() {
  if (chatInitialized) return;
  chatInitialized = true;

  messagesRef.once('value', (snap) => {
    const msgs = [];
    snap.forEach(c => msgs.push({ id: c.key, ...c.val() }));
    msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    msgs.forEach(m => handleNewMessage(m.id, m));
  }).catch(err => console.error("Error cargando mensajes:", err));

  messagesRef.on('child_added', (s) => {
    if (!displayedIds.has(s.key)) handleNewMessage(s.key, s.val());
  });
}

function createMessageElement(id, msg) {
  const div = document.createElement('div');
  div.className = 'message ' + (msg.userId === user.id ? 'sent' : 'received');

  const nameDiv = document.createElement('div');
  nameDiv.className = 'message-username';
  nameDiv.textContent = msg.userName || 'Anónimo';
  div.appendChild(nameDiv);

  if (msg.text) {
    const t = document.createElement('div');
    t.className = 'message-text';
    t.textContent = msg.text;
    div.appendChild(t);
  }
  if (msg.imageUrl) {
    const c = document.createElement('div');
    c.className = 'message-image-container';
    const img = document.createElement('img');
    img.className = 'message-image';
    img.src = msg.imageUrl;
    img.onclick = () => window.open(msg.imageUrl, '_blank');
    c.appendChild(img);
    div.appendChild(c);
  }
  if (msg.audioUrl) {
    const c = document.createElement('div');
    c.className = 'message-audio-container';
    const a = document.createElement('audio');
    a.src = msg.audioUrl;
    a.controls = true;
    c.appendChild(a);
    div.appendChild(c);
  }
  return div;
}

function handleNewMessage(id, msg) {
  if (!id || !msg || displayedIds.has(id)) return;
  displayedIds.add(id);
  chatMessages.appendChild(createMessageElement(id, msg));
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}