import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';

const settingsService = new SettingsService();

export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSettingsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const settings = await settingsService.getSettingsByCategory(category);
    res.json(settings);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }
    const settings = await settingsService.updateSettings(category, req.body, userId);
    res.json(settings);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { category, startDate, endDate, changedBy, page, limit } = req.query;
    
    const filters: any = {};
    if (category) filters.category = category as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (changedBy) filters.changedBy = changedBy as string;
    if (page) filters.page = parseInt(page as string, 10);
    if (limit) filters.limit = parseInt(limit as string, 10);

    const history = await settingsService.getHistory(filters);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreSetting = async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }
    const setting = await settingsService.restoreSetting(historyId, userId);
    res.json(setting);
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
    const settings = await settingsService.initializeDefaults(userId);
    res.json({ message: 'Default settings initialized', count: settings.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
