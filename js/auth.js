// ==================== ENCRIPTACIÓN ====================
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==================== LÓGICA DE LOGIN ====================
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');

function checkUser() {
  if (user && user.name) {
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    initChat();
  } else {
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
  }
}

loginBtn.addEventListener('click', async () => {
  const name = usernameInput.value.trim();
  const pass = passwordInput.value.trim();

  if (name.length < 2) return alert('El nombre debe tener al menos 2 letras.');
  if (pass.length < 4) return alert('La contraseña debe tener al menos 4 caracteres.');

  loginBtn.disabled = true;
  loginBtn.textContent = 'Verificando...';

  try {
    const hashedPass = await hashPassword(pass);
    const snapshot = await usersRef.orderByChild('name').equalTo(name).once('value');

    if (snapshot.exists()) {
      let isValid = false;
      let userId = null;

      snapshot.forEach(child => {
        if (child.val().password === hashedPass) {
          isValid = true;
          userId = child.key;
        }
      });

      if (isValid) {
        user = { id: userId, name: name };
        localStorage.setItem('brandon-user', JSON.stringify(user));
        welcomeScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
        initChat();
      } else {
        alert('Contraseña incorrecta. Intenta de nuevo.');
      }
    } else {
      const newUserRef = usersRef.push();
      await newUserRef.set({
        name: name,
        password: hashedPass,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      user = { id: newUserRef.key, name: name };
      localStorage.setItem('brandon-user', JSON.stringify(user));
      welcomeScreen.style.display = 'none';
      chatContainer.style.display = 'flex';
      initChat();
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión. Revisa tu internet.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Registrarse';
  }
});

passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});