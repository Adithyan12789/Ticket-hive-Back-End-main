import mongoose, { Schema, Document } from "mongoose";

export interface ISeat {
    label: string;
    isAvailable: boolean;
    holdSeat: boolean;
  }
  
export interface IShowTime {
    time: string;
    movie: mongoose.Schema.Types.ObjectId;
    movieTitle: string;
    layout: ISeat[][];
  }
  
export interface ISchedule extends Document {
    screen: mongoose.Schema.Types.ObjectId;
    date: Date;
    showTimes: IShowTime[];
  }  

const ScheduleSchema = new Schema<ISchedule>({
  screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screens", required: true },
  date: { type: Date, required: true },
  showTimes: [
    {
      time: { type: String, required: true },
      movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
      movieTitle: { type: String, required: true },
      layout: [
        [
          {
            label: { type: String, required: true },
            isAvailable: { type: Boolean, default: true },
            holdSeat: { type: Boolean, default: false },
          },
        ],
      ],
    },
  ],
});

export const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
