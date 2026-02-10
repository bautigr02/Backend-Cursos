const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;
const TeacherRepository = require('../repositories/teacherRepository');

//Obtener docente a partir del login
const loginDocente = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const resultado = await TeacherRepository.loginDocente(identifier);
    if (!resultado) {
      return res.status(400).json({ error: 'Docente no encontrado' });
    }
    if (resultado.contrasena !== password) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const payload = { dni: resultado.dni, email: resultado.email, nombre: resultado.nombre };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '30m' });
    res.status(200).json({ message: 'Login exitoso',
      token,
      user: { dni: resultado.dni,
      nombre: resultado.nombre,
      apellido: resultado.apellido,
      telefono: resultado.telefono,
      direccion: resultado.direccion,
      email: resultado.email,
      rol: 'docente',
      }
     });
  }catch (error) {
    console.error('Error al verificar las credenciales:', error);
    return res.status(500).json({ error: 'Error al verificar las credenciales' });
  }
};

// GET ALL
const getDocentes = async (req, res) => {
  try {
   const resultado = await TeacherRepository.getDocentes();
   if (!resultado || resultado.length === 0) {
    return res.status(400).json({ error: 'No se encontraron docentes' });
  }
    console.log('Docentes obtenidos correctamente');
    return res.status(200).json(resultado);
  }catch (error) {
    console.error('Error al obtener docentes:', error);
    return res.status(500).json({ error: 'Error al obtener los docentes' });
  }
};

// GET BY dni
const getDocenteByDni = async (req, res) => {
  const { dni } = req.params;
  try{
    const resultado = await TeacherRepository.getDocenteByDni(dni);
    if (!resultado) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    console.log('Docente obtenido correctamente por DNI');
    return res.status(200).json(resultado);
  }catch (error) {
    console.error('Error al obtener docente por DNI:', error);
    return res.status(500).json({ error: 'Error al obtener el docente' });
  }
};

// CREATE docente
const createDocente = async (req, res) => {
  const { dni, nombre, apellido, telefono, direccion, email, contrasena } = req.body;
  if (!dni || !nombre || !apellido || !telefono || !direccion || !email || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const existingDocente = await TeacherRepository.getDocenteByDni(dni);
    if (existingDocente) {
      return res.status(400).json({ error: 'Ya existe un docente con ese DNI' });
    }
    const existingEmail = await TeacherRepository.loginDocente(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Ya existe un docente con ese email' });
    }

    const resultado = await TeacherRepository.createDocente({ dni, nombre, apellido, telefono, direccion, email, contrasena });
    if (!resultado) {
      return res.status(400).json({ error: 'Error al crear el docente' });
    }
    console.log('Docente creado correctamente');
    return res.status(201).json({ message: 'Docente creado correctamente', dni: resultado });
  }catch (error) {
    console.error('Error al crear docente:', error);
    return res.status(500).json({ error: 'Error al crear el docente' });
  }
};

// DELETE docente by dni
const deleteDocenteByDni = async (req, res) => {
  const { dni } = req.params;
  try {
    const resultado = await TeacherRepository.deleteDocenteByDni(dni);
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    console.log('Docente eliminado correctamente');
    return res.status(200).json({ message: 'Docente eliminado correctamente' });
  }catch (error) {
    console.error('Error al eliminar docente:', error);
    return res.status(500).json({ error: 'Error al eliminar el docente' });
  }
};

// Actualizar datos del docente por DNI
const updateDocente = async (req, res) => {
  const dni = req.params.dni;
  const { direccion, email, telefono, contrasena } = req.body;

  if (!direccion || !email || !telefono || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try{
    const resultado = await TeacherRepository.updateDocente(dni, { direccion, email, telefono, contrasena });
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    console.log('Docente actualizado correctamente');
    return res.status(200).json({ message: 'Docente actualizado correctamente' });
  }catch (error) {
    console.error('Error al actualizar docente:', error);
    return res.status(500).json({ error: 'Error al actualizar el docente' });
  }
};

// Actualizar datos del alumno - patch
const updateDocentePatch = async (req, res) => {
  const dni = req.params.dni;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  try {
    const resultado = await TeacherRepository.updateDocentePatch(dni, campos);
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    console.log('Docente actualizado correctamente');
    return res.status(200).json({ message: 'Docente actualizado correctamente' });
  }catch (error) {
    console.error('Error al actualizar docente:', error);
    return res.status(500).json({ error: 'Error al actualizar el docente' });

  }
};

//get all courses by docente dni
const getCoursesByDocenteDni = async (req, res) => {
  const { dni } = req.params;
  try {
    const resultado = await TeacherRepository.getCoursesByDocenteDni(dni);
    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'No se encontraron cursos para el docente' });
    }
    console.log('Cursos obtenidos correctamente por DNI del docente');
    return res.status(200).json(resultado);
  } catch(error) {
    console.error('Error al obtener cursos por DNI del docente:', error);
    return res.status(500).json({ error: 'Error al obtener los cursos' });
  }
};

//get all talleres by curso id
const getTalleresByCursoId = async (req, res) => {
  const {idcurso} = req.params;
  try {
    const resultado = await TeacherRepository.getTalleresByCursoId(idcurso);
    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'No se encontraron talleres para el curso' });
    }
    console.log('Talleres obtenidos correctamente por ID de curso');
    return res.status(200).json(resultado);
  }catch (error) {
    console.error('Error al obtener talleres por ID de curso:', error);
    return res.status(500).json({ error: 'Error al obtener los talleres' });
  }
};

//get alumnos from inscripcion_curso by curso id
const getAlumnosByCursoId = async (req, res) => {
  const { idcurso } = req.params;
  try {
    const resultado = await TeacherRepository.getAlumnosByCursoId(idcurso);
    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'No se encontraron alumnos para el curso' });
    }
    console.log('Alumnos obtenidos correctamente por ID de curso');
    return res.status(200).json(resultado);
  }catch (error) {
    console.error('Error al obtener alumnos por ID de curso:', error);
    return res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
};

//get alumnos from inscripcion_taller by taller id
const getAlumnosByTallerId = async (req, res) => {
  const { idtaller } = req.params;
  try {
    const resultado = await TeacherRepository.getAlumnosByTallerId(idtaller);
    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'No se encontraron alumnos para el taller' });
    }
    console.log('Alumnos obtenidos correctamente por ID de taller');
    return res.status(200).json(resultado);
  }catch (error) {
    console.error('Error al obtener alumnos por ID de taller:', error);
    return res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
};

//insert calification of an student into inscripcion_Taller
const insertNotaAlumno = async (req, res) => {
  const {idtaller, dni} = req.params;
  const {notaTaller} = req.body;

  if (isNaN(notaTaller) || notaTaller < 0 || notaTaller > 10){
    return res.status(400).json({ error: 'La nota debe ser un número entre 0 y 10' });
  }

  try {
    const resultado = await TeacherRepository.insertNotaAlumno({ dni, notaTaller, idtaller });
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(400).json({ error: 'Error al insertar la nota del alumno' });
    }
    console.log('Nota del alumno insertada correctamente');
    return res.status(200).json({ message: 'Nota del alumno insertada correctamente' });
  }catch(error) {
    console.error('Error al insertar nota del alumno:', error);
    return res.status(500).json({ error: 'Error al insertar la nota del alumno' });
  }
}; 

//get all califications of a student in a course
const getNotasByAlumnoInCurso = async (req, res) => {
  const { dni, idcurso } = req.params;
  try {
    const resultado = await TeacherRepository.getNotasByAlumnoInCurso(dni, idcurso);
    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'No se encontraron notas para el alumno en el curso' });
    }
    console.log('Notas del alumno obtenidas correctamente por ID de curso');
    return res.status(200).json(resultado);
  }catch (error) {
    console.error('Error al obtener notas del alumno por ID de curso:', error);
    return res.status(500).json({ error: 'Error al obtener las notas del alumno' });
  }
};

// insert calification of a student into inscripcion_Curso
const insertNotaCursoAlumno = async (req, res) => {
  const { idcurso } = req.params;  
  const { dni, notaCurso } = req.body;
  if (isNaN(notaCurso) || notaCurso < 0 || notaCurso > 10){
    return res.status(400).json({ error: 'La nota debe ser un número entre 0 y 10' });
  }
  try {
    const resultado = await TeacherRepository.insertNotaCursoAlumno({ dni, notaCurso, idcurso });
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Error al insertar la nota del alumno en el curso' });
    }
    console.log('Nota del alumno en el curso insertada correctamente');
    return res.status(200).json({ message: 'Nota del alumno en el curso insertada correctamente' });
  }catch(error) {
    console.error('Error al insertar nota del alumno en el curso:', error);
    return res.status(500).json({ error: 'Error al insertar la nota del alumno en el curso' });
  }
};


//show all talleres from a teacher
const showTalleresHistorial = async (req, res) => {
const {dni_docente} = req.params;
try{
  const resultado = await TeacherRepository.showTalleresHistorial(dni_docente);
  if (!resultado || resultado.length === 0) {
    return res.status(404).json({ error: 'No se encontraron talleres para el docente' });
  }
  console.log('Talleres obtenidos correctamente por DNI del docente');
  return res.status(200).json(resultado);
}catch(error) {
  console.log('Error al obtener talleres por DNI del docente:', error);
  return res.status(500).json({ error: 'Error al obtener los talleres' });
}
};

module.exports = {
  loginDocente,
  getDocentes,
  getDocenteByDni,
  createDocente,
  deleteDocenteByDni,
  updateDocente,
  updateDocentePatch,
  getCoursesByDocenteDni,
  getTalleresByCursoId,
  getAlumnosByCursoId,
  getAlumnosByTallerId,
  insertNotaAlumno,
  getNotasByAlumnoInCurso,
  insertNotaCursoAlumno,
  showTalleresHistorial
};