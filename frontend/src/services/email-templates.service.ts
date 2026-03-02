const API_URL = '/api/email-templates';

export interface EmailTemplate {
  id: string;
  templateType: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string;
  isActive: boolean;
  version: number;
  updatedAt: string;
}

class EmailTemplatesService {
  async getAllTemplates(): Promise<EmailTemplate[]> {
    const response = await fetch(API_URL, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return response.json();
  }

  async getTemplateByType(type: string): Promise<EmailTemplate> {
    const response = await fetch(`${API_URL}/${type}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    return response.json();
  }

  async updateTemplate(
    type: string,
    data: {
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      isActive?: boolean;
    }
  ): Promise<EmailTemplate> {
    const response = await fetch(`${API_URL}/${type}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update template');
    }

    return response.json();
  }

  async restoreDefault(type: string): Promise<EmailTemplate> {
    const response = await fetch(`${API_URL}/${type}/restore`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to restore default');
    }

    return response.json();
  }

  async testSend(type: string, testEmail: string, testData: Record<string, string>): Promise<any> {
    const response = await fetch(`${API_URL}/${type}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ testEmail, testData })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send test email');
    }

    return response.json();
  }

  async initializeDefaults(): Promise<any> {
    const response = await fetch(`${API_URL}/initialize`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize defaults');
    }

    return response.json();
  }
}

export const emailTemplatesService = new EmailTemplatesService();
