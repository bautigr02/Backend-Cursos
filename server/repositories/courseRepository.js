const db = require('../models/db');

const CourseRepository = {

    getCursos: () => {
        const query = 'SELECT curso.*, aula.cant_alumnos, (SELECT COUNT(*) FROM inscripcion_curso i WHERE i.idcurso = curso.idcurso) AS cantidad_inscriptos FROM curso JOIN aula ON curso.num_aula = aula.num_aula';
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => err ? reject(err) : resolve(results));
        });
    },
    getCursoById: (id) => {
        const query = 'SELECT * FROM curso WHERE idcurso = ?';
        return new Promise((resolve, reject) => {
            db.query(query, [id], (err, results) => err ? reject(err) : resolve(results[0]));
        });
    },

    desactivarCurso: (id) => {
        const queryCurso = 'UPDATE CURSO SET estado = 4 WHERE idcurso = ? and estado = 1 and fec_ini > CURRENT_DATE'; // 4 es cancelado
        const queryInscripciones = 'UPDATE inscripcion_curso SET estado = 4 WHERE idcurso = ? and estado = 1'; // 4 es cancelado
        const queryInscripcionesTaller = 'UPDATE inscripcion_taller set estado = 2 WHERE idcurso = ? and estado = 1'; // 2 es cancelado
        return new Promise((resolve, reject) => {
            db.query(queryCurso, [id], (err, resultCurso) => {
                if (err) {
                    return reject(err);
                }
                if (resultCurso.affectedRows === 0) {
                return resolve({ curso: resultCurso }); 
                }
                db.query(queryInscripciones, [id], (err, resultInscripciones) => {
                    if (err) {
                        return reject(err);
                    }
                db.query(queryInscripcionesTaller, [id], (err, resultInscripcionesTaller) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        curso: resultCurso,
                        inscripciones: resultInscripciones,
                        talleres: resultInscripcionesTaller
                    });
                });
            });
        });
    });
    },
    //Actualiza todo el curso
    putCurso: (id, datos) => {
            const { nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen } = datos;
            const query = `UPDATE curso SET nom_curso=?, fec_ini=?, fec_fin=?, estado=?, num_aula=?, dni_docente=?, descripcion=?, imagen=? WHERE idcurso=?`;
            return new Promise((resolve, reject) => {
                db.query(query, [nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen, id], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        },
    //Actualiza solo algunos campos del curso
    patchCurso: (id, campos) => {
        const columnas = Object.keys(campos);
        const valores = Object.values(campos);
        const setClause = columnas.map(col => `${col} = ?`).join(', ');
        const query = `UPDATE curso SET ${setClause} WHERE idcurso = ?`;
        return new Promise((resolve, reject) => {
            // Pasamos los valores dinámicos + el ID al final
            db.query(query, [...valores, id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    createCurso: (datos) => {
        const { nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen } = datos;
        const query = 'INSERT INTO curso (nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            db.query(query, [nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen], (err, result) => {
                if (err) reject(err);
                else resolve(result)
            });
        });
    },

    getEstadosCursos: () => {
        const query = 'SELECT idcurso, estado, fec_ini, fec_fin FROM curso';
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },
    
    cambiarEstadoCurso: (nuevoEstado, idCurso) => {
        const queryCurso = 'UPDATE curso SET estado = ? WHERE idcurso = ?';  
        const queryInscripciones = 'UPDATE inscripcion_curso SET estado = ? WHERE idcurso = ? AND estado <> 4';

        return new Promise((resolve, reject) => {
            db.query(queryCurso, [nuevoEstado, idCurso], (err) => {
                if (err) return reject(err);
               
                db.query(queryInscripciones, [nuevoEstado, idCurso], (err) => {
                    if (err) return reject(err);
                    resolve(true);
                    });
                });
            });
    },


    
}

module.exports = CourseRepository;