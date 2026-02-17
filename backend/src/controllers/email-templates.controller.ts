import { Request, Response } from 'express';
import { EmailTemplatesService } from '../services/email-templates.service';

const emailTemplatesService = new EmailTemplatesService();

export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await emailTemplatesService.getAllTemplates();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTemplateByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const template = await emailTemplatesService.getTemplateByType(type);
    res.json(template);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }
    const template = await emailTemplatesService.updateTemplate(type, req.body, userId);
    res.json(template);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const restoreDefault = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }
    const template = await emailTemplatesService.restoreDefault(type, userId);
    res.json(template);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const testSend = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { testEmail, testData } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email address is required' });
    }

    const result = await emailTemplatesService.testSend(type, testEmail, testData || {});
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const initializeDefaults = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }
    const templates = await emailTemplatesService.initializeDefaults(userId);
    res.json({ message: 'Default templates initialized', count: templates.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
