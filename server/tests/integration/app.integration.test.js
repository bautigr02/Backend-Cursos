// Integration tests using supertest. We mock repositories to avoid touching real DB.
const request = require('supertest');

// Prevent the real DB connection by mocking models/db before app/routes are required
jest.mock('../../models/db', () => ({ query: jest.fn(), connect: jest.fn() }));

// Mock the CourseRepository before requiring the app so controllers use the mock
const mockCursos = [{ idcurso: 1, nom_curso: 'Integracion Test' }];
jest.mock('../../repositories/courseRepository', () => ({
  getCursos: jest.fn().mockResolvedValue(mockCursos),
  getCursoById: jest.fn().mockResolvedValue(mockCursos[0]),
}));

const app = require('../../app');

describe('Integration - app routes', () => {
  test('GET / returns server running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Servidor funcionando');
  });

  test('GET /api/cursos returns mocked cursos', async () => {
    const res = await request(app).get('/api/cursos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('idcurso', 1);
  });
});
