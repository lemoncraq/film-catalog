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

// Получение всех фильмов
  server.get(apiPrefix, (req: Request, res: Response): void => {
    res.json(films);
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
  const server = app();
  server.listen(port, () => {
    console.log(`✅ Node Express server listening on http://localhost:${port}`);
  });
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule?.filename || '';

if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
