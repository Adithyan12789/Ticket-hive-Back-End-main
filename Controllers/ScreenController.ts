import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { IScreenService } from "../Interface/IScreen/IService";
import { CustomRequest } from "../Middlewares/AuthMiddleware";

@injectable()
export class ScreenController {
  constructor(
    @inject("IScreenService") private readonly screenService: IScreenService
  ) { }

  validateScreenData = [
    body("screenNumber").isInt({ min: 1 }).withMessage("Screen number must be a positive integer"),
    body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
    body("layout").isArray({ min: 1 }).withMessage("Layout must be a non-empty array")
      .custom((layout) => layout.every((row: any[]) => Array.isArray(row) && row.every((seat) => typeof seat.label === "string" && typeof seat.isAvailable === "boolean")))
      .withMessage("Each layout row must be an array of objects with label and isAvailable properties"),
  ];

  validateScheduleData = [
    body("screen").isMongoId().withMessage("Screen ID must be valid"),
    body("showTimes").isArray().withMessage("Show times must be an array"),
    body("showTimes.*.time").notEmpty().withMessage("Show time is required"),
    body("showTimes.*.movie").isMongoId().withMessage("Movie ID must be valid"),
    body("showTimes.*.movieTitle").notEmpty().withMessage("Movie title is required"),
  ];

  addScreen = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { theaterId } = req.params;
    const { screenNumber, capacity, layout, showTimes } = req.body;
    console.log("DEBUG: ScreenController addScreen req.body.showTimes:", showTimes ? JSON.stringify(showTimes).substring(0, 200) : "undefined");

    try {
      const newScreen = await this.screenService.addScreenHandler(
        req.user?._id,
        {
          screenNumber,
          capacity,
          layout,
          theater: theaterId,
          showTimes
        }
      );

      res.status(201).json({
        message: 'Screen added successfully',
        screen: newScreen,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to add screen', error: error.message });
    }
  });

  updateScreen = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { theaterId, screenId } = req.params;
    const { screenNumber, capacity, layout } = req.body;

    try {
      const updatedScreen = await this.screenService.editScreenHandler(
        req.user?._id,
        screenId,
        { screenNumber, capacity, layout, showTimes: req.body.showTimes }
      );

      if (!updatedScreen) {
        res.status(404).json({ message: 'Screen not found' });
        return;
      }

      res.status(200).json({
        message: 'Screen updated successfully',
        screen: updatedScreen,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to update screen', error: error.message });
    }
  });

  addSchedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { screen, date, showTimes } = req.body;

    try {
      const createdSchedule = await this.screenService.addScheduleHandler(screen, { date, showTimes });
      res.status(201).json({ message: "Schedule created successfully", createdSchedule });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to add schedule', error: error.message });
    }
  });

  deleteScreen = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { screenId } = req.params;

    try {
      const deletedScreen = await this.screenService.deleteScreenHandler(screenId);

      if (!deletedScreen) {
        res.status(404).json({ message: "Screen not found for deletion" });
        return;
      }

      res.status(200).json({ message: "Screen deleted successfully", deletedScreen });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting Screen", error: error.message });
    }
  });

  getScreensByTheaterId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const screenDetails = await this.screenService.getScreensWithSchedulesByTheaterIdsService(id);
      if (!screenDetails || screenDetails.length === 0) {
        res.status(404).json({ message: "Screens not found" });
        return;
      }
      res.status(200).json(screenDetails);
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Internal server error" });
    }
  });

  getScreensById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { screenId } = req.params;

    try {
      const screenWithSchedules = await this.screenService.getScreensByIdService(screenId);
      res.status(200).json(screenWithSchedules);
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Internal server error" });
    }
  });

  getTheatersByMovieName = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { movieName } = req.params;

    if (!movieName) {
      res.status(400).json({ error: "Movie name is required" });
      return;
    }

    try {
      const theaters = await this.screenService.getTheatersByMovieNameService(movieName);

      if (!theaters.length) {
        res.status(404).json({ message: "No theaters found for the specified movie" });
        return;
      }

      res.status(200).json(theaters);
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Internal server error" });
    }
  });

  updateSeatAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { scheduleId, selectedSeats, holdSeat, showTime } = req.body;

    if (!scheduleId || !Array.isArray(selectedSeats)) {
      res.status(400).json({
        error: "Invalid data. 'scheduleId' and 'selectedSeats' are required.",
      });
      return;
    }

    try {
      const updatedSeats = await this.screenService.updateSeatAvailabilityHandler(
        scheduleId,
        selectedSeats,
        holdSeat,
        showTime
      );

      if (!updatedSeats) {
        res.status(404).json({ message: "Schedule not found or unable to update seats." });
        return;
      }

      res.status(200).json({
        message: "Seat availability updated successfully.",
        updatedSeats,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });
}
