---
caso_de_uso: "CU08"
nombre: "Visualizar Bitácora de Eventos Realizados"
actor: "Asistente."
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU08: Visualizar Bitácora de Eventos Realizados

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al usuario (Asistente/ subdirección) consultar el historial de los eventos que ha solicitado e impartido entro de la plataforma.

### 📋 Ficha de Especificación

| Caso de uso | CU08 Visualizar Bitácora de Eventos Realizados |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Vargas Rodriguez Leonardo. |
| Actor | Asistente. |
| Propósito: | Permitir al usuario consultar el historial completo y llevar un control de los eventos que ha organizado o realizados dentro del sistema. |
| Entradas: | ID del usuario autentificado, Filtro opcional por periodo de tiempo. |
| Salidas: | Pantalla de Bitácora de Eventos Realizados: Muestra la interfaz gráfica con el listado cronológico de eventos concluidos (incluyendo título del evento, fecha de realización, recinto y total de asistentes).<br>Mensaje/Vista de notificación: Pantalla con mensaje informativo en caso de que el usuario no tenga eventos registrados o concluidos.<br>Pantalla de alerta de error: En caso de fallo de red o servidor. |
| Precondiciones: | El usuario debe de haber iniciado sesión en el sistema. |
| Postcondiciones: | Sin cambios en el estado del sistema: Al ser una acción puramente de consulta e inspección de datos históricos, la base de datos no sufre ninguna modificación, alta o baja. |
| Errores: | Se mostrará el en pantalla el mensaje MSG11, Error de conexión con la base de datos.<br>Se mostrará el en pantalla el mensaje MSG14, Sin eventos registrados en la bitácora. |
| Tipo: | Primario (Inicializado por Asistente) |

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Visualizar bitácora de eventos realizados" desde la pantalla P02 - Menú Principal del Asistente.
2. ⚙️ **[Sistema]** Accede a la pantalla P10 - Bitácora de Eventos Realizados y consulta en la base de datos el historial de eventos solicitados e impartidos por el usuario con estatus "Concluido". [Trayectoria A] [Trayectoria B]
3. ⚙️ **[Sistema]** Ordena cronológicamente los eventos realizados (del más reciente al más antiguo) en la pantalla P10 - Bitácora de Eventos Realizados.
4. ⚙️ **[Sistema]** Muestra en pantalla P10 - Bitácora de Eventos Realizados la bitácora con el listado de eventos, incluyendo datos clave como nombre del evento, fecha de realización y recinto.
5. 👤 **[Actor]** Visualiza la información del historiaren la pantalla P10 - Bitácora de Eventos Realizados y finaliza la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin eventos registrados en la bitácora.
> **Condición:** Ocurre en el Paso 2 si el usuario aún no ha concluido ningún evento como organizador.
- ⚙️ **[Sistema]** **A-1** Detecta que la consulta no devuelve ningún evento con estatus “Concluido”.
- ⚙️ **[Sistema]** **A-2** Muestra en pantalla P10 - Bitácora de Eventos Realizados el mensaje MSG14 "Sin eventos registrados en la bitácora.
- ⚙️ **[Sistema]** **A-3** Habilita la opción "Regresar" en la pantalla P10 - Bitácora de Eventos Realizados.
- 👤 **[Actor]** **A-3** Selecciona la opción "Regresar".
- ⚙️ **[Sistema]** **A-4** Redirige al actor a la pantalla P02 - Menú Principal del Asistente.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión a la base de datos.
> **Condición:** 
- ⚙️ **[Sistema]** **B-1** Detecta una interrupción en la conexión al intentar recuperar los datos.
- ⚙️ **[Sistema]** **B-2** Muestra P10 - Bitácora de Eventos Realizados el mensaje MSG11 "Error de conexión con la base de datos".
- ⚙️ **[Sistema]** **B-3** Habilita las opciones "Reintentar" y "Regresar" en la pantalla P10 - Bitácora de Eventos Realizados.
- 👤 **[Actor]** **B-4** Selecciona una de las opciones disponibles.
- ⚙️ **[Sistema]** **B-5** Si selecciona "Reintentar", regresa al paso 2 de la trayectoria principal y realiza nuevamente la consulta desde la pantalla P10 - Bitácora de Eventos Realizados.
- ⚙️ **[Sistema]** **B-6** Si selecciona "Regresar", redirige al actor a la pantalla P02 - Menú Principal del Asistente.

*`----- Fin de trayectoria.`*

