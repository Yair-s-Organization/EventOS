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
> Este documento concentra los **28 Requerimientos Funcionales (`RF-01` a `RF-28`)**, **27 Requerimientos No Funcionales (`RNF-01` a `RNF-27`)** y **45 Reglas de Negocio (`RN-01` a `RN-45`)** oficiales de **EventOS** para la Escuela Superior de Cómputo (ESCOM - IPN).
> 
> 🔗 **Regresar al Hub:** [[00-Proyecto-EventOS]] | **Materia:** [[00-Análisis y Diseño de Sistemas]]

---

## 1. Requerimientos Funcionales (`RF-01` a `RF-28`)

| Código | Descripción del Requerimiento Funcional |
| :--- | :--- |
| **RF-01** | El sistema permitirá a los usuarios asistente y Subdirección de Servicios Educativos registrar una solicitud de evento, capturando información como el nombre del evento, descripción, fecha, horario y espacio deseado (auditorio, sala 14 o laboratorios de cómputo). |
| **RF-02** | El sistema permitirá al organizador modificar la fecha, horario y espacio de un evento según disponibilidad. |
| **RF-03** | El sistema permitirá al organizador cancelar un evento. |
| **RF-04** | El sistema permitirá al asistente reservar un lugar en las actividades disponibles. |
| **RF-05** | El sistema generará un boleto digital con código QR que pueda usar el asistente. |
| **RF-06** | El sistema permitirá al personal de logística escanear el código QR del boleto para validar su autenticidad y registrar el acceso de forma unificada, omitiendo acreditaciones de sub-roles especiales. |
| **RF-07** | El sistema permitirá al Organizador asignar directamente a los usuarios como Personal de Logística de los eventos bajo su responsabilidad, con un límite estricto de hasta 10 integrantes por evento, sin requerir formularios de postulación. Los permisos otorgados serán exclusivos para el evento correspondiente. |
| **RF-08** | El sistema permitirá al organizador capturar la información del ponente (o ponentes) como parte de los detalles del evento. |
| **RF-09** | El sistema permitirá a Subdirección de Servicios Educativos aprobar o rechazar la organización de un evento a través de un panel de autorización. Al aprobarse, el sistema cambiará el rol de Asistente a Organizador exclusivamente para ese evento. |
| **RF-10** | El sistema permitirá a Subdirección de Servicios Educativos solicitar cambios en la reserva de los espacios físicos por medio de un panel de autorización. |
| **RF-11** | El sistema permitirá al asistente cancelar su reserva de lugar o confirmación de asistencia a un evento. |
| **RF-12** | El sistema diferenciará entre usuarios internos y usuarios externos, asignando roles base distintos según el método de ingreso. |
| **RF-13** | El sistema requerirá de manera obligatoria que el usuario seleccione el tipo de alcance del evento (Público, Interno o Privado / Oculto) durante su configuración. |
| **RF-14** | El sistema permitirá al organizador subir documentación de apoyo (presentaciones, enlaces a repositorios, archivos PDF) asociada a su actividad o resumen. |
| **RF-15** | El sistema permitirá al organizador solicitar la disponibilidad de los equipos funcionales en laboratorios. |
| **RF-16** | El sistema requerirá registrar el nombre y correo (institucional o externo) del asistente para la emisión de un boleto directo para el envío del QR correspondiente. |
| **RF-17** | El sistema emitirá los boletos digitales asociándolos al nombre y correo del asistente para realizar el envío del código QR correspondiente. |
| **RF-18** | El sistema permitirá al asistente consultar el listado de eventos disponibles, filtrando por fecha, espacio, categoría o ponente. |
| **RF-19** | El sistema permitirá a los organizadores asignar etiquetas temáticas y áreas de conocimiento a los eventos durante su creación o edición. |
| **RF-20** | El sistema solicitará permisos y accederá a la cámara del dispositivo del personal de logística desde el navegador web para capturar y decodificar códigos QR, eliminando la necesidad de aplicaciones externas. |
| **RF-21** | El sistema permitirá al administrador crear, editar o dar de baja de forma intuitiva los espacios físicos disponibles en la escuela (Auditorio, Sala 14, Laboratorios) para mantener actualizado el catálogo general. |
| **RF-22** | El sistema permitirá al administrador gestionar el inventario específico de los laboratorios, cambiando el estatus de equipos de cómputo específicos. |
| **RF-23** | El sistema permitirá al administrador visualizar el listado general de cuentas registradas y cambiar el nivel de privilegios o el estatus (activo/inactivo) de cualquier usuario de la plataforma. |
| **RF-24** | El sistema permitirá al administrador crear cuentas de forma manual y asignarles el rol correspondiente (Subdirección de Servicios Educativos o Asistente), garantizando siempre la existencia de al menos una cuenta de administrador activa. |
| **RF-25** | El sistema permitirá al administrador consultar una bitácora histórica detallada de todos los eventos realizados y cancelados en el sistema. |
| **RF-26** | El sistema permitirá al administrador generar y exportar la bitácora de actividad histórica del sistema en formato PDF para propósitos de auditoría institucional. |
| **RF-27** | El sistema permitirá al Organizador consultar un listado de usuarios registrados con cuentas activas, mostrando su nombre y ocupación, para seleccionar a aquellos que desea incorporar como Personal de Logística de su evento. |
| **RF-28** | El sistema permitirá al Organizador visualizar los usuarios asignados como Personal de Logística de cada uno de sus eventos, mostrando la cantidad de integrantes registrados y actualizando dicha información después de cada asignación. |

---

## 2. Requerimientos No Funcionales (`RNF-01` a `RNF-27`)

| Código | Categoría / Descripción del Requerimiento No Funcional |
| :--- | :--- |
| **RNF-01** | Seguridad: El sistema deberá proteger la información de usuario, eventos y reservas mediante autenticación y control de acceso, de forma que cada usuario únicamente pueda realizar las acciones correspondientes a su rol. |
| **RNF-02** | Concurrencias: El sistema deberá garantizar que dos usuarios de tipo asistente no puedan reservar el mismo lugar, boleto o equipo de cómputo al mismo tiempo, incluso antes de las solicitudes simultaneas. |
| **RNF-03** | Disponibilidad: La plataforma deberá estar disponible de forma continua para la solicitud de eventos, reservas y demás operaciones del sistema, minimizando caídas del servicio. |
| **RNF-04** | Usabilidad: La interfaz deberá de ser sencilla e intuitiva tanto para usuarios internos como externos, sin requerir conocimientos técnicos para solicitar, reservar o validar un evento. |
| **RNF-05** | Escalabilidad: El sistema deberá poder soportar el crecimiento en número de eventos, usuarios y espacios gestionados. De igual forma mantendrá su velocidad de respuesta a pesar del incremento de usuarios. |
| **RNF-06** | Mantenibilidad: El código deberá estar organizado de forma modular para facilitar futuras modificaciones o la incorporación de nuevas funcionalidades sin afectar el resto del sistema. |
| **RNF-07** | (Control de Aforo): El sistema permitirá una emisión total de boletos (registrados por asistentes más cortesías del organizador) de hasta un 120% respecto al aforo oficial definido por protección civil, utilizando este 20% de holgura para compensar el índice de inasistencias. |
| **RNF-08** | Compatibilidad: El sistema debe de funcionar correctamente en los siguientes navegadores; Chrome, Firefox, Edge y Brave. |
| **RNF-09** | Gestión de sesiones: El sistema deberá invalidar el token de sesión y cerrar la sesión de cualquier usuario tras 30 minutos de inactividad, exigiendo un nuevo inicio de sesión para realizar reservas o solicitudes. |
| **RNF-10** | Localización y Estándares: El sistema deberá renderizar todas las agendas, formularios y boletos utilizando el formato de 24 horas y la zona horaria de la Ciudad de México (CST/UTC-6). |
| **RNF-11** | Usabilidad: El sistema deberá requerir un paso de confirmación explícito antes de realizar acciones irreversibles, como la cancelación de un evento. Para la cancelación de eventos, el organizador deberá ingresar obligatoriamente un motivo que será notificado a los asistentes registrados. |
| **RNF-12** | Fiabilidad: El sistema deberá realizar copias de seguridad automáticas de la base de datos diariamente, con un tiempo de recuperación objetivo (RTO) inferior a 2 horas. |
| **RNF-13** | Seguridad: El sistema deberá inhabilitar los códigos QR una vez fueron escaneados para evitar accesos duplicados. |
| **RNF-14** | Fiabilidad: El sistema deberá verificar la existencia del archivo PDF generado en el almacenamiento antes de habilitar el botón de descarga al usuario. |
| **RNF-15** | Integridad de los Datos: Todo código QR generado para los boletos deberá contener información validada mediante un hasheo criptográfico, para impedir que el usuario altere los datos de la imagen o falsifique su entrada. |
| **RNF-16** | Gestión de Errores y Excepciones: El sistema deberá implementar validaciones en tiempo real en todas las pantallas y formularios para mostrar mensajes al usuario en caso de datos inválidos. |
| **RNF-17** | Notificaciones: El envío de notificaciones por correo electrónico (cancelación o cambio de horario de un evento, asignación de lugar desde lista de espera) deberá ser confiable y oportuno. |
| **RNF-18** | Protección contra abuso y automatización: El sistema deberá limitar la frecuencia de solicitudes por usuario y por dirección IP, y aplicar mecanismos anti-bots (por ejemplo, CAPTCHA) en el registro, el inicio de sesión y la reserva de lugares, para evitar el acaparamiento de cupos y ataques de fuerza bruta. |
| **RNF-19** | Portabilidad y despliegue: El sistema deberá poder desplegarse y replicarse en distintos entornos (desarrollo, pruebas y producción) de forma reproducible, mediante contenedores o scripts de despliegue, y separar la configuración sensible (claves, credenciales y cadenas de conexión) del código fuente. |
| **RNF-20** | Tolerancia a fallos en el control de acceso: El sistema deberá mantener la operación del ingreso al evento ante conectividad inestable, permitiendo reintentar la validación de QR y mostrando al personal de logística un mensaje claro cuando no sea posible conectarse al servidor, sin perder los registros de check-in ya realizados. |
| **RNF-21** | Seguridad: El sistema utilizará el protocolo TLS1.3 en toda comunicación cliente-servidor. |
| **RNF-22** | Control de Acceso y Autorización (Administrador) El acceso a los módulos de eliminación de usuarios debe estar restringido exclusivamente a las sesiones autenticadas que posean el rol de "Administrador". El sistema validará este privilegio en cada petición al servidor (por ejemplo, mediante tokens JWT) para evitar que peticiones no autorizadas alteren la infraestructura. |
| **RNF-23** | Integridad de los Datos (Administrador): Cuando el Administrador ejecute la acción de "eliminar" sobre un usuario, un evento o un equipo de cómputo del inventario, el sistema deberá aplicar un borrado lógico (soft delete) en la base de datos (cambiando el estado del registro a inactivo) en lugar de una eliminación física. |
| **RNF-24** | Exportación de registro de eventos (Administrador): El sistema debe permitir al Administrador exportar la bitácora de eventos históricos y el inventario de equipos de cómputo de los laboratorios en formatos estándar y estructurados (como Excel) para su uso en reportes institucionales o auditorías externas de ESCOM, completando la descarga en un tiempo no mayor a 5 segundos. |
| **RNF-25** | Seguridad (administrador): Por el nivel crítico de sus privilegios, la cuenta del Administrador debe estar protegida contra ataques de fuerza bruta. El sistema debe bloquear automáticamente el acceso a la cuenta durante 30 minutos tras registrar 5 intentos fallidos consecutivos de inicio de sesión, y debe exigir contraseñas con un estándar de complejidad alto (mínimo 12 caracteres, incluyendo mayúsculas, números y símbolos). |
| **RNF-26** | Trazabilidad: El sistema deberá registrar en la bitácora quién realizó cada eliminación de evento, usuario o equipo, junto con la fecha y hora de la acción. |
| **RNF-27** | Usabilidad: El sistema deberá requerir una confirmación explícita antes de ejecutar la eliminación (lógica) de un evento, usuario o equipo, dado el impacto de esta acción. |

---

## 3. Reglas de Negocio (`RN-01` a `RN-45`)

> [!WARNING] Cumplimiento Estricto en Backend, Frontend y Pruebas
> Todas las validaciones de dominio, endpoints de NestJS, estados de base de datos en PostgreSQL y formularios de React deben respetar estas 45 reglas de negocio.

- **RN-01 — Clasificación de Dominio:** Cualquier registro que utilice los dominios @alumno.ipn.mx o @ipn.mx será catalogado automáticamente como "Usuario Interno". Cualquier otro dominio o inicio de sesión vía será clasificado como "Usuario Externo".
- **RN-02 — Asignación de Rol Organizador:** Todo usuario que registre exitosamente una solicitud de evento asumirá automáticamente los privilegios de "Organizador" de manera exclusiva para dicho evento.
- **RN-03 — Gestión de recursos físicos:** Si el espacio seleccionado de un evento es auditorio o laboratorio, el organizador deberá de seleccionar una de las tres siguientes modalidades de asignación de cupos.
  - a) El asistente selecciona un asiento o equipo específico.
  - b) El sistema asigna automáticamente un lugar disponible.
  - c) El sistema únicamente valida disponibilidad de cupos, sin una asignación específica.
- **RN-04 — Disponibilidad de cupos:** Si el espacio seleccionado de un evento es la Sala 14, no habrá una asignación de cupos específica, el sistema únicamente validará disponibilidad de cupos.
- **RN-05 — Bypass Administrativo:** Los boletos generados manualmente por Subdirección de Servicios Educativos (cortesías) ignoran las restricciones de dominio de usuario y no requieren que el invitado tenga una cuenta registrada en la plataforma. Esta excepción no aplica a eventos con alcance Privado/Oculto, los cuales solo permiten el acceso mediante enlace directo o código de invitación, conforme a RN-29.
- **RN-06 — Bloqueo de Colisiones:** El sistema impedirá registrar una solicitud de evento que se traslape en fecha, hora de inicio y hora de fin con otro evento en el mismo espacio físico, ya sea que dicho evento se encuentre aprobado o pendiente de revisión.
- **RN-07 — Control de Aforo:** El total de boletos registrados por asistentes más el total de boletos generados por Subdirección de Servicios Educativos (cortesías) no podrán superar el aforo definido por protección civil para el espacio físico seleccionado.
- **RN-08 — Unicidad de Reserva:** Un usuario solo puede poseer un (1) boleto activo por evento. No se permiten reservas múltiples.
- **RN-09 — Eventos gratuitos:** Todos los eventos gestionados en la plataforma deben ser estrictamente gratuitos. Queda prohibido el uso de pasarelas de pago en ninguna circunstancia.
- **RN-10 — Protección de Sobrecupo:** En situaciones de alta concurrencia, la base de datos debe procesar las reservas de manera atómica. Si se acaban los cupos en el milisegundo en que un usuario hace clic en "Reservar", la transacción debe fallar y denegar el boleto.
- **RN-11 — Unicidad del Código QR:** Todo código QR generado funcionará como un token de un solo uso para entrada. Al ser escaneado exitosamente por logística, el estado del boleto pasará a "Ingresado". Cualquier intento de escaneo posterior del mismo código arrojará una alerta visual y sonora de "Boleto Duplicado/Ya Utilizado".
- **RN-12 — Segmentación de Visibilidad:** Los eventos marcados con alcance "Interno" no podrán ser consultados a través del motor de búsqueda ni por la API pública si la petición proviene de una sesión inactiva o de un perfil clasificado como externo.
- **RN-13 — Aprobación automática directiva:** Las solicitudes de eventos creadas por perfiles con rol de “Subdirección de Servicios Educativos” se aprueban automáticamente, omitiendo el flujo de revisión y espera estándar.
- **RN-14 — Filtro de Beneficio Politécnico:** Toda solicitud de evento debe incluir un campo de justificación obligatorio que describa el fin o beneficio directo para la comunidad ESCOM/IPN.
- **RN-15 — Autoridad de Aprobación Central:** El cambio de estado de una solicitud a “Aprobada” recae exclusivamente en los perfiles asignados a la Subdirección de Servicios Educativos quienes toman la decisión basados en la agenda de disponibilidad.
- **RN-16 — Reserva por utilización de recurso:** Dependiendo del tipo de recinto, el sistema no solo descontará un “cupo general”, sino que exigirá la asignación de un recurso físico específico (ej. seleccionar una butaca exacta en el auditorio o apartar un equipo específico en un laboratorio).
- **RN-17 — Justificación de Impacto Académico:** Toda solicitud de reserva de un laboratorio se aprueba a través de una justificación de impacto evaluada por subdirección de servicios educativos, dictaminando si el evento amerita la suspensión de clases regulares en esos espacios o no.
- **RN-18 — Límites de Hardware:** A diferencia del auditorio (regido por aforo de protección civil), la capacidad máxima de un evento en un laboratorio estará estrictamente limitada por la cantidad de equipos de cómputo funcionales registrados en ese momento.
- **RN-19 — Eventos extraordinarios:** Un evento extraordinario se define como una actividad de máxima prioridad que requiere exclusividad sobre el uso de un espacio físico, prohibiendo el desarrollo de cualquier otra actividad académica o administrativa en dicho espacio durante su periodo de ejecución.
- **RN-20 — Gestión de Fechas Bloqueadas:** Todo intento de reserva será estrictamente invalidado si la fecha solicitada ya ha sido ocupada por un evento extraordinario.
- **RN-21 — Exclusividad de Roles en Tiempo Real:** Una misma cuenta de usuario no podrá desempeñar simultáneamente las funciones de Asistente y Personal de Logística en un mismo evento. Si el usuario seleccionado cuenta con una reserva activa como Asistente, el sistema impedirá su asignación como Personal de Logística hasta que dicha reserva sea cancelada.
- **RN-22 — Cancelación del evento:** La cancelación sobre una reserva previamente aprobada restituye en su totalidad la disponibilidad operativa del espacio físico, anulando cualquier derecho de exclusividad sobre la fecha y hora asignada, así como cualquier boleto expedido.
- **RN-23 — Reprogramación del evento:** La posposición de una reserva previamente aprobada involucra la actualización de la fecha y/o hora de la reserva del espacio físico, siempre y cuando la nueva fecha sea al menos una semana posterior a la fecha en que se realiza la modificación.
- **RN-24 — Notificación de posposición y cancelación:** Toda cancelación o posposición sobre una reserva previamente aprobada es notificada a los asistentes.
- **RN-25 — Motivo de cancelación de evento:** Toda cancelación o posposición sobre una reserva previamente aprobada estrictamente lleva un motivo por parte del organizador.
- **RN-26 — Cierre del registro:** Toda reserva a un lugar emitida por el asistente será invalidada si se ha alcanzado la fecha y hora de cierre de registro establecida previamente por subdirección o por el organizador del evento.
- **RN-27 — Alcance Público:** Un evento con alcance público deberá ser visible en la cartelera general y estará abierto al registro de usuarios externos.
- **RN-28 — Alcance Interno:** Un evento con alcance Interno será visible y permitirá el registro única y exclusivamente a usuarios autenticados que cuenten con dominio institucional.
- **RN-29 — Alcance Privado u Oculto:** Un evento con alcance Privado/Oculto no aparecerá en las búsquedas generales del sistema. El registro a este tipo de eventos requerirá indispensablemente el uso de un enlace directo o un código de invitación.
- **RN-30 — Datos obligatorios de ponencia:** Toda información capturada sobre un ponente dentro de un evento debe incluir obligatoriamente: fotografía, trayectoria académica/profesional y al menos un enlace de contacto, conformando así su perfil público de consulta.
- **RN-31 — Revocación de Aprobación por Modificación:** Un Organizador podrá modificar la fecha, el horario o el espacio físico de un evento con estado "Aprobado" única y exclusivamente si el sistema valida de forma simultánea que el cambio se realice con al menos siete días naturales de anticipación a la fecha original programada, y que el nuevo espacio solicitado (auditorio, Sala 14 o laboratorio) cuente con disponibilidad.
- **RN-32 — Protección de Registros Históricos:** Toda acción de desactivación o eliminación ejecutada por el Administrador sobre cuentas de usuario, espacios físicos o equipos de cómputo aplicará obligatoriamente un borrado lógico (cambio de estado a inactivo), prohibiendo la eliminación física en la base de datos para garantizar la integridad de la bitácora histórica y auditorías.
- **RN-33 — Inmutabilidad de la Bitácora:** Aunque el Administrador posee privilegios de nivel superior sobre la gestión del sistema, su acceso a la bitácora histórica de eventos y registros de actividad será estrictamente de consulta y exportación. El sistema impedirá cualquier intento de edición, alteración o eliminación de los registros contenidos en la bitácora.
- **RN-34 — Bloqueo Preventivo por Mantenimiento:** Al momento en que el Administrador edite el estado de un espacio físico (Auditorio, Sala 14 o Laboratorios) o de un equipo específico en el inventario a "Mantenimiento" o "Inactivo", el sistema inhabilitará inmediatamente dicho recurso para nuevas solicitudes de reservas, previniendo asignaciones en infraestructura no operativa.
- **RN-35 — Prevención de Bloqueo del Sistema:** Una cuenta activa con el rol de Administrador no podrá eliminarse a sí misma ni degradar sus propios privilegios. El sistema exigirá que siempre exista, como mínimo, una cuenta con privilegios de Administrador activa.
- **RN-36 — Exclusividad en Gestión de Catálogos:** La creación de nuevos recintos físicos, laboratorios o la incorporación de nuevo hardware al catálogo general de la escuela son acciones exclusivas del perfil Administrador, y sus cambios se verán reflejados en tiempo real en los formularios de solicitud de eventos para los Organizadores y la Subdirección.
- **RN-37 — Inhabilitación Automática de Reservas por Mantenimiento:** Sí el administrador cambia el estado de un espacio físico a “Mantenimiento” o ” Inactivo”, el sistema cancelará las reservas ya aprobadas que coincidan con el periodo de deshabilitación y notificará inmediatamente a los asistentes y organizadores para su reubicación y/o reprogramación.
- **RN-38 — Inhabilitación preventiva por falta de equipamiento:** Sí el administrador retira la totalidad de los equipos de un laboratorio, el sistema cambiará el estado de dicho espacio a “Inactivo” por falta de equipos, impidiendo nuevas solicitudes hasta que se ingresen nuevos equipos.
- **RN-39 — Ajuste de Capacidad de Equipos en Reservas:** Sí el administrador reduce la cantidad de equipos disponibles en un laboratorio, el sistema deberá revalidar las reservas para cada evento en ese laboratorio y sí las reservas exceden el nuevo límite de equipos se notificará al Organizador para ajustar el evento.
- **RN-40:** El organizador podrá modificar el alcance del evento. En caso de que existan registros de asistencia previos a la modificación, estos deberán de respetarse.
- **RN-41 — Asignación directa de Personal de Logística:** La incorporación de usuarios como Personal de Logística será realizada directamente por el Organizador responsable del evento. No será necesario que los usuarios completen formularios de postulación ni que exista una solicitud previa de asignación. Por lineamientos de control y seguridad, el equipo de logística para cualquier evento deberá estar conformado por un máximo de 10 usuarios. El sistema impedirá cualquier asignación que supere este límite máximo.
- **RN-42 — Restricciones para la asignación de logística:** Únicamente el Organizador responsable de un evento podrá asignar usuarios como Personal de Logística de este. La asignación solo podrá realizarse cuando el evento se encuentre en estado "Aprobado" o "Activo".
- **RN-43 — Validación de usuarios asignados:** Solo podrán ser asignados como Personal de Logística los usuarios que cuenten con una cuenta registrada y activa en la plataforma. Si el Organizador requiere asignar a una persona sin registro previo en el sistema, la plataforma generará una cuenta en estado "Pendiente" y creará un enlace web único (token de acceso). El Organizador deberá compartir dicho enlace a la persona invitada de forma externa al sistema. Al abrir el enlace, el usuario invitado deberá definir y guardar su contraseña para activar su cuenta y habilitar sus permisos de escaneo. El sistema impedirá que un mismo usuario sea asignado más de una vez como Personal de Logística del mismo evento.
- **RN-44 — Alcance de los permisos de logística:** Los permisos de Personal de Logística serán exclusivos del evento para el cual fueron asignados y no otorgarán acceso a las funciones de logística de otros eventos. Dichos permisos dejarán de estar vigentes cuando el evento finalice o sea cancelado.
- **RN-45 — Asignación opcional de Logística:** El sistema permitirá al Organizador decidir si requiere o no registrar Personal de Logística para su evento. En caso de que el Organizador seleccione que no es necesario asignar personal, el sistema desplegará una ventana de advertencia solicitando una confirmación explícita. Si el Organizador confirma la decisión, el evento quedará configurado de manera definitiva sin personal asignado para el control de acceso.
