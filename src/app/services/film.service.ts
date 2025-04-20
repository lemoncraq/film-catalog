import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Film } from '../models/film.model';
import { Observable } from 'rxjs';

export interface FilmQuery {
  genre?: string;
  year?: number;
  addedFrom?: Date;
  addedTo?: Date;
  updatedFrom?: Date;
  updatedTo?: Date;
  search?: string;
  sortField?: 'title' | 'year';
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class FilmService {

  private apiUrl = '/api/films';

  constructor(private http: HttpClient) { }

  getFilms(query?: FilmQuery): Observable<Film[]> {
    let params = new HttpParams();

    if (query) {
      if (query.genre)      params = params.set('genre', query.genre);
      if (query.year)       params = params.set('year', query.year.toString());
      if (query.addedFrom)  params = params.set('addedFrom', query.addedFrom.toISOString());
      if (query.addedTo)    params = params.set('addedTo', query.addedTo.toISOString());
      if (query.updatedFrom)params = params.set('updatedFrom', query.updatedFrom.toISOString());
      if (query.updatedTo)  params = params.set('updatedTo', query.updatedTo.toISOString());
      if (query.search)     params = params.set('search', query.search);
      if (query.sortField) {
        params = params.set('sortField', query.sortField);
        params = params.set('sortOrder', query.sortOrder || 'asc');
      }
    }

    return this.http.get<Film[]>(this.apiUrl, { params });
  }

  addFilm(film: Film): Observable<Film> {
    return this.http.post<Film>(this.apiUrl, film);
  }

  updateFilm(film: Film): Observable<Film> {
    return this.http.put<Film>(`${this.apiUrl}/${film.id}`, film);
  }

  deleteFilm(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
