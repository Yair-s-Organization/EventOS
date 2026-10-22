CREATE TABLE alcance (
  "idAlcance" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alcance varchar(10) NOT NULL
);

CREATE TABLE fecha (
  "idFecha" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha date NOT NULL,
  "horaInicio" time NOT NULL,
  "horaFin" time NOT NULL
);

CREATE TABLE "estadoRecinto" (
  "idEstadoRecinto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado varchar(100) NOT NULL
);

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
  "esJefeAcademia" boolean NOT NULL
);

CREATE TABLE rol (
  "idRol" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rol integer NOT NULL
);

CREATE TABLE "estadoBoleto" (
  "idEstadoBoleto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado varchar(100) NOT NULL
);

CREATE TABLE "estadoEvento" (
  "idEstadoEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado varchar(100) NOT NULL
);

CREATE TABLE "tipoEtiqueta" (
  "idTipoEtiqueta" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "tipoEtiqueta" varchar(150) NOT NULL
);

CREATE TABLE recinto (
  "idRecinto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(100) NOT NULL,
  aforo integer NOT NULL,
  "computadorasDisponibles" integer,
  "idEstadoRecinto" integer NOT NULL REFERENCES "estadoRecinto"("idEstadoRecinto")
);

CREATE TABLE asiento (
  "idAsiento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fila varchar(10) NOT NULL,
  numero integer NOT NULL,
  "idRecinto" integer NOT NULL REFERENCES recinto("idRecinto")
);

CREATE TABLE verificacion (
  "idVerificacion" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "informacionAdicional" varchar(500) NOT NULL,
  archivo text NOT NULL,
  "idRol" integer NOT NULL REFERENCES rol("idRol"),
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario")
);

CREATE TABLE "estadoEquipo" (
  "idEstadoEquipo" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "numeroEquipo" integer NOT NULL,
  estado boolean NOT NULL,
  "idRecinto" integer NOT NULL REFERENCES recinto("idRecinto")
);

CREATE TABLE evento (
  "idEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(150) NOT NULL,
  descripcion varchar(500) NOT NULL,
  poster text NOT NULL,
  justificacion text NOT NULL,
  "idAlcance" integer NOT NULL REFERENCES alcance("idAlcance"),
  "idEstadoEvento" integer NOT NULL REFERENCES "estadoEvento"("idEstadoEvento"),
  "idOrganizador" integer NOT NULL REFERENCES usuario("idUsuario")
);

CREATE TABLE "eventoEtiqueta" (
  "idEvento" integer NOT NULL REFERENCES evento("idEvento"),
  "idTipoEtiqueta" integer NOT NULL REFERENCES "tipoEtiqueta"("idTipoEtiqueta"),
  PRIMARY KEY ("idEvento", "idTipoEtiqueta")
);

CREATE TABLE boleto (
  "idBoleto" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "tokenQR" varchar(500) NOT NULL,
  "fechaGeneracion" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "idAsiento" integer REFERENCES asiento("idAsiento"),
  "idEstadoBoleto" integer NOT NULL REFERENCES "estadoBoleto"("idEstadoBoleto")
);

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

CREATE TABLE ponente (
  "idPonente" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre varchar(50) NOT NULL,
  "apellidoPa" varchar(50) NOT NULL,
  "apellidoMa" varchar(50),
  correo varchar(254) NOT NULL,
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento")
);

CREATE TABLE "eventoPersonalLogistica" (
  "idEvento" integer NOT NULL REFERENCES evento("idEvento"),
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario"),
  PRIMARY KEY ("idEvento", "idUsuario")
);

CREATE TABLE "asistenteEvento" (
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento"),
  "idUsuario" integer NOT NULL REFERENCES usuario("idUsuario"),
  "idBoleto" integer REFERENCES boleto("idBoleto"),
  PRIMARY KEY ("idSubEvento", "idUsuario")
);

CREATE TABLE "bitacoraEvento" (
  "idBitacoraEvento" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "idEvento" integer NOT NULL REFERENCES evento("idEvento"),
  "idSubEvento" integer NOT NULL REFERENCES "subEvento"("idSubEvento"),
  "idUsuarioActor" integer REFERENCES usuario("idUsuario"),
  "idEstadoEvento" integer NOT NULL REFERENCES "estadoEvento"("idEstadoEvento"),
  "fechaHoraCambio" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);