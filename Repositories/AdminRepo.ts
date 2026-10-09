import User, { IUser } from "../Models/UserModel";
import TheaterOwner, { ITheaterOwner } from "../Models/TheaterOwnerModel";
import Theater from "../Models/TheaterDetailsModel";
import mongoose from "mongoose";
import { Booking } from "../Models/bookingModel";
import Admin, { IAdmin } from "../Models/AdminModel";
import { injectable } from "inversify";
import { BaseRepository } from "./Base/BaseRepository";
import { AdminLogin } from "../types/adminTypes";
import { IAdminRepository } from "../Interface/IAdmin/IRepository";
@injectable()
export class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {
  private readonly adminModel = Admin;

  constructor() {
    super(Admin);
  }

  public async authenticateAdmin(
    email: string,
    password: string
  ): Promise<AdminLogin> {
    const adminEmail = process.env.ADMIN_EMAIL || "";
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    console.log("Admin Auth Process - Env check:", {
      emailExists: !!process.env.ADMIN_EMAIL,
      passExists: !!process.env.ADMIN_PASSWORD
    });

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error("CRITICAL: Admin credentials missing in process.env");
      throw new Error("Admin credentials not configured on server");
    }

    if (email.trim() !== adminEmail.trim() || password.trim() !== adminPassword.trim()) {
      console.warn("Auth mismatch: Received", { email });
      throw new Error("Invalid Admin Email or Password");
    }

    return { email: adminEmail, password: adminPassword };
  }

  public async getAdminCredentials(): Promise<{ adminEmail: string; adminPassword: string }> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials are not configured properly");
    }

    return { adminEmail, adminPassword };
  }

  public async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Error fetching users");
    }
  }

  public async getAllTheaterOwners(): Promise<ITheaterOwner[]> {
    try {
      return await TheaterOwner.find({}, { name: 1, email: 1, phone: 1, isBlocked: 1 });
    } catch (error) {
      console.error("Error fetching theater owners:", error);
      throw new Error("Error fetching theater owners");
    }
  }

  public async findAllBookings(): Promise<any[]> {
    try {
      return await Booking.find({})
        .populate("user", "name email")
        .populate("movie theater screen offer")
        .lean();
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Error fetching bookings");
    }
  }

  public async updateUser(userId: string, userData: Partial<any>): Promise<any | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId format");
      }

      const user = await User.findByIdAndUpdate(userId, userData, {
        new: true, // Return the updated document
      });

      return user;
    } catch (error: any) {
      console.error("Error in updateUser:", error.message);
      throw new Error("Error updating user");
    }
  }

  public async updatedTheaterOwner(theaterOwnerId: string, data: Partial<any>): Promise<any | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(theaterOwnerId)) {
        throw new Error("Invalid theaterOwnerId format");
      }

      const theaterOwner = await TheaterOwner.findById(theaterOwnerId);
      if (!theaterOwner) {
        throw new Error("Theater owner not found");
      }

      Object.assign(theaterOwner, data);
      return await theaterOwner.save();
    } catch (error: any) {
      console.error("Error updating theater owner:", error.message);
      throw new Error("Error updating theater owner");
    }
  }


  public async getPendingTheaterOwnerVerifications(): Promise<any[]> {
    try {
      return await Theater.find({ verificationStatus: "pending" }).select("-password");
    } catch (error) {
      console.error("Error fetching pending theater verifications:", error);
      throw new Error("Error fetching pending theater verifications");
    }
  }

  public async findTheaterOwnerById(id: string): Promise<ITheaterOwner | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }
      return await TheaterOwner.findById(id);
    } catch (error) {
      console.error(`Error finding Theater Owner with ID: ${id}`, error);
      throw new Error("Error finding Theater Owner");
    }
  }

  public async findTheaterById(id: string): Promise<any> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }
      return await Theater.findById(id);
    } catch (error) {
      console.error(`Error finding Theater with ID: ${id}`, error);
      throw new Error("Error finding Theater");
    }
  }

  public async saveTheater(theater: any): Promise<any> {
    try {
      return await theater.save();
    } catch (error) {
      console.error("Error saving Theater:", error);
      throw new Error("Error saving Theater");
    }
  }

  public async getAllAdmins(): Promise<AdminLogin[]> {
    try {
      return await Admin.find({});
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw new Error("Error fetching admins");
    }
  }
}

export default AdminRepository;
