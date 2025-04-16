import {Component, EventEmitter, Input, Output, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Film} from '../../models/film.model';

@Component({
  selector: 'app-film-form',
  templateUrl: './film-form.component.html'
})
export class FilmFormComponent implements OnInit {
  @Input() film?: Film;
  @Input() visible: boolean = false;
  @Output() save = new EventEmitter<Film>();
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.initForm();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      title: [this.film?.title || '', Validators.required],
      genre: [this.film?.genre || '', Validators.required],
      year: [this.film?.year || ''],
      director: [this.film?.director || '', Validators.required],
      actors: [this.film?.actors?.join(', ') || '', Validators.required],
      annotation: [this.film?.annotation || ''],
      image: [this.film?.image || '']
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const newFilm: Film = {
      ...this.film,
      title: formValue.title,
      genre: formValue.genre,
      year: formValue.year ? +formValue.year : undefined,
      director: formValue.director,
      actors: formValue.actors.split(',').map((a: string) => a.trim()),
      annotation: formValue.annotation,
      image: formValue.image
    };

    this.save.emit(newFilm);
  }

  onClose() {
    this.form.reset();
    this.close.emit();
  }
}
