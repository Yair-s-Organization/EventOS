---
caso_de_uso: "CU27"
nombre: "Modificar detalles de un evento"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU27: Modificar detalles de un evento (extend CU-25)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU25-Consultar-mis-eventos]] | **Extendido por:** [[CU28-Actualizar-informacion-general-del-evento]] / [[CU29-Solicitar-requerimientos-tecnicos]] / [[CU08-Agregar-ponente]]

### 📌 Resumen
Permite al usuario modificar determinadas especificaciones de sus eventos.

### 📋 Ficha de Especificación

| Caso de uso | CU-27 Modificar detalles de un evento (extend CU-25) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Arciniega Valdez Yair Emmanuel |
| **Actor:** | Organizador |
| **Propósito:** | Permite al usuario modificar determinada especificación de sus eventos. |
| **Entradas:** | • Nombre del evento y descripción del evento. |
| **Salidas:** | • Se muestra `UI15` "Panel de Administración y Detalles del Evento". |
| **Precondiciones:** | • El organizador ya ha escogido un evento previamente en `UI14` "Panel de Consulta de Mis Eventos". |
| **Postcondiciones:** | • Se muestra `UI15` "Panel de Administración y Detalles del Evento". |
| **Errores:** | • `MSG-E-07`: "Evento finalizado o inactivo." |
| **Tipo:** | Secundario para el organizador, viene del `CU-25` "Consultar mis eventos". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Muestra la información actual del evento.
2. 👤 **[Actor]** Selecciona la opción editar información general del evento (o requerimientos técnicos / ponentes). `[Trayectoria A]` `[Trayectoria B]`
3. ⚙️ **[Sistema]** Muestra `UI15` "Panel de Administración y Detalles del Evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Regresar a consultar mis eventos
> **Condición:** El organizador desea regresar a consultar sus eventos.
- **A-1.** 👤 **[Actor]** Oprime el botón "Regresar".
- **A-2.** ⚙️ **[Sistema]** Muestra la `UI14` "Panel de Consulta de Mis Eventos".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Evento finalizado o inactivo
> **Condición:** El evento seleccionado se encuentra finalizado o inactivo.
- **B-1.** ⚙️ **[Sistema]** Muestra en `UI15` "Panel de Administración y Detalles del Evento" el `MSG-E-07` "Evento finalizado o inactivo.".
- **B-2.** ⚙️ **[Sistema]** Termina el caso de uso.

*`----- Fin de trayectoria.`*

