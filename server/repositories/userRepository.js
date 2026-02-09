const db = require ('../models/db');

const UserRepository = {

    createAlumno: (alumnoData) => {
        const { dni, nombre, apellido, telefono, direccion, email, contrasena } = alumnoData;
        const query = `INSERT INTO alumno (dni, nombre_alumno, apellido_alumno, telefono, email, direccion, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)`; 
        return new Promise((resolve, reject) => {
            db.query(query, [dni, nombre, apellido, telefono, email, direccion, contrasena], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    loginAlumno: (identifier) => {
        const query = identifier.includes('@') ? 'SELECT * FROM alumno WHERE email = ?' : 'SELECT * FROM alumno WHERE dni = ?';
        return new Promise((resolve, reject) => {
            db.query(query, [identifier], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },

    // Actualiza los datos del alumno 
    updateAlumno: (dni, datos) => {
        const { direccion, email, telefono, contrasena } = datos;
        const query = `UPDATE alumno SET direccion = ?, email = ?, telefono = ?, contrasena = ? WHERE dni = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [direccion, email, telefono, contrasena, dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    // Actualiza datos de forma parcial 
    updateAlumnoPatch: (dni, datos) => {
        const keys = Object.keys(datos);
        if (keys.length === 0) return Promise.resolve({ affectedRows: 0 });

        const setValues = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => datos[key]);

        const query = `UPDATE alumno SET ${setValues} WHERE dni = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [...values, dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    getAlumnoByDni: (dni) => {
        const query = 'SELECT dni, nombre_alumno, apellido_alumno, telefono, direccion, email FROM alumno WHERE dni = ?';
        return new Promise((resolve, reject) => {
            db.query(query, [dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },

    checkIfDocente: (dni) => {
        const query = 'SELECT 1 FROM docente WHERE dni = ? LIMIT 1';
        return new Promise((resolve, reject) => {
            db.query(query, [dni], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0);
            });
        });
    },

    deleteAlumno: (dni) => {
        const query = `DELETE FROM alumno WHERE dni = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    getCursosByAlumno: (dni) => {
        const query =`SELECT c.idcurso, c.nom_curso, c.descripcion, c.fec_ini, c.fec_fin, c.estado as estado_curso, c.imagen, i.fec_inscripcion, i.estado as estado_inscripcion, i.nota_curso, d.nombre AS nombre_docente, d.apellido AS apellido_docente FROM inscripcion_curso i JOIN curso c ON i.idcurso = c.idcurso JOIN docente d ON c.dni_docente = d.dni WHERE i.dni = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    getTalleresByAlumno: (dni) => {
        const sql = `SELECT t.idtaller, t.nom_taller, t.fecha, t.tematica, t.herramienta, t.hora_ini, t.requisitos, t.dificultad, t.dni_docente, t.imagen, t.idcurso, it.fec_inscripcion, it.estado, it.nota_taller FROM inscripcion_taller it JOIN taller t ON it.idtaller = t.idtaller WHERE it.dni = ? AND it.estado = 1 -- Solo mostrar talleres con estado "1" (inscripto) para el alumno;`;
        return new Promise((resolve, reject) => {
            db.query(sql, [dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    validateCursoEstado: (dni, idcurso) => {
        const queryEstado = `SELECT estado FROM inscripcion_curso WHERE dni = ? AND idcurso = ?`;
        return new Promise((resolve, reject) => {
            db.query(queryEstado, [dni, idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0] ? results[0].estado : null);
                }
            });
        });
    },

    validateTallerEstado: (dni, idtaller) => {
        const query = `SELECT estado FROM inscripcion_taller WHERE dni = ? AND idtaller = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [dni, idtaller], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0] ? results[0].estado : null);
                }
            });
        });
    },
    cancelarInscripcionCurso: (dni, idcurso) => {
        const queryInscripcionCurso = `UPDATE inscripcion_curso SET estado = 4, nota_curso = NULL WHERE dni = ? AND idcurso = ?`;
        const queryInscripcionTaller = `UPDATE inscripcion_taller SET estado = 2, nota_taller = NULL WHERE dni = ? AND idcurso = ? AND estado IN (1, 2)`;
        return new Promise((resolve, reject) => {
            db.query(queryInscripcionCurso, [dni, idcurso], (err, results) => {
                if (err) return reject(err);
                db.query(queryInscripcionTaller, [dni, idcurso], (err2) => {
                    if (err2) reject(err2);
                    else resolve (results);
                });
            });
        });
    },

    inscribirAlumnoEnCurso: (dni, idcurso, esReactivacion = false) => {
        const query = `INSERT INTO inscripcion_curso (dni, idcurso, estado, fec_inscripcion) VALUES (?, ?, 1, NOW())`;
        const queryUpdate = `UPDATE inscripcion_curso SET estado = 1, fec_inscripcion = NOW() WHERE dni = ? AND idcurso = ?`;
        const queryFinal = esReactivacion ? queryUpdate : query;
        return new Promise((resolve, reject) => {
            db.query(queryFinal, [dni, idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    getCursoByIdTaller: (idtaller) => {
        const query = `SELECT idcurso FROM taller WHERE idtaller = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [idtaller], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0] || null );
                }
            });
        });
    },

    cancelarInscripcionTaller: (dni, idtaller, idcurso) => {
        const query = `UPDATE inscripcion_taller SET estado = 2, nota_taller = NULL WHERE dni = ? AND idtaller = ? AND idcurso = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [dni, idtaller, idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    inscribirAlumnoEnTaller: (dni, idtaller, idcurso, esReactivacion = false) => {
        const query = `INSERT INTO inscripcion_taller (dni, idtaller, idcurso, estado, fec_inscripcion) VALUES (?, ?, ?, 1, NOW())`;
        const queryUpdate = `UPDATE inscripcion_taller SET estado = 1, fec_inscripcion = NOW() WHERE dni = ? AND idtaller = ? AND idcurso = ?`;
        const queryFinal = esReactivacion ? queryUpdate : query;
        return new Promise((resolve, reject) => {
            db.query(queryFinal, [dni, idtaller, idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
}

module.exports = UserRepository;