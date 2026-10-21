---
caso_de_uso: "CU32"
nombre: "Asignar personal de logística"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU32: Asignar personal de logística

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU25-Consultar-mis-eventos]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
En este caso se le permite al organizador visualizar un panel con el listado de usuarios en el sistema, donde podrá revisar la identidad de cada uno y ocupación, y si así lo decide el organizador, asignarlo como personal de logística de su evento.

### 📋 Ficha de Especificación

| Caso de uso | CU-32 Asignar personal de logística (extend CU-25) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Moreno Ramirez Jose Jorge / Zempoalteca Salinas Enrique |
| **Actor:** | Organizador |
| **Propósito:** | Permitir al organizador buscar opciones entre los usuarios del sistema para asignarlos como parte del personal de logística de su evento ya agendado. |
| **Entradas:** | • Clic en el botón "Asignar" sobre un candidato de la lista de usuarios del sistema. |
| **Salidas:** | • Se mostrará en pantalla el mensaje `MSG-I-08` "Operación realizada con éxito."<br>• Actualización del contador de logística asignada vs logística requerida. |
| **Precondiciones:** | • Que el organizador tenga un evento en estado "Aprobado" o "Activo".<br>• Que haya usuarios activos en el sistema. |
| **Postcondiciones:** | • Después de asignar al usuario como personal de logística, el sistema asigna el permiso temporal de "Personal de Logística" a ese usuario, exclusivamente para ese evento. |
| **Errores:** | • Se mostrará el `MSG-E-08` "Error de conexión con la base de datos." en caso de fallo de red. |
| **Tipo:** | Secundario para el Organizador, viene del caso de uso `CU-25` "Consultar mis eventos". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Asignar personal de logística", dentro de la pantalla `UI15` / `UI16` "Panel de Administración y Detalles del Evento".
2. ⚙️ **[Sistema]** Consulta en la base de datos y muestra una tabla con los usuarios activos en el sistema, desplegando su Nombre y Ocupación (Alumno, Profesor, etc.), junto con el contador de logística actual.
3. 👤 **[Actor]** Oprime el botón "Asignar" ubicado en la fila del candidato deseado.
4. ⚙️ **[Sistema]** Actualiza en la base de datos el estado del usuario como "Asignado" en su apartado de logística.
5. ⚙️ **[Sistema]** Asigna el rol y los permisos de "Personal de Logística" al usuario, vinculándolos exclusivamente para este evento.
6. ⚙️ **[Sistema]** Aumenta el contador de personal de logística activo en la pantalla.
7. ⚙️ **[Sistema]** Muestra en pantalla el `MSG-I-08` "Operación realizada con éxito." y actualiza la opción de "Asignar" a "Asignado" en la fila del usuario en la lista de usuarios activos del sistema.

*`----- Fin de trayectoria.`*

