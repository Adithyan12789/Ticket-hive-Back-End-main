"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const ScheduleModel_1 = require("../Models/ScheduleModel");
const ScreensModel_1 = require("../Models/ScreensModel");
let ScreenRepository = class ScreenRepository {
    async getScreenById(screenId) {
        return await ScreensModel_1.Screens.findById(screenId).populate({
            path: 'theater',
            select: 'name city addressLine1 addressLine2 pincode state country',
        });
    }
    async getSchedulesByScreenId(screenId) {
        return await ScheduleModel_1.Schedule.find({ screen: screenId }).populate({
            path: 'showTimes.movie',
            select: 'title',
        });
    }
    async updateScreen(screenId, updateData) {
        return await ScreensModel_1.Screens.findByIdAndUpdate(screenId, updateData, {
            new: true,
        });
    }
    async getScreensByTheater(theaterId) {
        const screens = await ScreensModel_1.Screens.find({ theater: theaterId })
            .populate("schedule", "date showTimes")
            .lean();
        return screens;
    }
    async deleteScreen(screenId) {
        return await ScreensModel_1.Screens.findByIdAndDelete(screenId);
    }
    async getTheatersByMovieName(movieName) {
        return await ScreensModel_1.Screens.find({ "showTimes.movie": movieName }).populate("theater", "name location");
    }
    async createScreen(screenData) {
        const newScreen = new ScreensModel_1.Screens(screenData);
        return await newScreen.save();
    }
    async createSchedule(scheduleData) {
        const newSchedule = new ScheduleModel_1.Schedule(scheduleData);
        const savedSchedule = await newSchedule.save();
        if (savedSchedule.screen) {
            await ScreensModel_1.Screens.findByIdAndUpdate(savedSchedule.screen, {
                $push: { schedule: savedSchedule._id }
            });
        }
        return savedSchedule;
    }
    async getScheduleById(scheduleId) {
        return await ScheduleModel_1.Schedule.findById(scheduleId);
    }
    async updateSchedule(scheduleId, updateData) {
        return await ScheduleModel_1.Schedule.findByIdAndUpdate(scheduleId, updateData, { new: true });
    }
    async updateSeatAvailability(scheduleId, showTime, selectedSeats, holdSeat) {
        const schedule = await ScheduleModel_1.Schedule.findById(scheduleId);
        if (!schedule)
            return null;
        const targetShowTime = schedule.showTimes.find(st => String(st.time) === showTime);
        if (!targetShowTime)
            return null;
        targetShowTime.layout.forEach(row => {
            row.forEach(seat => {
                if (selectedSeats.includes(seat.label)) {
                    seat.holdSeat = holdSeat;
                }
            });
        });
        return await schedule.save();
    }
};
ScreenRepository = __decorate([
    (0, inversify_1.injectable)()
], ScreenRepository);
exports.default = ScreenRepository;
//# sourceMappingURL=ScreenRepo.js.map