import { IMovie, Movie } from "../Models/MoviesModel";
import { inject, injectable } from "inversify"
import { IMovieRepository } from "../Interface/IMovie/IRepository";
import { IMovieService } from "../Interface/IMovie/IService";

@injectable()
export class MovieService implements IMovieService {
  constructor(
    @inject("IMovieRepository") private movieRepository: IMovieRepository
  ) {}

  public async addMovie(movieData: Partial<IMovie>): Promise<IMovie> {
    return await this.movieRepository.addMovieRepo(movieData);
  }

  public async getAllMoviesService(): Promise<IMovie[]> {
    const result = await this.movieRepository.getAllMovies();
    return result;
  }
  
  public async findMovieById(movieId: string): Promise<any> {
    return await this.movieRepository.findMovieById(movieId);
  }

  public async updateMovieData(
    id: string,
    updateData: Partial<IMovie>,
    posterFile: { filename: string } | null,
    movieImageFiles: { filename: string }[],
    castImageFiles: { filename: string }[]    
  ) {
    try {
      const movie = await this.movieRepository.findMovieById(id);
      

      if (!movie) {
        throw new Error("Movie not found");
      }
      
      movie.title = updateData.title || movie.title;
      movie.genres =
        updateData.genres && Array.isArray(updateData.genres)
          ? updateData.genres.map((item: string) => item.trim())
          : movie.genres;
      movie.duration = updateData.duration || movie.duration;
      movie.description = updateData.description || movie.description;
      movie.director = updateData.director || movie.director;
      movie.casts =
        updateData.casts && Array.isArray(updateData.casts)
          ? updateData.casts.map((item: string) => item.trim())
          : movie.casts;
      movie.languages =
        updateData.languages && Array.isArray(updateData.languages)
          ? updateData.languages.map((item: string) => item.trim())
          : movie.languages;
      movie.releaseDate = updateData.releaseDate || movie.releaseDate;

      if (posterFile) {
          movie.posters = posterFile.filename;
      }

      if (movieImageFiles && movieImageFiles.length > 0) {
        movie.images = movieImageFiles.map(file => file.filename);
      }
      
      if (castImageFiles && castImageFiles.length > 0) {
        movie.castsImages = castImageFiles.map(file => file.filename);
      }      

      const updatedMovie = await movie.save();
      
      return updatedMovie;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  }

  public async deleteMovieService(id: string): Promise<IMovie | null> {
    const deletedMovie = await this.movieRepository.findByIdAndDelete(id);
    return deletedMovie;
  }
}
