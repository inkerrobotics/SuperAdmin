import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TEMPLATE_TYPES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_VERIFICATION: 'account_verification',
  SECURITY_ALERT: 'security_alert',
  SYSTEM_NOTIFICATION: 'system_notification'
};

export const DEFAULT_TEMPLATES = {
  welcome: {
    subject: 'Welcome to {{platformName}}!',
    bodyHtml: '<h1>Welcome {{userName}}!</h1><p>We\'re excited to have you on board at {{tenantName}}.</p>',
    bodyText: 'Welcome {{userName}}! We\'re excited to have you on board at {{tenantName}}.',
    variables: 'userName,tenantName,platformName'
  },
  password_reset: {
    subject: 'Reset Your Password',
    bodyHtml: '<h1>Password Reset Request</h1><p>Hi {{userName}},</p><p>Click the link below to reset your password:</p><p><a href="{{resetLink}}">Reset Password</a></p><p>This link expires in 1 hour.</p>',
    bodyText: 'Hi {{userName}}, Click the link below to reset your password: {{resetLink}}. This link expires in 1 hour.',
    variables: 'userName,resetLink'
  },
  account_verification: {
    subject: 'Verify Your Account',
    bodyHtml: '<h1>Verify Your Email</h1><p>Hi {{userName}},</p><p>Please verify your email address by clicking:</p><p><a href="{{verificationLink}}">Verify Email</a></p>',
    bodyText: 'Hi {{userName}}, Please verify your email address by clicking: {{verificationLink}}',
    variables: 'userName,verificationLink'
  },
  security_alert: {
    subject: 'Security Alert - {{alertType}}',
    bodyHtml: '<h1>Security Alert</h1><p>Hi {{userName}},</p><p>We detected: {{alertMessage}}</p><p>Time: {{timestamp}}</p><p>If this wasn\'t you, please secure your account immediately.</p>',
    bodyText: 'Hi {{userName}}, We detected: {{alertMessage}}. Time: {{timestamp}}. If this wasn\'t you, please secure your account immediately.',
    variables: 'userName,alertType,alertMessage,timestamp'
  },
  system_notification: {
    subject: '{{notificationTitle}}',
    bodyHtml: '<h1>{{notificationTitle}}</h1><p>{{notificationMessage}}</p>',
    bodyText: '{{notificationTitle}}: {{notificationMessage}}',
    variables: 'notificationTitle,notificationMessage'
  }
};

export class EmailTemplatesService {
  // Get all templates
  async getAllTemplates() {
    return await prisma.emailTemplate.findMany({
      orderBy: { templateType: 'asc' }
    });
  }

  // Get template by type
  async getTemplateByType(templateType: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { templateType }
    });

    if (!template) {
      const error: any = new Error('Template not found');
      error.statusCode = 404;
      throw error;
    }

    return template;
  }

  // Update template
  async updateTemplate(
    templateType: string,
    data: {
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      isActive?: boolean;
    },
    userId: string
  ) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { templateType }
    });

    if (!existing) {
      const error: any = new Error('Template not found');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.emailTemplate.update({
      where: { templateType },
      data: {
        ...data,
        version: existing.version + 1,
        updatedBy: userId
      }
    });
  }

  // Restore default template
  async restoreDefault(templateType: string, userId: string) {
    const defaultTemplate = DEFAULT_TEMPLATES[templateType as keyof typeof DEFAULT_TEMPLATES];

    if (!defaultTemplate) {
      const error: any = new Error('Default template not found');
      error.statusCode = 404;
      throw error;
    }

    const existing = await prisma.emailTemplate.findUnique({
      where: { templateType }
    });

    if (existing) {
      return await prisma.emailTemplate.update({
        where: { templateType },
        data: {
          subject: defaultTemplate.subject,
          bodyHtml: defaultTemplate.bodyHtml,
          bodyText: defaultTemplate.bodyText,
          version: existing.version + 1,
          updatedBy: userId
        }
      });
    } else {
      return await prisma.emailTemplate.create({
        data: {
          templateType,
          ...defaultTemplate,
          updatedBy: userId
        }
      });
    }
  }

  // Test send email (placeholder - integrate with actual email service)
  async testSend(templateType: string, testEmail: string, testData: Record<string, string>) {
    const template = await this.getTemplateByType(templateType);

    // Replace variables in template
    let subject = template.subject;
    let bodyHtml = template.bodyHtml;
    let bodyText = template.bodyText;

    Object.entries(testData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      bodyHtml = bodyHtml.replace(new RegExp(placeholder, 'g'), value);
      bodyText = bodyText.replace(new RegExp(placeholder, 'g'), value);
    });

    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    console.log('Test email would be sent to:', testEmail);
    console.log('Subject:', subject);
    console.log('Body HTML:', bodyHtml);
    console.log('Body Text:', bodyText);

    return {
      success: true,
      message: `Test email sent to ${testEmail}`,
      preview: { subject, bodyHtml, bodyText }
    };
  }

  // Initialize default templates
  async initializeDefaults(userId: string) {
    const created = [];

    for (const [templateType, template] of Object.entries(DEFAULT_TEMPLATES)) {
      try {
        const existing = await prisma.emailTemplate.findUnique({
          where: { templateType }
        });

        if (!existing) {
          const newTemplate = await prisma.emailTemplate.create({
            data: {
              templateType,
              ...template,
              updatedBy: userId
            }
          });
          created.push(newTemplate);
        }
      } catch (error) {
        // Skip if already exists (race condition)
        console.log(`Template ${templateType} already exists, skipping`);
      }
    }

    return created;
  }
}
