import { sendEmail } from "../utils/sendEmail";
import { IEmailService } from "../interfaces/services/email.service.interface";

export class EmailService implements IEmailService {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await sendEmail(to, subject, html);
  }
}
