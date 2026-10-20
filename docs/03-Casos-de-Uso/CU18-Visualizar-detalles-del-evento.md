---
caso_de_uso: "CU18"
nombre: "Visualizar detalles del evento"
actor: "Personal de Logística"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU18: Visualizar detalles del evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permite al personal de logística visualizar la información de un evento en específico

### 📋 Ficha de Especificación

| Caso de Uso | CU-18 Visualizar detalles del evento |
| --- | --- |
| Resumen de Atributos |  |
| Autor: | Lorena Zuñiga Gonzalez |
| Actor: | Personal de Logística |
| Propósito: | Permitir al personal de logística visualizar los detalles de un evento del que validará el acceso |
| Entradas: | Desde la UI-19 Panel de Eventos Asignados, el usuario hace clic en el evento que se desea visualizar |
| Salidas: | Muestra en la UI-19 Panel de Eventos Asignados la información del evento al que le dio clic |
| Precondiciones: | Tener vinculado el evento seleccionado en el CU-19 a su perfil de usuario |
| Postcondiciones: | - |
| Errores: |  |
| Tipo: | Secundario de CU 19 |

#### Trayectoria Principal
1. 👤 **[Actor]** Da clic en el evento que desea visualizar
2. ⚙️ **[Sistema]** Muestra en pantalla los detalles del evento y el botón de escanear
3. [El actor puede elegir ejecutar CU-21]

*`----- Fin de trayectoria.`*

