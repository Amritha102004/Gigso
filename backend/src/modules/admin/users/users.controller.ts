import { Request, Response } from "express";
import { IAdminUsersService } from "./users.service";
import { HttpStatus } from "../../../utils/http-status.enum";
import { MESSAGES } from "../../../constants/messages";
import { ApiResponse } from "../../../types/api-response.type";
import { toUserResponse } from "../../../mappers/user.mapper";
import { IUser } from "../../../interfaces/user.interface";

export class AdminUsersController {
  constructor(private _usersService: IAdminUsersService) {}

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this._usersService.getPaginatedUsers(role, page, limit, search);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : MESSAGES.SERVER_ERROR;
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message });
    }
  }

  public async getOwners(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this._usersService.getPaginatedUsers("owner", page, limit, search);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : MESSAGES.SERVER_ERROR;
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message });
    }
  }

  public async getWorkers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this._usersService.getPaginatedUsers("worker", page, limit, search);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : MESSAGES.SERVER_ERROR;
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message });
    }
  }

  public async getUserById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this._usersService.getUserDetails(id);
      
      const response: ApiResponse = {
        success: true,
        message: MESSAGES.DETAILS_FETCHED,
        data: { user: toUserResponse(user as IUser) }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : MESSAGES.USER_NOT_FOUND;
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message });
    }
  }

  public async approveOwner(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await this._usersService.approveOwner(id);
      
      const response: ApiResponse = {
        success: true,
        message: MESSAGES.OWNER_APPROVED,
        data: { user: toUserResponse(updatedUser) }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : MESSAGES.SERVER_ERROR;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }

  public async toggleSuspendUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await this._usersService.toggleUserSuspension(id);
      
      const response: ApiResponse = {
        success: true,
        message: MESSAGES.USER_STATUS_UPDATED,
        data: { user: toUserResponse(updatedUser) }
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : MESSAGES.SERVER_ERROR;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  }
}
