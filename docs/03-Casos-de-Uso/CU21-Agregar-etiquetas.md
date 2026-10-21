---
caso_de_uso: "CU21"
nombre: "Agregar etiquetas"
actor: "Asistente (Organizador del evento solicitado)"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU21: Agregar etiquetas (extend CU-20)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU20-Solicitar-evento]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al Asistente agregar etiquetas temáticas y áreas de conocimiento para clasificar un evento que está solicitando, mediante un flujo opcional que no crea otra solicitud.

### 📋 Ficha de Especificación

| Caso de uso | CU-21 Agregar etiquetas (extend de CU-20) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Por definir. |
| **Actor:** | Asistente (Organizador del evento solicitado). |
| **Propósito:** | Permitir al actor incorporar etiquetas o áreas de conocimiento a un evento para clasificarlo dentro de la plataforma, durante el registro de la solicitud o su edición autorizada. |
| **Entradas:** | • ID del evento en elaboración o ya registrado.<br>• Etiquetas temáticas o áreas de conocimiento seleccionadas. |
| **Salidas:** | • Pantalla `UI30` "Agregar Etiquetas al Evento".<br>• Etiquetas asociadas al evento.<br>• Mensaje `MSG-I-12` "Operación exitosa al asignar las etiquetas del evento.". |
| **Precondiciones:** | • El actor ha iniciado el `CU-20` "Solicitar evento" o está editando un evento del que es Organizador.<br>• La solicitud o evento pertenece al actor. |
| **Postcondiciones:** | • Las etiquetas válidas quedan relacionadas con el evento.<br>• No se modifican los horarios, recinto o estado de aprobación del evento. |
| **Errores:** | • `MSG-E-16` cuando el formato de una etiqueta no sea válido.<br>• `MSG-E-17` cuando se supere el número máximo permitido de etiquetas.<br>• `MSG-E-08` ante error de base de datos. |
| **Tipo:** | Secundario, extiende al `CU-20` "Solicitar evento". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** El Asistente selecciona `[Agregar etiquetas]` durante la solicitud del evento en `UI07` "Formulario de Solicitud de Evento".
2. ⚙️ **[Sistema]** Muestra `UI30` "Agregar Etiquetas al Evento" con las etiquetas disponibles.
3. 👤 **[Actor]** Selecciona una o más etiquetas temáticas o áreas de conocimiento relacionadas con su evento.
4. ⚙️ **[Sistema]** Comprueba que el formato y la cantidad de etiquetas sean válidos. `[Trayectoria A]` `[Trayectoria B]`
5. 👤 **[Actor]** Confirma la selección mediante `[Guardar etiquetas]`.
6. ⚙️ **[Sistema]** Vincula las etiquetas con la solicitud y conserva los datos ya introducidos. `[Trayectoria C]`
7. ⚙️ **[Sistema]** Muestra `MSG-I-12` "Operación exitosa al asignar las etiquetas del evento." y regresa a `UI07` para continuar con `CU-20`.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Formato de etiqueta inválido
> **Condición:** En el paso 4 una etiqueta no cumple con el formato permitido.
- **A-1.** ⚙️ **[Sistema]** Muestra `MSG-E-16` "Formato de etiqueta inválido. Por favor, verifique los caracteres ingresados.".
- **A-2.** ⚙️ **[Sistema]** Conserva las etiquetas válidas y permite corregir la que produjo el error.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Se supera el límite de etiquetas
> **Condición:** En el paso 4 la selección rebasa el máximo de etiquetas configurado.
- **B-1.** ⚙️ **[Sistema]** Muestra `MSG-E-17` "Límite de etiquetas excedido. No es posible asignar más etiquetas a este evento.".
- **B-2.** ⚙️ **[Sistema]** Solicita quitar etiquetas hasta cumplir con el límite y retoma el paso 4.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Error al guardar las etiquetas
> **Condición:** En el paso 6 no puede almacenarse la selección.
- **C-1.** ⚙️ **[Sistema]** Muestra `MSG-E-08` "Error de conexión con la base de datos.".
- **C-2.** ⚙️ **[Sistema]** Mantiene `UI30` con las etiquetas elegidas para intentar guardar de nuevo.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Cancelar selección de etiquetas
> **Condición:** El actor decide no agregar etiquetas antes de guardar.
- **D-1.** 👤 **[Actor]** Selecciona `[Cancelar]` y vuelve a `UI07`.
- **D-2.** ⚙️ **[Sistema]** La solicitud conserva sus datos previos, sin asignar las etiquetas descartadas.

*`----- Fin de trayectoria.`*

