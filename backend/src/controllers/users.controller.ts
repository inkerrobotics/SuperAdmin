import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';

const usersService = new UsersService();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await usersService.getUserById(id);
    res.json(user);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log('Creating user with data:', JSON.stringify(req.body, null, 2));

    const user = await usersService.createUser(req.body, {
      userId,
      ipAddress,
      userAgent
    });
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const user = await usersService.updateUser(id, req.body, {
      userId,
      ipAddress,
      userAgent
    });
    res.json(user);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await usersService.deleteUser(id, {
      userId,
      ipAddress,
      userAgent
    });
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permissions = await usersService.getUserPermissions(id);
    res.json(permissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const resendCredentials = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await usersService.resendCredentials(id, {
      userId,
      ipAddress,
      userAgent
    });
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    const result = await usersService.changePassword(userId, oldPassword, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
