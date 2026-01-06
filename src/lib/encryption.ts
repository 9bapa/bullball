import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

export class EncryptionService {
  /**
   * Encrypt sensitive data using AES encryption
   */
  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data using AES decryption
   */
  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt Solana private key (array of numbers to string)
   */
  static encryptPrivateKey(privateKey: number[]): string {
    const privateKeyString = Array.from(privateKey).toString();
    return this.encrypt(privateKeyString);
  }

  /**
   * Decrypt Solana private key back to array of numbers
   */
  static decryptPrivateKey(encryptedPrivateKey: string): number[] {
    const decryptedString = this.decrypt(encryptedPrivateKey);
    return decryptedString.split(',').map(num => parseInt(num.trim()));
  }

  /**
   * Validate if encrypted data can be decrypted
   */
  static isValidEncryption(encryptedData: string): boolean {
    try {
      this.decrypt(encryptedData);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const encryptionService = EncryptionService;