---
caso_de_uso: "CU28"
nombre: "Cambiar estatus de cuenta de usuario"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU28: Cambiar estatus de cuenta de usuario

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Este caso de uso permite la posibilidad de deshabilitar la cuenta de un usuario impidiéndole volver a iniciar sesión hasta que se le autorice nuevamente. La des habilitación se realizará mediante la pulsación de un botón para realizar dicha acción.

### 📋 Ficha de Especificación

| Caso de uso | CU28 Cambiar estatus de cuenta de usuario |
| --- | --- |
| Resumen de atributos |  |
| Actor | Administrador |
| Autor | Moreno Ramirez Jose Jorge |
| Propósito: | Cambiar el estatus de un usuario entre activo e inactivo en caso de que se requiera deshabilitar una cuenta. |
| Entradas: |  |
| Salidas: | Se mostrará en pantalla el MSG26 Operación realizada con éxito cuando se deshabilite la cuenta del usuario seleccionado de manera exitosa. |
| Precondiciones: | Se requiere que la cuenta haya existido y tenga un estado inicial “activo” |
| Postcondiciones: | Se actualiza el estado de cuenta del usuario seleccionado.<br>Se actualiza en el sistema el estado del usuario. |
| Errores: | Se mostrará el MSG 11 Error de conexión con la base de datos en caso de fallo de red. |
| Tipo: | Secundario para el Administrador. |
Trayectoria del caso de uso:

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona el panel que contiene la lista de usuarios.
2. ⚙️ **[Sistema]** Muestra la P22 Gestión de Cuentas de Usuario (Administrador) que contiene el listado todas las cuentas registradas.
3. 👤 **[Actor]** Busca por fecha de su último ingreso al sistema.
4. ⚙️ **[Sistema]** Consulta en la base de datos y muestra una tabla con los usuarios activos y su último log in al sistema, desplegando su nombre y ocupación.
5. 👤 **[Actor]** Oprime el botón [Inhabilitar]
6. ⚙️ **[Sistema]** Regresa a la pantalla XX Nombre por definir

*`--- Fin del caso de uso`*

