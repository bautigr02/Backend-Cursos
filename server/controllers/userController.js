const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

const UserRepository = require('../repositories/userRepository');


// Formulario Register
const createAlumno = async (req, res) => {
  const { nombre, apellido, telefono, email, dni, direccion, contrasena } = req.body;
  try {
    const alumno = await UserRepository.getAlumnoByDni(dni);
    if (alumno) {
      return res.status(400).json({ error: 'Ya existe un alumno con este documento' });
    }

    if (!nombre || !apellido || !telefono || !email || !dni || !direccion || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const resultado = await UserRepository.createAlumno({ nombre, apellido, telefono, email, dni, direccion, contrasena });
    if (resultado.affectedRows > 0) {
      return res.status(201).json({
        message: 'Alumno creado con éxito',
        alumnodni: dni 
      });
    }
  } catch (err) {
    console.error('Error al crear alumno:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

//Formulario de login
const loginAlumno = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const respuesta = await UserRepository.loginAlumno(identifier);
    if (!respuesta) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    const alumno = respuesta;
    if (alumno.contrasena !== password) {
      return res.status(400).json({ error: 'contrasena incorrecta' });
    }
    const payload = {
      dni: alumno.dni,
      email: alumno.email,
      nombre: alumno.nombre_alumno
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        dni: alumno.dni,
        nombre_alumno: alumno.nombre_alumno,
        apellido_alumno: alumno.apellido_alumno,
        telefono: alumno.telefono,
        direccion: alumno.direccion,
        email: alumno.email,
      }
    });
  } catch (err) {
    console.error('Error al verificar las credenciales:', err);
    return res.status(500).json({ error: 'Error al verificar las credenciales' });
  }
};

const updateAlumno = async (req, res) => {
    const { dni } = req.params;
    const { direccion, email, telefono, contrasena } = req.body;

    if (!direccion || !email || !telefono || !contrasena) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const result = await UserRepository.updateAlumno(dni, { direccion, email, telefono, contrasena });
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Alumno no encontrado' });
        
        res.status(200).json({ mensaje: 'Alumno actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const updateAlumnoPatch = async (req, res) => {
    const { dni } = req.params;

    try {
        const result = await UserRepository.updateAlumnoPatch(dni, req.body);
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Alumno no encontrado' });

        res.status(200).json({ mensaje: 'Alumno actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};


//Obtener datos del alumno por DNI
const getAlumnoByDni = async (req, res) => {
  const {dni} = req.params;
  try {
  
    const respuesta = await UserRepository.getAlumnoByDni(dni);
    if (!respuesta) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }
    return res.status(200).json(respuesta);
  } catch (err) {
    console.error('Error al obtener alumno:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Controlador para eliminar alumno por DNI
const deleteAlumno = async (req, res) => {
  const {dni} = req.params;
  try {
    const respuesta = await UserRepository.deleteAlumno(dni);
    if (respuesta.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }
    return res.status(200).json({ mensaje: 'Alumno eliminado correctamente' });

  } catch (err) {
    console.error('Error al eliminar alumno:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Controlador para obtener cursos por DNI del alumno
const getCursosByAlumno = async (req, res) => {
  const {dni} = req.params;
  try {
    const respuesta = await UserRepository.getCursosByAlumno(dni);
    if (!respuesta || respuesta.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron cursos para este alumno' });
    }
    return res.status(200).json(respuesta);
  }catch (err) {
    console.error('Error al obtener cursos del alumno:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Controlador para obtener talleres por DNI del alumno
const getTalleresByAlumno = async (req, res) => {
  const {dni} = req.params;
  try {
    const respuesta = await UserRepository.getTalleresByAlumno(dni);
    if (!respuesta) {
      return res.status(404).json({ mensaje: 'No se encontraron talleres para este alumno' });
    }
    return res.status(200).json(respuesta);
  } catch (err) {
    console.error('Error al obtener talleres del alumno:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Controlador para cancelar inscripción a un curso (Cambiar estado a "4") y cancelar talleres asociados
const cancelarInscripcionCurso = async (req, res) => {
  const { dni, idcurso } = req.params;
  try {
    const estado = await UserRepository.validateCursoEstado(dni, idcurso);
    if (estado === null) {
      return res.status(404).json({ error: 'No estás inscripto en este curso' });
    } else if (estado === 4) {
      return res.status(400).json({ error: 'La inscripción ya está cancelada' });
    }
    const respuesta = await UserRepository.cancelarInscripcionCurso(dni, idcurso);
    if (respuesta.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontró la inscripción al curso' });
    }
    if (respuesta.affectedRows > 0) {
      console.log(`Inscripción al curso cancelada para DNI ${dni} y curso ${idcurso}`);
      return res.status(200).json({ mensaje: 'Inscripción al curso cancelada correctamente' });
    }
    
  } catch (err) {
    console.error('Error al cancelar inscripción al curso:', err);
    return res.status(500).json({ error: 'Error al cancelar inscripción al curso' });
  }
};

// Controlador para inscribir alumno en un curso, si el estado actual es 4, cambiarlo a 1
const inscribirAlumnoEnCurso = async (req, res) => {
  const dni = req.user?.dni || req.body.dni;
  const { idcurso } = req.body;
  try {
      const esDocente = await UserRepository.checkIfDocente(dni);
      if (esDocente) return res.status(403).json({ error: 'Los docentes no pueden inscribirse' });

      const estado = await UserRepository.validateCursoEstado(dni, idcurso);
      if (estado === 1 || estado === 2) {
            return res.status(400).json({ error: 'Ya estás inscripto o cursando' });
        }
      const esReactivacion = (estado === 4);
      const resultado = await UserRepository.inscribirAlumnoEnCurso(dni, idcurso, esReactivacion);
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró el curso o el alumno' });
      }
      res.status(esReactivacion ? 200 : 201).json({ 
            mensaje: esReactivacion ? 'Inscripción reactivada' : 'Inscripción exitosa' 
        });
  }catch (err) {
      console.error('Error al inscribir alumno en curso:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Controlador para inscribir alumno en un taller. Verificar inscripción al curso primero
const inscribirAlumnoEnTaller = async (req, res) => {
  const dni = req.user?.dni || req.body.dni;
    const { idtaller } = req.body;

    try {
        const esDocente = await UserRepository.checkIfDocente(dni);
        if (esDocente) return res.status(403).json({ error: 'Docentes no permitidos' });

        const tallerInfo = await UserRepository.getCursoByIdTaller(idtaller);
        if (!tallerInfo) return res.status(404).json({ error: 'Taller no existe' });
        
        // Validar fecha
        if (new Date(tallerInfo.fecha) <= new Date()) {
            return res.status(400).json({ error: 'El taller ya pasó o es hoy' });
        }

        // Validar que esté en el curso
        const estadoCurso = await UserRepository.validateCursoEstado(dni, tallerInfo.idcurso);
        if (estadoCurso !== 1 && estadoCurso !== 2) {
            return res.status(400).json({ error: 'Debes estar activo en el curso primero' });
        }
        const estadoTaller = await UserRepository.validateTallerEstado(dni, idtaller);
        if (estadoTaller === 1) {
            return res.status(400).json({ error: 'Ya estás inscripto en este taller' });
        }

        const esReactivacion = (estadoTaller === 2);

        const resultado = await UserRepository.inscribirAlumnoEnTaller(dni, idtaller, tallerInfo.idcurso, esReactivacion);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró el taller o el alumno' });
        }
        res.status(esReactivacion ? 200 : 201).json({ mensaje: 'Inscripción a taller procesada' });

    } catch (err) {
        res.status(500).json({ error: 'Error al inscribir taller' });
    }
};

// Controlador para cancelar inscripción a un taller (Cambiar estado a "2"). Obtener idcurso desde idtaller
const cancelarInscripcionTaller = async (req, res) => {
  const { dni, idtaller } = req.params;
  const curso = await UserRepository.getCursoByIdTaller(idtaller);
  if (!curso) {
    return res.status(404).json({ error: 'Taller no encontrado' });
  }
  try {
    const respuesta = await UserRepository.cancelarInscripcionTaller(dni, idtaller, curso.idcurso);
    if (respuesta.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontró la inscripción al taller o ya está cancelada' });
    }
    if (respuesta.affectedRows > 0) {
      console.log(`Inscripción al taller cancelada para DNI ${dni} y taller ${idtaller}`);
      return res.status(200).json({ mensaje: 'Inscripción al taller cancelada correctamente' });
    }
  }catch (err) {
    console.error('Error al cancelar inscripción al taller:', err);
    return res.status(500).json({ error: 'Error al cancelar inscripción al taller' });
  }
};


// Exportar las funciones del controlador
module.exports = {
  createAlumno,
  loginAlumno,
  updateAlumno,
  updateAlumnoPatch,
  getAlumnoByDni,
  deleteAlumno,
  getCursosByAlumno,
  cancelarInscripcionCurso,
  getTalleresByAlumno,
  inscribirAlumnoEnCurso,
  inscribirAlumnoEnTaller,
  cancelarInscripcionTaller
};