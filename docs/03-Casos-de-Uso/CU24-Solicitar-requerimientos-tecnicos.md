---
caso_de_uso: "CU24"
nombre: "Solicitar requerimientos técnicos"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU24: Solicitar requerimientos técnicos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permitir al usuario solicitar el hardware y equipo de cómputo necesario para llevar a cabo su evento en el laboratorio.

### 📋 Ficha de Especificación

| Caso de uso | CU-24 Solicitar requerimientos técnicos |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Arciniega Valdez Yair Emmanuel |
| Actor | Organizador |
| Propósito: | Registrar la cantidad de computadoras necesarias para el evento, garantizando que no se supere la capacidad instalada. |
| Entradas: | Cantidad entera de computadoras a solicitar. |
| Salidas: | Confirmación visual de que los requerimientos han sido registrados. |
| Precondiciones: | El sistema se encuentra en el punto de extensión de "Modificar detalles de un evento".<br>El evento está configurado para realizarse en un espacio tipo laboratorio. |
| Postcondiciones: | La cantidad de computadoras solicitadas se asocia al evento y se guarda permanentemente en la base de datos. |
| Errores: | Cuando la cantidad ingresada supera el límite máximo de computadoras permitidas o se introducen caracteres no numéricos. |
| Tipo: | Secundario para el organizador, viene del caso de uso "Modificar detalles de un evento". |

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Muestra el catálogo de requerimientos técnicos (hardware y equipos de cómputo disponibles).
2. 👤 **[Actor]** Selecciona y/o ingresa la cantidad de computadoras necesarias para su actividad. [Trayectoria A]
3. 👤 **[Actor]** Confirma la solicitud de requerimientos.
4. ⚙️ **[Sistema]** Valida que la cantidad ingresada sea un número entero y no exceda el límite máximo permitido. [Trayectoria B] [Trayectoria C]
5. ⚙️ **[Sistema]** Asocia los requerimientos técnicos al evento y actualiza la información en la base de datos.
6. Notifica que los requerimientos se guardaron correctamente y regresa el control al caso de uso base (“Modificar detalles de un evento”).

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El Organizador decide no agregar requerimientos y presiona "Cancelar" o "Regresar”.
- ⚙️ **[Sistema]** **A-1** Descarta los datos introducidos que no hayan sido guardados.
- ⚙️ **[Sistema]** **A-2** Regresa a la pantalla principal de “Modificar detalles de un evento”.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El Organizador ingresa datos inválidos en el apartado de cantidad de computadoras a usar.
- ⚙️ **[Sistema]** **B-1** Muestra el MSG-03 "Datos inválidos o incompletos. Por favor, revisa tu solicitud."
- ⚙️ **[Sistema]** **B-2** Resalta los campos con errores.
- ⚙️ **[Sistema]** **B-3** Retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** El Organizador ingresa un número mayor al límite permitido.
- ⚙️ **[Sistema]** **C-1** Muestra el MSG-04 " La cantidad solicitada excede el límite disponible”.
- ⚙️ **[Sistema]** **C-2** Bloquea la acción de guardado y resalta el campo de captura.
- ⚙️ **[Sistema]** **C-3** Retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

