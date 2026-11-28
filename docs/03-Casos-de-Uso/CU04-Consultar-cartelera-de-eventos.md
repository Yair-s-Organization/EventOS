---
caso_de_uso: "CU-04"
nombre: "Consultar cartelera de eventos"
actor: "Público General / Asistente / Organizador / Subdirección de Servicios Educativos / Personal de Logística / Administrador."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-04: Consultar cartelera de eventos

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

El público general, con o sin cuenta, puede consultar la cartelera y los detalles de eventos públicos publicados; los usuarios autenticados pueden consultar además los eventos autorizados para su alcance (incluyendo eventos internos para usuarios con dominio institucional y eventos privados donde el usuario haya sido incorporado al padrón de invitados de algún subevento o haya ingresado mediante su enlace privado `/eventos/privado/:tokenSubEvento`).

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-04 Consultar cartelera de eventos** |
| **Autor** | Vazquez Perez Axel Daniel |
| **Actor** | Público General / Asistente / Organizador / Subdirección de Servicios Educativos / Personal de Logística / Administrador. |
| **Propósito** | Permitir consultar la cartelera de eventos publicados sin obligar al visitante a registrarse; los usuarios autenticados visualizan además los eventos de alcance autorizado. |
| **Entradas** | - |
| **Salidas** | Listado de eventos públicos vigentes en UI04 y detalle en UI05; los eventos de acceso libre pueden consultarse sin generar boleto. Si el evento requiere boleto, se presenta [Reservar lugar], cuya confirmación sí exige autenticación mediante CU-15. |
| **Precondiciones** | Ninguna (acceso público sin autenticación requerida). |
| **Postcondiciones** | Los registros en la base de datos no se modifican, la operación es de solo lectura. |
| **Errores** | • **MSG-I-14**. No hay eventos disponibles, consulte más tarde.<br>• **MSG-I-15** no hay eventos disponibles que cumplan con los filtros seleccionados.<br>• **MSG-E-08** Error de conexión con la base de datos. |
| **Tipo** | Primario |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. El Público General o un Asistente accede a UI04 "Cartelera de Eventos" directamente desde la plataforma; si inició sesión, también puede acceder desde UI03.
2. El sistema consulta los eventos públicos publicados sin exigir una sesión; si existe una sesión, además verifica el alcance permitido al usuario.
3. Obtiene la lista de eventos visibles según su alcance: muestra eventos públicos a todos, eventos internos únicamente a usuarios con dominio institucional y eventos privados exclusivamente a usuarios autenticados con invitación vigente en alguno de sus subeventos (`"invitacionEvento"."idSubEvento"`) o a su organizador. [Trayectoria A] [Trayectoria E]
4. Despliega la cartelera con los eventos disponibles mostrando su información general (nombre, fecha, categoría, lugar).
5. El actor visualiza la lista de eventos en UI04 "Cartelera de Eventos" y puede aplicar filtros o consultar su detalle. [Trayectoria B] [Trayectoria F]

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición**: La base de datos no tiene registro de ningún evento.

- **A-1.** Muestra el **MSG-I-14** no hay eventos disponibles, consulte más tarde.
- **A-2.** Permanece en UI04 "Cartelera de Eventos", mostrando el aviso sin exigir autenticación.
- **A-3.** Fin del caso de uso.

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición**: El actor desea agregar filtros a su búsqueda.

- **B-1.** Selecciona uno o más filtros de búsqueda (fecha, categoría, espacio, ponente) y presiona “buscar”.
- **B-2.** Filtra la lista de eventos según los criterios ingresados y actualiza la pantalla UI04(cartelera de eventos). [Trayectoria C] [Trayectoria D].
- **B-3.** Fin del caso de uso.

*Fin de la trayectoria.*


### Trayectoria alternativa C:

> **Condición**: La base de datos no encuentra ningún evento que cumpla con los filtros solicitados.

- **C-1.** Muestra el **MSG-I-15** no hay eventos disponibles que cumplan con los filtros seleccionados.
- **C-2.** Muestra la pantalla UI04(cartelera de eventos). vacía y el botón “limpiar filtros”. [Trayectoria D].
- **C-3.** Fin del caso de uso.

*Fin de la trayectoria.*


### Trayectoria alternativa D:

> **Condición**: El actor desea eliminar los filtros aplicados

- **D-1.** Selecciona el botón “limpiar filtros” en la UI04(cartelera de eventos).
- **D-2.** Elimina los filtros de manera automática.
- **D-3.** Continúa en el paso 2 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa E:

> **Condición**: No se puede conectar con la base de datos y por ende no se puede consular los eventos.

- **E-1.** Detecta la interrupción o falla al intentar consultar los registros.
- **E-2.** Detiene el proceso y muestra el mensaje de error MSG-E-08 Error de conexión con la base de datos.

*Fin de la trayectoria.*


### Trayectoria alternativa F:

> **Condición: El Público General o Asistente desea consultar la información completa de un evento, tenga o no sesión activa.**

- **F-1.** selecciona [Ver detalles] en un evento visible desde UI04 "Cartelera de Eventos" o desde UI03 cuando corresponda.
- **F-2.** identifica el evento seleccionado y ejecuta CU-05 "Visualizar detalles del evento", sin exigir autenticación para eventos públicos.
- **F-3.** muestra UI05 "Detalles del Evento" conforme a CU-05. Para eventos con boleto, la reserva se tramita mediante CU-15 con autenticación obligatoria.

*Fin de la trayectoria.*
