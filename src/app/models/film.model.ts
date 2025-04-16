export interface Film {
  id?: number;
  title: string;
  genre: string;
  year?: number;
  director: string;
  actors: string[];
  annotation?: string;
  image?: string; // 👉 ссылка на изображение
  createdAt?: Date;
  updatedAt?: Date;
}
