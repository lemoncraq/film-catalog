import {Component, OnInit} from '@angular/core';
import {FilmService} from '../../services/film.service';
import {Film} from '../../models/film.model';
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html'
  // styleUrls: ['./film-list.component.scss']
})
export class FilmListComponent implements OnInit {
  films: Film[] = [];

  constructor(private filmService: FilmService) {
  }

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

  showForm = false;
  selectedFilm?: Film;

  onAddFilm() {
    this.selectedFilm = undefined;
    this.showForm = true;
  }

  onEditFilm(film: Film) {
    this.selectedFilm = {...film}; // копия, чтобы не портить оригинал
    this.showForm = true;
  }

  onSave(film: Film) {
    if (film.id) {
      this.filmService.updateFilm(film).subscribe(() => this.loadFilms());
    } else {
      this.filmService.addFilm(film).subscribe(() => this.loadFilms());
    }
    this.showForm = false;
  }

  activeFilm!: Film;

  menuItems: MenuItem[] = [
    {
      label: 'Редактировать',
      icon: 'pi pi-pencil',
      command: () => this.onEditFilm(this.activeFilm)
    },
    {
      label: 'Удалить',
      icon: 'pi pi-trash',
      command: () => this.deleteFilm(this.activeFilm.id!)
    }
  ];
}
