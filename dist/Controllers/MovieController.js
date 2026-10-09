"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieController = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = __importDefault(require("mongoose"));
const languageMapping = {
    en: "English",
    ta: "Tamil",
    ml: "Malalayalam",
    hi: "Hindi",
    te: "Telugu",
};
let MovieController = class MovieController {
    constructor(movieService) {
        this.movieService = movieService;
        this.addMovieController = async (req, res) => {
            try {
                console.log("Add Movie Request Body:", req.body);
                console.log("Add Movie Request Files:", req.files);
                const posterFile = req.files["poster"]?.[0];
                const bannerFiles = req.files["banners"] || [];
                const movieImageFiles = req.files["movieImages"] || [];
                const castImageFiles = req.files["castImages"] || [];
                if (!posterFile ||
                    movieImageFiles.length === 0 ||
                    bannerFiles.length === 0) {
                    res.status(400).json({ message: "Please upload required files (Poster, Banners & Scene Images)." });
                    return;
                }
                const genres = this.parseArrayField(req.body.genre || req.body["genre[]"]);
                const languages = this.parseArrayField(req.body.language || req.body["language[]"]);
                const casts = this.parseArrayField(req.body.casts || req.body["casts[]"]);
                const movieData = {
                    title: req.body.title,
                    genres: genres.map((genre) => genre.toString()),
                    duration: req.body.duration,
                    description: req.body.description,
                    director: req.body.director,
                    languages: languages.map((lang) => languageMapping[lang] || lang),
                    casts: casts,
                    releaseDate: req.body.releaseDate,
                    posters: posterFile.filename,
                    banners: bannerFiles.map((file) => file.filename),
                    images: movieImageFiles.map((file) => file.filename),
                    castsImages: castImageFiles.map((file) => file.filename),
                };
                const newMovie = await this.movieService.addMovie(movieData);
                res
                    .status(201)
                    .json({ message: "Movie added successfully", movie: newMovie });
            }
            catch (error) {
                console.error("Error adding movie:", error);
                res.status(500).json({ message: "Failed to add movie", error });
            }
        };
        this.getAllMoviesController = async (req, res) => {
            try {
                if (!this.movieService) {
                    throw new Error("MovieService is undefined");
                }
                const movies = await this.movieService.getAllMoviesService();
                res.status(200).json({ movies });
            }
            catch (error) {
                console.error("Error fetching movies:", error instanceof Error ? error.message : error);
                res.status(500).json({ message: "Failed to get movies" });
            }
        };
        this.getMovieByIdHandler = async (req, res) => {
            const movieId = req.params.id;
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId)) {
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
            }
            catch (error) {
                console.error("Error in handler:", error);
                res.status(500).json({ message: "Server error" });
            }
        };
        this.updateMovieHandler = async (req, res) => {
            const { id } = req.params;
            const posterFile = req.files["poster"]?.[0];
            const movieImageFiles = req.files["movieImages"] || [];
            const castImageFiles = req.files["castImages"] || [];
            const genres = this.parseArrayField(req.body.genre || req.body["genre[]"]);
            const languages = this.parseArrayField(req.body.language || req.body["language[]"]);
            const casts = this.parseArrayField(req.body.casts || req.body["casts[]"]);
            const updateData = {
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
                const updatedMovie = await this.movieService.updateMovieData(id, updateData, posterFile, movieImageFiles, castImageFiles);
                if (!updatedMovie) {
                    res.status(404).json({ message: "Movie not found for updating" });
                    return;
                }
                res.status(200).json(updatedMovie);
            }
            catch (error) {
                console.error("Error updating movie:", error);
                res
                    .status(500)
                    .json({ message: "Error updating movie", error: error.message });
            }
        };
        this.deleteMovieHandler = async (req, res) => {
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
            }
            catch (error) {
                console.error("Error deleting Movie:", error);
                res
                    .status(500)
                    .json({ message: "Error deleting Movie", error: error.message });
            }
        };
    }
    parseArrayField(field) {
        if (!field)
            return [];
        if (Array.isArray(field))
            return field;
        return [field];
    }
};
exports.MovieController = MovieController;
exports.MovieController = MovieController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IMovieService")),
    __metadata("design:paramtypes", [Object])
], MovieController);
//# sourceMappingURL=MovieController.js.map