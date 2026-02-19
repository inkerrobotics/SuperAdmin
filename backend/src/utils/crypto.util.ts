import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!'; // Must be 32 characters
const IV_LENGTH = 16; // For AES, this is always 16

export class CryptoUtil {
  /**
   * Encrypt text using AES-256-CBC
   */
  static encrypt(text: string): string {
    if (!text) return '';
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Decrypt text using AES-256-CBC
   */
  static decrypt(text: string): string {
    if (!text) return '';
    
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  }

  /**
   * Hash text using SHA256 (one-way, cannot be decrypted)
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generate a random tenant ID
   */
  static generateTenantId(): string {
    return 'TNT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
}
