---
caso_de_uso: "CU07"
nombre: "Cerrar sesión"
actor: "Asistente, subdirección de servicios educativos, organizador, persona de logística o administrador (Cualquier usuario autenticado del sistema)."
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU07: Cerrar sesión

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir a cualquier usuario autenticado (Asistente, subdirección de servicios educativos, organizador, persona de logística o administrador) finalizar de forma segura su sesión activa en el sistema.

### 📋 Ficha de Especificación

| Caso de uso | CU-07 Cerrar sesión |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Vargas Rodriguez Leonardo. |
| Actor | Asistente, subdirección de servicios educativos, organizador, persona de logística o administrador (Cualquier usuario autenticado del sistema). |
| Propósito: | Permitir al actor finalizar su sesión de trabajo activa en la plataforma de forma segura. |
| Entradas: | ID de la sesión del usuario autenticado. |
| Salidas: | Ventana Emergente (Modal) de Confirmación: Muestra la pantalla de diálogo con el mensaje "¿Desea cerrar su sesión?" y botones de opción (Aceptar / Cancelar).<br>Pantalla de Inicio de Sesión (Login): Vista pública del sistema a la cual se redirige automáticamente al usuario tras finalizar el proceso.<br>Notificación visual: Mensaje en pantalla notificando la salida exitosa |
| Precondiciones: | El actor debe de contar con una sesión activa e iniciada dentro del sistema. |
| Postcondiciones: | Destrucción / Invalidación de la sesión: El token de autenticación o galleta (cookie) activa del usuario se elimina/invalida tanto en el cliente (navegador) como en el servidor/base de datos. |
| Errores: | Se mostrará el en pantalla el mensaje MSG16, si su sesión se encuentra expirada o invalida.<br>Se mostrará el en pantalla el mensaje MSG1, Falla al invalidar el token. |
| Tipo: | Primario (Para todos los actores) |

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Cerrar sesión" en la barra de navegación o menú de perfil de la pantalla en la que se encuentre (P02, P07, P11, P14, P19, P21, P22 o P23, según su rol)..
2. ⚙️ **[Sistema]** Solicita confirmación al actor mediante una ventana emergente MSG17 "¿Desea cerrar su sesión?". [Trayectoria A]
3. 👤 **[Actor]** Da clic en el botón "Aceptar" para confirmar el cierre de sesión.
4. [Sistema] Destruye el token de autenticación de la sesión activa en el servidor. [Trayectoria B]
5. ⚙️ **[Sistema]** Muestra el mensaje MSG18 Sesión finalizada con éxito y redirige automáticamente a la pantalla de inicio de sesión P01 - Inicio de Sesión / Registro.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el actor decide no cerrar su sesión.
- 👤 **[Actor]** **A-1** Da click en el botón "Cancelar" en la ventana de confirmación mostrada sobre la pantalla actual.
- ⚙️ **[Sistema]** **A-2** Cierra la ventana emergente y mantiene al usuario en la pantalla actual sin alterar el estado de su sesión.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Falla al invalidar token.
> **Condición:** Ocurre en el Paso 4 si se pierde la conexión con el servidor al procesar la salida.
- ⚙️ **[Sistema]** **B-1** Detecta una interrupción en la conexión al intentar recuperar los datos.
- ⚙️ **[Sistema]** **B-2** Muestra el mensaje de error MSG11 “Error de conexión con la base de datos” en una ventana emergente sobre la pantalla actual, indicando que no fue posible completar el cierre de sesión.
- ⚙️ **[Sistema]** **B-3** Habilita la opción de reintentar o volver al menú anterior.
- 👤 **[Actor]** **B-4** Redirige al a la pantalla P01 - Inicio de Sesión / Registro.

*`----- Fin de trayectoria.`*

