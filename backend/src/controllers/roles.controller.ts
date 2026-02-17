import { Request, Response } from 'express';
import { RolesService } from '../services/roles.service';

const rolesService = new RolesService();

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await rolesService.getAllRoles();
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await rolesService.getRoleById(id);
    res.json(role);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await rolesService.createRole(req.body);
    res.status(201).json(role);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await rolesService.updateRole(id, req.body);
    res.json(role);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await rolesService.deleteRole(id);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getAvailableModules = async (req: Request, res: Response) => {
  try {
    const modules = await rolesService.getAvailableModules();
    res.json(modules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
