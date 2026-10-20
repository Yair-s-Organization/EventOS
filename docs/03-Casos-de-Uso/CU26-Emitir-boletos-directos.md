---
caso_de_uso: "CU26"
nombre: "Emitir boletos directos"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU26: Emitir boletos directos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permitir al usuario generar boletos directos para un evento garantizando que no se sobrepase la capacidad máxima de seguridad del recinto.

### 📋 Ficha de Especificación

| Caso de uso | CU-26 Emitir boletos directos |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Arciniega Valdez Yair Emmanuel |
| Actor | Organizador |
| Propósito: | Generar y asignar boletos directos para un evento controlando estrictamente el límite de asistencia por seguridad. |
| Entradas: | Cantidad entera de boletos a emitir. |
| Salidas: | Confirmación visual de éxito y boletos generados. |
| Precondiciones: | El evento tiene un recinto asignado con un aforo máximo de seguridad definido en el sistema.<br>El evento se encuentra en estado "Aprobado" o "Activo". |
| Postcondiciones: | Los boletos son generados, asociados al evento y se descuentan de la disponibilidad total del aforo. |
| Errores: | Cuando la cantidad solicitada, sumada a los boletos ya existentes, supera el aforo máximo del recinto, o si se ingresan valores inválidos. |
| Tipo: | Secundario para el organizador. |

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Muestra la pantalla de emisión de boletos, indicando el aforo total y los lugares disponibles actualmente.
2. 👤 **[Actor]** Ingresa la cantidad de boletos a emitir. [Trayectoria A]
3. 👤 **[Actor]** Confirma la emisión de los boletos.
4. ⚙️ **[Sistema]** Valida que la cantidad ingresada sea un número mayor a cero y que la suma total de boletos no exceda el aforo máximo de seguridad del recinto. [Trayectoria B] [Trayectoria C]
5. ⚙️ **[Sistema]** Genera los boletos directos y actualiza la cantidad de lugares disponibles en la base de datos.
6. ⚙️ **[Sistema]** Muestra un mensaje indicando que los boletos se emitieron exitosamente.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El Organizador decide no agregar requerimientos y presiona "Cancelar" o "Regresar”.
- ⚙️ **[Sistema]** **A-1** Descarta la información ingresada.
- ⚙️ **[Sistema]** **A-2** Regresa a la pantalla de gestión del evento.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** La cantidad ingresada de boletos supera el aforo disponible del recinto.
- ⚙️ **[Sistema]** **B-1** Muestra el MSG-05 “La cantidad solicitada excede el aforo máximo de seguridad del recinto. Solo quedan X lugares disponibles."
- ⚙️ **[Sistema]** **B-2** Bloquea la acción de emitir y resalta el campo de cantidad.
- ⚙️ **[Sistema]** **B-3** Retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** El Organizador ingresa datos inválidos en la cantidad (números negativos, cero, letras o campo vacío).
- ⚙️ **[Sistema]** **C-1** Muestra el MSG-03 " Cantidad inválida. Ingrese un número entero válido.”.
- ⚙️ **[Sistema]** **C-2** Resalta el campo con error.
- ⚙️ **[Sistema]** **C-3** Retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

