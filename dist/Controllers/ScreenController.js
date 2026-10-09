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
exports.ScreenController = void 0;
const inversify_1 = require("inversify");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
let ScreenController = class ScreenController {
    constructor(screenService) {
        this.screenService = screenService;
        this.validateScreenData = [
            (0, express_validator_1.body)("screenNumber").isInt({ min: 1 }).withMessage("Screen number must be a positive integer"),
            (0, express_validator_1.body)("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
            (0, express_validator_1.body)("layout").isArray({ min: 1 }).withMessage("Layout must be a non-empty array")
                .custom((layout) => layout.every((row) => Array.isArray(row) && row.every((seat) => typeof seat.label === "string" && typeof seat.isAvailable === "boolean")))
                .withMessage("Each layout row must be an array of objects with label and isAvailable properties"),
        ];
        this.validateScheduleData = [
            (0, express_validator_1.body)("screen").isMongoId().withMessage("Screen ID must be valid"),
            (0, express_validator_1.body)("showTimes").isArray().withMessage("Show times must be an array"),
            (0, express_validator_1.body)("showTimes.*.time").notEmpty().withMessage("Show time is required"),
            (0, express_validator_1.body)("showTimes.*.movie").isMongoId().withMessage("Movie ID must be valid"),
            (0, express_validator_1.body)("showTimes.*.movieTitle").notEmpty().withMessage("Movie title is required"),
        ];
        this.addScreen = (0, express_async_handler_1.default)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { theaterId } = req.params;
            const { screenNumber, capacity, layout, showTimes } = req.body;
            console.log("DEBUG: ScreenController addScreen req.body.showTimes:", showTimes ? JSON.stringify(showTimes).substring(0, 200) : "undefined");
            try {
                const newScreen = await this.screenService.addScreenHandler(req.user?._id, {
                    screenNumber,
                    capacity,
                    layout,
                    theater: theaterId,
                    showTimes
                });
                res.status(201).json({
                    message: 'Screen added successfully',
                    screen: newScreen,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to add screen', error: error.message });
            }
        });
        this.updateScreen = (0, express_async_handler_1.default)(async (req, res) => {
            const { theaterId, screenId } = req.params;
            const { screenNumber, capacity, layout } = req.body;
            try {
                const updatedScreen = await this.screenService.editScreenHandler(req.user?._id, screenId, { screenNumber, capacity, layout, showTimes: req.body.showTimes });
                if (!updatedScreen) {
                    res.status(404).json({ message: 'Screen not found' });
                    return;
                }
                res.status(200).json({
                    message: 'Screen updated successfully',
                    screen: updatedScreen,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to update screen', error: error.message });
            }
        });
        this.addSchedule = (0, express_async_handler_1.default)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { screen, date, showTimes } = req.body;
            try {
                const createdSchedule = await this.screenService.addScheduleHandler(screen, { date, showTimes });
                res.status(201).json({ message: "Schedule created successfully", createdSchedule });
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to add schedule', error: error.message });
            }
        });
        this.deleteScreen = (0, express_async_handler_1.default)(async (req, res) => {
            const { screenId } = req.params;
            try {
                const deletedScreen = await this.screenService.deleteScreenHandler(screenId);
                if (!deletedScreen) {
                    res.status(404).json({ message: "Screen not found for deletion" });
                    return;
                }
                res.status(200).json({ message: "Screen deleted successfully", deletedScreen });
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting Screen", error: error.message });
            }
        });
        this.getScreensByTheaterId = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            try {
                const screenDetails = await this.screenService.getScreensWithSchedulesByTheaterIdsService(id);
                if (!screenDetails || screenDetails.length === 0) {
                    res.status(404).json({ message: "Screens not found" });
                    return;
                }
                res.status(200).json(screenDetails);
            }
            catch (error) {
                res.status(500).json({ message: error?.message || "Internal server error" });
            }
        });
        this.getScreensById = (0, express_async_handler_1.default)(async (req, res) => {
            const { screenId } = req.params;
            try {
                const screenWithSchedules = await this.screenService.getScreensByIdService(screenId);
                res.status(200).json(screenWithSchedules);
            }
            catch (error) {
                res.status(500).json({ message: error?.message || "Internal server error" });
            }
        });
        this.getTheatersByMovieName = (0, express_async_handler_1.default)(async (req, res) => {
            const { movieName } = req.params;
            if (!movieName) {
                res.status(400).json({ error: "Movie name is required" });
                return;
            }
            try {
                const theaters = await this.screenService.getTheatersByMovieNameService(movieName);
                if (!theaters.length) {
                    res.status(404).json({ message: "No theaters found for the specified movie" });
                    return;
                }
                res.status(200).json(theaters);
            }
            catch (error) {
                res.status(500).json({ message: error?.message || "Internal server error" });
            }
        });
        this.updateSeatAvailability = (0, express_async_handler_1.default)(async (req, res) => {
            const { scheduleId, selectedSeats, holdSeat, showTime } = req.body;
            if (!scheduleId || !Array.isArray(selectedSeats)) {
                res.status(400).json({
                    error: "Invalid data. 'scheduleId' and 'selectedSeats' are required.",
                });
                return;
            }
            try {
                const updatedSeats = await this.screenService.updateSeatAvailabilityHandler(scheduleId, selectedSeats, holdSeat, showTime);
                if (!updatedSeats) {
                    res.status(404).json({ message: "Schedule not found or unable to update seats." });
                    return;
                }
                res.status(200).json({
                    message: "Seat availability updated successfully.",
                    updatedSeats,
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message || "Internal server error" });
            }
        });
    }
};
exports.ScreenController = ScreenController;
exports.ScreenController = ScreenController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IScreenService")),
    __metadata("design:paramtypes", [Object])
], ScreenController);
//# sourceMappingURL=ScreenController.js.map