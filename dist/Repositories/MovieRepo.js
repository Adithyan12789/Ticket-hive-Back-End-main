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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieRepository = void 0;
const MoviesModel_1 = require("../Models/MoviesModel");
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./Base/BaseRepository");
let MovieRepository = class MovieRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(MoviesModel_1.Movie);
    }
    async addMovieRepo(movieData) {
        const movie = new MoviesModel_1.Movie(movieData);
        try {
            const savedMovie = await movie.save();
            return savedMovie;
        }
        catch (error) {
            console.error("Error saving movie:", error);
            throw error;
        }
    }
    async getAllMovies() {
        return MoviesModel_1.Movie.find();
    }
    async findMovieById(id) {
        return await MoviesModel_1.Movie.findById(id);
    }
    async findByIdAndDelete(id) {
        return await MoviesModel_1.Movie.findByIdAndDelete(id);
    }
};
exports.MovieRepository = MovieRepository;
exports.MovieRepository = MovieRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], MovieRepository);
exports.default = MovieRepository;
//# sourceMappingURL=MovieRepo.js.map