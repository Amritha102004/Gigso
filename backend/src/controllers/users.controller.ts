import { Request, Response } from "express";
import { IUsersService } from "../interfaces/services/users.service.interface";
import { HttpStatus } from "../utils/http-status.enum";
import { MESSAGES } from "../constants/messages";
import { ApiResponse } from "../types/api-response.type";
import { toUserResponse } from "../mappers/user.mapper";
import { IUser } from "../interfaces/user.interface";
import { asyncHandler } from "../utils/asyncHandler";

export class AdminUsersController {
  constructor(private _usersService: IUsersService) {}

  public getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const role = req.query.role as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const result = await this._usersService.getUsers(filter, page, limit);
    const mappedUsers = result.users.map((user: IUser) => toUserResponse(user));

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.USERS_FETCHED,
      data: {
        ...result,
        users: mappedUsers
      }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getOwners = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const filter: any = { role: "owner" };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const result = await this._usersService.getUsers(filter, page, limit);
    const mappedUsers = result.users.map((user: IUser) => toUserResponse(user));

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.USERS_FETCHED,
      data: {
        ...result,
        users: mappedUsers
      }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getWorkers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const filter: any = { role: "worker" };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const result = await this._usersService.getUsers(filter, page, limit);
    const mappedUsers = result.users.map((user: IUser) => toUserResponse(user));

    const response: ApiResponse = {
      success: true,
      message: MESSAGES.USERS_FETCHED,
      data: {
        ...result,
        users: mappedUsers
      }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public getUserById = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const user = await this._usersService.getUser(id);
    
    const response: ApiResponse = {
      success: true,
      message: MESSAGES.DETAILS_FETCHED,
      data: { user: toUserResponse(user as IUser) }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public approveOwner = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const updatedUser = await this._usersService.approveOwner(id);
    
    const response: ApiResponse = {
      success: true,
      message: MESSAGES.OWNER_APPROVED,
      data: { user: toUserResponse(updatedUser) }
    };

    res.status(HttpStatus.OK).json(response);
  });

  public toggleSuspendUser = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    // Get user first to toggle
    const user = await this._usersService.getUser(id);
    const updatedUser = await this._usersService.updateUserStatus(id, !user.isSuspended);
    
    const response: ApiResponse = {
      success: true,
      message: MESSAGES.USER_STATUS_UPDATED,
      data: { user: toUserResponse(updatedUser) }
    };

    res.status(HttpStatus.OK).json(response);
  });
}
