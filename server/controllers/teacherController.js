const db = require('../models/db');

//Obtener docente a partir del login
const loginDocente = (req, res) => {
  const { identifier, password } = req.body;
  let query;
  if (identifier.includes('@')) {

    query = 'SELECT * FROM docente WHERE email = ?';
  } else {
  
    query = 'SELECT * FROM docente WHERE dni = ?';
  }

  db.query(query, [identifier], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error al verificar las credenciales:', checkError);
      return res.status(500).json({ error: 'Error al verificar las credenciales' });
    }

    if (checkResults.length === 0) {
      return res.status(400).json({ error: 'Docente no encontrado' });
    }
    const docente = checkResults[0];
    if (docente.contrasena !== password) {
      return res.status(400).json({ error: 'contrasena incorrecta' });
    }
    res.status(200).json({ message: 'Login exitoso',
      user: { dni: docente.dni,
      nombre: docente.nombre,
      apellido: docente.apellido,
      telefono: docente.telefono,
      direccion: docente.direccion,
      email: docente.email,
      fecha_nacimiento: docente.fecha_nacimiento}
     });
  });
};
// GET ALL
const getDocentes = (req, res) => {
  const query = 'SELECT docente.* FROM docente';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener docente:', err);
      return res.status(500).json({ error: 'Error al obtener los docentes' });
    }
    res.status(200).json(results);
    console.log('docente obtenidos correctamente');
  });
};

// GET BY dni
const getDocenteByDni = (req, res) => {
  const { dni } = req.params;
  const query = 'SELECT * FROM docente WHERE dni = ?';
  
  db.query(query, [dni], (err, results) => {
    if (err) {
      console.error('Error al obtener docente por DNI:', err);
      return res.status(500).json({ error: 'Error al obtener el docente' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.status(200).json(results[0]);
    console.log('Docente obtenido correctamente por DNI');
  });
};

// CREATE docente
const createDocente = (req, res) => {
  const { dni, nombre, apellido, telefono, direccion, email, contrasena } = req.body;

  const query = `
    INSERT INTO docente (dni, nombre, apellido, telefono, direccion, email, contrasena)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [dni, nombre, apellido, telefono, direccion, email, contrasena], (err, results) => {
    if (err) {
      console.error('Error al crear docente:', err);
      return res.status(500).json({ error: 'Error al crear el docente' });
    }
    res.status(201).json({ message: 'Docente creado correctamente', dni: results.insertdni });
    console.log('Docente creado correctamente');
  });
};

// DELETE docente by dni
const deleteDocenteByDni = (req, res) => {
  const { dni } = req.params;

  const query = 'DELETE FROM docente WHERE dni = ?';

  db.query(query, [dni], (err, results) => {
    if (err) {
      console.error('Error al eliminar docente:', err);
      return res.status(500).json({ error: 'Error al eliminar el docente' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    res.status(200).json({ message: 'Docente eliminado correctamente' });
    console.log('Docente eliminado correctamente');
  });
};

// Actualizar datos del docente por DNI
const updateDocente = (req, res) => {
  const dni = req.params.dni;
  const { direccion, email, telefono, contrasena } = req.body;

  if (!direccion || !email || !telefono || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    UPDATE docente
    SET direccion = ?, email = ?, telefono = ?, contrasena = ?
    WHERE dni = ?
  `;

  const values = [direccion, email, telefono, contrasena, dni];

 db.query(sql, values, (err, result) => {
    console.log('Valores enviados:', values);
    if (err) {
      console.error('Error al actualizar docente:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Docente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Docente actualizado correctamente' });
  });
};

// Actualizar datos del alumno - patch
const updateDocentePatch = (req, res) => {
  const dni = req.params.dni;
  const { nombre, apellido, direccion, email, telefono, contrasena } = req.body;

  if (!nombre && !apellido && !direccion && !email && !telefono && !contrasena) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  const updates = [];
  const values = [];
  if (nombre) {
    updates.push('nombre = ?');
    values.push(nombre);
  }
  if (apellido) {
    updates.push('apellido = ?');
    values.push(apellido);
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
    UPDATE Docente
    SET ${updates.join(', ')}
    WHERE dni = ?
  `;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar Docente:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Docente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Docente actualizado correctamente' });
  });
};

//get all courses by docente dni
const getCoursesByDocenteDni = (req, res) => {
  const { dni } = req.params;
  const query = 'Select idcurso, nom_curso, num_aula, fec_ini, fec_fin, descripcion from curso where dni_docente = ?' ;
  db.query(query, [dni], (err, results) => {
    if (err) {
      console.error('Error al obtener cursos por DNI del docente:', err);
      return res.status(500).json({ error: 'Error al obtener los cursos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron cursos para el docente' });
    }
    res.status(200).json(results);
    console.log('Cursos obtenidos correctamente por DNI del docente');
  });
};

//get all talleres by curso id
const getTalleresByCursoId = (req, res) => {
  const {idcurso} = req.params;
  const query = "Select idtaller, nom_taller, fecha, hora_ini from taller where idcurso = ?";
  db.query(query, [idcurso], (err, results) => {
    if (err) {
      console.error('Error al obtener talleres por ID de curso:', err);
      return res.status(500).json({ error: 'Error al obtener los talleres' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron talleres para el curso' });
    }
    res.status(200).json(results);
    console.log('Talleres obtenidos correctamente por ID de curso');
  });
};

//get alumnos from inscripcion_curso by curso id
const getAlumnosByCursoId = (req, res) => {
  const { idcurso } = req.params;
  const query = "Select ic.dni, ic.fec_inscripcion, a.nombre_alumno, a.apellido_alumno, a.email from inscripcion_curso ic inner join alumno a on ic.dni = a.dni where ic.idcurso = ?";
  db.query(query, [idcurso], (err, results) => {
    if (err) {
      console.error('Error al obtener alumnos por ID de curso:', err);
      return res.status(500).json({ error: 'Error al obtener los alumnos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron alumnos para el curso' });
    }
    res.status(200).json(results);
    console.log('Alumnos obtenidos correctamente por ID de curso');
  });
};

//get alumnos from inscripcion_taller by taller id
const getAlumnosByTallerId = (req, res) => {
  const { idtaller } = req.params;
  const query = "Select it.dni, it.fec_inscripcion, a.nombre_alumno, a.apellido_alumno, a.email, it.nota_taller from inscripcion_taller it inner join alumno a on it.dni = a.dni where it.idtaller = ?";
  db.query(query, [idtaller], (err, results) => {
    if (err) {
      console.error('Error al obtener alumnos por ID de taller:', err);
      return res.status(500).json({ error: 'Error al obtener los alumnos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron alumnos para el taller' });
    }
    res.status(200).json(results);
    console.log('Alumnos obtenidos correctamente por ID de taller');
  });
};

//insert calification of an student into inscripcion_Taller
const insertNotaAlumno = (req, res) => {
  const { idtaller } = req.params;
  const { dni, nota_taller } = req.body;

  const query = "UPDATE inscripcion_taller SET nota_taller = ? WHERE idtaller = ? AND dni = ?";
  db.query(query, [nota_taller, idtaller, dni], (err, result) => {
    if (err) {
      console.error('Error al insertar nota del alumno:', err);
      return res.status(500).json({ error: 'Error al insertar la nota' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontró la inscripción del alumno' });
    }
    res.status(200).json({ mensaje: 'Nota del alumno actualizada correctamente' });
  });
}; 

//show all talleres from a teacher
const showTalleresHistorial = (req, res) => {
const {dni} = req.params;
const {} = req.body;

const query = "Select * from talleres where dni = ?";
db.query(query, [dni], (err, results) => {
  if (err) {
    console.error('Error al obtener talleres por DNI del docente:', err);
    return res.status(500).json({ error: 'Error al obtener los talleres' });
  }
  if (results.length === 0) {
    return res.status(404).json({ error: 'No se encontraron talleres para el docente' });
  }
  res.status(200).json(results);
  console.log('Talleres obtenidos correctamente por DNI del docente');
});
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
  showTalleresHistorial
};