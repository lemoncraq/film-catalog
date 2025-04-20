import {Component, OnInit} from '@angular/core';
import {FilmQuery, FilmService} from '../../services/film.service';
import {Film} from '../../models/film.model';
import {MenuItem, SelectItem} from "primeng/api";

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html'
})
export class FilmListComponent implements OnInit {
  films: Film[] = [];

  // UI-модели фильтра
  searchTerm: string = '';
  selectedGenre?: string;
  availableGenres: SelectItem[] = [];
  selectedYear?: number;
  availableYears: SelectItem[] = [];
  dateAddedRange: Date[] = [];
  updatedDateRange: Date[] = [];
  // выбор сортировки
  sortOptions: SelectItem[] = [
    {label: 'Название A → Z', value: 'title_asc'},
    {label: 'Название Z → A', value: 'title_desc'},
    {label: 'Год по возрастанию', value: 'year_asc'},
    {label: 'Год по убыванию', value: 'year_desc'}
  ];
  selectedSort: string | null = null;

  constructor(private filmService: FilmService) {
  }

  ngOnInit(): void {
    // Изначально загрузим все фильмы и выполним один запрос для списка жанров/годов
    this.filmService.getFilms().subscribe(all => {
      this.availableGenres = Array.from(new Set(all.map(f => f.genre)))
        .map(g => ({label: g, value: g}));
      this.availableYears = Array.from(new Set(all.map(f => f.year).filter(y => y)))
        .map(y => ({label: y!.toString(), value: y!}));
      // Затем сразу подгрузим первый раз с пустыми фильтрами
      this.loadFilms();
    });
  }


  loadFilms(): void {
    const q: FilmQuery = {};

    if (this.selectedGenre) q.genre = this.selectedGenre;
    if (this.selectedYear) q.year = this.selectedYear;
    if (this.dateAddedRange?.length === 2 && this.dateAddedRange[0] && this.dateAddedRange[1]) {
      q.addedFrom = this.dateAddedRange[0];
      q.addedTo = this.dateAddedRange[1];
    }
    if (this.updatedDateRange?.length === 2 && this.updatedDateRange[0] && this.updatedDateRange[1]) {
      q.updatedFrom = this.updatedDateRange[0];
      q.updatedTo = this.updatedDateRange[1];
    }
    if (this.searchTerm.trim().length >= 3) {
      q.search = this.searchTerm.trim();
    }
    // сортировка
    if (this.selectedSort) {
      const [field, order] = this.selectedSort.split('_') as ['title' | 'year', 'asc' | 'desc'];
      q.sortField = field;
      q.sortOrder = order;
    }

    this.filmService.getFilms(q).subscribe(f => this.films = f);
  }

  // Вызвать loadFilms() при любых изменениях в UI
  onSearchChange() {
    this.loadFilms();
  }

  onGenreChange() {
    this.loadFilms();
  }

  onYearChange() {
    this.loadFilms();
  }

  onDateAddedChange() {
    this.loadFilms();
  }

  onDateUpdatedChange() {
    this.loadFilms();
  }

  onSortChange(): void {
    this.loadFilms();
  }

  /** Сброс всех фильтров, поиска и сортировки */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedGenre = undefined;
    this.selectedYear = undefined;
    this.dateAddedRange = [];
    this.updatedDateRange = [];
    this.selectedSort = null;

    this.loadFilms();
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
