---
caso_de_uso: "CU-31"
nombre: "Asignar personal de logística"
actor: "Organizador"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-31: Asignar personal de logística

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** En este caso se le permite al organizador visualizar un panel con el listado de usuarios en el sistema, donde podrá revisar la identidad de cada uno y ocupación, y si así lo decide el organizador, asignarlo como personal de logística de su evento.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-31 Asignar personal de logística** |
| **Autor** | Moreno Ramirez Jose Jorge / Zempoalteca Salinas Enrique |
| **Actor** | Organizador |
| **Propósito** | Permitir al organizador buscar opciones entre los usuarios del sistema para asignarlos como parte del personal de logística de su evento ya agendado. |
| **Entradas** | Click en el botón “Asignar” sobre un candidato de la lista de usuarios del sistema. |
| **Salidas** | • Pantalla **UI27** "Agregar Personal de Logística".<br>• Se mostrará en pantalla el mensaje MSG-I-08 Operación realizada con éxito.<br>• Actualización del contador de logística asignada vs logística requerido. |
| **Precondiciones** | Que el organizador tenga un evento en estado “Aprobado” o “Activo” sin haber alcanzado el límite de 10 integrantes (`RN-41`, `MSG-E-50`).<br>Que haya usuarios activos en el sistema sin reserva previa como asistente en ese evento (`RN-21`, `MSG-E-12`). |
| **Postcondiciones** | Después de asignar al usuario como personal de logística, el sistema asigna el permiso temporal de “Personal de Logística” a ese usuario, exclusivamente para ese evento. |
| **Errores** | Se mostrará el MSG-E-08 Error de conexión con la base de datos en caso de fallo de red. |
| **Tipo** | Secundario para el Organizador, viene del caso de uso CU-24 Consultar mis eventos (`<<extend>>`). |


### Trayectoria Principal

1. Selecciona la opción “Asignar personal de logística”, dentro de la pantalla UI15 Panel de Administración y Detalles del Evento.
2. Consulta en la base de datos y muestra la pantalla **UI27** "Agregar Personal de Logística" con una tabla con los usuarios activos en el sistema, desplegando su Nombre y Ocupación (Alumno, Profesor, etc.), junto con el contador de logística actual.
3. Oprime el botón “Asignar” ubicado en la fila del candidato deseado.
4. Actualiza en la base de datos el estado del usuario como “Asignado” en su apartado de logística.
5. Asigna el rol y los permisos de “Personal de Logística” al usuario, vinculándolos exclusivamente para este evento.
6. Aumenta el contador de personal de logística activa en la UI15.
7. Muestra en pantalla el **MSG-I-08** Operación realizada con éxito y actualiza la opción de “Asignar” a “Asignado” en la fila del usuario en la lista de usuarios activos del sistema.

*Fin de la trayectoria.*
