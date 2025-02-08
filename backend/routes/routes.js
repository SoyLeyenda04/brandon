const express = require('express');
const router = express.Router();

// Ejemplo de una ruta simple
router.get('/', (req, res) => {
    res.send('Hello, this is the main route!');
});

module.exports = router;
