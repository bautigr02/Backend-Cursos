const db = require('../models/userModel');

// Formulario Register
const createAlumno = (req, res) => {
    console.log('Body recibido:', req.body);
  const { nombre, apellido, telefono, email, dni, direccion, contraseña } = req.body;

  const checkQuery = `SELECT * FROM alumno WHERE dni = ?`;

  db.query(checkQuery, [dni], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error al verificar el documento:', checkError);
      return res.status(500).json({ error: 'Error al verificar el documento del alumno' });
    }

    if (checkResults.length > 0) {
      return res.status(400).json({ error: 'Ya existe un alumno con este documento' });
    }

    const query = `INSERT INTO alumno (dni, nombre_alumno, apellido_alumno, telefono, email, direccion, contraseña)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`; 

    db.query(query, [dni, nombre, apellido, telefono, email, direccion, contraseña], (error, results) => {
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
    if (alumno.contraseña !== password) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }
    res.status(200).json({ message: 'Login exitoso',
      user: { dni: alumno.dni}
     });
  });
};


// Actualizar datos del alumno
const updateAlumno = (req, res) => {
  const dni = req.params.dni;
  const { direccion, email, telefono, contraseña } = req.body;

  if (!direccion || !email || !telefono || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    UPDATE alumno
    SET direccion = ?, email = ?, telefono = ?, contraseña = ?
    WHERE dni = ?
  `;

  const values = [direccion, email, telefono, contraseña, dni];

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

// Exportar las funciones del controlador
module.exports = {
  createAlumno,
  loginAlumno,
  updateAlumno,
  getAlumnoByDni,
  deleteAlumno,
};