// Tests de integración usando supertest. Mockeamos repositorios para evitar tocar la BD real.
const request = require('supertest');

// Prevenimos la conexión real a la BD mockeando models/db antes de requerir app/routes
jest.mock('../../models/db', () => ({ query: jest.fn(), connect: jest.fn() }));

// Mockeamos CourseRepository antes de requerir la app para que los controladores usen el mock
const mockCursos = [{ idcurso: 1, nom_curso: 'Integracion Test' }];
jest.mock('../../repositories/courseRepository', () => ({
  getCursos: jest.fn().mockResolvedValue(mockCursos),
  getCursoById: jest.fn().mockResolvedValue(mockCursos[0]),
}));

const app = require('../../app');

describe('Integration - rutas de la app', () => {
  test('GET / devuelve servidor funcionando', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Servidor funcionando');
  });

  test('GET /api/cursos devuelve cursos mockeados', async () => {
    const res = await request(app).get('/api/cursos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('idcurso', 1);
  });
});
