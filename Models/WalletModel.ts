import mongoose, { Document, Model, Schema } from 'mongoose';
export interface ITransaction {
  transactionId: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'success' | 'failed';
  date: Date;
  description: string;
}
export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema<IWallet> = new Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    balance: { 
      type: Number, 
      required: true, 
      default: 0 
    },
    transactions: [
      {
        transactionId: { type: String, required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        status: { type: String, enum: ['success', 'failed'], required: true },
        date: { type: Date, default: Date.now },
        description: { type: String, required: true }
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

WalletSchema.pre<IWallet>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Wallet: Model<IWallet> = mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
