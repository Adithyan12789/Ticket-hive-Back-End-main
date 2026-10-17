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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieService = void 0;
const CastModel_1 = require("../Models/CastModel");
const inversify_1 = require("inversify");
async function resolveCastImages(casts, existingImages) {
    if (!casts || casts.length === 0)
        return [];
    try {
        const allCasts = await CastModel_1.Cast.find({ name: { $in: casts } });
        const castMap = new Map();
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
    }
    catch (err) {
        console.error("Error resolving cast images:", err);
        return existingImages || [];
    }
}
let MovieService = class MovieService {
    constructor(movieRepository) {
        this.movieRepository = movieRepository;
    }
    async addMovie(movieData) {
        if (movieData.casts && (!movieData.castsImages || movieData.castsImages.length === 0)) {
            movieData.castsImages = await resolveCastImages(movieData.casts, movieData.castsImages);
        }
        return await this.movieRepository.addMovieRepo(movieData);
    }
    async getAllMoviesService() {
        const result = await this.movieRepository.getAllMovies();
        for (const movie of result) {
            if (movie.casts && (!movie.castsImages || movie.castsImages.length === 0 || movie.castsImages.some(img => !img))) {
                movie.castsImages = await resolveCastImages(movie.casts, movie.castsImages);
            }
        }
        return result;
    }
    async findMovieById(movieId) {
        const movie = await this.movieRepository.findMovieById(movieId);
        if (movie && movie.casts && (!movie.castsImages || movie.castsImages.length === 0 || movie.castsImages.some(img => !img))) {
            movie.castsImages = await resolveCastImages(movie.casts, movie.castsImages);
        }
        return movie;
    }
    async updateMovieData(id, updateData, posterFile, movieImageFiles, castImageFiles, bannerFiles) {
        try {
            const movie = await this.movieRepository.findMovieById(id);
            if (!movie) {
                throw new Error("Movie not found");
            }
            movie.title = updateData.title || movie.title;
            movie.genres =
                updateData.genres && Array.isArray(updateData.genres)
                    ? updateData.genres.map((item) => item.trim())
                    : movie.genres;
            movie.duration = updateData.duration || movie.duration;
            movie.description = updateData.description || movie.description;
            movie.director = updateData.director || movie.director;
            movie.casts =
                updateData.casts && Array.isArray(updateData.casts)
                    ? updateData.casts.map((item) => item.trim())
                    : movie.casts;
            movie.languages =
                updateData.languages && Array.isArray(updateData.languages)
                    ? updateData.languages.map((item) => item.trim())
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
            }
            else if (movie.casts && movie.casts.length > 0) {
                movie.castsImages = await resolveCastImages(movie.casts, movie.castsImages);
            }
            const updatedMovie = await movie.save();
            return updatedMovie;
        }
        catch (error) {
            console.error("Error updating movie:", error);
            throw error;
        }
    }
    async deleteMovieService(id) {
        const deletedMovie = await this.movieRepository.findByIdAndDelete(id);
        return deletedMovie;
    }
};
exports.MovieService = MovieService;
exports.MovieService = MovieService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IMovieRepository")),
    __metadata("design:paramtypes", [Object])
], MovieService);
//# sourceMappingURL=MovieService.js.map