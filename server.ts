import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { AppServerModule } from './src/main.server';
import type { Request, Response } from 'express';

// Тип для фильма
interface Film {
  id: number;
  title: string;
  genre: string;
  year?: number;
  director: string;
  actors: string[];
  annotation?: string;
  image?: string; // 👉 ссылка на изображение
  createdAt: Date;
  updatedAt: Date;
}

// In-memory хранилище фильмов
const films: Film[] = [
  {
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    year: 2010,
    director: 'Christopher Nolan',
    actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
    annotation: 'A mind-bending thriller',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/film-catalog/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.use(express.json()); // 👈 Нужно для парсинга JSON в body

  /** ====== API endpoints ====== **/

  const apiPrefix = '/api/films';


// GET /api/films?genre=&year=&search=&addedFrom=&addedTo=&updatedFrom=&updatedTo=
  server.get(apiPrefix, (req: Request, res: Response): void => {
    let result = films.slice();

    const { genre, year, search, addedFrom, addedTo, updatedFrom, updatedTo } = req.query;

    // Фильтрация по жанру
    if (genre && typeof genre === 'string') {
      result = result.filter(f => f.genre === genre);
    }

    // Фильтрация по году
    if (year && !isNaN(+year)) {
      const y = +year;
      result = result.filter(f => f.year === y);
    }

    // Фильтрация по диапазону дат добавления
    if (addedFrom && addedTo) {
      const from = new Date(addedFrom as string);
      const to   = new Date(addedTo   as string);
      result = result.filter(f => f.createdAt >= from && f.createdAt <= to);
    }

    // Фильтрация по диапазону дат обновления
    if (updatedFrom && updatedTo) {
      const from = new Date(updatedFrom as string);
      const to   = new Date(updatedTo   as string);
      result = result.filter(f => f.updatedAt >= from && f.updatedAt <= to);
    }

    // Поиск (регистронезависимо, по части слова или фразы, от 3 символов)
    if (search && typeof search === 'string' && search.trim().length >= 3) {
      const term = search.trim().toLowerCase();
      result = result.filter(f => {
        const haystack = [
          f.title,
          f.director,
          f.annotation || '',
          ...f.actors
        ].join(' ').toLowerCase();

        return haystack.includes(term);
      });
    }

    const { sortField, sortOrder } = req.query;

    if (sortField && typeof sortField === 'string') {
      const order = (sortOrder === 'desc') ? -1 : 1;
      result.sort((a, b) => {
        const aVal = (a as any)[sortField];
        const bVal = (b as any)[sortField];

        // если оба значения строки
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }

        // если числа (год)
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * order;
        }

        return 0;
      });
    }

    res.json(result);
  });


// Добавление фильма
  server.post(apiPrefix, (req: Request, res: Response): void => {
    const { title, genre, year, director, actors, annotation, image } = req.body;

    if (!title || !genre || !director || !Array.isArray(actors) || actors.length === 0) {
      res.status(400).json({ error: 'Обязательные поля: title, genre, director, actors[]' });
      return;
    }

    const newFilm: Film = {
      id: films.length ? films[films.length - 1].id + 1 : 1,
      title,
      genre,
      year,
      director,
      actors,
      annotation,
      image,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    films.push(newFilm);
    res.status(201).json(newFilm);
  });

// Обновление фильма
  server.put(`${apiPrefix}/:id`, (req: Request, res: Response): void => {
    const id = parseInt(req.params['id']);
    const film = films.find(f => f.id === id);

    if (!film) {
      res.status(404).json({ error: 'Фильм не найден' });
      return;
    }

    const { title, genre, year, director, actors, annotation, image } = req.body;

    if (title !== undefined) film.title = title;
    if (genre !== undefined) film.genre = genre;
    if (year !== undefined) film.year = year;
    if (director !== undefined) film.director = director;
    if (actors !== undefined && Array.isArray(actors)) film.actors = actors;
    if (annotation !== undefined) film.annotation = annotation;
    if (image !== undefined) film.image = image;

    film.updatedAt = new Date();

    res.json(film);
  });

// Удаление фильма
  server.delete(`${apiPrefix}/:id`, (req: Request, res: Response): void => {
    const id = parseInt(req.params['id']);
    const index = films.findIndex(f => f.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Фильм не найден' });
      return;
    }

    films.splice(index, 1);
    res.json({ message: 'Фильм удалён' });
  });

  /** ====== Static + SSR ====== **/

  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
    });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const host = '0.0.0.0';
  const server = app();
  server.listen(port as number, host, () => {
    console.log(`✅ Server running on http://${host}:${port}`);
  });
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule?.filename || '';

if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
