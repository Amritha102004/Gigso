import type { Model, Document, UpdateQuery } from "mongoose";
import type { IBaseRepository } from "../interfaces/repositories/base.repository.interface";
import type { DbInput } from "../utils/db-types";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected _model: Model<T>;

  constructor(model: Model<T>) {
    this._model = model;
  }

  async create(item: DbInput<T>): Promise<T> {
    const newItem = new this._model(item);
    return await newItem.save();
  }

  async update(id: string, item: DbInput<T>): Promise<T | null> {
    const updated = await this._model.findByIdAndUpdate(id, item as UpdateQuery<T>, { new: true }).exec();
    return updated as unknown as T | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this._model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findById(id: string): Promise<T | null> {
    return await this._model.findById(id).exec();
  }

  async findOne(filter: Record<string, unknown>): Promise<T | null> {
    return await this._model.findOne(filter).exec();
  }
}
