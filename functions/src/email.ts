/**
 * Email sending utilities for Firebase Functions
 * Uses Google Workspace SMTP for sending emails
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Use an existing Google Workspace account (no need to create new user)
 * 2. Enable 2-factor authentication on that account
 * 3. Generate App Password: https://myaccount.google.com/apppasswords
 * 4. Set secrets:
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_USER=<your-existing-email@joystie.com>
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_PASSWORD=<app-password>
 *    firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_FROM=notifications@joystie.com (optional - for display name)
 */

import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// Email service configuration - using Google Workspace SMTP
const EMAIL_USER = process.env.SERVICE_FUNCTION_EMAIL_USER;
const EMAIL_PASSWORD = process.env.SERVICE_FUNCTION_EMAIL_PASSWORD;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
  verify?(): Promise<boolean>;
}

/**
 * Google Workspace SMTP provider implementation
 */
class WorkspaceSMTPProvider implements EmailProvider {
  private transporter: Transporter | null = null;

  getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      throw new Error(
        'SERVICE_FUNCTION_EMAIL_USER and SERVICE_FUNCTION_EMAIL_PASSWORD not configured. ' +
          'Set them using: firebase functions:secrets:set SERVICE_FUNCTION_EMAIL_USER and SERVICE_FUNCTION_EMAIL_PASSWORD'
      );
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD, // App Password from Google Workspace
      },
    });

    return this.transporter;
  }

  async send(options: EmailOptions): Promise<void> {
    const transporter = this.getTransporter();

    try {
      // Use SERVICE_FUNCTION_EMAIL_FROM if set, otherwise use EMAIL_USER
      const fromEmail = process.env.SERVICE_FUNCTION_EMAIL_FROM || EMAIL_USER;
      const mailOptions = {
        from: `"Joystie" <${fromEmail}>`,
        to: options.to,
        replyTo: 'info@joystie.com',
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] Email sent successfully via Google Workspace SMTP:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
    } catch (error: any) {
      console.error('[Email] Google Workspace SMTP error:', error);
      throw new Error(`Failed to send email via Google Workspace: ${error.message}`);
    }
  }

  async verify(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('[Email] Google Workspace SMTP configuration verified');
      return true;
    } catch (error: any) {
      console.error('[Email] Google Workspace SMTP verification failed:', error);
      return false;
    }
  }
}

/**
 * Get email provider - always uses Google Workspace SMTP
 */
function getEmailProvider(): EmailProvider {
  return new WorkspaceSMTPProvider();
}

/**
 * Send email using configured provider (abstraction layer)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const provider = getEmailProvider();
  await provider.send(options);
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const provider = getEmailProvider();
    if (provider.verify) {
      return await provider.verify();
    }
    return true;
  } catch (error: any) {
    console.error('[Email] Email configuration verification failed:', error);
    return false;
  }
}
