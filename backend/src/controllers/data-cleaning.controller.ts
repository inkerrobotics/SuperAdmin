import { Request, Response } from 'express';
import { DataCleaningService } from '../services/data-cleaning.service';

const dataCleaningService = new DataCleaningService();

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await dataCleaningService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cleanupExpiredSessions = async (req: Request, res: Response) => {
  try {
    const result = await dataCleaningService.cleanupExpiredSessions();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cleanupOldLogs = async (req: Request, res: Response) => {
  try {
    const { days = 90 } = req.body;
    const result = await dataCleaningService.cleanupOldLogs(days);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cleanupOldBackups = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.body;
    const result = await dataCleaningService.cleanupOldBackups(days);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cleanupOrphanedData = async (req: Request, res: Response) => {
  try {
    const result = await dataCleaningService.cleanupOrphanedData();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
