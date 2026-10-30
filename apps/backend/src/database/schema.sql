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

-- 8. Tipo Etiqueta
CREATE TABLE "tipoEtiqueta" (
  "idTipoEtiqueta" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "tipoEtiqueta" varchar(150) NOT NULL
);

-- 9. Recinto
CREATE TABLE recinto (
  "idRecinto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(100) NOT NULL,
  aforo integer NOT NULL,
  "computadorasDisponibles" integer,
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
  estado boolean NOT NULL,
  "idRecinto" integer NOT NULL REFERENCES recinto("idRecinto")
);

-- 13. Evento
CREATE TABLE evento (
  "idEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(150) NOT NULL,
  descripcion varchar(500) NOT NULL,
  poster text NOT NULL,
  justificacion text,
  "idAlcance" integer NOT NULL REFERENCES alcance("idAlcance"),
  "idEstadoEvento" integer NOT NULL REFERENCES "estadoEvento"("idEstadoEvento"),
  "idOrganizador" integer NOT NULL REFERENCES usuario("idUsuario")
);

-- 14. Evento Etiqueta
CREATE TABLE "eventoEtiqueta" (
  "idEvento" integer NOT NULL REFERENCES evento("idEvento"),
  "idTipoEtiqueta" integer NOT NULL REFERENCES "tipoEtiqueta"("idTipoEtiqueta"),
  PRIMARY KEY ("idEvento", "idTipoEtiqueta")
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
  "accesoQR" boolean NOT NULL,
  estado varchar(50) NOT NULL,
  nombre varchar(150) NOT NULL,
  descripcion varchar(500) NOT NULL,
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
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento"),
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario"),
  "idBoleto" integer REFERENCES boleto("idBoleto"),
  PRIMARY KEY ("idSubEvento", "idUsuario")
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

-- 5. Tipo de Etiqueta
INSERT INTO "tipoEtiqueta" ("idTipoEtiqueta", "tipoEtiqueta") OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'IA'),
  (2, 'Tecnología'),
  (3, 'Salud'),
  (4, 'Ciencia'),
  (5, 'Sistemas')
ON CONFLICT ("idTipoEtiqueta") DO NOTHING;

-- 6. Rol de Verificación
INSERT INTO rol ("idRol", rol) OVERRIDING SYSTEM VALUE
VALUES 
  (1, 1),
  (2, 2),
  (3, 3)
ON CONFLICT ("idRol") DO NOTHING;

-- 7. Recintos Iniciales de ESCOM
INSERT INTO recinto ("idRecinto", nombre, aforo, "computadorasDisponibles", "idEstadoRecinto") OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'Auditorio Principal', 250, 0, 1),
  (2, 'Laboratorio de Cómputo A', 35, 35, 1),
  (3, 'Laboratorio de Cómputo B', 25, 25, 1),
  (4, 'Sala 14', 50, 0, 1)
ON CONFLICT ("idRecinto") DO NOTHING;

-- Ajustar secuencias de identity para futuros INSERTs automáticos
SELECT setval(pg_get_serial_sequence('"alcance"', 'idAlcance'), COALESCE(MAX("idAlcance"), 1)) FROM "alcance";
SELECT setval(pg_get_serial_sequence('"estadoRecinto"', 'idEstadoRecinto'), COALESCE(MAX("idEstadoRecinto"), 1)) FROM "estadoRecinto";
SELECT setval(pg_get_serial_sequence('"estadoEvento"', 'idEstadoEvento'), COALESCE(MAX("idEstadoEvento"), 1)) FROM "estadoEvento";
SELECT setval(pg_get_serial_sequence('"estadoBoleto"', 'idEstadoBoleto'), COALESCE(MAX("idEstadoBoleto"), 1)) FROM "estadoBoleto";
SELECT setval(pg_get_serial_sequence('"tipoEtiqueta"', 'idTipoEtiqueta'), COALESCE(MAX("idTipoEtiqueta"), 1)) FROM "tipoEtiqueta";
SELECT setval(pg_get_serial_sequence('"rol"', 'idRol'), COALESCE(MAX("idRol"), 1)) FROM "rol";
SELECT setval(pg_get_serial_sequence('"recinto"', 'idRecinto'), COALESCE(MAX("idRecinto"), 1)) FROM "recinto";
