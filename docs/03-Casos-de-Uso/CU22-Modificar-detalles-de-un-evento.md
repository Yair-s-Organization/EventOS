---
caso_de_uso: "CU22"
nombre: "Modificar detalles de un evento"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU22: Modificar detalles de un evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permite al usuario modificar determinadas especificaciones de sus eventos.

### 📋 Ficha de Especificación

| Caso de uso | CU-22 Modificar detalles de un evento |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Arciniega Valdez Yair Emmanuel |
| Actor | Organizador |
| Propósito: | Permite al usuario modificar determinada especificación de sus eventos. |
| Entradas: | Los nuevos valores de los campos que el organizador decida alterar. |
| Salidas: | Los datos del evento modificado se actualizan y se guardan permanentemente en el sistema. |
| Precondiciones: | El organizador ya ha escogido un evento previamente. |
| Postcondiciones: | Se redirige a la sección seleccionada por el usuario. |
| Errores: | Cuando el evento seleccionado ya ha caducado (la fecha del evento ya ha ocurrido). |
| Tipo: | Secundario para el organizador, viene del caso de uso “Consultar mis eventos’. |

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Muestra la información actual del evento.
2. 👤 **[Actor]** Selecciona la opción de editar. [Trayectoria A]
3. ⚙️ **[Sistema]** Habilita los campos editables. [Trayectoria B]
4. 👤 **[Actor]** Modifica los datos deseados. [Trayectoria C][Trayectoria D][Trayectoria E][Trayectoria F]
5. ⚙️ **[Sistema]** Valida y actualiza la información.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El organizador no desea modificar los detalles del evento.
- 👤 **[Actor]** **A-1** Oprime el botón “Regresar”.
- ⚙️ **[Sistema]** **A-2** Muestra la pantalla consultar mis eventos.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** La fecha del evento seleccionado ya ha pasado.
- ⚙️ **[Sistema]** **B-1** Muestra en la pantalla “Modificar detalles de un evento” el MSG 01 El evento ya ha concluido.
- ⚙️ **[Sistema]** **B-2** Termina el caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** El usuario desea modificar la descripción del evento.
- ⚙️ **[Sistema]** **C-1** Muestra la pantalla “Actualizar descripción”.
- ⚙️ **[Sistema]** **C-2** Ejecuta Caso de uso “Actualizar descripción”.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D:
> **Condición:** El usuario desea modificar el alcance del evento.
- ⚙️ **[Sistema]** **D-1** Muestra la pantalla “Actualizar alcance del evento”.
- ⚙️ **[Sistema]** **D-2** Ejecuta Caso de uso “Actualizar alcance del evento”.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E:
> **Condición:** El usuario desea modificar las etiquetas del evento.
- ⚙️ **[Sistema]** **E-1** Muestra la pantalla “Asignar etiquetas”.
- ⚙️ **[Sistema]** **E-2** Ejecuta Caso de uso “Asignar etiquetas”.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa F:
> **Condición:** El usuario desea solicitar los requerimientos técnicos.
- ⚙️ **[Sistema]** **F-1** Muestra la pantalla “Solicitar requerimientos técnicos”.
- ⚙️ **[Sistema]** **F-2** Ejecuta Caso de uso “Solicitar requerimientos técnicos”.

*`----- Fin de trayectoria.`*

