---
proyecto: "EventOS"
materia: "Análisis y Diseño de Sistemas"
equipo: "Sinergia Ágil"
tags:
  - apunte
  - escuela
  - ads
  - eventos
  - actores
  - catalogos
---

# 👥 Actores, Diagramas de Casos de Uso y Catálogos — EventOS

> [!NOTE] Navegación Rápida
> 🔗 **Hub del Proyecto:** [[00-Proyecto-EventOS]] | **Requerimientos y Reglas:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Casos de Uso:** [[00-Indice-Casos-de-Uso]]

---

## 1. Descripción de Actores del Sistema

### 👤 Asistente

Este actor interactúa con la plataforma para consultar la cartelera y gestionar su participación. Tiene la capacidad de reservar su lugar o recursos específicos (como equipos de cómputo en laboratorios), generar su boleto digital de acceso mediante código QR, administrar o cancelar sus reservas activa. Este actor puede operar desde una cuenta de tipo Usuario Interno (comunidad ESCOM/IPN) o Usuario Externo (público general), lo cual determinará su visibilidad en la cartelera.

### 👤 Organizador

Este actor es responsable de la propuesta, creación y administración operativa de los eventos, el cual puede pertenecer a la comunidad institucional, a un club estudiantil o ser una entidad externa. Sus capacidades incluyen la captura de especificaciones del evento (horarios, recintos, descripción), la definición del nivel de alcance (público, interno o privado), la categorización del ciclo de vida del evento, abarcando modificaciones de itinerario o cancelaciones justificadas.

### 👤 Subdirección de Servicios Educativos

Este actor cuenta con privilegios de administrador y es el encargado de evaluar las solicitudes de los eventos, y decidir si se autorizan o rechazan mediante un panel de autorización. Toma la decisión de aprobar basándose en la agenda de disponibilidad y evaluando la justificación de impacto académico de la actividad frente a las clases regulares.

### 👤 Personal de Logística

Actor operativo cuyo propósito en el sistema es la verificación de las reservas. Interactúa con un módulo específico de la plataforma web que, mediante los permisos del navegador, utiliza la cámara del dispositivo para decodificar los códigos QR de los boletos. Su interacción principal consiste en recibir el dictamen del sistema (acceso válido, duplicado o inválido) y visualizar el nivel de acreditación del usuario consultado y observar en tiempo real la capacidad o aforo actual del recinto.

### 👤 Administrador

Este actor cuenta con privilegios de gestión sobre la infraestructura y los usuarios del sistema. Tiene la capacidad de consultar los eventos registrados y eliminarlos cuando sea necesario, así como eliminar cualquier cuenta de usuario de la plataforma. Es responsable de la gestión de los espacios físicos (auditorio, Sala 14 y laboratorios), pudiendo editarlos o agregar nuevos espacios conforme la institución lo requiera. Administra también el inventario de los equipos de cómputo de los laboratorios, con control total para añadir, modificar o eliminar tanto espacios como equipos del inventario. Adicionalmente, puede consultar una bitácora de los eventos realizados, como registro histórico de la actividad del sistema

---

## 2. Diagramas de Casos de Uso por Actor

### 2.1. Asistente
![[diagrama-cu-asistente.png]]

### 2.2. Organizador
![[diagrama-cu-organizador.png]]

### 2.3. Subdirección de Servicios Educativos
![[diagrama-cu-subdireccion.png]]

### 2.4. Personal de Logística
![[diagrama-cu-logistica.png]]

### 2.5. Administrador
![[diagrama-cu-administrador.png]]

---

## 3. Catálogo Oficial de Pantallas (`UI01` – `UI24`)

| ID | Nombre Detallado |
| --- | --- |
| UI01 | Pantalla de Inicio de Sesión |
| UI02 | Pantalla de Registro de Usuario |
| UI03 | Menú Principal del Asistente |
| UI04 | Cartelera de Eventos |
| UI05 | Detalles del Evento |
| UI06 | Mapa de Asientos y Disponibilidad del Recinto |
| UI07 | Formulario de Solicitud de Evento |
| UI08 | Consultar Sus Eventos (Reservas del Asistente) |
| UI09 | Boleto Digital y Código QR |
| UI10 | Bitácora de Eventos Realizados |
| UI11 | Panel de Solicitudes Pendientes (Subdirección) |
| UI12 | Detalles de Solicitud para Evaluación |
| UI13 | Panel de Eventos Aprobados |
| UI14 | Panel Consultar Mis Eventos (Organizador) |
| UI15 | Panel de Administración y Detalles del Evento (Organizador) |
| UI16 | Formularios de Modificación de Evento (Logística, Descripción, Alcance, Etiquetas) |
| UI17 | Catálogo de Requerimientos Técnicos |
| UI18 | Panel de Eventos Asignados (Personal de Logística) |
| UI19 | Pantalla de Escáner QR |
| UI20 | Bitácora Histórica del Sistema (Administrador) |
| UI21 | Gestión de Cuentas de Usuario (Administrador) |
| UI22 | Panel de Gestión de Espacios Físicos (Tarjetas de Recintos) |
| UI23 | Mapa Visual de Inventario de Equipos de Laboratorio |
| UI24 | Activación de Cuenta por Token (Personal de Logística) |

---

## 4. Catálogo de Mensajes de Error (`MSG-E-01` – `MSG-E-30`)

| ID | Mensaje |
| --- | --- |
| MSG-E-01 | El evento ya ha concluido. |
| MSG-E-02 | Cantidad inválida. Ingrese un número entero válido. |
| MSG-E-03 | La cantidad solicitada excede el límite disponible. |
| MSG-E-04 | La cantidad solicitada excede el aforo máximo de seguridad del recinto. Solo quedan X lugares disponibles. |
| MSG-E-05 | Evento sin lugares disponibles. |
| MSG-E-06 | Evento no encontrado o cancelado. |
| MSG-E-07 | Evento finalizado o inactivo. |
| MSG-E-08 | Error de conexión con la base de datos. |
| MSG-E-09 | Uno o más asientos seleccionados ya no están disponibles. Por favor, elija otros lugares. |
| MSG-E-10 | Sesión expirada o inválida. |
| MSG-E-11 | Por favor, completa todos los campos obligatorios resaltados para continuar. |
| MSG-E-12 | Ya cuentas con un boleto de asistente para este evento. Si deseas postularte como staff, primero debes cancelar tu reserva actual. |
| MSG-E-13 | Dato requerido faltante. La descripción no puede estar vacía. |
| MSG-E-14 | La descripción excede el límite máximo de caracteres permitidos. |
| MSG-E-15 | Debe seleccionar un tipo de alcance válido para continuar. |
| MSG-E-16 | Formato de etiqueta inválido. Por favor, verifique los caracteres ingresados. |
| MSG-E-17 | Límite de etiquetas excedido. No es posible asignar más etiquetas a este evento. |
| MSG-E-18 | Error de conexión con la base de datos al cargar las tarjetas. |
| MSG-E-19 | Operación fallida al intentar actualizar el estado del equipo. |
| MSG-E-20 | Error: Ya tienes una reserva para este evento. |
| MSG-E-21 | El correo no se pudo enviar. Inténtelo de nuevo más tarde. |
| MSG-E-22 | Advertencia: Ingrese un correo válido. |
| MSG-E-23 | Acceso denegado, el código QR no ha sido reconocido por el sistema. |
| MSG-E-24 | Acceso denegado, el código QR ya ha sido validado en el sistema. |
| MSG-E-25 | El lugar seleccionado ya no se encuentra disponible. |
| MSG-E-26 | El periodo de registro para este evento ha finalizado. |
| MSG-E-27 | No fue posible generar el código QR. Intenta nuevamente. |
| MSG-E-28 | La reserva no ha sido confirmada. |
| MSG-E-29 | No fue posible consultar tus eventos. Intenta nuevamente. |
| MSG-E-30 | Dato requerido faltante. La justificación no puede estar vacía. |

---

## 5. Catálogo de Mensajes de Pantalla / Confirmación (`MSG-01` – `MSG-25`)

| Número de mensaje | Mensaje Detallado |
| --- | --- |
| MSG-01 | No hay solicitudes pendientes de aprobación en este momento. |
| MSG-02 | ¿Desea confirmar la cancelación del evento seleccionado? |
| MSG-03 | El evento se ha cancelado exitosamente. |
| MSG-04 | Sin eventos registrados en la bitácora. |
| MSG-05 | ¿Desea cerrar su sesión? |
| MSG-06 | Sesión finalizada con éxito. |
| MSG-07 | Tu postulación ha sido enviada con éxito. |
| MSG-08 | ¿Desea aprobar el evento? |
| MSG-09 | ¿Desea rechazar el evento? |
| MSG-10 | La solicitud fue aprobada exitosamente. |
| MSG-11 | La solicitud fue rechazada exitosamente. |
| MSG-12 | Operación realizada con éxito. |
| MSG-13 | Operación realizada con éxito. Evento en espera de revisión debido a cambio de duración. |
| MSG-14 | Operación exitosa al actualizar la descripción del evento. |
| MSG-15 | Operación exitosa al actualizar el alcance del evento |
| MSG-16 | Operación exitosa al asignar las etiquetas del evento. |
| MSG-17 | Operación realizada con éxito. Recinto actualizado. |
| MSG-18 | No hay eventos disponibles, consulte más tarde. |
| MSG-19 | No hay eventos disponibles que cumplan con los filtros seleccionados. |
| MSG-20 | Operación exitosa, su reserva se ha generado correctamente. |
| MSG-21 | Proceso interrumpido con éxito, reserva cancelada. |
| MSG-22 | Correo enviado con éxito. |
| MSG-23 | No existen eventos vinculados a este perfil. |
| MSG-24 | Acceso válido. |
| MSG-25 | No cuentas con eventos registrados. |
