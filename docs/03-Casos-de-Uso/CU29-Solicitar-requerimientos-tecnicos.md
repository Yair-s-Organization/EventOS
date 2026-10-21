---
caso_de_uso: "CU29"
nombre: "Solicitar requerimientos técnicos"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU29: Solicitar requerimientos técnicos (extend CU-27)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU27-Modificar-detalles-de-un-evento]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al usuario solicitar el equipo de cómputo necesario para llevar a cabo su evento en el laboratorio.

### 📋 Ficha de Especificación

| Caso de uso | CU-29 Solicitar requerimientos técnicos (extend CU-27) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Arciniega Valdez Yair Emmanuel |
| **Actor:** | Organizador |
| **Propósito:** | Registrar la cantidad de computadoras necesarias para el evento, garantizando que no se supere la capacidad instalada. |
| **Entradas:** | • Cantidad entera de computadoras a solicitar. |
| **Salidas:** | • El sistema muestra `MSG-I-08` "Operación realizada con éxito."<br>• El sistema muestra la `UI15` "Panel de Administración y Detalles del Evento". |
| **Precondiciones:** | • El usuario se encuentra en la `UI17` "Catálogo de Requerimientos Técnicos".<br>• El evento está configurado para realizarse en un espacio tipo laboratorio. |
| **Postcondiciones:** | • La cantidad de computadoras solicitadas se asocia al evento y se guarda permanentemente en la base de datos. |
| **Errores:** | • `MSG-E-02`: "Cantidad inválida. Ingrese un número entero válido."<br>• `MSG-E-03`: "La cantidad solicitada excede el límite disponible." |
| **Tipo:** | Secundario para el organizador, viene de `CU-27` "Modificar detalles de un evento". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Muestra el catálogo de requerimientos técnicos (`UI17`, equipos de cómputo disponibles).
2. 👤 **[Actor]** Selecciona y/o ingresa la cantidad de computadoras necesarias para su actividad. `[Trayectoria A]`
3. 👤 **[Actor]** Confirma la solicitud de requerimientos.
4. ⚙️ **[Sistema]** Valida que la cantidad ingresada sea un número entero y no exceda el límite máximo permitido. `[Trayectoria B]` `[Trayectoria C]`
5. ⚙️ **[Sistema]** Asocia los requerimientos técnicos al evento y actualiza la información en la base de datos.
6. ⚙️ **[Sistema]** Notifica que los requerimientos se guardaron correctamente (`MSG-I-08`) y regresa el control al caso de uso base (`CU-27` "Modificar detalles de un evento").

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Cancelar solicitud de requerimientos
> **Condición:** El Organizador decide no agregar requerimientos y presiona "Cancelar" o "Regresar".
- **A-1.** ⚙️ **[Sistema]** Descarta los datos introducidos que no hayan sido guardados.
- **A-2.** ⚙️ **[Sistema]** Regresa a `UI15` "Panel de Administración y Detalles del Evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Cantidad inválida
> **Condición:** El Organizador ingresa datos inválidos en el apartado de cantidad de computadoras a usar.
- **B-1.** ⚙️ **[Sistema]** Muestra el `MSG-E-02` "Cantidad inválida. Ingrese un número entero válido.".
- **B-2.** ⚙️ **[Sistema]** Resalta los campos con errores.
- **B-3.** ⚙️ **[Sistema]** Retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Cantidad excede el límite disponible
> **Condición:** El Organizador ingresa un número mayor al límite permitido.
- **C-1.** ⚙️ **[Sistema]** Muestra el `MSG-E-03` "La cantidad solicitada excede el límite disponible.".
- **C-2.** ⚙️ **[Sistema]** Bloquea la acción de guardado y resalta el campo de captura.
- **C-3.** ⚙️ **[Sistema]** Retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

