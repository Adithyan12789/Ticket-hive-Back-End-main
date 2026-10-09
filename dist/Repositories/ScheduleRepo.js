"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduleModel_1 = require("../Models/ScheduleModel");
class ScheduleRepository {
    async createSchedule(scheduleData) {
        const newSchedule = new ScheduleModel_1.Schedule({
            ...scheduleData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await newSchedule.save();
    }
    async getScheduleById(scheduleId) {
        return await ScheduleModel_1.Schedule.findById(scheduleId).populate("screen");
    }
    async updateSchedule(scheduleId, updateData) {
        return await ScheduleModel_1.Schedule.findByIdAndUpdate(scheduleId, updateData, {
            new: true,
        }).populate("screen");
    }
    async getScheduleByScreenId(screenId) {
        return await ScheduleModel_1.Schedule.find({ screen: screenId }).populate('showTimes.movie', 'title');
    }
    async getSchedulesByScreen(screenId) {
        return await ScheduleModel_1.Schedule.find({ screen: screenId });
    }
    async deleteSchedule(scheduleId) {
        return await ScheduleModel_1.Schedule.findByIdAndDelete(scheduleId);
    }
}
exports.default = new ScheduleRepository();
//# sourceMappingURL=ScheduleRepo.js.map