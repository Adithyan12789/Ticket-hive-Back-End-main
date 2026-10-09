// IWalletService.ts

export interface IWalletService {
    addMoneyToWallet(userId: string, amount: number, description: string): Promise<void>;
    getTransactionHistory(userId: string): Promise<{ balance: number; transactions: any[] }>;
    deductAmountFromWallet(userId: string, amount: number, description: string): Promise<void>;
    addCashbackToWallet(userId: string, amount: number, description: string): Promise<void>;
    getWalletBalance(userId: string): Promise<number>;
}  
  