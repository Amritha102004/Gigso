import { Document, Types } from "mongoose";

export type UserRole = "worker" | "owner" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  isApproved: boolean;
  isSuspended: boolean;
  isProfileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
}


export interface IWorkerProfile extends Document {
  userId: Types.ObjectId;
  skills: string[];
  portfolio: string[];
  age?: number;
  bio?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOwnerProfile extends Document {
  userId: Types.ObjectId;
  businessName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminProfile extends Document {
  userId: Types.ObjectId;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}