// import mongoose, { Document, Model, Schema } from 'mongoose';

// export interface ShowTime {
//   time: string;
//   movie: mongoose.Types.ObjectId;
//   movieTitle: string;
//   layout: { label: string; isAvailable: boolean, holdSeat: boolean }[][]; 
// }

// export interface IScreen extends Document {
//   screenNumber: number;
//   capacity: number;
//   theater: mongoose.Types.ObjectId;
//   showTimes: ShowTime[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ScreenSchema: Schema<IScreen> = new Schema({
//   screenNumber: { type: Number, required: true, unique: true },
//   capacity: { 
//     type: Number, 
//     required: true, 
//     min: [1, 'Capacity must be at least 1'] 
//   },
//   theater: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'TheaterDetails', 
//     required: true 
//   },
//   showTimes: [
//     {
//       time: { type: String, required: true },
//       movieTitle: { type: String, required: true },
//       movie: { 
//         type: mongoose.Schema.Types.ObjectId, 
//         ref: 'Movie', 
//         required: true 
//       },
//       layout: [[{ 
//         label: { type: String, required: true }, 
//         isAvailable: { type: Boolean, default: true },
//         holdSeat: { type: Boolean, default: false } 
//       }]],
//     }
//   ],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });



// ScreenSchema.pre<IScreen>('save', function (next) {
//   this.updatedAt = new Date();
//   next();
// });

// const Screens: Model<IScreen> = mongoose.model<IScreen>('Screens', ScreenSchema);

// export default Screens;


import mongoose, { Schema } from 'mongoose';

export interface IScreen extends Document {
  screenNumber: number;
  capacity: number;
  layout: { label: string }[][];
  theater?: string; // Optional, depending on your model
  schedule?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ScreenSchema = new Schema({
  theater: { type: mongoose.Schema.Types.ObjectId, ref: "TheaterDetails", required: true },
  schedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: false }],
  screenNumber: { type: Number, required: true },
  capacity: { type: Number, required: true },
  layout: [[{ label: { type: String, required: true } }]], // Seats layout for the screen
});

export const Screens = mongoose.model('Screens', ScreenSchema);
