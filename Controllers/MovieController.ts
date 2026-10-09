import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { inject, injectable } from "inversify"
import { IMovie, Movie } from "../Models/MoviesModel";
import mongoose from "mongoose";
import { IMovieService } from "../Interface/IMovie/IService";

const languageMapping: { [key: string]: string } = {
  en: "English",
  ta: "Tamil",
  ml: "Malalayalam",
  hi: "Hindi",
  te: "Telugu",
};

@injectable()
export class MovieController {
  constructor(
    @inject("IMovieService") private readonly movieService: IMovieService,
  ) { }

  private parseArrayField(field: any): string[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return [field];
  }


  addMovieController = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Add Movie Request Body:", req.body);
      console.log("Add Movie Request Files:", req.files);

      const posterFile = (req.files as any)["poster"]?.[0];
      const bannerFiles = (req.files as any)["banners"] || [];
      const movieImageFiles = (req.files as any)["movieImages"] || [];
      const castImageFiles = (req.files as any)["castImages"] || [];

      if (
        !posterFile ||
        movieImageFiles.length === 0 ||
        bannerFiles.length === 0
      ) {
        res.status(400).json({ message: "Please upload required files (Poster, Banners & Scene Images)." });
        return;
      }

      const genres = this.parseArrayField(req.body.genre || req.body["genre[]"]);
      const languages = this.parseArrayField(req.body.language || req.body["language[]"]);
      const casts = this.parseArrayField(req.body.casts || req.body["casts[]"]);

      const movieData: Partial<IMovie> = {
        title: req.body.title,
        genres: genres.map((genre: string) => genre.toString()),
        duration: req.body.duration,
        description: req.body.description,
        director: req.body.director,
        languages: languages.map(
          (lang: string) => languageMapping[lang] || lang
        ),
        casts: casts,
        releaseDate: req.body.releaseDate,
        posters: posterFile.filename,
        banners: bannerFiles.map((file: any) => file.filename),
        images: movieImageFiles.map((file: any) => file.filename),
        castsImages: castImageFiles.map((file: any) => file.filename),
      };

      const newMovie = await this.movieService.addMovie(movieData);

      res
        .status(201)
        .json({ message: "Movie added successfully", movie: newMovie });
    } catch (error) {
      console.error("Error adding movie:", error);
      res.status(500).json({ message: "Failed to add movie", error });
    }
  }

  getAllMoviesController = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.movieService) {
        throw new Error("MovieService is undefined");
      }

      const movies = await this.movieService.getAllMoviesService();
      res.status(200).json({ movies });
    } catch (error) {
      console.error("Error fetching movies:", error instanceof Error ? error.message : error);
      res.status(500).json({ message: "Failed to get movies" });
    }
  }

  getMovieByIdHandler = async (req: Request, res: Response): Promise<void> => {
    const movieId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(400).json({ message: "Invalid Movie ID" });
      return;
    }

    try {
      const movie = await this.movieService.findMovieById(movieId);

      if (!movie) {
        res.status(404).json({ message: "Movie not found" });
        return;
      }

      res.json(movie.toObject());
    } catch (error) {
      console.error("Error in handler:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  updateMovieHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const posterFile = (req.files as any)["poster"]?.[0];
    const movieImageFiles = (req.files as any)["movieImages"] || [];
    const castImageFiles = (req.files as any)["castImages"] || [];

    const genres = this.parseArrayField(req.body.genre || req.body["genre[]"]);
    const languages = this.parseArrayField(req.body.language || req.body["language[]"]);
    const casts = this.parseArrayField(req.body.casts || req.body["casts[]"]);

    const updateData: Partial<IMovie> = {
      title: req.body.title,
      genres: genres.length > 0 ? genres.map(g => g.toString()) : undefined,
      duration: req.body.duration,
      description: req.body.description,
      director: req.body.director,
      languages: languages.length > 0 ? languages.map(l => languageMapping[l] || l) : undefined,
      casts: casts.length > 0 ? casts : undefined,
      releaseDate: req.body.releaseDate
    };

    try {
      const updatedMovie = await this.movieService.updateMovieData(
        id,
        updateData,
        posterFile,
        movieImageFiles,
        castImageFiles
      );

      if (!updatedMovie) {
        res.status(404).json({ message: "Movie not found for updating" });
        return;
      }

      res.status(200).json(updatedMovie);
    } catch (error: any) {
      console.error("Error updating movie:", error);
      res
        .status(500)
        .json({ message: "Error updating movie", error: error.message });
    }
  }

  deleteMovieHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const deletedMovie = await this.movieService.deleteMovieService(id);

      if (!deletedMovie) {
        res.status(404).json({ message: "Movie not found for deletion" });
        return;
      }

      res
        .status(200)
        .json({ message: "Movie deleted successfully", deletedMovie });
    } catch (error: any) {
      console.error("Error deleting Movie:", error);
      res
        .status(500)
        .json({ message: "Error deleting Movie", error: error.message });
    }
  }
}