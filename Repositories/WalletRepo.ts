import { injectable } from "inversify";
import Wallet, { IWallet } from "../Models/WalletModel";
import { BaseRepository } from "./Base/BaseRepository";
import { IWalletRepository } from "../Interface/IWallet/IRepository";

@injectable()
export class WalletRepository
  extends BaseRepository<IWallet>
  implements IWalletRepository
{
  private readonly walletModel = Wallet;

  constructor() {
    super(Wallet);
  }

  async findWalletByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ user: userId });
  }

  async createWallet(data: IWallet): Promise<void> {
    await Wallet.create(data);
  }

  async updateWallet(wallet: IWallet): Promise<void> {
    await wallet.save();
  }
}
