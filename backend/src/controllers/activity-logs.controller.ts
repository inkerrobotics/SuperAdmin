import { Request, Response } from 'express';
import { ActivityLogsService } from '../services/activity-logs.service';

const activityLogsService = new ActivityLogsService();

export const getAllLogs = async (req: Request, res: Response) => {
  try {
    const filters = {
      userId: req.query.userId as string,
      module: req.query.module as string,
      action: req.query.action as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await activityLogsService.getAllLogs(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLogStats = async (req: Request, res: Response) => {
  try {
    const stats = await activityLogsService.getLogStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportLogs = async (req: Request, res: Response) => {
  try {
    const filters = {
      userId: req.query.userId as string,
      module: req.query.module as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const logs = await activityLogsService.exportLogs(filters);
    
    // Convert to CSV
    const csv = [
      ['Date', 'User', 'Action', 'Module', 'Description', 'IP Address', 'Status'].join(','),
      ...logs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.user?.email || 'System',
        log.action,
        log.module,
        log.description,
        log.ipAddress || '',
        log.status
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
