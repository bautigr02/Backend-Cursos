# TP-CURSOS

## Backend-Cursos

Repositorio del codigo Backend del proyecto **Cursos**

El deploy del mismo fue realizado en <mark> [Railway.app](https://railway.com/). </mark>

## Setup

Para que funcione correctamente recordar incluir el archivo **.env** con las creedenciales correspondientes al **.env.ejemplo**

Al correr el codigo de forma local, este estara disponible en: <mark> http://localhost:3000/ </mark>

## Comandos Utiles

Instalar dependencias: <mark> npm install </mark>

Inciar el backend de forma local: <mark> npm start (Habilita el http://localhost:3000/) </mark>

## Tests

Los tests realizados son: 
1. Test del controlador curso.
2. Test del repository de curso.
3. Test de integracion.

(**Estos test fueron realizados utilizando Jest y supertest**)

### Comandos de Testing

Todos los tests (unitarios e integración): <mark> npm run test:backend </mark>

Solo tests unitarios: <mark> npm run test:backend -- --testPathPattern=__tests__ </mark>

Solo tests de integración: <mark> npm run test:backend -- --testPathPattern=integration </mark>

Test de un archivo específico: <mark> npm run test:backend -- courseController.unit.test </mark>

**Nota:** Los tests corren con variables de entorno de test configuradas automáticamente
