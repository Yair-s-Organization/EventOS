---
caso_de_uso: "CU36"
nombre: "Consultar y exportar bitácora histórica"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU36: Consultar y exportar bitácora histórica

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al Administrador consultar y exportar los registros históricos de las actividades realizadas dentro de la plataforma, incluyendo eventos y acciones de los usuarios. La información podrá filtrarse y descargarse en un archivo PDF, garantizando que los registros originales no sean modificados.

### 📋 Ficha de Especificación

| Caso de uso | CU-36 Consultar y exportar bitácora histórica |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Arciniega Valdez Yair Emmanuel |
| **Actor:** | Administrador |
| **Propósito:** | Permitir al Administrador consultar los registros históricos de las actividades del sistema y exportar la información para facilitar su revisión y utilización en auditorías institucionales, sin modificar los datos almacenados en la base de datos. |
| **Entradas:** | • ID del Administrador autenticado, obtenido de la sesión activa.<br>• Solicitud de consulta de la bitácora histórica.<br>• Criterios de búsqueda o filtrado por usuario, tipo de acción y periodo de tiempo (opcionales).<br>• Solicitud de exportación de los registros consultados.<br>• Formato de exportación PDF (`.pdf`). |
| **Salidas:** | • Pantalla `UI20` "Bitácora Histórica del Sistema".<br>• Listado de registros históricos, mostrando información como usuario responsable, acción realizada, fecha y hora.<br>• Archivo PDF con los registros consultados, cuando el actor solicite su exportación.<br>• Mensaje informativo `MSG-I-08` "Operación realizada con éxito.", cuando se complete correctamente la exportación. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Administrador.<br>• El actor debe contar con permisos para consultar y exportar los registros históricos del sistema. |
| **Postcondiciones:** | • El Administrador visualiza los registros históricos almacenados en la base de datos.<br>• Si el actor utiliza filtros, el sistema muestra únicamente los registros que cumplen con los criterios seleccionados.<br>• Si el actor solicita la exportación, se genera un archivo PDF con la información consultada.<br>• Los registros originales de la bitácora permanecen sin modificaciones en la base de datos (`RN-33`).<br>• Si el Administrador decide no exportar la información, únicamente se realiza la consulta.<br>• La sesión del Administrador permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información histórica.<br>• Se mostrará el mensaje `MSG-E-31` "No hay registros de eventos disponibles.", cuando la bitácora no contenga registros para consultar.<br>• Se mostrará el mensaje `MSG-I-23` "No se encontraron registros que coincidan con los filtros seleccionados.", cuando la búsqueda no devuelva resultados.<br>• Se mostrará el mensaje `MSG-E-32` "Error al exportar el archivo.", cuando ocurra una falla durante la generación del archivo PDF. |
| **Tipo:** | Primario para el actor Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Consultar y exportar bitácora histórica" desde la pantalla `UI26` "Menú Principal de Administrador".
2. ⚙️ **[Sistema]** Consulta en la base de datos los registros históricos de eventos y acciones realizadas por los usuarios. `[Trayectoria B]`
3. ⚙️ **[Sistema]** Verifica que existan registros históricos disponibles para su consulta. `[Trayectoria A]`
4. ⚙️ **[Sistema]** Muestra la pantalla `UI20` "Bitácora Histórica del Sistema", presentando los registros ordenados cronológicamente del más reciente al más antiguo, incluyendo usuario, acción realizada, fecha y hora.
5. 👤 **[Actor]** Consulta los registros históricos y, de manera opcional, ingresa criterios de búsqueda o selecciona filtros para localizar información específica.
6. ⚙️ **[Sistema]** Aplica los filtros seleccionados y actualiza el listado de registros mostrados en la pantalla `UI20` "Bitácora Histórica del Sistema". `[Trayectoria A]`
7. 👤 **[Actor]** Selecciona la opción `[Exportar PDF]` para descargar los registros consultados. `[Trayectoria D]`
8. ⚙️ **[Sistema]** Genera un archivo PDF con los registros mostrados de acuerdo con los filtros aplicados, sin modificar la información original de la base de datos. `[Trayectoria C]`
9. ⚙️ **[Sistema]** Completa la generación del archivo y pone a disposición del actor su descarga.
10. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito." en la pantalla `UI20` "Bitácora Histórica del Sistema".
11. 👤 **[Actor]** Descarga el archivo PDF y finaliza la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin registros históricos disponibles
> **Condición:** Ocurre en los pasos 3 o 6 de la trayectoria principal cuando no existen registros históricos disponibles o cuando los filtros seleccionados no devuelven resultados.
- **A-1.** ⚙️ **[Sistema]** Detecta que la consulta de la bitácora histórica no ha devuelto registros.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-31` "No hay registros de eventos disponibles.", cuando no existan registros históricos, o el mensaje `MSG-I-23` "No se encontraron registros que coincidan con los filtros seleccionados.", cuando la búsqueda no genere resultados.
- **A-3.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI20` "Bitácora Histórica del Sistema", mostrando el listado sin registros.
- **A-4.** 👤 **[Actor]** Puede modificar los filtros aplicados para realizar una nueva consulta o finalizar la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión con la base de datos
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar los registros históricos debido a una falla de conexión con la base de datos.
- **B-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar recuperar los registros históricos.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al Administrador que no fue posible completar la consulta.
- **B-3.** ⚙️ **[Sistema]** Impide continuar con la consulta mientras no sea posible recuperar la información solicitada.
- **B-4.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI20` "Bitácora Histórica del Sistema", permitiéndole intentar nuevamente la consulta cuando se restablezca la conexión.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Error al exportar el archivo
> **Condición:** Ocurre en el paso 8 de la trayectoria principal cuando el sistema presenta un error durante la generación del archivo PDF.
- **C-1.** ⚙️ **[Sistema]** Detecta una falla al intentar generar el archivo PDF con los registros históricos consultados.
- **C-2.** ⚙️ **[Sistema]** Detiene el proceso de exportación y muestra el mensaje `MSG-E-32` "Error al exportar el archivo.".
- **C-3.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI20` "Bitácora Histórica del Sistema", conservando los filtros y registros consultados.
- **C-4.** 👤 **[Actor]** Puede seleccionar nuevamente la opción `[Exportar PDF]` para intentar generar el archivo.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Consultar la bitácora sin exportar
> **Condición:** Ocurre en el paso 7 de la trayectoria principal cuando el Administrador decide únicamente consultar los registros históricos sin realizar una exportación.
- **D-1.** 👤 **[Actor]** Revisa la información presentada en la pantalla `UI20` "Bitácora Histórica del Sistema" y decide no seleccionar la opción `[Exportar PDF]`.
- **D-2.** ⚙️ **[Sistema]** Mantiene disponibles los registros históricos consultados y los filtros aplicados, sin generar ningún archivo.
- **D-3.** 👤 **[Actor]** Finaliza la consulta o regresa a la pantalla `UI26` "Menú Principal de Administrador".

*`----- Fin de trayectoria.`*

