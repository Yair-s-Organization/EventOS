-- =======================================================
-- Script DDL y Catálogos Iniciales para EventOS
-- =======================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 1. Alcance
CREATE TABLE alcance (
  "idAlcance" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alcance varchar(10) NOT NULL
);

-- 2. Fecha
CREATE TABLE fecha (
  "idFecha" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha date NOT NULL,
  "horaInicio" time NOT NULL,
  "horaFin" time NOT NULL
);

-- 3. Estado Recinto
CREATE TABLE "estadoRecinto" (
  "idEstadoRecinto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado varchar(100) NOT NULL
);

-- 4. Usuario
CREATE TABLE usuario (
  "idUsuario" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(100) NOT NULL,
  "apellidoPa" varchar(50) NOT NULL,
  "apellidoMa" varchar(50),
  correo varchar(254) NOT NULL UNIQUE,
  contrasena varchar(255) NOT NULL,
  estatus boolean NOT NULL,
  "esVerificado" varchar(15) NOT NULL,
  "tipoCuenta" varchar(20) NOT NULL,
  "esJefeAcademia" boolean NOT NULL,
  "intentosFallidos" integer NOT NULL DEFAULT 0,
  "bloqueadoHasta" timestamp
);

-- 5. Rol
CREATE TABLE rol (
  "idRol" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rol integer NOT NULL
);

-- 6. Estado Boleto
CREATE TABLE "estadoBoleto" (
  "idEstadoBoleto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado varchar(100) NOT NULL
);

-- 7. Estado Evento
CREATE TABLE "estadoEvento" (
  "idEstadoEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado varchar(100) NOT NULL
);

-- 8. Modalidad de Acceso
CREATE TABLE "modalidadAcceso" (
  "idModalidadAcceso" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  modalidad varchar(50) NOT NULL
);

-- 9. Recinto
CREATE TABLE recinto (
  "idRecinto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(100) NOT NULL,
  aforo integer NOT NULL,
  "idEstadoRecinto" integer NOT NULL REFERENCES "estadoRecinto"("idEstadoRecinto")
);

-- 10. Asiento
CREATE TABLE asiento (
  "idAsiento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fila varchar(10) NOT NULL,
  numero integer NOT NULL,
  "idRecinto" integer NOT NULL REFERENCES recinto("idRecinto")
);

-- 11. Verificación
CREATE TABLE verificacion (
  "idVerificacion" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "informacionAdicional" varchar(500) NOT NULL,
  archivo text NOT NULL,
  fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "idRol" integer NOT NULL REFERENCES rol("idRol"),
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario")
);

-- 12. Estado Equipo
CREATE TABLE "estadoEquipo" (
  "idEstadoEquipo" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "numeroEquipo" integer NOT NULL,
  estado boolean NOT NULL DEFAULT true,
  "idRecinto" integer NOT NULL REFERENCES recinto("idRecinto")
);

-- 13. Evento
CREATE TABLE evento (
  "idEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(150) NOT NULL,
  descripcion varchar(500) NOT NULL,
  poster text NOT NULL,
  justificacion text,
  "esUrgente" boolean NOT NULL DEFAULT false,
  "motivoUrgencia" text,
  "motivoRechazo" text,
  "idAlcance" integer NOT NULL REFERENCES alcance("idAlcance"),
  "idEstadoEvento" integer NOT NULL REFERENCES "estadoEvento"("idEstadoEvento"),
  "idOrganizador" integer NOT NULL REFERENCES usuario("idUsuario")
);

-- 15. Boleto
CREATE TABLE boleto (
  "idBoleto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "tokenQR" varchar(500) NOT NULL,
  "fechaGeneracion" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "idAsiento" integer REFERENCES asiento("idAsiento"),
  "idEstadoBoleto" integer NOT NULL REFERENCES "estadoBoleto"("idEstadoBoleto")
);

-- 16. SubEvento
CREATE TABLE "subEvento" (
  "idSubEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "idModalidadAcceso" integer NOT NULL REFERENCES "modalidadAcceso"("idModalidadAcceso"),
  estado varchar(50) NOT NULL,
  nombre varchar(150) NOT NULL,
  descripcion varchar(500) NOT NULL,
  "cupoMaximo" integer CHECK ("cupoMaximo" IS NULL OR "cupoMaximo" > 0),
  "tokenInvitacion" varchar(64) NOT NULL UNIQUE,
  "enlaceInvitacionActivo" boolean NOT NULL DEFAULT false,
  "idEvento" integer NOT NULL REFERENCES evento("idEvento"),
  "idRecinto" integer NOT NULL REFERENCES recinto("idRecinto"),
  "idFecha" integer NOT NULL REFERENCES fecha("idFecha")
);

-- 17. Ponente
CREATE TABLE ponente (
  "idPonente" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(50) NOT NULL,
  "apellidoPa" varchar(50) NOT NULL,
  "apellidoMa" varchar(50),
  correo varchar(254) NOT NULL,
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento")
);

-- 18. Evento Personal Logística
CREATE TABLE "eventoPersonalLogistica" (
  "idEvento" integer NOT NULL REFERENCES evento("idEvento"),
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario"),
  PRIMARY KEY ("idEvento", "idUsuario")
);

-- 19. Asistente Evento
CREATE TABLE "asistenteEvento" (
  "idAsistenteEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento"),
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario"),
  "idBoleto" integer REFERENCES boleto("idBoleto")
);

-- 20. Bitácora Evento
CREATE TABLE "bitacoraEvento" (
  "idBitacoraEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "idEvento" integer NOT NULL REFERENCES evento("idEvento"),
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento"),
  "idUsuarioActor" integer REFERENCES usuario("idUsuario"),
  "idEstadoEvento" integer NOT NULL REFERENCES "estadoEvento"("idEstadoEvento"),
  "fechaHoraCambio" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. Solicitud Modificación
CREATE TABLE "solicitudModificacion" (
  "idSolicitudModificacion" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "idEvento" integer NOT NULL REFERENCES evento("idEvento") ON DELETE CASCADE,
  "motivoModificacion" varchar(500) NOT NULL,
  "subeventosPropuestos" jsonb NOT NULL,
  estado varchar(50) NOT NULL DEFAULT 'Pendiente',
  "motivoRechazo" text
);

-- 22. Invitación Evento Privado
CREATE TABLE "invitacionEvento" (
  "idInvitacionEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento") ON DELETE CASCADE,
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario"),
  "fechaUltimoEnvio" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("idSubEvento", "idUsuario")
);

-- 23. Retención Asiento (Temporal para modalidad QR con mapa de asientos)
CREATE TABLE "retencionAsiento" (
  "idRetencionAsiento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento") ON DELETE CASCADE,
  "idAsiento" integer NOT NULL REFERENCES asiento("idAsiento") ON DELETE CASCADE,
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario") ON DELETE CASCADE,
  "venceEn" timestamp NOT NULL,
  "creadaEn" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "UQ_subevento_asiento" UNIQUE ("idSubEvento", "idAsiento"),
  CONSTRAINT "UQ_subevento_usuario" UNIQUE ("idSubEvento", "idUsuario")
);

-- =======================================================
-- Catálogos y Datos Iniciales
-- =======================================================

-- 1. Alcance
INSERT INTO alcance ("idAlcance", alcance) OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'Público'),
  (2, 'Interno'),
  (3, 'Privado')
ON CONFLICT ("idAlcance") DO NOTHING;

-- 2. Estado de Recinto
INSERT INTO "estadoRecinto" ("idEstadoRecinto", estado) OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'Habilitado'),
  (2, 'Inhabilitado'),
  (3, 'Mantenimiento')
ON CONFLICT ("idEstadoRecinto") DO NOTHING;

-- 3. Estado de Evento
INSERT INTO "estadoEvento" ("idEstadoEvento", estado) OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'Rechazado'),
  (2, 'Aceptado'),
  (3, 'En Proceso'),
  (4, 'Cancelado'),
  (5, 'Finalizado')
ON CONFLICT ("idEstadoEvento") DO NOTHING;

-- 4. Estado de Boleto
INSERT INTO "estadoBoleto" ("idEstadoBoleto", estado) OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'Válido'),
  (2, 'Utilizado'),
  (3, 'Cancelado')
ON CONFLICT ("idEstadoBoleto") DO NOTHING;

-- 5. Rol de Verificación
INSERT INTO rol ("idRol", rol) OVERRIDING SYSTEM VALUE
VALUES 
  (1, 1),
  (2, 2),
  (3, 3)
ON CONFLICT ("idRol") DO NOTHING;

-- 5.1. Modalidad de Acceso
INSERT INTO "modalidadAcceso" ("idModalidadAcceso", modalidad) OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Acceso libre'),
  (2, 'Registro simple sin QR'),
  (3, 'QR Admisión general'),
  (4, 'QR con mapa de asientos')
ON CONFLICT ("idModalidadAcceso") DO NOTHING;

-- 6. Recintos Iniciales de ESCOM
INSERT INTO recinto ("idRecinto", nombre, aforo, "idEstadoRecinto") OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'Auditorio Principal', 242, 1),
  (2, 'Laboratorio 2104', 36, 1),
  (3, 'Laboratorio 2105', 36, 1),
  (4, 'Sala 14', 100, 1),
  (5, 'Laboratorio 2106', 36, 1),
  (6, 'Laboratorio 2107', 36, 1)
ON CONFLICT ("idRecinto") DO UPDATE
SET nombre = EXCLUDED.nombre, aforo = EXCLUDED.aforo;

-- 7. Asientos Oficiales del Auditorio Principal (242 butacas)
INSERT INTO asiento (fila, numero, "idRecinto")
SELECT filas.fila, numeros.numero, 1
FROM (VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K')) AS filas(fila)
CROSS JOIN generate_series(1, 23) AS numeros(numero)
WHERE (
  (filas.fila = 'A' AND numeros.numero IN (4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20))
  OR (filas.fila = 'B' AND numeros.numero BETWEEN 2 AND 22)
  OR filas.fila NOT IN ('A', 'B')
)
AND NOT EXISTS (
  SELECT 1 FROM asiento a
  WHERE a."idRecinto" = 1 AND a.fila = filas.fila AND a.numero = numeros.numero
);

-- Ajustar secuencias de identity para futuros INSERTs automáticos
SELECT setval(pg_get_serial_sequence('"alcance"', 'idAlcance'), COALESCE(MAX("idAlcance"), 1)) FROM "alcance";
SELECT setval(pg_get_serial_sequence('"estadoRecinto"', 'idEstadoRecinto'), COALESCE(MAX("idEstadoRecinto"), 1)) FROM "estadoRecinto";
SELECT setval(pg_get_serial_sequence('"estadoEvento"', 'idEstadoEvento'), COALESCE(MAX("idEstadoEvento"), 1)) FROM "estadoEvento";
SELECT setval(pg_get_serial_sequence('"estadoBoleto"', 'idEstadoBoleto'), COALESCE(MAX("idEstadoBoleto"), 1)) FROM "estadoBoleto";
SELECT setval(pg_get_serial_sequence('"rol"', 'idRol'), COALESCE(MAX("idRol"), 1)) FROM "rol";
SELECT setval(pg_get_serial_sequence('"modalidadAcceso"', 'idModalidadAcceso'), COALESCE(MAX("idModalidadAcceso"), 1)) FROM "modalidadAcceso";
SELECT setval(pg_get_serial_sequence('"recinto"', 'idRecinto'), COALESCE(MAX("idRecinto"), 1)) FROM "recinto";
