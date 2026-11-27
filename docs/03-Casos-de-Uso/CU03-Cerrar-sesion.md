---
caso_de_uso: "CU-03"
nombre: "Cerrar sesión"
actor: "Asistente, subdirección de servicios educativos, organizador, persona de logística o administrador (Cualquier usuario autenticado del sistema)."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-03: Cerrar sesión

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir a cualquier usuario autenticado (asistente, subdirección de servicios educativos, organizador, persona de logística o administrador) finalizar de forma segura su sesión activa en el sistema.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-03 Cerrar sesión** |
| **Autor** | Vargas Rodriguez Leonardo. |
| **Actor** | Asistente, subdirección de servicios educativos, organizador, persona de logística o administrador (Cualquier usuario autenticado del sistema). |
| **Propósito** | Permitir al actor finalizar su sesión de trabajo activa en la plataforma de forma segura. |
| **Entradas** | ID de la sesión del usuario autenticado. |
| **Salidas** | • Ventana emergente de confirmación con el mensaje **MSG-P-02** "¿Desea cerrar su sesión?" y los botones [Aceptar] y [Cancelar].<br>• Mensaje informativo **MSG-I-04** "Sesión finalizada con éxito".<br>• Pantalla **UI01** "Pantalla de Inicio de Sesión", a la cual se redirige automáticamente al actor una vez finalizado el proceso. |
| **Precondiciones** | El actor debe de contar con una sesión activa e iniciada dentro del sistema. |
| **Postcondiciones** | Destrucción / Invalidación de la sesión: El token JWT activo se invalida en lista negra (`RNF-09`) y se limpia la sesión del cliente (navegador). |
| **Errores** | Se mostrará el mensaje MSG-E-08 "Error de conexión con la base de datos", cuando una falla de conexión con la base de datos impida completar el cierre de sesión. |
| **Tipo** | Primario (Para todos los actores) |


### Trayectoria Principal

1. Selecciona la opción "Cerrar sesión" en la barra de navegación o menú de perfil de la pantalla en la que se encuentre (UI03, UI04, UI25 O UI26, según su rol).
2. Solicita confirmación al actor mediante una ventana emergente **MSG-P-02** "¿Desea cerrar su sesión?". [Trayectoria A]
3. Da clic en el botón "Aceptar" para confirmar el cierre de sesión.
4. Destruye el token de autenticación de la sesión activa en el servidor. [Trayectoria B]
5. Muestra el mensaje **MSG-I-04** “Sesión finalizada con éxito” y redirige automáticamente a la pantalla de inicio de sesión UI01 “Inicio de Sesión”.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Toma la decisión de no cerrar sesión.

> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el actor decide no cerrar su sesión.

- **A-1.** Da click en el botón "Cancelar" en la ventana de confirmación mostrada sobre la pantalla actual.
- **A-2.** Cierra la ventana emergente y mantiene al usuario en la pantalla actual sin alterar el estado de su sesión.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Falla al invalidar token.

> **Condición:** Ocurre en el Paso 4 si se pierde la conexión con el servidor al procesar la salida.

- **B-1.** Detecta una interrupción en la conexión al intentar recuperar los datos.
- **B-2.** Muestra el mensaje de error **MSG-E-08** “Error de conexión con la base de datos” en una ventana emergente sobre la pantalla actual, indicando que no fue posible completar el cierre de sesión.
- **B-3.** Redirige al usuario a la pantalla **UI01** “Inicio de Sesión”.

*Fin de la trayectoria.*
