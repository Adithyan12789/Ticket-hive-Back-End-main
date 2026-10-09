// IMovieRepository.ts

import { HydratedDocument } from "mongoose";
import { IMovie } from "../../Models/MoviesModel";
import { IReview } from "../../Models/ReviewModel";

export interface IMovieRepository {
    addMovieRepo(movieData: Partial<IMovie>): Promise<HydratedDocument<IMovie>>;
    getAllMovies(): Promise<IMovie[]>;
    findMovieById(movieId: string): Promise<IMovie | null>;
    findByIdAndDelete(id: string): Promise<IMovie | null>;
}

