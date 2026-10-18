import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { extname } from 'path';

// 'public'  -> se puede ver con URL directa (ej. póster)
// 'private' -> solo se ve con URL firmada temporal (ej. documento de identidad)
export type Visibilidad = 'public' | 'private';

/**
 * Único punto del sistema que toca archivos.
 * Habla el protocolo S3, así que funciona igual con MinIO (desarrollo) y
 * Cloudflare R2 (producción): solo cambian las variables del .env.
 */
@Injectable()
export class StorageService {
  private readonly s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'auto',
    forcePathStyle: true, // requerido por MinIO; R2 también lo acepta
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? '',
      secretAccessKey: process.env.S3_SECRET_KEY ?? '',
    },
  });

  private bucket(visibilidad: Visibilidad): string {
    return visibilidad === 'public'
      ? (process.env.S3_BUCKET_PUBLIC ?? 'eventos-public')
      : (process.env.S3_BUCKET_PRIVATE ?? 'eventos-private');
  }

  /** Guarda el archivo y devuelve la KEY (esto es lo que se guarda en la BD). */
  async upload(
    file: Express.Multer.File,
    folder: string,
    visibilidad: Visibilidad,
  ): Promise<string> {
    const key = `${folder}/${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket(visibilidad),
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return key;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new InternalServerErrorException('No se pudo almacenar el archivo');
    }
  }

  /** URL directa. Solo para archivos guardados como 'public'. */
  publicUrl(key: string): string {
    return `${process.env.S3_PUBLIC_URL}/${key}`;
  }

  /** URL temporal de lectura. Para archivos guardados como 'private'. */
  privateUrl(key: string, expiresInSeconds = 300): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket('private'), Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  async delete(key: string, visibilidad: Visibilidad): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket(visibilidad), Key: key }),
    );
  }
}

