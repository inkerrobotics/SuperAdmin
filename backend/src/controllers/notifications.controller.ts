import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';

const notificationsService = new NotificationsService();

// Templates
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await notificationsService.getAllTemplates();
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const template = await notificationsService.createTemplate({
      ...req.body,
      createdBy: userId
    });
    res.status(201).json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await notificationsService.updateTemplate(id, req.body);
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await notificationsService.deleteTemplate(id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Notifications
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const filters = {
      type: req.query.type as string,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await notificationsService.getAllNotifications(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const notification = await notificationsService.createNotification({
      ...req.body,
      createdBy: userId
    });
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const scheduleNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const notification = await notificationsService.scheduleNotification({
      ...req.body,
      scheduledAt: new Date(req.body.scheduledAt),
      createdBy: userId
    });
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await notificationsService.sendNotification(id);
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const stats = await notificationsService.getNotificationStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
