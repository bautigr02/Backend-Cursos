// Tests unitarios para courseController - mockea CourseRepository para aislar la lógica del controlador
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

  test('getCursoById devuelve 200 con el curso cuando lo encuentra', async () => {
    CourseRepository.getCursoById.mockResolvedValue({ idcurso: 1, nom_curso: 'A' });
    const req = { params: { id: 1 } };
    await getCursoById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ idcurso: 1, nom_curso: 'A' });
  });

  test('getCursoById devuelve 404 cuando no encuentra el curso', async () => {
    CourseRepository.getCursoById.mockResolvedValue(undefined);
    const req = { params: { id: 999 } };
    await getCursoById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Curso no encontrado' });
  });

  test('createCurso devuelve 400 cuando faltan campos obligatorios', async () => {
    const req = { body: { nom_curso: 'OnlyName' } };
    await createCurso(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  test('createCurso devuelve 400 cuando fecha fin <= fecha inicio', async () => {
    const req = { body: { nom_curso: 'X', fec_ini: '2025-01-02', fec_fin: '2025-01-01', estado: 1, num_aula: 1, dni_docente: 123 } };
    await createCurso(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('createCurso llama al repositorio y devuelve 201 en caso exitoso', async () => {
    const req = { body: { nom_curso: 'A', fec_ini: '2099-01-01', fec_fin: '2099-02-01', estado: 1, num_aula: 1, dni_docente: 123, descripcion: 'd', imagen: 'i' } };
    CourseRepository.createCurso.mockResolvedValue({ insertId: 42 });
    await createCurso(req, res);
    expect(CourseRepository.createCurso).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }));
  });
});
