const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const mainRoutes = require('./routes/routes');

app.use(express.json());
app.use('/api/users', userRoutes); // Ruta para los usuarios
app.use('/', mainRoutes); // Ruta principal

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});