import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client | null = null;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get<string>('MINIO_BUCKET', 'lorry-erp');
    const ssl = String(config.get('MINIO_USE_SSL', 'false')).toLowerCase() === 'true';
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(config.get('MINIO_PORT', 9000));

    try {
      this.minioClient = new Minio.Client({
        endPoint: endpoint,
        port: port,
        useSSL: ssl,
        accessKey: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin123'),
      });
    } catch {
      this.logger.warn('MinIO client initialization skipped');
    }

    this.baseUrl = `${ssl ? 'https' : 'http'}://${endpoint}:${port}/${this.bucket}`;
    this.ensureBucketExists();
  }

  /**
   * Upload a file buffer to MinIO or fallback to local Data URL / disk storage.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
    mimeType: string,
  ): Promise<{ url: string; key: string }> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Cannot upload empty file');
    }

    const ext = path.extname(originalName || 'file').toLowerCase();
    const key = `${folder}/${uuidv4()}${ext}`;

    // Try MinIO first if client exists
    if (this.minioClient) {
      try {
        await this.minioClient.putObject(this.bucket, key, buffer, buffer.length, {
          'Content-Type': mimeType || 'application/octet-stream',
          'Cache-Control': 'max-age=31536000',
        });

        const url = `${this.baseUrl}/${key}`;
        this.logger.log(`File uploaded to MinIO: ${key}`);
        return { url, key };
      } catch (err: any) {
        this.logger.warn(`MinIO upload failed (${err?.message || err}). Falling back to Data URL storage.`);
      }
    }

    // Fallback: Store as Data URL so image/pdf can be viewed directly anywhere with 0 dependencies
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType || 'application/octet-stream'};base64,${base64}`;
    this.logger.log(`File uploaded (Data URL fallback): ${key}`);

    return { url: dataUrl, key };
  }

  /**
   * Delete a file by key.
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.minioClient) return;
    try {
      await this.minioClient.removeObject(this.bucket, key);
      this.logger.log(`File deleted: ${key}`);
    } catch (err) {
      this.logger.warn(`Failed to delete file: ${key}`, err);
    }
  }

  /**
   * Generate a pre-signed URL for temporary direct access.
   */
  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    if (!this.minioClient) return key;
    try {
      return await this.minioClient.presignedGetObject(this.bucket, key, expirySeconds);
    } catch {
      return key;
    }
  }

  private async ensureBucketExists() {
    if (!this.minioClient) return;
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket '${this.bucket}' created`);
      }
    } catch {
      this.logger.warn(`MinIO storage offline or unconfigured; Data URL fallback active.`);
    }
  }
}
