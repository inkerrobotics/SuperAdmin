import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const sessions = await sessionService.getUserSessions(userId);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserSessionStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const stats = await sessionService.getUserSessionStats(userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const filters = {
      userId: req.query.userId as string,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await sessionService.getAllSessions(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const revokeSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const { reason } = req.body;

    const session = await sessionService.revokeSession(id, userId, reason);
    res.json({ message: 'Session revoked successfully', session });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const revokeAllSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const token = req.cookies.token;

    const result = await sessionService.revokeAllUserSessions(userId, token);
    res.json({ 
      message: 'All other sessions revoked successfully',
      count: result.count
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessionStats = async (req: Request, res: Response) => {
  try {
    const stats = await sessionService.getSessionStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessionsByDevice = async (req: Request, res: Response) => {
  try {
    const devices = await sessionService.getSessionsByDevice();
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cleanupExpiredSessions = async (req: Request, res: Response) => {
  try {
    const result = await sessionService.cleanupExpiredSessions();
    res.json({ 
      message: 'Expired sessions cleaned up',
      count: result.count
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
