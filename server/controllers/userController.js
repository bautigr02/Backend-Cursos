const db = require('../models/userModel');

// Formulario Register
const createAlumno = (req, res) => {
  const { nombre, apellido, telefono, email, dni, direccion, password } = req.body;

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

    db.query(query, [dni, nombre, apellido, telefono, email, direccion, password], (error, results) => {
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

module.exports = {
  createAlumno,
  loginAlumno
};