const db = require ('../models/db');

const TeacherRepository = {

    loginDocente: (identifier) => {
        const query = 'SELECT * FROM docente WHERE email = ? OR dni = ?';
        return new Promise((resolve, reject) => {
            db.query(query, [identifier, identifier], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    },

    getDocentes: () => {
        const query = 'SELECT docente.* FROM docente';
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    getDocenteByDni: (dni) => {
        const query = 'SELECT * FROM docente WHERE dni = ?';
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

    createDocente: (datos) => {
        const { dni, nombre, apellido, telefono, direccion, email, contrasena } = datos;
        const query = `INSERT INTO docente (dni, nombre, apellido, telefono, direccion, email, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            db.query(query, [dni, nombre, apellido, telefono, direccion, email, contrasena], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dni);
                }
            });
        });
    },

    deleteDocenteByDni: (dni) => {
        const query = 'DELETE FROM docente WHERE dni = ?';
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
    //Actualiza los datos del docente
    updateDocente: (dni, datos) => {
        const { direccion, email, telefono, contrasena } = datos;
        const query = `UPDATE docente SET direccion = ?, email = ?, telefono = ?, contrasena = ? WHERE dni = ?`;
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

    updateDocentePatch: (dni, datos) => {
        const keys = Object.keys(datos);
        const setValues = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => datos[key]);

        const query = `UPDATE docente SET ${setValues} WHERE dni = ?`;
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

    getCoursesByDocenteDni: (dni) => {
        const query = 'Select idcurso, estado, nom_curso, num_aula, fec_ini, fec_fin, descripcion from curso where dni_docente = ?' ;
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

    getTalleresByCursoId: (idcurso) => {
        const query = "Select idtaller, nom_taller, fecha, hora_ini, tematica, requisitos, herramienta from taller where idcurso = ?";
        return new Promise ((resolve, reject)=> {
            db.query(query, [idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    getAlumnosByCursoId: (idcurso) => {
        const query = "Select ic.dni, ic.fec_inscripcion, a.nombre_alumno, a.apellido_alumno, a.email, ic.nota_curso as notaFinal from inscripcion_curso ic inner join alumno a on ic.dni = a.dni where ic.idcurso = ?";
        return new Promise ((resolve, reject)=> {
            db.query(query, [idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    getAlumnosByTallerId: (idtaller) => {
        const query = "Select it.dni, it.fec_inscripcion, a.nombre_alumno, a.apellido_alumno, a.email, it.nota_taller from inscripcion_taller it inner join alumno a on it.dni = a.dni where it.idtaller = ?";
        return new Promise ((resolve, reject)=> {
            db.query(query, [idtaller], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    //NotaTaller
    insertNotaAlumno: (datos) => {
        const { dni, notaTaller, idtaller} = datos;
        const query = "UPDATE inscripcion_taller SET nota_taller = ? WHERE idtaller = ? AND dni = ?";
        return new Promise ((resolve, reject) => {
            db.query(query, [notaTaller, idtaller, dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    getNotasByAlumnoInCurso: (dni, idcurso) => {
        const query = `SELECT it.nota_taller, t.nom_taller FROM inscripcion_taller it INNER JOIN taller t ON it.idtaller = t.idtaller WHERE it.dni = ? AND t.idcurso = ? `;
        return new Promise((resolve, reject) => {
            db.query(query, [dni, idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    //NotaCurso
    insertNotaCursoAlumno: (datos) => {
        const { dni, notaCurso, idcurso } = datos;
        const query = "UPDATE inscripcion_curso SET nota_curso = ? WHERE idcurso = ? AND dni = ?";
        return new Promise((resolve, reject) => {
            db.query(query, [notaCurso, idcurso, dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
    showTalleresHistorial: (dni) => {
        const query = "Select * from taller where dni_docente = ?";
        return new Promise ((resolve, reject) => {
            db.query(query, [dni], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
}

module.exports = TeacherRepository;