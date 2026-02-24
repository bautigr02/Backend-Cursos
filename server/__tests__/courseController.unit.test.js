// Unit tests for courseController - mocks CourseRepository
jest.mock('../repositories/courseRepository', () => ({
  getCursoById: jest.fn(),
  createCurso: jest.fn(),
}));

const CourseRepository = require('../repositories/courseRepository');
const { getCursoById, createCurso } = require('../controllers/courseController');

describe('courseController (unit)', () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test('getCursoById returns 200 with curso when found', async () => {
    CourseRepository.getCursoById.mockResolvedValue({ idcurso: 1, nom_curso: 'A' });
    const req = { params: { id: 1 } };
    await getCursoById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ idcurso: 1, nom_curso: 'A' });
  });

  test('getCursoById returns 404 when not found', async () => {
    CourseRepository.getCursoById.mockResolvedValue(undefined);
    const req = { params: { id: 999 } };
    await getCursoById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Curso no encontrado' });
  });

  test('createCurso returns 400 when missing fields', async () => {
    const req = { body: { nom_curso: 'OnlyName' } };
    await createCurso(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  test('createCurso returns 400 when fin <= inicio', async () => {
    const req = { body: { nom_curso: 'X', fec_ini: '2025-01-02', fec_fin: '2025-01-01', estado: 1, num_aula: 1, dni_docente: 123 } };
    await createCurso(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createCurso calls repository and returns 201 on success', async () => {
    const req = { body: { nom_curso: 'A', fec_ini: '2099-01-01', fec_fin: '2099-02-01', estado: 1, num_aula: 1, dni_docente: 123, descripcion: 'd', imagen: 'i' } };
    CourseRepository.createCurso.mockResolvedValue({ insertId: 42 });
    await createCurso(req, res);
    expect(CourseRepository.createCurso).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }));
  });
});
