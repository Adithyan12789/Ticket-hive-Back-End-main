// IMovieService.ts

import { IMovie } from "../../Models/MoviesModel";

export interface IMovieService {
    addMovie(movieData: Partial<IMovie>): Promise<IMovie>;
    getAllMoviesService(): Promise<IMovie[]>;
    findMovieById(movieId: string): Promise<IMovie>;
    updateMovieData(
        id: string,
        updateData: Partial<IMovie>,
        posterFile: { filename: string } | null,
        movieImageFiles: { filename: string }[],
        castImageFiles: { filename: string }[]    
    ): Promise<IMovie | null>;
    deleteMovieService(id: string): Promise<IMovie | null>;
}


  