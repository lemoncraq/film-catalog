import { Component, OnInit } from '@angular/core';
import { FilmService } from '../../services/film.service';
import { Film } from '../../models/film.model';

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html'
  // styleUrls: ['./film-list.component.scss']
})
export class FilmListComponent implements OnInit {
  films: Film[] = [];

  constructor(private filmService: FilmService) { }

  ngOnInit(): void {
    this.loadFilms();
  }

  loadFilms() {
    this.filmService.getFilms().subscribe({
      next: (data) => this.films = data,
      error: (err) => console.error(err)
    });
  }

  deleteFilm(id: number) {
    this.filmService.deleteFilm(id).subscribe({
      next: () => this.loadFilms(),
      error: (err) => console.error(err)
    });
  }

  onAddFilm() {
    // Открытие формы в диалоге, либо переход на страницу добавления
    console.log('Добавить фильм');
  }

  onEditFilm(film: Film) {
    // Открытие формы редактирования
    console.log('Редактировать фильм:', film);
  }

}
