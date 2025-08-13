import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;

  constructor(private readonly config: ConfigService) {
    this.initializeTransporter();
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    if (!this.transporter) {
      throw new Error('SMTP is not configured. Please set SMTP env variables.');
    }
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"NestJS App" <${this.fromAddress}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      throw new Error(`Gửi email thất bại: ${error.message}`);
    }
  }

  // Send verification email with built-in template
  async sendVerificationEmail(to: string, activeToken: string, displayName?: string) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const verificationUrl = `${frontendUrl}/verify-email?token=${activeToken}`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h3>Xác thực email đăng ký</h3>
        ${displayName ? `<p>Xin chào <strong>${displayName}</strong>,</p>` : ''}
        <p>Nhấp vào nút bên dưới để xác thực email của bạn:</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;background:#1a73e8;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Xác thực email</a>
        </p>
        <p>Nếu nút không hoạt động, hãy copy đường link sau và dán vào trình duyệt:</p>
        <p style="word-break:break-all;background:#f2f4f7;padding:8px 10px;border-radius:4px">${verificationUrl}</p>
        <p style="color:#667085;font-size:12px">Link có hiệu lực trong 1 giờ.</p>
      </div>
    `;

    return this.sendMail(to, 'Xác thực email đăng ký tài khoản', '', html);
  }

  private initializeTransporter() {
    try {
      const service = this.config.get<string>('SMTP_SERVICE');
      const host = this.config.get<string>('SMTP_HOST');
      const portStr = this.config.get<string>('SMTP_PORT');
      const secureStr = this.config.get<string>('SMTP_SECURE');
      const user = this.config.get<string>('SMTP_USER');
      const pass = this.config.get<string>('SMTP_PASS');
      const from = this.config.get<string>('SMTP_FROM') || user;

      if (!user || !pass) {
        this.logger.warn('SMTP_USER/SMTP_PASS missing. Email sending disabled.');
        this.transporter = null;
        this.fromAddress = 'no-reply@example.com';
        return;
      }

      this.fromAddress = from as string;

      // Prefer service config for Gmail
      if (service === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });
        return;
      }

      // Host/port config
      if (host) {
        const port = portStr ? parseInt(portStr, 10) : 587;
        const secure = secureStr === 'true' || secureStr === '1' || port === 465;
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          requireTLS: !secure,
          auth: { user, pass },
          tls: { minVersion: 'TLSv1.2', servername: host },
        });
        return;
      }

      // If neither service nor host provided
      this.logger.warn('SMTP not configured (missing SMTP_SERVICE or SMTP_HOST). Email sending disabled.');
      this.transporter = null;
    } catch (e: any) {
      this.logger.error(`Failed to initialize mail transporter: ${e?.message || e}`);
      this.transporter = null;
    }
  }
}
