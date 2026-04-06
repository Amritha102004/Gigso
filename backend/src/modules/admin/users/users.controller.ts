import { Request, Response } from "express";
import { IAdminUsersService } from "./users.service";

export class AdminUsersController {
  constructor(private usersService: IAdminUsersService) {}

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this.usersService.getPaginatedUsers(role, page, limit, search);

      res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch users";
      res.status(500).json({ error: message });
    }
  }

  public async getOwners(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this.usersService.getPaginatedUsers("owner", page, limit, search);

      res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch owners";
      res.status(500).json({ error: message });
    }
  }

  public async getWorkers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this.usersService.getPaginatedUsers("worker", page, limit, search);

      res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch workers";
      res.status(500).json({ error: message });
    }
  }

  public async getUserById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.usersService.getUserDetails(id);
      res.status(200).json({ user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "User not found";
      res.status(404).json({ error: message });
    }
  }

  public async approveOwner(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await this.usersService.approveOwner(id);
      res.status(200).json({ message: "Owner approved successfully", user: updatedUser });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Approval failed";
      res.status(400).json({ error: message });
    }
  }

  public async toggleSuspendUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await this.usersService.toggleUserSuspension(id);
      const status = updatedUser.isSuspended ? "suspended" : "unsuspended";
      res.status(200).json({ message: `User ${status} successfully`, user: updatedUser });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Toggle suspension failed";
      res.status(400).json({ error: message });
    }
  }
}
