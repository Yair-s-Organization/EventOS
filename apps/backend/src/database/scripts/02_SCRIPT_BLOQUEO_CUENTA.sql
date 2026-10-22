ALTER TABLE usuario
ADD COLUMN IF NOT EXISTS "intentosFallidos" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "bloqueadoHasta" timestamp;