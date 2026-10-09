import { Request, Response } from "express";
import { Cast } from "../Models/CastModel";
import { injectable } from "inversify";

@injectable()
export class CastController {

    async addCast(req: Request, res: Response): Promise<void> {
        console.log("-> Entering addCast controller");
        try {
            console.log("Adding cast - Body:", JSON.stringify(req.body));
            console.log("Adding cast - File:", req.file);

            const { name, role } = req.body;
            const file = req.file;

            if (!name || !role || !file) {
                console.warn("Add Cast failed: Missing fields", { name, role, hasFile: !!file });
                res.status(400).json({ message: "All fields are required" });
                return;
            }

            const newCast = new Cast({
                name,
                role,
                image: file.filename,
            });

            await newCast.save();
            console.log("Cast added successfully:", newCast._id);
            res.status(201).json({ message: "Cast added successfully", cast: newCast });
        } catch (error: any) {
            console.error("Error adding cast:", error);
            res.status(500).json({
                message: "Server Error while adding cast",
                error: error.message || error
            });
        }
    }

    async getAllCast(req: Request, res: Response): Promise<void> {
        console.log("-> Entering getAllCast controller");
        try {
            console.log("Fetching all cast members from DB (simple find)...");
            const cast = await Cast.find();
            console.log(`Fetched ${cast.length} cast members`);
            res.status(200).json(cast);
        } catch (error: any) {
            console.error("Error fetching cast:", error);
            res.status(500).json({
                message: "Server Error while fetching cast",
                error: error.message || error
            });
        }
    }

    async deleteCast(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            console.log("Deleting cast with ID:", id);
            const deleted = await Cast.findByIdAndDelete(id);
            if (!deleted) {
                res.status(404).json({ message: "Cast member not found" });
                return;
            }
            res.status(200).json({ message: "Cast deleted successfully" });
        } catch (error: any) {
            console.error("Error deleting cast:", error);
            res.status(500).json({
                message: "Server Error while deleting cast",
                error: error.message || error
            });
        }
    }

    async updateCast(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, role } = req.body;
            const file = req.file;

            console.log("Updating cast member with ID:", id);

            const updateData: any = { name, role };
            if (file) {
                updateData.image = file.filename;
            }

            const updatedCast = await Cast.findByIdAndUpdate(id, updateData, { new: true });

            if (!updatedCast) {
                res.status(404).json({ message: "Cast member not found" });
                return;
            }

            res.status(200).json({ message: "Cast updated successfully", cast: updatedCast });
        } catch (error: any) {
            console.error("Error updating cast:", error);
            res.status(500).json({
                message: "Server Error while updating cast",
                error: error.message || error
            });
        }
    }
}
