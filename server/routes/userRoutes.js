const express = require('express');
const router = express.Router();
const {createAlumno} = require('../controllers/userController');
const { loginAlumno } = require('../controllers/userController');

router.post('/login', loginAlumno);
router.post('/alumno', createAlumno);

module.exports = router;