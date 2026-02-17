import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Generate a random temporary password
   */
  generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Send credentials email to new user
   */
  async sendCredentialsEmail(data: {
    userId: string;
    email: string;
    name: string;
    temporaryPassword: string;
    loginUrl?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const loginUrl = data.loginUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const subject = 'Welcome! Your Login Credentials';
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .credentials-box {
      background: white;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .credential-item {
      margin: 15px 0;
      padding: 10px;
      background: #f3f4f6;
      border-radius: 5px;
    }
    .credential-label {
      font-weight: bold;
      color: #667eea;
      display: block;
      margin-bottom: 5px;
    }
    .credential-value {
      font-family: 'Courier New', monospace;
      font-size: 16px;
      color: #1f2937;
      word-break: break-all;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: bold;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to Super Admin Platform!</h1>
  </div>
  
  <div class="content">
    <p>Hello <strong>${data.name}</strong>,</p>
    
    <p>Your account has been successfully created. Below are your login credentials to access the platform:</p>
    
    <div class="credentials-box">
      <div class="credential-item">
        <span class="credential-label">Login URL:</span>
        <span class="credential-value">${loginUrl}</span>
      </div>
      
      <div class="credential-item">
        <span class="credential-label">Email ID:</span>
        <span class="credential-value">${data.email}</span>
      </div>
      
      <div class="credential-item">
        <span class="credential-label">Temporary Password:</span>
        <span class="credential-value">${data.temporaryPassword}</span>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="${loginUrl}" class="button">Login Now</a>
    </div>
    
    <div class="warning">
      <strong>⚠️ Important Security Notice:</strong>
      <ul style="margin: 10px 0;">
        <li>You will be required to change your password on first login</li>
        <li>Please keep your credentials secure and do not share them</li>
        <li>This is a temporary password - change it immediately after logging in</li>
      </ul>
    </div>
    
    <p><strong>Next Steps:</strong></p>
    <ol>
      <li>Click the "Login Now" button above or visit the login URL</li>
      <li>Enter your email and temporary password</li>
      <li>You'll be prompted to create a new secure password</li>
      <li>Start using the platform!</li>
    </ol>
    
    <p>If you have any questions or need assistance, please contact your administrator.</p>
    
    <p>Best regards,<br><strong>Super Admin Team</strong></p>
  </div>
  
  <div class="footer">
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>&copy; ${new Date().getFullYear()} Super Admin Platform. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const textBody = `
Welcome to Super Admin Platform!

Hello ${data.name},

Your account has been successfully created. Below are your login credentials:

Login URL: ${loginUrl}
Email ID: ${data.email}
Temporary Password: ${data.temporaryPassword}

IMPORTANT SECURITY NOTICE:
- You will be required to change your password on first login
- Please keep your credentials secure and do not share them
- This is a temporary password - change it immediately after logging in

Next Steps:
1. Visit the login URL above
2. Enter your email and temporary password
3. You'll be prompted to create a new secure password
4. Start using the platform!

If you have any questions or need assistance, please contact your administrator.

Best regards,
Super Admin Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} Super Admin Platform. All rights reserved.
    `;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'Super Admin <noreply@superadmin.com>',
        to: data.email,
        subject: subject,
        text: textBody,
        html: htmlBody
      });

      // Log successful email
      await prisma.emailLog.create({
        data: {
          userId: data.userId,
          recipient: data.email,
          subject: subject,
          body: htmlBody,
          type: 'credentials',
          status: 'sent',
          sentAt: new Date()
        }
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      // Log failed email
      await prisma.emailLog.create({
        data: {
          userId: data.userId,
          recipient: data.email,
          subject: subject,
          body: htmlBody,
          type: 'credentials',
          status: 'failed',
          error: error.message
        }
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Resend credentials email
   */
  async resendCredentialsEmail(data: {
    userId: string;
    email: string;
    name: string;
    temporaryPassword: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await this.sendCredentialsEmail(data);
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration error:', error);
      return false;
    }
  }
}
