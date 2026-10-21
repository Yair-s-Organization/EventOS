---
proyecto: "EventOS"
materia: "Análisis y Diseño de Sistemas"
equipo: "Sinergia Ágil"
grupo: "5CM3"
tags:
  - apunte
  - escuela
  - ads
  - eventos
  - requerimientos
  - reglas-de-negocio
---

# 📋 Requerimientos y Reglas de Negocio — EventOS

> [!NOTE] Contexto del Documento
> Este documento concentra los **28 Requerimientos Funcionales (`RF-01` a `RF-28`)**, **27 Requerimientos No Funcionales (`RNF-01` a `RNF-27`)** y **45 Reglas de Negocio (`RN-01` a `RN-45`)** oficiales de **EventOS** para la Escuela Superior de Cómputo (ESCOM - IPN), alineados con las especificaciones de uso definitivas (`CU01`–`CU37`).
> 
> 🔗 **Regresar al Hub:** [[00-Proyecto-EventOS]] | **Catálogos (`UI`, `MSG-E`, `MSG-I`, `MSG-P`):** [[02-Actores-y-Catalogos]] | **Casos de Uso:** [[00-Indice-Casos-de-Uso]]

---

## 1. Requerimientos Funcionales (`RF-01` a `RF-28`)

| Código | Descripción del Requerimiento Funcional |
| :--- | :--- |
| **RF-01** | El sistema permitirá a los usuarios Asistente y Subdirección de Servicios Educativos registrar una solicitud de evento (`CU-09`, `CU-20`), capturando nombre, descripción, justificación, alcance, póster opcional, modalidad de acceso con boleto, espacio deseado (Auditorio, Sala 14 o Laboratorios de cómputo) y uno o más bloques de fecha y horario (subeventos). |
| **RF-02** | El sistema permitirá al organizador modificar la fecha, horario y espacio de un evento según disponibilidad (`CU-26`). |
| **RF-03** | El sistema permitirá al organizador y a Subdirección cancelar un evento registrando un motivo obligatorio (`CU-07`, `CU-30`). |
| **RF-04** | El sistema permitirá al asistente reservar un lugar en las actividades disponibles (`CU-14`, `CU-15`). |
| **RF-05** | El sistema generará un boleto digital con código QR que pueda usar el asistente (`CU-16`, `CU-19`). |
| **RF-06** | El sistema permitirá al personal de logística escanear el código QR del boleto para validar su autenticidad y registrar el acceso de forma unificada, omitiendo acreditaciones de sub-roles especiales (`CU-24`). |
| **RF-07** | El sistema permitirá al Organizador y a Subdirección registrar y asignar directamente a los usuarios como Personal de Logística de los eventos bajo su responsabilidad (`CU-10`, `CU-32`), con un límite estricto de hasta 10 integrantes por evento, sin requerir formularios de postulación. Los permisos otorgados serán exclusivos para el evento correspondiente. |
| **RF-08** | El sistema permitirá a Subdirección y al Organizador capturar la información del ponente (o ponentes) como parte de los detalles de un evento aprobado (`CU-08`). |
| **RF-09** | El sistema permitirá a Subdirección de Servicios Educativos aprobar o rechazar la organización de un evento a través de un panel de evaluación (`CU-04`, `CU-05`). Al registrarse una solicitud, el solicitante recibe privilegios de Organizador exclusivamente para ese evento (`RN-02`). |
| **RF-10** | El sistema permitirá a Subdirección de Servicios Educativos evaluar la disponibilidad de los espacios físicos por medio del panel de autorización (`UI11`, `UI12`). |
| **RF-11** | El sistema permitirá al asistente cancelar su reserva de lugar o confirmación de asistencia a un evento (`CU-18`). |
| **RF-12** | El sistema diferenciará entre usuarios internos y usuarios externos, asignando roles base distintos según el dominio de su correo electrónico (`CU-01`, `CU-11`). |
| **RF-13** | El sistema requerirá de manera obligatoria que el usuario seleccione el tipo de alcance del evento (Público, Interno o Privado / Oculto) durante su configuración (`CU-09`, `CU-20`, `CU-28`). |
| **RF-14** | El sistema permitirá al organizador subir documentación de apoyo y póster asociados a su actividad (`UI07`). |
| **RF-15** | El sistema permitirá al organizador solicitar la cantidad de equipos de cómputo funcionales requeridos en laboratorios (`CU-29`). |
| **RF-16** | El sistema requerirá registrar el nombre y correo (institucional o externo) de un destinatario con cuenta activa para la emisión de un boleto directo por parte del Organizador (`CU-31`). |
| **RF-17** | El sistema emitirá los boletos digitales directos asociándolos a la cuenta activa del destinatario para que pueda consultarlos con su código QR directamente desde la aplicación, sin envío de correo electrónico (`CU-31`). |
| **RF-18** | El sistema permitirá al asistente consultar el listado de eventos disponibles en la cartelera, filtrando por fecha, espacio, categoría o ponente (`CU-13`). |
| **RF-19** | El sistema permitirá a los organizadores asignar etiquetas temáticas y áreas de conocimiento a los eventos durante su creación o edición (`CU-21`, `CU-28`). |
| **RF-20** | El sistema solicitará permisos y accederá a la cámara del dispositivo del personal de logística desde el navegador web para capturar y decodificar códigos QR, eliminando la necesidad de aplicaciones externas (`CU-24`). |
| **RF-21** | El sistema permitirá al administrador consultar y modificar el estado operativo (`Activo`, `Mantenimiento`, `Inactivo`) y el aforo máximo de los espacios físicos registrados de la escuela (Auditorio, Sala 14, Laboratorios) sin crear ni eliminar físicamente recintos de la base de datos (`CU-34`). |
| **RF-22** | El sistema permitirá al administrador gestionar el inventario específico de los laboratorios, cambiando el estatus de equipos de cómputo específicos entre `Activo`, `Inactivo` y `Mantenimiento` (`CU-35`). |
| **RF-23** | El sistema permitirá al administrador visualizar el listado general de cuentas registradas, cambiar el estatus (`Activo` / `Inactivo`) de cualquier cuenta de usuario (`CU-33`) y gestionar el estado de verificación (`Verificado` / `No verificado`) de usuarios Alumno, Profesor o Empresa (`CU-37`). |
| **RF-24** | El sistema permitirá al administrador crear cuentas de forma manual (`CU-11`) y asignarles únicamente el rol de `Subdirección de Servicios Educativos` o `Asistente`, garantizando siempre la existencia de al menos una cuenta de administrador activa. |
| **RF-25** | El sistema permitirá al administrador consultar una bitácora histórica detallada de todos los eventos y acciones realizadas en el sistema (`CU-36`). |
| **RF-26** | El sistema permitirá al administrador generar y exportar la bitácora de actividad histórica del sistema en formato PDF (`.pdf`) para propósitos de auditoría institucional (`CU-36`). |
| **RF-27** | El sistema permitirá al Organizador consultar un listado de usuarios registrados con cuentas activas, mostrando su nombre y ocupación, para seleccionar a aquellos que desea incorporar como Personal de Logística de su evento (`CU-32`). |
| **RF-28** | El sistema permitirá al Organizador visualizar los usuarios asignados como Personal de Logística de cada uno de sus eventos, mostrando la cantidad de integrantes registrados y actualizando dicha información después de cada asignación (`CU-10`, `CU-32`). |

---

## 2. Requerimientos No Funcionales (`RNF-01` a `RNF-27`)

| Código | Categoría / Descripción del Requerimiento No Funcional |
| :--- | :--- |
| **RNF-01** | Seguridad: El sistema deberá proteger la información de usuario, eventos y reservas mediante autenticación y control de acceso, de forma que cada usuario únicamente pueda realizar las acciones correspondientes a su rol. |
| **RNF-02** | Concurrencias: El sistema deberá garantizar que dos usuarios de tipo asistente no puedan reservar el mismo lugar, boleto o equipo de cómputo al mismo tiempo, incluso ante solicitudes simultáneas. |
| **RNF-03** | Disponibilidad: La plataforma deberá estar disponible de forma continua para la solicitud de eventos, reservas y demás operaciones del sistema, minimizando caídas del servicio. |
| **RNF-04** | Usabilidad: La interfaz deberá de ser sencilla e intuitiva tanto para usuarios internos como externos, sin requerir conocimientos técnicos para solicitar, reservar o validar un evento. |
| **RNF-05** | Escalabilidad: El sistema deberá poder soportar el crecimiento en número de eventos, usuarios y espacios gestionados. De igual forma mantendrá su velocidad de respuesta a pesar del incremento de usuarios. |
| **RNF-06** | Mantenibilidad: El código deberá estar organizado de forma modular para facilitar futuras modificaciones o la incorporación de nuevas funcionalidades sin afectar el resto del sistema. |
| **RNF-07** | (Control de Aforo): El sistema permitirá una emisión total de boletos (registrados por asistentes más boletos directos) respetando el aforo configurado del recinto. |
| **RNF-08** | Compatibilidad: El sistema debe de funcionar correctamente en los siguientes navegadores: Chrome, Firefox, Edge y Brave. |
| **RNF-09** | Gestión de sesiones: El sistema deberá invalidar el token de sesión y cerrar la sesión de cualquier usuario tras 30 minutos de inactividad, exigiendo un nuevo inicio de sesión para realizar reservas o solicitudes. |
| **RNF-10** | Localización y Estándares: El sistema deberá renderizar todas las agendas, formularios y boletos utilizando el formato de 24 horas y la zona horaria de la Ciudad de México (CST/UTC-6). |
| **RNF-11** | Usabilidad: El sistema deberá requerir un paso de confirmación explícito (`MSG-P-01` a `MSG-P-07`) antes de realizar acciones críticas o irreversibles, como la cancelación de un evento. Para la cancelación de eventos, el actor deberá ingresar obligatoriamente un motivo que será notificado a los asistentes registrados. |
| **RNF-12** | Fiabilidad: El sistema deberá realizar copias de seguridad automáticas de la base de datos diariamente, con un tiempo de recuperación objetivo (RTO) inferior a 2 horas. |
| **RNF-13** | Seguridad: El sistema deberá inhabilitar los códigos QR una vez fueron escaneados (`Ingresado`) para evitar accesos duplicados (`MSG-E-23`). |
| **RNF-14** | Fiabilidad: El sistema deberá verificar la existencia del archivo PDF generado en el almacenamiento antes de habilitar el botón de descarga al usuario (`CU-36`). |
| **RNF-15** | Integridad de los Datos: Todo código QR generado para los boletos deberá contener un `TokenQr` único y encriptado validado mediante firma criptográfica, para impedir que el usuario altere los datos de la imagen o falsifique su entrada (`CU-16`). |
| **RNF-16** | Gestión de Errores y Excepciones: El sistema deberá implementar validaciones en tiempo real en todas las pantallas y formularios para mostrar mensajes al usuario en caso de datos inválidos (`MSG-E-01` a `MSG-E-49`). |
| **RNF-17** | Notificaciones Internas: El envío de notificaciones dentro del apartado de notificaciones de la aplicación (cancelación, reprogramación o inhabilitación por mantenimiento) deberá ser confiable e inmediato (`CU-07`, `CU-26`, `CU-30`, `CU-34`). |
| **RNF-18** | Protección contra abuso y automatización: El sistema deberá limitar la frecuencia de solicitudes por usuario y por dirección IP, y aplicar mecanismos anti-bots (por ejemplo, CAPTCHA) en el inicio de sesión (`CU-01`), para evitar el acaparamiento de cupos y ataques de fuerza bruta. |
| **RNF-19** | Portabilidad y despliegue: El sistema deberá poder desplegarse y replicarse en distintos entornos (desarrollo, pruebas y producción) de forma reproducible, mediante contenedores o scripts de despliegue, y separar la configuración sensible (claves, credenciales y cadenas de conexión) del código fuente. |
| **RNF-20** | Tolerancia a fallos en el control de acceso: El sistema deberá mantener la operación del ingreso al evento ante conectividad inestable, permitiendo reintentar la validación de QR y mostrando al personal de logística un mensaje claro (`MSG-E-08`) cuando no sea posible conectarse al servidor, sin perder los registros de check-in ya realizados (`CU-24`). |
| **RNF-21** | Seguridad: El sistema utilizará el protocolo TLS 1.3 en toda comunicación cliente-servidor. |
| **RNF-22** | Control de Acceso y Autorización (Administrador): El acceso a los módulos de gestión de usuarios, verificación, espacios e inventario debe estar restringido exclusivamente a las sesiones autenticadas que posean el rol de "Administrador". El sistema validará este privilegio en cada petición al servidor (por ejemplo, mediante tokens JWT). |
| **RNF-23** | Integridad de los Datos (Administrador): Cuando el Administrador desactive una cuenta de usuario, un espacio físico o un equipo de cómputo del inventario, el sistema deberá aplicar un borrado lógico (`soft delete`, cambiando el estado a `Inactivo`) en la base de datos en lugar de una eliminación física. |
| **RNF-24** | Exportación de registro de eventos (Administrador): El sistema debe permitir al Administrador exportar la bitácora histórica del sistema en formato PDF (`.pdf`) para su uso en reportes institucionales o auditorías de ESCOM (`CU-36`), completando la generación y descarga en un tiempo no mayor a 5 segundos. |
| **RNF-25** | Seguridad (Autenticación): Por seguridad contra ataques de fuerza bruta, el sistema debe bloquear automáticamente el acceso a la cuenta durante 30 minutos tras registrar 5 intentos fallidos consecutivos de inicio de sesión (`CU-01`), y exigir contraseñas con estándar de complejidad alto para el Administrador (mínimo 12 caracteres, incluyendo mayúsculas, números y símbolos). |
| **RNF-26** | Trazabilidad: El sistema deberá registrar en la bitácora histórica quién realizó cada acción crítica (cancelación de evento, cambio de estado o cambio de verificación de usuario), junto con la fecha, hora y justificación correspondiente. |
| **RNF-27** | Usabilidad: El sistema deberá requerir una confirmación explícita (`MSG-P-01`, `MSG-P-05`, `MSG-P-06`, `MSG-P-07`) antes de ejecutar cambios de estado sobre un evento, cuenta de usuario, estado de verificación o recinto físico. |

---

## 3. Reglas de Negocio (`RN-01` a `RN-45`)

> [!WARNING] Cumplimiento Estricto en Backend, Frontend y Pruebas
> Todas las validaciones de dominio, endpoints de NestJS, estados de base de datos en PostgreSQL y formularios de React deben respetar estas 45 reglas de negocio.

- **RN-01 — Clasificación de Dominio:** Cualquier registro que utilice los dominios `@alumno.ipn.mx` o `@ipn.mx` será catalogado automáticamente como "Usuario Interno". Cualquier otro dominio será clasificado como "Usuario Externo".
- **RN-02 — Asignación de Rol Organizador:** Todo usuario que registre exitosamente una solicitud de evento asumirá automáticamente los privilegios de "Organizador" de manera exclusiva para dicho evento.
- **RN-03 — Gestión de recursos físicos:** Si el espacio seleccionado de un evento es auditorio o laboratorio, el organizador deberá de seleccionar una de las tres siguientes modalidades de asignación de cupos:
  - a) El asistente selecciona un asiento o equipo específico.
  - b) El sistema asigna automáticamente un lugar disponible.
  - c) El sistema únicamente valida disponibilidad de cupos, sin una asignación específica.
- **RN-04 — Disponibilidad de cupos:** Si el espacio seleccionado de un evento es la Sala 14, no habrá una asignación de cupos específica, el sistema únicamente validará disponibilidad de cupos.
- **RN-05 — Emisión de Boletos Directos:** Los boletos directos emitidos por el Organizador en `CU-31` requieren que el destinatario disponga de una cuenta activa en la plataforma (`MSG-E-49`); la excepción para invitados sin cuenta corresponde únicamente a Subdirección de Servicios Educativos y no aplica a eventos con alcance Privado/Oculto (`RN-29`).
- **RN-06 — Bloqueo de Colisiones:** El sistema impedirá registrar una solicitud de evento (o cualquiera de sus bloques horarios/subeventos) que se traslape en fecha, hora de inicio y hora de fin con otro evento en el mismo espacio físico, ya sea que dicho evento se encuentre aprobado o pendiente de revisión, o entre los propios bloques del mismo evento (`MSG-E-47`).
- **RN-07 — Control de Aforo:** El total de boletos registrados por asistentes más el total de boletos directos emitidos no podrán superar el aforo autorizado para el espacio físico seleccionado.
- **RN-08 — Unicidad de Reserva:** Un usuario solo puede poseer un (1) boleto activo por evento. No se permiten reservas ni boletos directos duplicados para el mismo destinatario y evento (`MSG-E-20`, `MSG-E-48`).
- **RN-09 — Eventos gratuitos:** Todos los eventos gestionados en la plataforma deben ser estrictamente gratuitos. Queda prohibido el uso de pasarelas de pago en ninguna circunstancia.
- **RN-10 — Protección de Sobrecupo:** En situaciones de alta concurrencia, la base de datos debe procesar las reservas de manera atómica. Si se acaban los cupos en el milisegundo en que un usuario hace clic en "Reservar", la transacción debe fallar y denegar el boleto.
- **RN-11 — Unicidad del Código QR:** Todo código QR generado funcionará como un token de un solo uso para entrada. Al ser escaneado exitosamente por logística, el estado del boleto pasará a "Ingresado" (`MSG-I-19`). Cualquier intento de escaneo posterior del mismo código arrojará alerta de código ya validado (`MSG-E-23`).
- **RN-12 — Segmentación de Visibilidad:** Los eventos marcados con alcance "Interno" no podrán ser consultados a través del motor de búsqueda ni por la API pública si la petición proviene de una sesión inactiva o de un perfil clasificado como externo.
- **RN-13 — Aprobación automática directiva:** Las solicitudes de eventos creadas por perfiles con rol de "Subdirección de Servicios Educativos" se aprueban automáticamente (`CU-09`), omitiendo el flujo de revisión y espera estándar.
- **RN-14 — Filtro de Beneficio Politécnico:** Toda solicitud de evento debe incluir un campo de justificación obligatorio que describa el fin o beneficio directo para la comunidad ESCOM/IPN.
- **RN-15 — Autoridad de Aprobación Central:** El cambio de estado de una solicitud pendiente a "Aprobada" recae exclusivamente en los perfiles asignados a la Subdirección de Servicios Educativos (`CU-05`), quienes toman la decisión basados en la agenda de disponibilidad.
- **RN-16 — Reserva por utilización de recurso:** Dependiendo del tipo de recinto y modalidad, el sistema no solo descontará un "cupo general", sino que exigirá la asignación de un recurso físico específico (ej. seleccionar una butaca exacta en el auditorio o apartar un equipo específico en un laboratorio).
- **RN-17 — Justificación de Impacto Académico:** Toda solicitud de reserva de un laboratorio se aprueba a través de una justificación de impacto evaluada por Subdirección de Servicios Educativos, dictaminando si el evento amerita la suspensión de clases regulares en esos espacios o no.
- **RN-18 — Límites de Hardware:** A diferencia del auditorio (regido por aforo de protección civil), la capacidad máxima de un evento en un laboratorio estará estrictamente limitada por la cantidad de equipos de cómputo funcionales registrados en ese momento.
- **RN-19 — Eventos extraordinarios:** Un evento extraordinario se define como una actividad de máxima prioridad que requiere exclusividad sobre el uso de un espacio físico, prohibiendo el desarrollo de cualquier otra actividad académica o administrativa en dicho espacio durante su periodo de ejecución.
- **RN-20 — Gestión de Fechas Bloqueadas:** Todo intento de reserva será estrictamente invalidado si la fecha solicitada ya ha sido ocupada por un evento extraordinario.
- **RN-21 — Exclusividad de Roles en Tiempo Real:** Una misma cuenta de usuario no podrá desempeñar simultáneamente las funciones de Asistente y Personal de Logística en un mismo evento (`MSG-E-12`). Si el usuario seleccionado cuenta con una reserva activa como Asistente, el sistema impedirá su asignación como Personal de Logística hasta que dicha reserva sea cancelada.
- **RN-22 — Cancelación del evento:** La cancelación sobre una reserva previamente aprobada restituye en su totalidad la disponibilidad operativa del espacio físico, anulando cualquier derecho de exclusividad sobre la fecha y hora asignada, así como cualquier boleto expedido (`CU-07`, `CU-30`).
- **RN-23 — Reprogramación del evento:** La posposición de una reserva previamente aprobada involucra la actualización de la fecha y/o hora de la reserva del espacio físico, siempre y cuando la nueva fecha sea al menos una semana posterior a la fecha en que se realiza la modificación (`CU-26`).
- **RN-24 — Notificación de posposición y cancelación:** Toda cancelación o posposición sobre una reserva previamente aprobada es notificada a los asistentes registrados mediante el apartado de notificaciones de la aplicación (`CU-07`, `CU-26`, `CU-30`).
- **RN-25 — Motivo de cancelación de evento:** Toda cancelación o posposición sobre una reserva previamente aprobada estrictamente lleva un motivo obligatorio por parte del actor responsable (`CU-07`, `CU-26`, `CU-30`).
- **RN-26 — Cierre del registro:** Toda reserva a un lugar emitida por el asistente será invalidada si se ha alcanzado la fecha y hora de cierre de registro establecida previamente (`MSG-E-25`).
- **RN-27 — Alcance Público:** Un evento con alcance público deberá ser visible en la cartelera general y estará abierto al registro de usuarios externos.
- **RN-28 — Alcance Interno:** Un evento con alcance Interno será visible y permitirá el registro única y exclusivamente a usuarios autenticados que cuenten con dominio institucional.
- **RN-29 — Alcance Privado u Oculto:** Un evento con alcance Privado/Oculto no aparecerá en las búsquedas generales del sistema. El registro a este tipo de eventos requerirá indispensablemente el uso de un enlace directo o un código de invitación (`CU-28`).
- **RN-30 — Datos obligatorios de ponencia:** Toda información capturada sobre un ponente dentro de un evento (`CU-08`) debe incluir obligatoriamente: nombre completo, correo electrónico, trayectoria académica/profesional y al menos un enlace de contacto.
- **RN-31 — Revocación de Aprobación por Modificación:** Un Organizador podrá modificar la fecha, el horario o el espacio físico de un evento con estado "Aprobado" si el cambio se realiza con al menos siete días naturales de anticipación y el nuevo espacio cuenta con disponibilidad (`CU-26`). Si el nuevo bloque horario difiere de la duración original aprobada, el evento cambia a estado "Pendiente" para revisión de Subdirección (`MSG-I-09`).
- **RN-32 — Protección de Registros Históricos:** Toda acción de desactivación ejecutada por el Administrador sobre cuentas de usuario, espacios físicos o equipos de cómputo aplicará obligatoriamente un borrado lógico (cambio de estado a `Inactivo`), prohibiendo la eliminación física en la base de datos para garantizar la integridad de la bitácora histórica y auditorías (`CU-33`, `CU-34`, `CU-35`).
- **RN-33 — Inmutabilidad de la Bitácora:** Aunque el Administrador posee privilegios de nivel superior sobre la gestión del sistema, su acceso a la bitácora histórica de eventos y registros de actividad será estrictamente de consulta y exportación en PDF (`CU-36`). El sistema impedirá cualquier intento de edición, alteración o eliminación de los registros contenidos en la bitácora.
- **RN-34 — Bloqueo Preventivo por Mantenimiento:** Al momento en que el Administrador edite el estado de un espacio físico (Auditorio, Sala 14 o Laboratorios) o de un equipo específico en el inventario a "Mantenimiento" o "Inactivo", el sistema inhabilitará inmediatamente dicho recurso para nuevas solicitudes de reservas (`CU-34`, `CU-35`).
- **RN-35 — Prevención de Bloqueo del Sistema:** Una cuenta activa con el rol de Administrador no podrá eliminarse a sí misma ni degradar sus propios privilegios. El sistema exigirá que siempre exista, como mínimo, una cuenta con privilegios de Administrador activa.
- **RN-36 — Exclusividad en Gestión de Catálogos:** La actualización de estado operativo y aforo de los espacios físicos y la gestión del estado del inventario de hardware en laboratorios son acciones exclusivas del perfil Administrador (`CU-34`, `CU-35`), y sus cambios se verán reflejados en tiempo real en los formularios de solicitud de eventos.
- **RN-37 — Inhabilitación Automática de Reservas por Mantenimiento:** Si el administrador cambia el estado de un espacio físico a "Mantenimiento" o "Inactivo", el sistema cancelará las reservas ya aprobadas que coincidan con el periodo de deshabilitación y notificará dentro de la aplicación a los asistentes y organizadores (`CU-34`).
- **RN-38 — Inhabilitación preventiva por falta de equipamiento:** Si el administrador retira la totalidad de los equipos funcionales de un laboratorio, el sistema cambiará el estado de dicho espacio a "Inactivo" por falta de equipos, impidiendo nuevas solicitudes hasta que se habiliten equipos.
- **RN-39 — Ajuste de Capacidad de Equipos en Reservas:** Si el administrador reduce la cantidad de equipos funcionales en un laboratorio (`CU-35`), el sistema verificará si existen eventos aprobados afectados y mostrará la advertencia `MSG-I-22` sin cancelar automáticamente los eventos previamente aprobados.
- **RN-40 — Respeto a Registros Previos ante Cambio de Alcance:** El organizador podrá modificar el alcance del evento (`CU-28`). En caso de que existan registros de asistencia previos a la modificación, estos deberán de respetarse.
- **RN-41 — Asignación directa de Personal de Logística:** La incorporación de usuarios como Personal de Logística será realizada directamente por Subdirección o el Organizador responsable del evento (`CU-10`, `CU-32`), con un límite máximo de 10 usuarios por evento.
- **RN-42 — Restricciones para la asignación de logística:** Únicamente Subdirección o el Organizador responsable de un evento podrá asignar usuarios como Personal de Logística de este, y solo cuando el evento se encuentre en estado "Aprobado" o "Activo" (`MSG-E-40`).
- **RN-43 — Validación de usuarios asignados:** La asignación de Personal de Logística utiliza una cuenta registrada y activa en la plataforma, sin duplicar asignaciones al mismo evento (`MSG-E-39`).
- **RN-44 — Alcance de los permisos de logística:** Los permisos de Personal de Logística serán exclusivos del evento para el cual fueron asignados (`MSG-E-41`) y dejarán de estar vigentes cuando el evento finalice o sea cancelado.
- **RN-45 — Asignación opcional de Logística:** El sistema permitirá al Organizador decidir si requiere o no registrar Personal de Logística para su evento.
