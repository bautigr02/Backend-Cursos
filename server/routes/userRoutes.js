const express = require('express');
const router = express.Router();
const {createAlumno} = require('../controllers/userController');
const { loginAlumno } = require('../controllers/userController');
const {updateAlumno} = require('../controllers/userController');
const { updateAlumnoPatch } = require('../controllers/userController');
const { getAlumnoByDni } = require('../controllers/userController');
const { deleteAlumno } = require('../controllers/userController');
const { getCursosByAlumno } = require('../controllers/userController');
const { getTalleresByAlumno } = require('../controllers/userController');


router.post('/login', loginAlumno);
router.post('/alumno', createAlumno);
router.put('/alumno/:dni', updateAlumno);
router.patch('/alumno/:dni', updateAlumnoPatch);
router.get('/alumno/:dni', getAlumnoByDni);
router.delete('/alumno/:dni', deleteAlumno);
router.get('/alumno/:dni/cursos', getCursosByAlumno);
router.get('/alumno/:dni/talleres', getTalleresByAlumno);

module.exports = router;