// IScreenService.ts

import { ISchedule } from "../../Models/ScheduleModel";
import { IScreen } from "../../Models/ScreensModel";


export interface IScreenService {
  addScreenHandler(
    theaterOwnerId: string | undefined,
    screenData: {
      screenNumber: number
      capacity: number
      layout: { label: string; isAvailable: boolean }[][]
      theater: string
      showTimes?: {
        time: string
        movie: string
        movieTitle: string
        layout: any[]
      }[]
    },
  ): Promise<IScreen>

  editScreenHandler(
    theaterOwnerId: string | undefined,
    screenId: string,
    updateData: {
      screenNumber?: number
      capacity?: number
      layout?: any[]
      showTimes?: any[]
    },
  ): Promise<IScreen | null>

  addScheduleHandler(
    screenId: string,
    scheduleData: {
      date: string
      showTimes: {
        time: string
        movie: string
        movieTitle: string
        layout: any[]
      }[]
    },
  ): Promise<ISchedule>

  editScheduleHandler(
    scheduleId: string,
    updateData: {
      date?: string
      showTimes?: {
        time?: string
        movie?: string
        movieTitle?: string
        layout?: any[]
      }[]
    },
  ): Promise<ISchedule | null>

  deleteScreenHandler(screenId: string): Promise<IScreen | null>
  getScreenByIdHandler(screenId: string): Promise<IScreen | null>
  getScreensWithSchedulesByTheaterIdsService(id: string): Promise<IScreen[]>
  getScreensByIdService(screenId: string): Promise<{ screen: IScreen | null; schedule: ISchedule[]; theater: any }>
  getTheatersByMovieNameService(movieName: string): Promise<any[]>
  updateSeatAvailabilityHandler(
    scheduleId: string,
    selectedSeats: string[],
    holdSeat: boolean,
    showTime: string,
  ): Promise<ISchedule | null>
}



