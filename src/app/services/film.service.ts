import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Film } from '../models/film.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilmService {

  private apiUrl = '/api/films';

  constructor(private http: HttpClient) { }

  getFilms(): Observable<Film[]> {
    return this.http.get<Film[]>(this.apiUrl);
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
