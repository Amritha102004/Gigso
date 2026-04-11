import { Request, Response } from "express";
import { IAdminUsersService } from "./users.service";
import { HttpStatus } from "../../../utils/http-status.enum";

export class AdminUsersController {
  constructor(private _usersService: IAdminUsersService) {}

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this._usersService.getPaginatedUsers(role, page, limit, search);

      res.status(HttpStatus.OK).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch users";
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: message });
    }
  }

  public async getOwners(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this._usersService.getPaginatedUsers("owner", page, limit, search);

      res.status(HttpStatus.OK).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch owners";
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: message });
    }
  }

  public async getWorkers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this._usersService.getPaginatedUsers("worker", page, limit, search);

      res.status(HttpStatus.OK).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch workers";
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: message });
    }
  }

  public async getUserById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this._usersService.getUserDetails(id);
      res.status(HttpStatus.OK).json({ user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "User not found";
      res.status(HttpStatus.NOT_FOUND).json({ error: message });
    }
  }

  public async approveOwner(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await this._usersService.approveOwner(id);
      res.status(HttpStatus.OK).json({ message: "Owner approved successfully", user: updatedUser });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Approval failed";
      res.status(HttpStatus.BAD_REQUEST).json({ error: message });
    }
  }

  public async toggleSuspendUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await this._usersService.toggleUserSuspension(id);
      const status = updatedUser.isSuspended ? "suspended" : "unsuspended";
      res.status(HttpStatus.OK).json({ message: `User ${status} successfully`, user: updatedUser });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Toggle suspension failed";
      res.status(HttpStatus.BAD_REQUEST).json({ error: message });
    }
  }
}
