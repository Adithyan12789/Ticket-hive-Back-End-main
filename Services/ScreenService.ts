import { inject, injectable } from "inversify";
import { format } from "date-fns";
import mongoose from "mongoose";
import { IScreenRepository } from "../Interface/IScreen/IRepository";
import { IScreenService } from "../Interface/IScreen/IService";
import { ISchedule } from "../Models/ScheduleModel";
import { IScreen } from "../Models/ScreensModel";
import TheaterDetails from "../Models/TheaterDetailsModel";

@injectable()
export class ScreenService implements IScreenService {
  constructor(
    @inject("IScreenRepository") private readonly screenRepository: IScreenRepository
  ) { }

  public async addScreenHandler(
    theaterOwnerId: string,
    screenData: {
      screenNumber: number;
      capacity: number;
      layout: { label: string; isAvailable: boolean }[][];
      theater: string;
      showTimes?: {
        time: string;
        movie: string;
        movieTitle: string;
        layout: any[];
      }[];
    }
  ): Promise<IScreen> {
    if (
      !Array.isArray(screenData.layout) ||
      !screenData.layout.every((row) => Array.isArray(row))
    ) {
      throw new Error("Invalid layout. It should be a 2D array of seats.");
    }

    try {
      const transformedLayout = screenData.layout.map((row) =>
        row.map((seat) => ({
          label: seat.label,
          isAvailable: seat.isAvailable,
        }))
      );

      const newScreenData = {
        theater: screenData.theater,
        screenNumber: screenData.screenNumber,
        capacity: screenData.capacity,
        layout: transformedLayout,
      };

      const newScreen = await this.screenRepository.createScreen(newScreenData);

      console.log("DEBUG: ScreenService addScreenHandler newScreen created:", (newScreen as any)._id);
      console.log("DEBUG: ScreenService addScreenHandler showTimes check:", screenData.showTimes && screenData.showTimes.length > 0);

      if (screenData.showTimes && screenData.showTimes.length > 0) {
        // Create schedule for today
        const today = new Date();
        const formattedDate = format(today, "yyyy-MM-dd");

        console.log("DEBUG: Creating schedule for date:", formattedDate);

        const schedule = await this.screenRepository.createSchedule({
          screen: (newScreen as any)._id,
          date: formattedDate,
          showTimes: screenData.showTimes,
        });
        console.log("DEBUG: Schedule created:", schedule._id);
      }

      return newScreen;
    } catch (error) {
      console.error("Service Error: ", error);
      throw new Error("Failed to save screen.");
    }
  }

  public async editScreenHandler(
    theaterOwnerId: string,
    screenId: string,
    updateData: {
      screenNumber?: number;
      capacity?: number;
      layout?: any[];
      showTimes?: any[];
    }
  ): Promise<IScreen | null> {
    const screen = await this.screenRepository.getScreenById(screenId);

    if (!screen) {
      throw new Error("Screen not found");
    }

    const updatedScreen = await this.screenRepository.updateScreen(screenId, {
      screenNumber: updateData.screenNumber,
      capacity: updateData.capacity,
      layout: updateData.layout,
    });

    if (updateData.showTimes && updateData.showTimes.length > 0) {
      // Find existing schedule for today or create new one
      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");

      const existingSchedules = await this.screenRepository.getSchedulesByScreenId(screenId);
      const todaySchedule = existingSchedules.find(s => format(new Date(s.date), "yyyy-MM-dd") === formattedDate);

      if (todaySchedule) {
        // Update existing schedule
        await this.screenRepository.updateSchedule(todaySchedule._id as string, {
          showTimes: updateData.showTimes
        });
        console.log("DEBUG: Updated existing schedule:", todaySchedule._id);
      } else {
        // Create new schedule
        await this.screenRepository.createSchedule({
          screen: screenId,
          date: formattedDate,
          showTimes: updateData.showTimes,
        });
        console.log("DEBUG: Created new schedule for update.");
      }
    }

    return updatedScreen;
  }

  public async addScheduleHandler(
    screenId: string,
    scheduleData: {
      date: string;
      showTimes: {
        time: string;
        movie: string;
        movieTitle: string;
        layout: any[];
      }[];
    }
  ): Promise<ISchedule> {
    const screen = await this.screenRepository.getScreenById(screenId);

    if (!screen) {
      throw new Error("Screen not found for scheduling");
    }

    const formattedDate = format(new Date(scheduleData.date), "yyyy-MM-dd");

    return await this.screenRepository.createSchedule({
      screen: screenId,
      date: formattedDate,
      showTimes: scheduleData.showTimes,
    });
  }

  public async editScheduleHandler(
    scheduleId: string,
    updateData: {
      date?: string;
      showTimes?: {
        time?: string;
        movie?: string;
        movieTitle?: string;
        layout?: any[];
      }[];
    }
  ): Promise<ISchedule | null> {
    const schedule = await this.screenRepository.getScheduleById(scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return await this.screenRepository.updateSchedule(scheduleId, updateData);
  }

  public async deleteScreenHandler(screenId: string): Promise<IScreen | null> {
    if (!mongoose.isValidObjectId(screenId)) {
      throw new Error("Invalid screenId format");
    }
    return await this.screenRepository.deleteScreen(screenId);
  }

  public async getScreenByIdHandler(screenId: string): Promise<IScreen | null> {
    try {
      return await this.screenRepository.getScreenById(screenId);
    } catch (error: any) {
      throw new Error(error?.message || "Failed to retrieve screen");
    }
  }

  public async getScreensWithSchedulesByTheaterIdsService(id: string): Promise<IScreen[]> {
    try {
      const screens = await this.screenRepository.getScreensByTheater(id);
      return screens;
    } catch (error) {
      throw new Error("Error fetching screens and schedules");
    }
  }

  public async getScreensByIdService(screenId: string): Promise<{ screen: IScreen | null, schedule: ISchedule[], theater: any }> {
    try {
      const screen = await this.screenRepository.getScreenById(screenId);

      if (!screen) {
        throw new Error("Screen not found");
      }

      const theaterId = screen.theater;
      const theater = await TheaterDetails.findById(theaterId);
      const schedule = await this.screenRepository.getSchedulesByScreenId(screenId);

      return { screen, schedule, theater };
    } catch (error) {
      throw new Error("Error fetching screen or schedules");
    }
  }

  public async getTheatersByMovieNameService(movieName: string): Promise<any[]> {
    try {
      return await this.screenRepository.getTheatersByMovieName(movieName);
    } catch (error) {
      throw new Error("Error fetching theaters by movie name");
    }
  }

  public async updateSeatAvailabilityHandler(
    scheduleId: string,
    selectedSeats: string[],
    holdSeat: boolean,
    showTime: string
  ): Promise<ISchedule | null> {
    return await this.screenRepository.updateSeatAvailability(scheduleId, showTime, selectedSeats, holdSeat);
  }
}
