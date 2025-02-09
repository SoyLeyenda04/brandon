const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {}; // Almacenará los perfiles de los usuarios

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta para crear un nuevo usuario
app.post('/users', (req, res) => {
    const { username, email } = req.body;
    if (users[username]) {
        return res.status(400).json({ error: "Username already exists" });
    }
    users[username] = { username, email };
    res.json({ success: true, user: users[username] });
});

// Ruta para obtener el perfil del usuario
app.get('/users/:username', (req, res) => {
    const username = req.params.username;
    if (users[username]) {
        res.json(users[username]);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Manejar conexiones de socket
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('private message', ({ to, message }) => {
        if (users[to]) {
            io.to(users[to].socketId).emit('private message', { from: socket.username, message });
        }
    });

    socket.on('register', (username) => {
        if (users[username]) {
            users[username].socketId = socket.id;
        } else {
            users[username] = { username, socketId: socket.id };
        }
        socket.username = username;
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        if (socket.username && users[socket.username]) {
            users[socket.username].socketId = null;
        }
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
