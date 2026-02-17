import { Request, Response } from 'express';
import { BackupsService } from '../services/backups.service';

const backupsService = new BackupsService();

export const getAllBackups = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await backupsService.getAllBackups(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createManualBackup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const backup = await backupsService.createBackup({
      name: req.body.name || `Manual Backup ${new Date().toISOString()}`,
      type: 'manual',
      createdBy: userId
    });

    // Simulate backup process (in production, this would trigger actual backup)
    setTimeout(async () => {
      await backupsService.updateBackupStatus(backup.id, 'completed', {
        size: '125 MB',
        filePath: `/backups/${backup.id}.sql`,
        completedAt: new Date()
      });
    }, 2000);

    res.status(201).json(backup);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const scheduleBackup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const backup = await backupsService.scheduleBackup({
      name: req.body.name,
      type: 'scheduled',
      scheduledAt: new Date(req.body.scheduledAt),
      createdBy: userId
    });
    res.status(201).json(backup);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBackupStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const backup = await backupsService.updateBackupStatus(id, req.body.status, req.body);
    res.json(backup);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await backupsService.deleteBackup(id);
    res.json({ message: 'Backup deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBackupStats = async (req: Request, res: Response) => {
  try {
    const stats = await backupsService.getBackupStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
