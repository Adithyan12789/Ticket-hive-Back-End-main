import { Movie, IMovie } from "../Models/MoviesModel";
import { HydratedDocument } from "mongoose";
import { injectable } from "inversify";
import { BaseRepository } from "./Base/BaseRepository";
import { IMovieRepository } from "../Interface/IMovie/IRepository";

@injectable()
export class MovieRepository
  extends BaseRepository<IMovie>
  implements IMovieRepository
{
  constructor() {
    super(Movie);
  }

  public async addMovieRepo(
    movieData: Partial<IMovie>
  ): Promise<HydratedDocument<IMovie>> {
    // Use HydratedDocument for type compatibility
    const movie = new Movie(movieData);

    try {
      const savedMovie = await movie.save();
      return savedMovie;
    } catch (error) {
      console.error("Error saving movie:", error);
      throw error;
    }
  }

  public async getAllMovies(): Promise<IMovie[]> {
    return Movie.find(); // Removed unnecessary await
  }

  public async findMovieById(id: string): Promise<IMovie | null> {
    return await Movie.findById(id);
  }

  public async findByIdAndDelete(id: string): Promise<IMovie | null> {
    return await Movie.findByIdAndDelete(id);
  }
}

export default MovieRepository;
