import { Schedule } from "../Models/ScheduleModel";

class ScheduleRepository {
  // Create a new schedule
  public async createSchedule(scheduleData: {
    screen: string; // Screen ID
    date: string; // Schedule date
    showTimes: {
      time: string;
      movie: string; // Movie ID
      movieTitle: string;
      layout: any[]; // Seat availability layout
    }[];
  }) {
    const newSchedule = new Schedule({
      ...scheduleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await newSchedule.save();
  }

  // Find a schedule by ID
  public async getScheduleById(scheduleId: string) {
    return await Schedule.findById(scheduleId).populate("screen");
  }

  // Update a schedule by ID
  public async updateSchedule(scheduleId: string, updateData: any) {
    return await Schedule.findByIdAndUpdate(scheduleId, updateData, {
      new: true,
    }).populate("screen");
  }

  public async getScheduleByScreenId(screenId: string) {
    return await Schedule.find({ screen: screenId }).populate('showTimes.movie', 'title'); // Populate movie title if needed
  }

  // Find schedules by screen ID
  public async getSchedulesByScreen(screenId: string) {
    return await Schedule.find({ screen: screenId });
  }

  // Delete a schedule by ID
  public async deleteSchedule(scheduleId: string) {
    return await Schedule.findByIdAndDelete(scheduleId);
  }
}

export default new ScheduleRepository();
