import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

/**
 * Crea la configuración de Multer (recepción + validación).
 * El archivo queda en memoria (file.buffer) y el StorageService lo sube.
 */
export function crearUploadOptions(
  tiposPermitidos: string[],
  maxMB: number,
): MulterOptions {
  return {
    storage: memoryStorage(),
    limits: { fileSize: maxMB * 1024 * 1024 }, // si se excede responde 413
    fileFilter: (_req, file, cb) => {
      if (!tiposPermitidos.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            `Tipo de archivo no permitido. Permitidos: ${tiposPermitidos.join(', ')}`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
}

// Configuraciones listas para usar con FileInterceptor
export const posterOptions = crearUploadOptions(
  ['image/jpeg', 'image/png', 'image/webp'],
  5,
);

export const documentoOptions = crearUploadOptions(
  ['application/pdf', 'image/jpeg', 'image/png'],
  5,
);

