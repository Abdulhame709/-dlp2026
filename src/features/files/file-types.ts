export interface FileAsset {
  id: string;
  name: string;
  size: number; // in bytes
  mimeType: string;
  fileUrl: string;
  version: number;
  uploadedBy: string;
  createdAt: Date;
}
