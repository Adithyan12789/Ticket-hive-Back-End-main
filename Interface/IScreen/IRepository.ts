// IScreenRepository.ts

import { ISchedule } from "../../Models/ScheduleModel"
import { IScreen } from "../../Models/ScreensModel"

export interface IScreenRepository {
  getScreenById(screenId: string): Promise<IScreen | null>
  getSchedulesByScreenId(screenId: string): Promise<ISchedule[]>
  updateScreen(screenId: string, updateData: Partial<IScreen>): Promise<IScreen | null>
  getScreensByTheater(theaterId: string): Promise<IScreen[]>
  deleteScreen(screenId: string): Promise<IScreen | null>
  getTheatersByMovieName(movieName: string): Promise<any[]>
  createScreen(screenData: Partial<IScreen>): Promise<IScreen>
  createSchedule(scheduleData: Partial<any>): Promise<ISchedule>
  getScheduleById(scheduleId: string): Promise<ISchedule | null>
  updateSchedule(scheduleId: string, updateData: Partial<any>): Promise<ISchedule | null>
  updateSeatAvailability(
    scheduleId: string,
    showTime: string,
    selectedSeats: string[],
    holdSeat: boolean,
  ): Promise<ISchedule | null>
}



