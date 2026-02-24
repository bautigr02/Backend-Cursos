// Unit test for CourseRepository - mocks `models/db` to avoid real DB connection
jest.mock('../models/db', () => ({ query: jest.fn() }));

const db = require('../models/db');
const CourseRepository = require('../repositories/courseRepository');

describe('CourseRepository (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCursoById resolves with single curso object', async () => {
    const fakeResult = [{ idcurso: 1, nom_curso: 'Test' }];
    db.query.mockImplementation((query, params, cb) => cb(null, fakeResult));

    const curso = await CourseRepository.getCursoById(1);
    expect(curso).toEqual(fakeResult[0]);
    expect(db.query).toHaveBeenCalled();
  });

  test('getCursos resolves with array of cursos', async () => {
    const fakeResults = [{ idcurso: 1 }, { idcurso: 2 }];
    db.query.mockImplementation((query, cb) => cb(null, fakeResults));

    const cursos = await CourseRepository.getCursos();
    expect(Array.isArray(cursos)).toBe(true);
    expect(cursos).toHaveLength(2);
  });

  test('getCursoById rejects when db returns error', async () => {
    db.query.mockImplementation((query, params, cb) => cb(new Error('DB error')));
    await expect(CourseRepository.getCursoById(999)).rejects.toThrow('DB error');
  });
});
