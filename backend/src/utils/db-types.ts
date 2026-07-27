import type { Document, Types } from "mongoose";

export type DbInput<T> = Partial<Omit<T, keyof Document>> & { _id?: Types.ObjectId | string };
