import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get<string>('MINIO_BUCKET', 'lorry-erp');
    const ssl = String(config.get('MINIO_USE_SSL', 'false')).toLowerCase() === 'true';
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(config.get('MINIO_PORT', 9000));

    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: ssl,
      accessKey: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin123'),
    });

    this.baseUrl = `${ssl ? 'https' : 'http'}://${endpoint}:${port}/${this.bucket}`;
    this.ensureBucketExists();
  }

  /**
   * Upload a file buffer to MinIO.
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
    mimeType: string,
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(originalName).toLowerCase();
    const key = `${folder}/${uuidv4()}${ext}`;

    try {
      await this.minioClient.putObject(this.bucket, key, buffer, buffer.length, {
        'Content-Type': mimeType,
        'Cache-Control': 'max-age=31536000',
      });

      const url = `${this.baseUrl}/${key}`;
      this.logger.log(`File uploaded: ${key}`);
      return { url, key };
    } catch (err) {
      this.logger.error('File upload failed', err);
      throw new InternalServerErrorException({
        message: 'File upload failed. Please try again.',
        code: 'STORAGE_UPLOAD_FAILED',
      });
    }
  }

  /**
   * Delete a file from MinIO by its object key.
   */
  async deleteFile(key: string): Promise<void> {
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
    return this.minioClient.presignedGetObject(this.bucket, key, expirySeconds);
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket '${this.bucket}' created`);
      }
    } catch (err) {
      this.logger.warn(`MinIO bucket check deferred (MinIO storage offline or unconfigured)`);
    }
  }
}
