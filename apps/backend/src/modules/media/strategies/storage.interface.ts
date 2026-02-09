export interface StorageStrategy {
  /**
   * Upload a file to storage
   * @param file - The file buffer
   * @param filename - The unique filename to store
   * @param mimetype - The file mimetype
   * @returns The path/URL where the file was stored
   */
  upload(file: Buffer, filename: string, mimetype: string): Promise<UploadResult>;

  /**
   * Delete a file from storage
   * @param path - The file path
   * @returns True if deleted successfully
   */
  delete(path: string): Promise<boolean>;

  /**
   * Get the public URL for a file
   * @param path - The file path
   * @returns The public URL
   */
  getUrl(path: string): string;

  /**
   * Check if a file exists
   * @param path - The file path
   * @returns True if the file exists
   */
  exists(path: string): Promise<boolean>;
}

export interface UploadResult {
  path: string;
  url: string;
  size: number;
}

export const STORAGE_STRATEGY = 'STORAGE_STRATEGY';
