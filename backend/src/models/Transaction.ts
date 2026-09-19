import mongoose, { Document, Model, Schema } from 'mongoose';

export interface TransactionAttrs {
  id: number;
  date: Date;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}

export interface TransactionDoc extends Document, TransactionAttrs {}

const transactionSchema = new Schema<TransactionDoc>(
  {
    id: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    status: { type: String, required: true },
    user_id: { type: String, required: true },
    user_profile: { type: String, required: true },
  },
  { collection: 'transactions', versionKey: false },
);

// Indexes for dashboard filtering, sorting, and search.
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ user_id: 1 });
transactionSchema.index({ amount: 1 });
transactionSchema.index({ category: 1, status: 1, date: -1 });

export const Transaction: Model<TransactionDoc> =
  mongoose.models.Transaction ??
  mongoose.model<TransactionDoc>('Transaction', transactionSchema);
