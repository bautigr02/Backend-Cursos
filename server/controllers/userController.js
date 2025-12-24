const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;
const db = require('../models/db');

// Helpers
const checkIfDocente = (dni, cb) => {
  const sql = 'SELECT 1 FROM docente WHERE dni = ? LIMIT 1';
  db.query(sql, [dni], (err, results) => {
    if (err) return cb(err);
    cb(null, results.length > 0);
  });
};

// Formulario Register
const createAlumno = (req, res) => {
    console.log('Body recibido:', req.body);
  const { nombre, apellido, telefono, email, dni, direccion, contrasena } = req.body;

  const checkQuery = `SELECT * FROM alumno WHERE dni = ?`;

  db.query(checkQuery, [dni], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error al verificar el documento:', checkError);
      return res.status(500).json({ error: 'Error al verificar el documento del alumno' });
    }

    if (checkResults.length > 0) {
      return res.status(400).json({ error: 'Ya existe un alumno con este documento' });
    }

    const query = `INSERT INTO alumno (dni, nombre_alumno, apellido_alumno, telefono, email, direccion, contrasena)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`; 

    db.query(query, [dni, nombre, apellido, telefono, email, direccion, contrasena], (error, results) => {
      if (error) {
        console.error('Error al insertar alumno:', error);
        return res.status(500).json({ error: 'Error al crear el alumno' });
      }

      res.status(201).json({
        message: 'Alumno creado con éxito',
        alumnodni: dni 
      });
    });
  });
};

//Formulario de login
const loginAlumno = (req, res) => {
  const { identifier, password } = req.body;

  let query = identifier.includes('@')
    ? 'SELECT * FROM alumno WHERE email = ?'
    : 'SELECT * FROM alumno WHERE dni = ?';

  db.query(query, [identifier], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al verificar las credenciales' });
    if (results.length === 0) return res.status(400).json({ error: 'Usuario no encontrado' });
    
    const alumno = results[0];
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
        nombre: alumno.nombre_alumno,
        apellido: alumno.apellido_alumno,
        telefono: alumno.telefono,
        direccion: alumno.direccion,
        email: alumno.email,
        fecha_nacimiento: alumno.fecha_nacimiento
      }
    });
  });
};

// Actualizar datos del alumno
const updateAlumno = (req, res) => {
  const dni = req.params.dni;
  const { direccion, email, telefono, contrasena } = req.body;

  if (!direccion || !email || !telefono || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    UPDATE alumno
    SET direccion = ?, email = ?, telefono = ?, contrasena = ?
    WHERE dni = ?
  `;

  const values = [direccion, email, telefono, contrasena, dni];

 db.query(sql, values, (err, result) => {
    console.log('Valores enviados:', values);
    if (err) {
      console.error('Error al actualizar alumno:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    res.status(200).json({ mensaje: 'Alumno actualizado correctamente' });
  });
};

// Actualizar datos del alumno - patch
const updateAlumnoPatch = (req, res) => {
  const dni = req.params.dni;
  const { nombre_alumno, apellido_alumno, direccion, email, telefono, contrasena } = req.body;

  if (!nombre_alumno && !apellido_alumno && !direccion && !email && !telefono && !contrasena) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  const updates = [];
  const values = [];
  if (nombre_alumno) {
    updates.push('nombre_alumno = ?');
    values.push(nombre_alumno);
  }
  if (apellido_alumno) {
    updates.push('apellido_alumno = ?');
    values.push(apellido_alumno);
  }
  if (direccion) {
    updates.push('direccion = ?');
    values.push(direccion);
  }
  if (email) {
    updates.push('email = ?');
    values.push(email);
  }
  if (telefono) {
    updates.push('telefono = ?');
    values.push(telefono);
  }
  if (contrasena) {
    updates.push('contrasena = ?');
    values.push(contrasena);
  }

  values.push(dni);

  const sql = `
    UPDATE alumno
    SET ${updates.join(', ')}
    WHERE dni = ?
  `;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar alumno:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    res.status(200).json({ mensaje: 'Alumno actualizado correctamente' });
  });
};


//Obtener datos del alumno por DNI
const getAlumnoByDni = (req, res) => {
  const dni = req.params.dni;

  const sql = 'SELECT dni, nombre_alumno, apellido_alumno, telefono, direccion, email FROM alumno WHERE dni = ?';

  db.query(sql, [dni], (err, results) => {
    if (err) {
      console.error('Error al obtener alumno:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    res.status(200).json(results[0]);
  });
};

// Controlador para eliminar alumno por DNI
const deleteAlumno = (req, res) => {
  const dni = req.params.dni;

  const sql = `DELETE FROM alumno WHERE dni = ?`;

  db.query(sql, [dni], (err, result) => {
    if (err) {
      console.error('Error al eliminar alumno:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Alumno no encontrado' });
    }

    res.status(200).json({ mensaje: 'Alumno eliminado correctamente' });
  });
};

// Controlador para obtener cursos por DNI del alumno
const getCursosByAlumno = (req, res) => {
  const dni = req.params.dni;
  const sql = `
    SELECT c.idcurso, c.nom_curso, c.descripcion, c.fec_ini, c.fec_fin, c.estado, c.imagen, i.fec_inscripcion, i.estado, i.nota_curso, d.nombre AS nombre_docente, d.apellido AS apellido_docente
    FROM inscripcion_curso i
    JOIN curso c ON i.idcurso = c.idcurso
    JOIN docente d ON c.dni_docente = d.dni
    WHERE i.dni = ?
  `;
  db.query(sql, [dni], (err, results) => {
    if (err) {
      console.error('Error al obtener cursos del alumno:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.status(200).json(results);
  });
};

// Controlador para obtener talleres por DNI del alumno
const getTalleresByAlumno = (req, res) => {
  const dni = req.params.dni;
  const sql = `
    SELECT t.idtaller, t.nom_taller, t.fecha, t.tematica, t.herramienta, t.hora_ini, t.requisitos, t.dificultad, t.dni_docente, t.imagen, t.idcurso, it.fec_inscripcion, it.estado, it.nota_taller
    FROM inscripcion_taller it
    JOIN taller t ON it.idtaller = t.idtaller
    WHERE it.dni = ?
  `;
  db.query(sql, [dni], (err, results) => {
    if (err) {
      console.error('Error al obtener talleres del alumno:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.status(200).json(results);
  });
};

// Controlador para cancelar inscripción a un curso (Cambiar estado a "3") y cancelar talleres asociados
const cancelarInscripcionCurso = (req, res) => {
  const { dni, idcurso } = req.params;

  // Verificar que la inscripción al curso existe
  const checkCursoSql = `SELECT estado FROM inscripcion_curso WHERE dni = ? AND idcurso = ?`;
  db.query(checkCursoSql, [dni, idcurso], (err, cursoResults) => {
    if (err) {
      console.error('Error al verificar inscripción al curso:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (cursoResults.length === 0) {
      return res.status(404).json({ error: 'No estás inscripto en este curso' });
    }

    const estadoActual = cursoResults[0].estado;
    if (estadoActual === 3) {
      return res.status(400).json({ error: 'La inscripción ya está cancelada' });
    }

    // Primero cancelamos la inscripción al curso
    const cancelCursoSql = `UPDATE inscripcion_curso SET estado = 3, nota_curso = NULL WHERE dni = ? AND idcurso = ?`;
    db.query(cancelCursoSql, [dni, idcurso], (err, cursoResult) => {
      if (err) {
        console.error('Error al cancelar inscripción al curso:', err);
        return res.status(500).json({ error: 'Error al cancelar inscripción al curso' });
      }

      if (cursoResult.affectedRows === 0) {
        return res.status(404).json({ error: 'No se encontró la inscripción al curso' });
      }

      // Ahora cancelamos todas las inscripciones a talleres del mismo curso
      const cancelTalleresSql = `
        UPDATE inscripcion_taller 
        SET estado = 3, nota_taller = NULL 
        WHERE dni = ? AND idcurso = ? AND estado IN (1, 2)
      `;
      
      db.query(cancelTalleresSql, [dni, idcurso], (err, talleresResult) => {
        if (err) {
          console.error('Error al cancelar inscripciones a talleres:', err);
          // Aunque falle la cancelación de talleres, el curso ya fue cancelado
          return res.status(200).json({ 
            mensaje: 'Inscripción al curso cancelada, pero hubo un error al cancelar los talleres',
            warning: 'Algunos talleres pueden no haberse cancelado correctamente'
          });
        }

        const talleresCancelados = talleresResult.affectedRows;
        
        if (talleresCancelados > 0) {
          res.status(200).json({ 
            mensaje: `Inscripción al curso cancelada correctamente. También se cancelaron ${talleresCancelados} inscripciones a talleres del curso.`
          });
        } else {
          res.status(200).json({ 
            mensaje: 'Inscripción al curso cancelada correctamente. No había inscripciones activas a talleres de este curso.'
          });
        }
      });
    });
  });
};

// Controlador para inscribir alumno en un curso, si el estado actual es 3, cambiarlo a 1
const inscribirAlumnoEnCurso = (req, res) => {
  const dniFromToken = req.user?.dni;
  const { dni: dniFromBody, idcurso } = req.body;
  const dni = dniFromToken || dniFromBody;

  if (!dni || !idcurso) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  // Evita suplantación: el dni del body debe coincidir con el del token si ambos existen
  if (dniFromToken && dniFromBody && dniFromToken !== dniFromBody) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  // Bloquear docentes
  checkIfDocente(dni, (err, esDocente) => {
    if (err) {
      console.error('Error al verificar docente:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (esDocente) {
      return res.status(403).json({ error: 'Los docentes no pueden inscribirse en cursos' });
    }

    // Primero, verificamos si el alumno ya está inscrito en el curso
    const checkSql = `SELECT estado FROM inscripcion_curso WHERE dni = ? AND idcurso = ?`;
    db.query(checkSql, [dni, idcurso], (err, results) => {
      if (err) {
        console.error('Error al verificar inscripción:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (results.length === 0) {
        // Si no existe, lo inscribimos
        const insertSql = `INSERT INTO inscripcion_curso (dni, idcurso, estado, fec_inscripcion) VALUES (?, ?, 1, NOW())`;
        db.query(insertSql, [dni, idcurso], (err, result) => {
          if (err) {
            console.error('Error al inscribir alumno:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
          }
          return res.status(201).json({ mensaje: 'Inscripción exitosa' });
        });
      } else {
        // Si existe, verificamos el estado
        const estadoActual = results[0].estado;
        if (estadoActual === 3) {
          // Si el estado es 3, lo cambiamos a 1
          const updateSql = `UPDATE inscripcion_curso SET estado = 1, fec_inscripcion = NOW() WHERE dni = ? AND idcurso = ?`;
          db.query(updateSql, [dni, idcurso], (err, result) => {
            if (err) {
              console.error('Error al actualizar inscripción:', err);
              return res.status(500).json({ error: 'Error en el servidor' });
            }
            return res.status(200).json({ mensaje: 'Inscripción reactivada' });
          });
        } else {
          return res.status(400).json({ error: 'El alumno ya está inscrito en este curso' });
        }
      }

    });
  });
};

// Controlador para inscribir alumno en un taller. Verificar inscripción al curso primero
const inscribirAlumnoEnTaller = (req, res) => {
  const dniFromToken = req.user?.dni;
  const { dni: dniFromBody, idtaller } = req.body;
  const dni = dniFromToken || dniFromBody;
  
  if (!dni || !idtaller) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Evita suplantación: el dni del body debe coincidir con el del token si ambos existen
  if (dniFromToken && dniFromBody && dniFromToken !== dniFromBody) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  // Bloquear docentes
  checkIfDocente(dni, (err, esDocente) => {
    if (err) {
      console.error('Error al verificar docente:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (esDocente) {
      return res.status(403).json({ error: 'Los docentes no pueden inscribirse en talleres' });
    }

    // Obtenemos el idcurso del taller
    const getCursoSql = `SELECT idcurso FROM taller WHERE idtaller = ?`;
    db.query(getCursoSql, [idtaller], (err, results) => {
      if (err) {
        console.error('Error al obtener idcurso del taller:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Taller no encontrado' });
      }

      const idcurso = results[0].idcurso;

      // VERIFICAR SI EL ALUMNO ESTÁ INSCRIPTO AL CURSO CORRESPONDIENTE
      const checkCursoSql = `SELECT estado FROM inscripcion_curso WHERE dni = ? AND idcurso = ?`;
      db.query(checkCursoSql, [dni, idcurso], (err, cursoResults) => {
        if (err) {
          console.error('Error al verificar inscripción al curso:', err);
          return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (cursoResults.length === 0) {
          return res.status(400).json({ error: 'Debes estar inscripto al curso correspondiente para inscribirte en este taller' });
        }

        const estadoCurso = cursoResults[0].estado;
        // Solo permitir si está inscripto (estado 1) o cursando (estado 2)
        if (estadoCurso !== 1 && estadoCurso !== 2) {
          return res.status(400).json({ error: 'Debes estar inscripto y cursando el curso para inscribirte en este taller' });
        }

        // Verificar fecha del taller (debe ser futura)
        const checkFechaSql = `SELECT fecha FROM taller WHERE idtaller = ?`;
        db.query(checkFechaSql, [idtaller], (err, fechaResults) => {
          if (err) {
            console.error('Error al verificar fecha del taller:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
          }

          const fechaTaller = new Date(fechaResults[0].fecha);
          const fechaActual = new Date();
          
          if (fechaTaller <= fechaActual) {
            return res.status(400).json({ error: 'No puedes inscribirte a un taller que ya comenzó o finalizó' });
          }

          // Ahora verificamos si el alumno ya está inscrito en el taller
          const checkTallerSql = `SELECT estado FROM inscripcion_taller WHERE dni = ? AND idtaller = ? AND idcurso = ?`;
          db.query(checkTallerSql, [dni, idtaller, idcurso], (err, tallerResults) => {
            if (err) {
              console.error('Error al verificar inscripción al taller:', err);
              return res.status(500).json({ error: 'Error en el servidor' });
            }

            if (tallerResults.length === 0) {
              // Si no existe, lo inscribimos
              const insertSql = `INSERT INTO inscripcion_taller (dni, idtaller, idcurso, estado, fec_inscripcion) VALUES (?, ?, ?, 1, NOW())`;
              db.query(insertSql, [dni, idtaller, idcurso], (err, result) => {
                if (err) {
                  console.error('Error al inscribir alumno en taller:', err);
                  return res.status(500).json({ error: 'Error en el servidor' });
                }
                return res.status(201).json({ mensaje: 'Inscripción al taller exitosa' });
              });
            } else {
              // Si existe, verificamos el estado
              const estadoActual = tallerResults[0].estado;
              if (estadoActual === 3) {
                // Si el estado es 3 (cancelado), lo cambiamos a 1
                const updateSql = `UPDATE inscripcion_taller SET estado = 1, fec_inscripcion = NOW(), nota_taller = NULL WHERE dni = ? AND idtaller = ? AND idcurso = ?`;
                db.query(updateSql, [dni, idtaller, idcurso], (err, result) => {
                  if (err) {
                    console.error('Error al reactivar inscripción al taller:', err);
                    return res.status(500).json({ error: 'Error en el servidor' });
                  }
                  return res.status(200).json({ mensaje: 'Inscripción al taller reactivada' });
                });
              } else {
                return res.status(400).json({ error: 'Ya estás inscripto en este taller' });
              }
            }
          });
        });
      });
    });
  });
};

// Controlador para cancelar inscripción a un taller (Cambiar estado a "3"). Obtener idcurso desde idtaller
const cancelarInscripcionTaller = (req, res) => {
  const { dni, idtaller } = req.params;

  // obtenemos el idcurso del taller
  const getCursoSql = `SELECT idcurso FROM taller WHERE idtaller = ?`;
  db.query(getCursoSql, [idtaller], (err, results) => {
    if (err) {
      console.error('Error al obtener idcurso del taller:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }

    const idcurso = results[0].idcurso;

    const sql = `UPDATE inscripcion_taller SET estado = 3, nota_taller = NULL WHERE dni = ? AND idtaller = ? AND idcurso = ?`;

    db.query(sql, [dni, idtaller, idcurso], (err, result) => {
      if (err) {
        console.error('Error al cancelar inscripción al taller:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Inscripción no encontrada o ya cancelada' });
      }

      res.status(200).json({ mensaje: 'Inscripción cancelada correctamente' });
    });
  });
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