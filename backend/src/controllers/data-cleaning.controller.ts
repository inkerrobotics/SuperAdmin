import { Request, Response } from 'express';
import { DataCleaningService } from '../services/data-cleaning.service';

const dataCleaningService = new DataCleaningService();

export const detectDuplicates = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const duplicates = await dataCleaningService.detectDuplicates(campaignId);
    res.json(duplicates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markDuplicates = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const result = await dataCleaningService.markDuplicates(campaignId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const mergeParticipants = async (req: Request, res: Response) => {
  try {
    const { keepId, removeIds } = req.body;
    const result = await dataCleaningService.mergeParticipants(keepId, removeIds);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const validatePhoneNumbers = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const invalid = await dataCleaningService.validatePhoneNumbers(campaignId);
    res.json(invalid);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const validateEmails = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const invalid = await dataCleaningService.validateEmails(campaignId);
    res.json(invalid);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkDelete = async (req: Request, res: Response) => {
  try {
    const { participantIds } = req.body;
    const result = await dataCleaningService.bulkDelete(participantIds);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCleaningStats = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const stats = await dataCleaningService.getCleaningStats(campaignId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
