// IWalletRepository.ts

import { IWallet } from "../../Models/WalletModel";

export interface IWalletRepository {
  findWalletByUserId(userId: string): Promise<any | null>;
  createWallet(data: any): Promise<void>;
  updateWallet(wallet: IWallet): Promise<void>;
}
