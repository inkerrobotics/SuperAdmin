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
    const user = await usersService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await usersService.updateUser(id, req.body);
    res.json(user);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await usersService.deleteUser(id);
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
