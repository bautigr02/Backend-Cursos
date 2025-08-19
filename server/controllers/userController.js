const db = require('../models/db');

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


  let query;
  if (identifier.includes('@')) {

    query = 'SELECT * FROM alumno WHERE email = ?';
  } else {
  
    query = 'SELECT * FROM alumno WHERE dni = ?';
  }

  db.query(query, [identifier], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error al verificar las credenciales:', checkError);
      return res.status(500).json({ error: 'Error al verificar las credenciales' });
    }

    if (checkResults.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    const alumno = checkResults[0];
    if (alumno.contrasena !== password) {
      return res.status(400).json({ error: 'contrasena incorrecta' });
    }
    res.status(200).json({ message: 'Login exitoso',
      user: { dni: alumno.dni,
      nombre: alumno.nombre_alumno,
      apellido: alumno.apellido_alumno,
      telefono: alumno.telefono,
      direccion: alumno.direccion,
      email: alumno.email,
      fecha_nacimiento: alumno.fecha_nacimiento}
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

// Controlador para cancelar inscripción a un curso (Cambiar estado a "3")
const cancelarInscripcionCurso = (req, res) => {
  const { dni, idcurso } = req.params;

  const sql = `UPDATE inscripcion_curso SET estado = 3, nota_curso = NULL WHERE dni = ? AND idcurso = ?`;

  db.query(sql, [dni, idcurso], (err, result) => {
    if (err) {
      console.error('Error al cancelar inscripción al curso:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Inscripción no encontrada o ya cancelada' });
    }

    res.status(200).json({ mensaje: 'Inscripción cancelada correctamente' });
  });
};

// Controlador para inscribir alumno en un curso, si el estado actual es 3, cambiarlo a 1
const inscribirAlumnoEnCurso = (req, res) => {
  const { dni, idcurso } = req.body;

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
  inscribirAlumnoEnCurso
};