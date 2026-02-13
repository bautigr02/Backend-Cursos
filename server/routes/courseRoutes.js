const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/cursos', courseController.getCursos);
router.get('/cursos/:id', courseController.getCursoById);
router.post('/cursos', courseController.createCurso);
//router.delete('/cursos/:id', courseController.deleteCurso);
router.patch('/cursos/desactivar/:id', courseController.desactivarCurso);
router.put('/cursos/:id', courseController.putCurso);
router.patch('/cursos/:id', courseController.patchCurso);
router.patch('/cursos/estado/:id', courseController.cambiarEstadoCurso);

module.exports = router;