import type { AnnouncementRepository } from "../repositories/announcement.repository";
import type { GigRepository } from "../repositories/gig.repository";
import type { GigApplicationRepository } from "../repositories/application.repository";
import type { NotificationService } from "./notification.service";
import type { IGigAnnouncement } from "../interfaces/announcement.interface";

export class AnnouncementService {
  constructor(
    private _announcementRepo: AnnouncementRepository,
    private _gigRepo: GigRepository,
    private _applicationRepo: GigApplicationRepository,
    private _notificationService: NotificationService
  ) {}

  async createAnnouncement(gigId: string, message: string, ownerId: string): Promise<IGigAnnouncement> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig) {
      throw new Error("GIG_NOT_FOUND");
    }
    if (gig.ownerId.toString() !== ownerId) {
      throw new Error("UNAUTHORIZED");
    }

    const announcement = await this._announcementRepo.create({
      gigId: gigId as any,
      message,
    } as IGigAnnouncement);

    // Get all accepted applications for this gig
    const applications = await this._applicationRepo.findByGigId(gigId);
    const acceptedApps = applications.filter((app) => app.status === "accepted");

    // Send notifications to all accepted workers
    for (const app of acceptedApps) {
      await this._notificationService.createNotification(
        app.workerId._id.toString(),
        `New Announcement for ${gig.title}`,
        message.length > 60 ? `${message.substring(0, 57)}...` : message,
        "announcement"
      );
    }

    return announcement;
  }

  async getAnnouncements(gigId: string, userId: string, role: string): Promise<IGigAnnouncement[]> {
    const gig = await this._gigRepo.findById(gigId);
    if (!gig) {
      throw new Error("GIG_NOT_FOUND");
    }

    // Authorization checks:
    // If owner:
    if (role === "owner" && gig.ownerId.toString() !== userId) {
      throw new Error("UNAUTHORIZED");
    }
    // If worker: must have an accepted application for this gig
    if (role === "worker") {
      const apps = await this._applicationRepo.findByGigIdAndWorkerId(gigId, userId);
      const isAccepted = apps.some((app) => app.status === "accepted");
      if (!isAccepted) {
        throw new Error("UNAUTHORIZED");
      }
    }

    return await this._announcementRepo.findAllForGig(gigId);
  }
}
