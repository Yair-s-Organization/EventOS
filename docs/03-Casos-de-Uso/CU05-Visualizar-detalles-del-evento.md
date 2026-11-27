---
caso_de_uso: "CU-05"
nombre: "Visualizar detalles del evento"
actor: "Público General / Asistente / Organizador / Subdirección de Servicios Educativos / Personal de Logística / Administrador."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-05: Visualizar detalles del evento

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir al público general y a los usuarios de la plataforma visualizar los detalles de los eventos disponibles para su consulta, sin iniciar sesión cuando el evento sea público. El personal de logística podrá acceder además a las funciones de control de acceso de los eventos que tiene asignados.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-05 Visualizar detalles del evento** |
| **Autor** | Lorena Zuñiga Gonzalez. |
| **Actor** | Público General / Asistente / Organizador / Subdirección de Servicios Educativos / Personal de Logística / Administrador. |
| **Propósito** | Permitir que cualquier persona consulte los detalles de eventos publicados conforme a su alcance, sin exigir autenticación para eventos públicos. Las acciones exclusivas de logística requieren asignación y sesión activa. |
| **Entradas** | ID del evento seleccionado en UI04 o UI18, o enlace compartible privado `/eventos/privado/:tokenSubEvento`. Solicitud de visualización de detalles (`UI05` y subvista de subevento `UI05.1`). La sesión es opcional para eventos públicos; se requiere cuando se accede a funciones restringidas o enlaces privados. |
| **Salidas** | Pantalla UI05 "Detalles del Evento" (y subvista `UI05.1` por subevento), con fecha, horario, ponentes, recinto, disponibilidad efectiva (`min(cupoMaximo, aforoActualRecinto)`), póster, descripción y modalidad de acceso. Eventos de acceso libre: informan que no requieren registro ni boleto. Eventos con registro previo (*Registro simple sin QR*, *QR Admisión general* o *QR con mapa*): opción [Reservar lugar]. Opción [Control de acceso] (`UI17`) / [Escanear QR] (`UI19`) únicamente para el personal de logística autorizado en el subevento asignado. |
| **Precondiciones** | Ninguna para consulta pública de un evento publicado. Para consultar datos internos de un evento asignado o usar [Escanear QR], el actor deberá estar autenticado y contar con autorización. |
| **Postcondiciones** | El actor visualiza los detalles del evento autorizado para su alcance. La consulta no modifica la base de datos. La sesión, si existía, permanece activa. |
| **Errores** | MSG-E-08 cuando no se recupera información. MSG-E-06 si el evento no existe, está cancelado o no es visible. MSG-E-41 si un usuario de logística intenta acceder a un evento no asignado mediante UI18. |
| **Tipo** | Primario para el Público General y todos los roles de la plataforma. El acceso a [Escanear QR] está restringido al personal de logística asignado. |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. El actor selecciona [Ver detalles] de un evento visible desde UI04 "Cartelera de Eventos". El personal de logística también puede abrir un evento asignado desde UI18 "Panel de Eventos Asignados".
2. El sistema obtiene el identificador y consulta los datos del evento sin exigir inicio de sesión cuando sea público; si proviene de UI18, verifica la asignación al personal de logística. [Trayectoria A] [Trayectoria B]
3. El sistema verifica que el evento exista, esté publicado y sea visible para el actor de acuerdo con su alcance:
   - Si es alcance **Privado**, comprueba que el usuario autenticado esté registrado en la lista de invitados del subevento (`invitacionEvento.idSubEvento`), sea su organizador, directivo o personal asignado. Si accede por enlace privado (`/eventos/privado/:tokenSubEvento`) sin sesión o con una cuenta sin permiso, muestra el aviso correspondiente con botón **[Iniciar sesión]** / **[Aceptar invitación]** y retorno automático tras autenticarse.
   - Si es alcance **Interno**, valida que el usuario pertenezca a la comunidad interna del IPN o que, siendo externo, posea un boleto previo emitido antes del cambio de alcance (`CU-27`). [Trayectoria C]
4. Muestra UI05 "Detalles del Evento" (y su desglose `UI05.1` por subevento) con nombre, descripción, fecha, horario, ponentes, recinto, lugares disponibles sobre el cupo efectivo (`min(cupoMaximo, aforoActualRecinto)`) y modalidad de acceso. Si es de acceso libre, informa que no necesita registro ni boleto; si requiere registro previo (*Registro simple sin QR*, *QR Admisión general* o *QR con mapa*), habilita [Reservar lugar].
5. El actor consulta los detalles. Puede solicitar una reserva cuando el evento requiera registro previo [Trayectoria E]. Solo el personal de logística autenticado y asignado puede abrir `UI17` "Control de Acceso" o seleccionar [Escanear QR] (`UI19`) en subeventos con boleto QR. [Trayectoria D]

*Fin de la trayectoria.*


### Trayectoria alternativa A: Evento no autorizado para logística

> **Condición: En el paso 2, el personal de logística intenta consultar desde UI18 un evento que no tiene asignado. Esta restricción no impide consultar los detalles públicos desde UI04.**

- **A-1.** El sistema detecta que el evento no está asignado al personal de logística autenticado que accede desde UI18.
- **A-2.** Bloquea únicamente la consulta operativa de ese evento y muestra MSG-E-41 "No tiene autorización para consultar este evento porque no se encuentra asignado a él.".
- **A-3.** Regresa a UI18 "Panel de Eventos Asignados". La consulta pública de eventos publicados permanece disponible mediante UI04.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Error de conexión con la base de datos

> **Condición: En el paso 2, el sistema no puede recuperar los datos del evento debido a una falla de conexión con la base de datos.**

- **B-1.** Detecta una falla de conexión con la base de datos al intentar consultar la información del evento seleccionado.
- **B-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** Mantiene al actor en UI04 o UI18, según el punto de acceso, para que pueda reintentar la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Evento no encontrado o cancelado

> **Condición: En el paso 3, el evento no existe, fue cancelado o su alcance no permite mostrarlo al actor.**

- **C-1.** El sistema detecta que el evento no está disponible para el actor por cancelación, inexistencia o restricciones de visibilidad.
- **C-2.** Impide continuar con la consulta y muestra el mensaje **MSG-E-06** "Evento no encontrado o cancelado.".
- **C-3.** Regresa a UI04 o UI18 según corresponda, actualizando los eventos visibles.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Escanear código QR de un asistente

> **Condición: En el paso 5, un usuario autenticado con permisos de logística para el evento elige [Escanear QR]. Los visitantes y demás actores no tienen disponible esta opción.**

- **D-1.** El personal de logística asignado selecciona [Escanear QR] desde UI05 "Detalles del Evento"
- **D-2.** Obtiene el identificador del evento seleccionado y ejecuta el CU-23 "Escanear QR", conforme a la relación `<<extend>>` establecida en el diagrama.
- **D-3.** Muestra la pantalla **UI19** "Pantalla de Escáner QR", de acuerdo con la trayectoria definida en el CU-23.
- *----- Continúa la ejecución del CU-23 "Escanear QR".*

### Trayectoria alternativa E: Solicitar reserva para evento con registro previo

> **Condición:** En el paso 5, el actor selecciona [Reservar lugar] en un evento cuya modalidad requiere registro previo (*Registro simple sin QR*, *QR Admisión general* o *QR con mapa*).

- **E-1.** selecciona [Reservar lugar] en la pantalla UI05 "Detalles del Evento".
- **E-2.** ejecuta CU-15 "Reservar lugar a un evento". Si el actor no está autenticado, el flujo de reserva conserva el evento seleccionado y solicita iniciar sesión o registrarse.
- **E-3.** Al autenticarse, continúa el proceso de reserva, sujeto a disponibilidad y a las reglas del evento.

*Fin de la trayectoria.*
