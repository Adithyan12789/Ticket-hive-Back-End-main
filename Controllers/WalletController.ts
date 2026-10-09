import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { IWalletService } from "../Interface/IWallet/IService";

@injectable()
export class WalletController {
  constructor(
    @inject("IWalletService") private readonly walletService: IWalletService
  ) {}

  addMoneyToWallet = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId, amount, description } = req.body;

      if (!userId || !amount) {
        res.status(400).json({ message: "User ID and amount are required" });
        return;
      }

      try {
        await this.walletService.addMoneyToWallet(userId, amount, description);
        res.status(200).json({ message: "Money added to wallet successfully" });
      } catch (err: unknown) {
        console.error("Error adding money to wallet:", err);
        res
          .status(500)
          .json({ message: "An error occurred while adding money to wallet" });
      }
    }
  );

  getTransactionHistory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      try {
        const transactions = await this.walletService.getTransactionHistory(
          userId
        );
        res.status(200).json({ transactions });
      } catch (err: unknown) {
        console.error("Error fetching transaction history:", err);
        res
          .status(500)
          .json({
            message: "An error occurred while fetching transaction history",
          });
      }
    }
  );
}
