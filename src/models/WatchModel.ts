import mongoose from "mongoose";
import { WatchInterface } from "../../types/watch";

const watchSchema = new mongoose.Schema({
  userId: String,
});
watchSchema.index({ userId: 1 }, { unique: true });

export type WatchDocument = mongoose.Document & WatchInterface;

export const WatchModel = mongoose.model<WatchDocument>("Watch", watchSchema);
