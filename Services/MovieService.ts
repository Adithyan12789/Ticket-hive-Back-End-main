import { IMovie, Movie } from "../Models/MoviesModel";
import { Cast } from "../Models/CastModel";
import { inject, injectable } from "inversify"
import { IMovieRepository } from "../Interface/IMovie/IRepository";
import { IMovieService } from "../Interface/IMovie/IService";

async function resolveCastImages(casts: string[], existingImages?: string[]): Promise<string[]> {
  if (!casts || casts.length === 0) return [];
  try {
    const allCasts = await Cast.find({ name: { $in: casts } });
    const castMap = new Map<string, string>();
    allCasts.forEach(c => {
      if (c.name && c.image) {
        castMap.set(c.name.trim().toLowerCase(), c.image);
      }
    });

    return casts.map((actorName, idx) => {
      if (existingImages && existingImages[idx]) {
        return existingImages[idx];
      }
      return castMap.get(actorName.trim().toLowerCase()) || "";
    });
  } catch (err) {
    console.error("Error resolving cast images:", err);
    return existingImages || [];
  }
}

@injectable()
export class MovieService implements IMovieService {
  constructor(
    @inject("IMovieRepository") private movieRepository: IMovieRepository
  ) {}

  public async addMovie(movieData: Partial<IMovie>): Promise<IMovie> {
    if (movieData.casts && (!movieData.castsImages || movieData.castsImages.length === 0)) {
      movieData.castsImages = await resolveCastImages(movieData.casts, movieData.castsImages);
    }
    return await this.movieRepository.addMovieRepo(movieData);
  }

  public async getAllMoviesService(): Promise<IMovie[]> {
    const result = await this.movieRepository.getAllMovies();
    for (const movie of result) {
      if (movie.casts && (!movie.castsImages || movie.castsImages.length === 0 || movie.castsImages.some(img => !img))) {
        movie.castsImages = await resolveCastImages(movie.casts, movie.castsImages);
      }
    }
    return result;
  }
  
  public async findMovieById(movieId: string): Promise<any> {
    const movie = await this.movieRepository.findMovieById(movieId);
    if (movie && movie.casts && (!movie.castsImages || movie.castsImages.length === 0 || movie.castsImages.some(img => !img))) {
      movie.castsImages = await resolveCastImages(movie.casts, movie.castsImages);
    }
    return movie;
  }

  public async updateMovieData(
    id: string,
    updateData: Partial<IMovie>,
    posterFile: { filename: string } | null,
    movieImageFiles: { filename: string }[],
    castImageFiles: { filename: string }[],
    bannerFiles?: { filename: string }[]
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
      
      if (bannerFiles && bannerFiles.length > 0) {
        movie.banners = bannerFiles.map(file => file.filename);
      }

      if (castImageFiles && castImageFiles.length > 0) {
        movie.castsImages = castImageFiles.map(file => file.filename);
      } else if (movie.casts && movie.casts.length > 0) {
        movie.castsImages = await resolveCastImages(movie.casts, movie.castsImages);
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

