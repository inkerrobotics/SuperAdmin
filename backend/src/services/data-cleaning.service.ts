import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DataCleaningService {
  async detectDuplicates(campaignId: string) {
    const participants = await prisma.participant.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'asc' }
    });

    const duplicates: any[] = [];
    const seen = new Map<string, any[]>();

    participants.forEach(p => {
      const key = `${p.email?.toLowerCase() || ''}-${p.phone || ''}`;
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(p);
    });

    seen.forEach((group, key) => {
      if (group.length > 1 && key !== '-') {
        duplicates.push({
          key,
          count: group.length,
          participants: group
        });
      }
    });

    return duplicates;
  }

  async markDuplicates(campaignId: string) {
    const duplicates = await this.detectDuplicates(campaignId);
    let markedCount = 0;

    for (const group of duplicates) {
      const [first, ...rest] = group.participants;
      for (const dup of rest) {
        await prisma.participant.update({
          where: { id: dup.id },
          data: { isDuplicate: true }
        });
        markedCount++;
      }
    }

    return { markedCount, totalGroups: duplicates.length };
  }

  async mergeParticipants(keepId: string, removeIds: string[]) {
    const keep = await prisma.participant.findUnique({ where: { id: keepId } });
    if (!keep) throw new Error('Primary participant not found');

    await prisma.participant.deleteMany({
      where: { id: { in: removeIds } }
    });

    await prisma.campaign.update({
      where: { id: keep.campaignId },
      data: {
        totalParticipants: {
          decrement: removeIds.length
        }
      }
    });

    return { merged: removeIds.length };
  }

  async validatePhoneNumbers(campaignId: string) {
    const participants = await prisma.participant.findMany({
      where: { campaignId }
    });

    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    const invalid: any[] = [];

    participants.forEach(p => {
      if (p.phone && !phoneRegex.test(p.phone)) {
        invalid.push({
          id: p.id,
          name: p.name,
          phone: p.phone,
          reason: 'Invalid format'
        });
      }
    });

    return invalid;
  }

  async validateEmails(campaignId: string) {
    const participants = await prisma.participant.findMany({
      where: { campaignId }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid: any[] = [];

    participants.forEach(p => {
      if (p.email && !emailRegex.test(p.email)) {
        invalid.push({
          id: p.id,
          name: p.name,
          email: p.email,
          reason: 'Invalid format'
        });
      }
    });

    return invalid;
  }

  async bulkDelete(participantIds: string[]) {
    const participants = await prisma.participant.findMany({
      where: { id: { in: participantIds } }
    });

    const campaignUpdates = new Map<string, number>();
    participants.forEach(p => {
      campaignUpdates.set(p.campaignId, (campaignUpdates.get(p.campaignId) || 0) + 1);
    });

    await prisma.participant.deleteMany({
      where: { id: { in: participantIds } }
    });

    for (const [campaignId, count] of campaignUpdates) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { totalParticipants: { decrement: count } }
      });
    }

    return { deleted: participantIds.length };
  }

  async getCleaningStats(campaignId: string) {
    const [total, duplicates, invalidEmails, invalidPhones] = await Promise.all([
      prisma.participant.count({ where: { campaignId } }),
      prisma.participant.count({ where: { campaignId, isDuplicate: true } }),
      this.validateEmails(campaignId),
      this.validatePhoneNumbers(campaignId)
    ]);

    return {
      total,
      duplicates,
      invalidEmails: invalidEmails.length,
      invalidPhones: invalidPhones.length,
      clean: total - duplicates - invalidEmails.length - invalidPhones.length
    };
  }
}
