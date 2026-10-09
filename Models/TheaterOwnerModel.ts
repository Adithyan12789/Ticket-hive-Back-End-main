import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ITheaterOwner extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone?: string;
    profileImageName?: string;
    otp?: string;
    otpExpires?: Date;
    otpVerified?: boolean;
    otpGeneratedAt: Date;
    isBlocked?: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    favoriteGenres?: string[];
    matchPassword(password: string): Promise<boolean>;
}



const theaterOwnerSchema: Schema<ITheaterOwner> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        profileImageName: { type: String },
        phone: { type: String, required: false },
        otp: { type: String, required: false },
        otpVerified: { type: Boolean, default: false },
        otpGeneratedAt: { type: Date, default: Date.now },
        isBlocked: {type: Boolean, default: false, },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        favoriteGenres: { type: [String] },
    }, {
        timestamps: true,
    }
)

theaterOwnerSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

const TheaterOwner: Model<ITheaterOwner> = mongoose.model<ITheaterOwner>('TheaterOwner', theaterOwnerSchema);

export default TheaterOwner;
