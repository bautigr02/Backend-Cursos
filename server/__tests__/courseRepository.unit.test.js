// Tests unitarios para CourseRepository - mockea `models/db` para evitar conexión real a la base de datos
jest.mock('../models/db', () => ({ query: jest.fn() }));

const db = require('../models/db');
const CourseRepository = require('../repositories/courseRepository');

describe('CourseRepository (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCursoById resuelve con un objeto curso único', async () => {
    const fakeResult = [{ idcurso: 1, nom_curso: 'Test' }];
    db.query.mockImplementation((query, params, cb) => cb(null, fakeResult));

    const curso = await CourseRepository.getCursoById(1);
    expect(curso).toEqual(fakeResult[0]);
    expect(db.query).toHaveBeenCalled();
  });

  test('getCursos resuelve con un array de cursos', async () => {
    const fakeResults = [{ idcurso: 1 }, { idcurso: 2 }];
    db.query.mockImplementation((query, cb) => cb(null, fakeResults));

    const cursos = await CourseRepository.getCursos();
    expect(Array.isArray(cursos)).toBe(true);
    expect(cursos).toHaveLength(2);
  });

  test('getCursoById rechaza la promesa cuando la BD devuelve error', async () => {
    db.query.mockImplementation((query, params, cb) => cb(new Error('DB error')));
    await expect(CourseRepository.getCursoById(999)).rejects.toThrow('DB error');
  });
});
