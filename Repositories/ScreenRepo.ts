import { injectable } from "inversify";
import { IScreenRepository } from "../Interface/IScreen/IRepository";
import { ISchedule, Schedule } from "../Models/ScheduleModel";
import { Screens, IScreen } from "../Models/ScreensModel";

@injectable()
class ScreenRepository implements IScreenRepository {
  public async getScreenById(screenId: string): Promise<any | null> {
    return await Screens.findById(screenId).populate({
      path: 'theater',
      select: 'name city addressLine1 addressLine2 pincode state country',
    });
  }

  public async getSchedulesByScreenId(screenId: string): Promise<ISchedule[]> {
    return await Schedule.find({ screen: screenId }).populate({
      path: 'showTimes.movie',
      select: 'title',
    });
  }

  public async updateScreen(screenId: string, updateData: Partial<IScreen>): Promise<IScreen | null> {
    return await Screens.findByIdAndUpdate(screenId, updateData, {
      new: true,
    });
  }

  public async getScreensByTheater(theaterId: string): Promise<IScreen[]> {
    const screens = await Screens.find({ theater: theaterId })
      .populate("schedule", "date showTimes")
      .lean();

    return screens as unknown as IScreen[];
  }


  public async deleteScreen(screenId: string): Promise<IScreen | null> {
    return await Screens.findByIdAndDelete(screenId);
  }

  public async getTheatersByMovieName(movieName: string): Promise<any[]> {
    return await Screens.find({ "showTimes.movie": movieName }).populate(
      "theater",
      "name location"
    );
  }

  public async createScreen(screenData: Partial<IScreen>): Promise<any | null> {
    const newScreen = new Screens(screenData);
    return await newScreen.save();
  }

  public async createSchedule(scheduleData: Partial<ISchedule>): Promise<ISchedule> {
    const newSchedule = new Schedule(scheduleData);
    const savedSchedule = await newSchedule.save();

    if (savedSchedule.screen) {
      await Screens.findByIdAndUpdate(savedSchedule.screen, {
        $push: { schedule: savedSchedule._id }
      });
    }

    return savedSchedule;
  }

  public async getScheduleById(scheduleId: string): Promise<ISchedule | null> {
    return await Schedule.findById(scheduleId);
  }

  public async updateSchedule(scheduleId: string, updateData: Partial<ISchedule>): Promise<ISchedule | null> {
    return await Schedule.findByIdAndUpdate(scheduleId, updateData, { new: true });
  }

  public async updateSeatAvailability(
    scheduleId: string,
    showTime: string,
    selectedSeats: string[],
    holdSeat: boolean
  ): Promise<ISchedule | null> {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return null;

    const targetShowTime = schedule.showTimes.find(st => String(st.time) === showTime);
    if (!targetShowTime) return null;

    targetShowTime.layout.forEach(row => {
      row.forEach(seat => {
        if (selectedSeats.includes(seat.label)) {
          seat.holdSeat = holdSeat;
        }
      });
    });

    return await schedule.save();
  }
}

export default ScreenRepository;
