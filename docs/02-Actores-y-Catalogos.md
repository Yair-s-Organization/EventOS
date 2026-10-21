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
> 🔗 **Hub del Proyecto:** [[00-Proyecto-EventOS]] | **Requerimientos y Reglas:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Casos de Uso (`CU01`–`CU37`):** [[00-Indice-Casos-de-Uso]]

---

## 1. Descripción de Actores del Sistema

### 👤 Asistente

Este actor interactúa con la plataforma para consultar la cartelera y gestionar su participación. Tiene la capacidad de reservar su lugar o recursos específicos (como asientos en el auditorio o equipos de cómputo en laboratorios), generar y visualizar su boleto digital de acceso mediante código QR, administrar o cancelar sus reservas activas, consultar la bitácora de eventos realizados y solicitar la creación de un evento adjuntando la documentación de identidad según su tipo de solicitante (*Estudiante*, *Empresa* o *Externo*). Puede operar desde una cuenta de tipo `Usuario Interno` (comunidad ESCOM/IPN) o `Usuario Externo` (público general), lo cual determinará su visibilidad en la cartelera.

### 👤 Organizador

Este actor es responsable de la propuesta, creación y administración operativa de los eventos bajo su responsabilidad (privilegio otorgado por evento conforme a `RN-02`), pudiendo pertenecer a la comunidad institucional, a un club estudiantil o a una entidad externa. Sus capacidades incluyen consultar y administrar sus eventos, reprogramar o reubicar su logística (fecha, hora, espacio), actualizar la información general (descripción, alcance público/interno/privado y etiquetas temáticas), solicitar requerimientos técnicos de cómputo en laboratorios, agregar ponentes, emitir boletos directos (consultables dentro de la aplicación sin envío de correo), asignar o registrar personal de logística y cancelar sus eventos especificando un motivo obligatorio que se notifica internamente en la aplicación.

### 👤 Subdirección de Servicios Educativos

Este actor es el encargado de consultar y evaluar las solicitudes de eventos pendientes de aprobación, dictaminando si se aprueban o rechazan mediante el panel de evaluación con base en la agenda de disponibilidad y el impacto académico frente a las clases regulares. Asimismo, puede consultar los eventos aprobados, cancelarlos justificadamente, agregar ponentes, registrar personal de logística y solicitar eventos cuyas solicitudes se aprueban de forma automática (`RN-13`).

### 👤 Personal de Logística

Actor operativo cuyo propósito en el sistema es la validación de acceso de los asistentes en los eventos a los que ha sido asignado. Interactúa con el panel de eventos asignados, visualiza los detalles del evento y utiliza la cámara del dispositivo desde el navegador web para escanear los códigos QR de los boletos digitales, recibiendo el dictamen del sistema (acceso válido, código no reconocido o código ya validado) y actualizando el estado del boleto a `Ingresado`.

### 👤 Administrador

Este actor cuenta con privilegios de gestión sobre las cuentas de usuario, la infraestructura de espacios físicos y la auditoría del sistema. Puede registrar usuarios manualmente (asignando roles permitidos), activar o desactivar cuentas de usuario (borrado lógico), gestionar el estado de verificación (`Verificado` / `No verificado`) de usuarios (*Alumno*, *Profesor* o *Empresa*), actualizar el estado operativo (`Activo`, `Mantenimiento`, `Inactivo`) y aforo máximo de los espacios físicos de ESCOM, administrar el estado del inventario de equipos de cómputo por laboratorio, y consultar/exportar en formato PDF la bitácora histórica inmutable del sistema.

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

## 3. Catálogo Oficial de Pantallas (`UI0`, `UI01` – `UI32`)

| Actor | ID | Nombre de la pantalla |
| :--- | :--- | :--- |
| Todos | **UI0** | Pantalla de Verificación de usuario |
| Todos | **UI01** | Pantalla de Inicio de Sesión |
| Todos | **UI28** | Visualizar Perfil de Usuario |
| Asistente | **UI02** | Pantalla de Registro de Usuario |
| Asistente | **UI03** | Menú Principal del Asistente |
| Asistente | **UI04** | Cartelera de Eventos |
| Asistente | **UI05** | Detalles del Evento |
| Asistente | **UI06** | Mapa de Asientos y Disponibilidad del Recinto |
| Asistente | **UI07** | Formulario de Solicitud de Evento |
| Asistente | **UI08** | Consultar Mis Eventos |
| Asistente | **UI09** | Boleto Digital y Código QR |
| Asistente | **UI10** | Bitácora de Eventos Realizados |
| Asistente | **UI30** | Agregar Etiquetas al Evento |
| Asistente | **UI32** | Panel de Verificación de Usuario |
| Subdirección de Servicios Educativos | **UI07** | Formulario de Solicitud de Evento |
| Subdirección de Servicios Educativos | **UI11** | Panel de Solicitudes Pendientes |
| Subdirección de Servicios Educativos | **UI12** | Detalles del Evento para Evaluación |
| Subdirección de Servicios Educativos | **UI13** | Panel de Eventos Aprobados |
| Subdirección de Servicios Educativos | **UI25** | Menú Principal de Subdirección |
| Subdirección de Servicios Educativos | **UI27** | Agregar Personal de Logística |
| Subdirección de Servicios Educativos | **UI29** | Agregar Ponente al Evento |
| Organizador | **UI14** | Panel de Consulta de Mis Eventos |
| Organizador | **UI15** | Panel de Administración y Detalles del Evento |
| Organizador | **UI16** | Formulario de Modificación de Evento |
| Organizador | **UI17** | Catálogo de Requerimientos Técnicos |
| Organizador | **UI27** | Agregar Personal de Logística |
| Organizador | **UI29** | Agregar Ponente al Evento |
| Personal de Logística | **UI05** | Detalles del Evento |
| Personal de Logística | **UI18** | Panel de Eventos Asignados |
| Personal de Logística | **UI19** | Pantalla de Escáner QR |
| Personal de Logística | **UI24** | Activación de Cuenta por Token |
| Administrador | **UI20** | Bitácora Histórica del Sistema |
| Administrador | **UI21** | Gestión de Cuentas de Usuario |
| Administrador | **UI22** | Panel de Gestión de Espacios Físicos |
| Administrador | **UI23** | Gestión de Equipos de Laboratorio |
| Administrador | **UI26** | Menú Principal de Administrador |
| Administrador | **UI31** | Gestionar Estado de Verificación de Usuarios |

---

## 4. Catálogo de Mensajes de Error (`MSG-E-01` – `MSG-E-49`)

| ID | Mensaje |
| :--- | :--- |
| **MSG-E-01** | El evento ya ha concluido. |
| **MSG-E-02** | Cantidad inválida. Ingrese un número entero válido. |
| **MSG-E-03** | La cantidad solicitada excede el límite disponible. |
| **MSG-E-04** | La cantidad solicitada excede el aforo máximo de seguridad del recinto. Solo quedan X lugares disponibles. |
| **MSG-E-05** | Evento sin lugares disponibles. |
| **MSG-E-06** | Evento no encontrado o cancelado. |
| **MSG-E-07** | Evento finalizado o inactivo. |
| **MSG-E-08** | Error de conexión con la base de datos. |
| **MSG-E-09** | Uno o más asientos seleccionados ya no están disponibles. Por favor, elija otros lugares. |
| **MSG-E-10** | Sesión expirada o inválida. |
| **MSG-E-11** | Por favor, completa todos los campos obligatorios resaltados para continuar. |
| **MSG-E-12** | Ya cuentas con un boleto de asistente para este evento. Si deseas postularte como staff, primero debes cancelar tu reserva actual. |
| **MSG-E-13** | Dato requerido faltante. La descripción no puede estar vacía. |
| **MSG-E-14** | La descripción excede el límite máximo de caracteres permitidos. |
| **MSG-E-15** | Debe seleccionar un tipo de alcance válido para continuar. |
| **MSG-E-16** | Formato de etiqueta inválido. Por favor, verifique los caracteres ingresados. |
| **MSG-E-17** | Límite de etiquetas excedido. No es posible asignar más etiquetas a este evento. |
| **MSG-E-18** | Error de conexión con la base de datos al cargar las tarjetas. |
| **MSG-E-19** | Operación fallida al intentar actualizar el estado del equipo. |
| **MSG-E-20** | Error: Ya tienes una reserva para este evento. |
| **MSG-E-21** | Advertencia: Ingrese un correo válido. |
| **MSG-E-22** | Acceso denegado, el código QR no ha sido reconocido por el sistema. |
| **MSG-E-23** | Acceso denegado, el código QR ya ha sido validado en el sistema. |
| **MSG-E-24** | El lugar seleccionado ya no se encuentra disponible. |
| **MSG-E-25** | El periodo de registro para este evento ha finalizado. |
| **MSG-E-26** | No fue posible generar el código QR. Intenta nuevamente. |
| **MSG-E-27** | La reserva no ha sido confirmada. |
| **MSG-E-28** | No fue posible consultar tus eventos. Intenta nuevamente. |
| **MSG-E-29** | Dato requerido faltante. La justificación no puede estar vacía. |
| **MSG-E-30** | No fue posible guardar el boleto digital. Intenta nuevamente. |
| **MSG-E-31** | No hay registros de eventos disponibles. |
| **MSG-E-32** | Error al exportar el archivo. |
| **MSG-E-33** | La solicitud seleccionada ya no se encuentra pendiente de aprobación. Actualice el listado para continuar. |
| **MSG-E-34** | El ponente ya se encuentra registrado en el evento seleccionado. |
| **MSG-E-35** | No es posible agregar ponentes a un evento que no se encuentra aprobado. |
| **MSG-E-36** | La fecha u horario del evento no es válido. Verifique que la fecha sea futura y que la hora de finalización sea posterior a la hora de inicio. |
| **MSG-E-37** | El correo electrónico ingresado ya se encuentra registrado en el sistema. |
| **MSG-E-38** | No cuenta con los permisos necesarios para registrar personal de logística. |
| **MSG-E-39** | El personal de logística ya se encuentra asignado al evento seleccionado. |
| **MSG-E-40** | No es posible asignar personal de logística a un evento que no se encuentra aprobado. |
| **MSG-E-41** | No tiene autorización para consultar este evento porque no se encuentra asignado a él. |
| **MSG-E-42** | No se pudo acceder a la cámara del dispositivo. Verifique los permisos e inténtelo nuevamente. |
| **MSG-E-43** | La cuenta seleccionada no existe o ya no se encuentra disponible. |
| **MSG-E-44** | No es posible actualizar el recinto porque existen eventos aprobados que podrían verse afectados. Revise sus asignaciones. |
| **MSG-E-45** | No es posible verificar al usuario porque su información de verificación está incompleta. |
| **MSG-E-46** | Las contraseñas ingresadas no coinciden. |
| **MSG-E-47** | El espacio ya se encuentra solicitado o reservado para el horario seleccionado. |
| **MSG-E-48** | El destinatario ya cuenta con un boleto activo para este evento. |
| **MSG-E-49** | No se encontró una cuenta activa para el destinatario del boleto directo. |

---

## 5. Catálogo de Mensajes Informativos (`MSG-I-01` – `MSG-I-23`)

| Número de mensaje | Mensaje Detallado |
| :--- | :--- |
| **MSG-I-01** | No hay solicitudes pendientes de aprobación en este momento. |
| **MSG-I-02** | El evento se ha cancelado exitosamente. |
| **MSG-I-03** | Sin eventos registrados en la bitácora. |
| **MSG-I-04** | Sesión finalizada con éxito. |
| **MSG-I-05** | Tu postulación ha sido enviada con éxito. |
| **MSG-I-06** | La solicitud fue aprobada exitosamente. |
| **MSG-I-07** | La solicitud fue rechazada exitosamente. |
| **MSG-I-08** | Operación realizada con éxito. |
| **MSG-I-09** | Operación realizada con éxito. Evento en espera de revisión debido a cambio de duración. |
| **MSG-I-10** | Operación exitosa al actualizar la descripción del evento. |
| **MSG-I-11** | Operación exitosa al actualizar el alcance del evento |
| **MSG-I-12** | Operación exitosa al asignar las etiquetas del evento. |
| **MSG-I-13** | Operación realizada con éxito. Recinto actualizado. |
| **MSG-I-14** | No hay eventos disponibles, consulte más tarde. |
| **MSG-I-15** | No hay eventos disponibles que cumplan con los filtros seleccionados. |
| **MSG-I-16** | Operación exitosa, su reserva se ha generado correctamente. |
| **MSG-I-17** | Proceso interrumpido con éxito, reserva cancelada. |
| **MSG-I-18** | No existen eventos vinculados a este perfil. |
| **MSG-I-19** | Acceso válido. |
| **MSG-I-20** | No cuentas con eventos registrados. |
| **MSG-I-21** | No hay eventos aprobados registrados en este momento. |
| **MSG-I-22** | La capacidad operativa del laboratorio ha disminuido. Existen eventos aprobados que requieren revisión. |
| **MSG-I-23** | No se encontraron registros que coincidan con los filtros seleccionados. |

---

## 6. Catálogo de Mensajes de Pantalla / Confirmación (`MSG-P-01` – `MSG-P-07`)

| Número de mensaje | Mensaje Detallado |
| :--- | :--- |
| **MSG-P-01** | ¿Desea confirmar la cancelación del evento seleccionado? |
| **MSG-P-02** | ¿Desea cerrar su sesión? |
| **MSG-P-03** | ¿Desea aprobar el evento? |
| **MSG-P-04** | ¿Desea rechazar el evento? |
| **MSG-P-05** | ¿Desea confirmar el cambio de estado de la cuenta seleccionada? |
| **MSG-P-06** | ¿Desea confirmar la actualización del recinto seleccionado? |
| **MSG-P-07** | ¿Desea confirmar el cambio de estado de verificación del usuario seleccionado? |
