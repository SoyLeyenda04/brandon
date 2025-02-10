document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;
    
    // Simulate login process
    if (loginEmail === "user@example.com" && loginPassword === "password") {
        alert('Inicio de sesión exitoso');
    } else {
        alert('Correo electrónico o contraseña incorrectos');
    }
});
