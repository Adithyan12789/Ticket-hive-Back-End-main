import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { IWalletService } from "../Interface/IWallet/IService";
import { IWalletRepository } from "../Interface/IWallet/IRepository";

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject("IWalletRepository") private readonly walletRepository: IWalletRepository
  ) {}

  async addMoneyToWallet(userId: string, amount: number, description: string): Promise<void> {
    const wallet = await this.walletRepository.findWalletByUserId(userId);
    const transaction = {
      transactionId: uuidv4(),
      type: "credit",
      amount,
      description,
      date: new Date(),
      status: "success",
    };

    if (!wallet) {
      await this.walletRepository.createWallet({
        user: userId,
        balance: amount,
        transactions: [transaction],
      });
    } else {
      wallet.balance += amount;
      wallet.transactions.push(transaction);
      await this.walletRepository.updateWallet(wallet);
    }
  }

  async getTransactionHistory(userId: string): Promise<{ balance: number; transactions: any[] }> {
    const wallet = await this.walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      return { balance: 0, transactions: [] };
    }
    return { balance: wallet.balance, transactions: wallet.transactions };
  }

  async deductAmountFromWallet(userId: string, amount: number, description: string): Promise<void> {
    const wallet = await this.walletRepository.findWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.balance < amount) throw new Error("Insufficient funds");

    wallet.balance -= amount;
    wallet.transactions.push({
      transactionId: uuidv4(),
      type: "debit",
      amount,
      description,
      date: new Date(),
      status: "success",
    });

    await this.walletRepository.updateWallet(wallet);
  }

  async addCashbackToWallet(userId: string, amount: number, description: string): Promise<void> {
    await this.addMoneyToWallet(userId, amount, description);
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.walletRepository.findWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    return wallet.balance;
  }
}
