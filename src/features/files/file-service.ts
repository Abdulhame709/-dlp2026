import { FileAsset } from './file-types';
import { Logger } from '@/core/logging/logger';
import { EventBus } from '@/core/utils/event-bus';

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export class FileService {
  private static filesStore: FileAsset[] = [];

  /**
   * Validate and simulate file uploading to Supabase Storage
   */
  static async uploadFile(
    userId: string,
    name: string,
    size: number,
    mimeType: string
  ): Promise<{ success: boolean; file?: FileAsset; error?: string }> {
    // 1. Size Validation check
    if (size > MAX_FILE_SIZE) {
      return { success: false, error: 'FILE_SIZE_LIMIT_EXCEEDED: Maximum allowed upload size is 10MB.' };
    }

    // 2. MIME Whitelist validation
    if (!allowedMimeTypes.includes(mimeType)) {
      return { success: false, error: 'UNSAFE_FILE_MIME_TYPE: Script or executable uploads are strictly prohibited.' };
    }

    const mockFile: FileAsset = {
      id: `file-uuid-${Date.now()}`,
      name,
      size,
      mimeType,
      fileUrl: `https://mock-supabase-project.supabase.co/storage/v1/object/private/attachments/${name}`,
      version: 1,
      uploadedBy: userId,
      createdAt: new Date(),
    };

    this.filesStore.push(mockFile);

    // Track telemetry audit event on EventBus
    await EventBus.publish('FEATURE_USED', {
      userId,
      featureName: 'attachment_uploaded',
      metadata: { fileName: name, fileSize: size, fileType: mimeType },
    });

    return { success: true, file: mockFile };
  }

  static async getFiles(userId: string): Promise<FileAsset[]> {
    return this.filesStore.filter(f => f.uploadedBy === userId);
  }
}
