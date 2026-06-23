import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGigRole extends Document {
  gigId: Types.ObjectId;
  roleName: string;
  spots: number;
  payPerPerson: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGig extends Document {
  ownerId: Types.ObjectId;
  title: string;
  description: string;
  categoryId: Types.ObjectId;
  location: string;
  eventDate: Date;
  startTime: string;
  roles: Types.ObjectId[];
  totalBudget: number;
  status: "draft" | "active" | "completed" | "cancelled" | "paid";
  paymentStatus: "unpaid" | "paid";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
