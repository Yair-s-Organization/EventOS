---
caso_de_uso: "CU17"
nombre: "Consultar Eventos Asignados"
actor: "Personal de Logística"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU17: Consultar Eventos Asignados

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permite al personal de logística visualizar los eventos en los que será quién valide el acceso de los asistentes.

### 📋 Ficha de Especificación

| Caso de Uso | CU-17 Consultar Eventos Asignadas |
| --- | --- |
| Resumen de Atributos |  |
| Autor: | Lorena Zuñiga Gonzalez |
| Actor: | Personal de Logística |
| Propósito: | Permitir al personal de logística visualizar los eventos próximos en los que tiene asignada la validación de acceso. |
| Entradas: | - |
| Salidas: | Se muestra en pantalla una lista de los eventos que se tienen vinculados al perfil de usuario. |
| Precondiciones: | El actor ha realizado el login exitosamente. |
| Postcondiciones: | - |
| Errores: | No hay eventos vinculados al perfil |
| Tipo: | Primario |

#### Trayectoria Principal
1. 👤 **[Actor]** Ingresa al panel del listado de eventos de los cuales es personal [Trayectoria A]
2. ⚙️ **[Sistema]** Muestra en pantalla los eventos vinculados al perfil del usuario [El actor puede elegir ejecutar CU-20]

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** No existen próximos eventos vinculado al perfil
⚙️ **[Sistema]** Muestra el pantalla el MSG 45 “No existen eventos vinculados a este perfil”.

*`----- Fin de trayectoria.`*

