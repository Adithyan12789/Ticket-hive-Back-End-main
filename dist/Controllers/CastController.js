"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CastController = void 0;
const CastModel_1 = require("../Models/CastModel");
const inversify_1 = require("inversify");
let CastController = class CastController {
    async addCast(req, res) {
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
            const newCast = new CastModel_1.Cast({
                name,
                role,
                image: file.filename,
            });
            await newCast.save();
            console.log("Cast added successfully:", newCast._id);
            res.status(201).json({ message: "Cast added successfully", cast: newCast });
        }
        catch (error) {
            console.error("Error adding cast:", error);
            res.status(500).json({
                message: "Server Error while adding cast",
                error: error.message || error
            });
        }
    }
    async getAllCast(req, res) {
        console.log("-> Entering getAllCast controller");
        try {
            console.log("Fetching all cast members from DB (simple find)...");
            const cast = await CastModel_1.Cast.find();
            console.log(`Fetched ${cast.length} cast members`);
            res.status(200).json(cast);
        }
        catch (error) {
            console.error("Error fetching cast:", error);
            res.status(500).json({
                message: "Server Error while fetching cast",
                error: error.message || error
            });
        }
    }
    async deleteCast(req, res) {
        try {
            const { id } = req.params;
            console.log("Deleting cast with ID:", id);
            const deleted = await CastModel_1.Cast.findByIdAndDelete(id);
            if (!deleted) {
                res.status(404).json({ message: "Cast member not found" });
                return;
            }
            res.status(200).json({ message: "Cast deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting cast:", error);
            res.status(500).json({
                message: "Server Error while deleting cast",
                error: error.message || error
            });
        }
    }
    async updateCast(req, res) {
        try {
            const { id } = req.params;
            const { name, role } = req.body;
            const file = req.file;
            console.log("Updating cast member with ID:", id);
            const updateData = { name, role };
            if (file) {
                updateData.image = file.filename;
            }
            const updatedCast = await CastModel_1.Cast.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedCast) {
                res.status(404).json({ message: "Cast member not found" });
                return;
            }
            res.status(200).json({ message: "Cast updated successfully", cast: updatedCast });
        }
        catch (error) {
            console.error("Error updating cast:", error);
            res.status(500).json({
                message: "Server Error while updating cast",
                error: error.message || error
            });
        }
    }
};
exports.CastController = CastController;
exports.CastController = CastController = __decorate([
    (0, inversify_1.injectable)()
], CastController);
//# sourceMappingURL=CastController.js.map