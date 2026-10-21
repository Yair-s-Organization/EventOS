---
caso_de_uso: "CU12"
nombre: "Visualizar bitácora de eventos realizados"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU12: Visualizar bitácora de eventos realizados

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al usuario (Asistente/Subdirección) consultar el historial de los eventos que ha solicitado e impartido dentro de la plataforma.

### 📋 Ficha de Especificación

| Caso de uso | CU-12 Visualizar Bitácora de Eventos Realizados |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Vargas Rodriguez Leonardo. |
| **Actor:** | Asistente. |
| **Propósito:** | Permitir al usuario consultar el historial completo y llevar un control de los eventos que ha organizado o realizado dentro del sistema. |
| **Entradas:** | • ID del usuario autenticado.<br>• Filtro opcional por periodo de tiempo. |
| **Salidas:** | • Pantalla `UI10` "Bitácora de Eventos Realizados", que muestra el listado cronológico de eventos concluidos, incluyendo nombre del evento, fecha de realización, recinto y total de asistentes.<br>• Mensaje informativo `MSG-I-03` "Sin eventos registrados en la bitácora.", cuando el actor no cuente con eventos concluidos. |
| **Precondiciones:** | • El usuario debe de haber iniciado sesión en el sistema. |
| **Postcondiciones:** | • Sin cambios en el estado del sistema: Al ser una acción puramente de consulta e inspección de datos históricos, la base de datos no sufre ninguna modificación, alta o baja. |
| **Errores:** | • Se mostrará en pantalla el mensaje `MSG-E-08` "Error de conexión con la base de datos.". |
| **Tipo:** | Primario. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Visualizar bitácora de eventos realizados" desde la pantalla `UI03` "Menú Principal del Asistente".
2. ⚙️ **[Sistema]** Accede a la pantalla `UI10` "Bitácora de Eventos Realizados" y consulta en la base de datos el historial de eventos solicitados e impartidos por el usuario con estatus "Concluido". `[Trayectoria A]` `[Trayectoria B]`
3. ⚙️ **[Sistema]** Ordena cronológicamente los eventos realizados (del más reciente al más antiguo) en la pantalla `UI10` "Bitácora de Eventos Realizados".
4. ⚙️ **[Sistema]** Muestra en pantalla `UI10` "Bitácora de Eventos Realizados" la bitácora con el listado de eventos, incluyendo datos clave como nombre del evento, fecha de realización y recinto.
5. 👤 **[Actor]** Visualiza la información del historial en la pantalla `UI10` "Bitácora de Eventos Realizados" y finaliza la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin eventos registrados en la bitácora
> **Condición:** Ocurre en el Paso 2 si el usuario aún no ha concluido ningún evento como organizador.
- **A-1.** ⚙️ **[Sistema]** Detecta que la consulta no devuelve ningún evento con estatus "Concluido".
- **A-2.** ⚙️ **[Sistema]** Muestra en pantalla `UI10` "Bitácora de Eventos Realizados" el mensaje `MSG-I-03` "Sin eventos registrados en la bitácora.".
- **A-3.** ⚙️ **[Sistema]** Habilita la opción "Regresar" en la `UI10` "Bitácora de Eventos Realizados".
- **A-4.** 👤 **[Actor]** Selecciona la opción "Regresar".
- **A-5.** ⚙️ **[Sistema]** Redirige al actor a la pantalla `UI03` "Menú Principal del Asistente".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión a la base de datos
> **Condición:** Que el tiempo para hacer la consulta en la base de datos se agote.
- **B-1.** ⚙️ **[Sistema]** Detecta una interrupción en la conexión al intentar recuperar los datos.
- **B-2.** ⚙️ **[Sistema]** Muestra en `UI10` "Bitácora de Eventos Realizados" el mensaje `MSG-E-08` "Error de conexión con la base de datos.".
- **B-3.** ⚙️ **[Sistema]** Habilita las opciones "Reintentar" y "Regresar" en la pantalla `UI10` "Bitácora de Eventos Realizados".
- **B-4.** 👤 **[Actor]** Selecciona una de las opciones disponibles.
- **B-5.** ⚙️ **[Sistema]** Si selecciona "Reintentar", regresa al paso 2 de la trayectoria principal y realiza nuevamente la consulta desde la pantalla `UI10` "Bitácora de Eventos Realizados".
- **B-6.** ⚙️ **[Sistema]** Si selecciona "Regresar", redirige al actor a la pantalla `UI03` "Menú Principal del Asistente".

*`----- Fin de trayectoria.`*

