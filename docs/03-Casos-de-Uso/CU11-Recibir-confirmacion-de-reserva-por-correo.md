---
caso_de_uso: "CU11"
nombre: "Recibir confirmación de reserva por correo"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU11: Recibir confirmación de reserva por correo

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: El asistente recibe por correo electrónico una confirmación de reserva junto con su pase de acceso al evento al que se haya registrado.

### 📋 Ficha de Especificación

| Caso de uso | CU-11 Recibir confirmación de reserva por correo |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Vazquez Perez Axel Daniel |
| Actor | Asistente |
| Propósito: | Permitir al asistente solicitar y recibir en su correo electrónico el comprobante de su reserva y su pase de acceso al evento. |
| Entradas: | El asistente ingresa su correo electrónico. |
| Salidas: | MSG-22 Correo enviado con éxito |
| Precondiciones: | El asistente debe tener su correo electrónico actualizado y disponible.<br>El asistente generó una reserva (CU10) |
| Postcondiciones: | - |
| Errores: | MSG-E-21: El correo no se pudo enviar inténtelo de nuevo más tarde.<br>MSG-E-22 Advertencia: Ingrese un correo valido. |
| Tipo: | Secundario inclusión del CU10 |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción “Enviar confirmación por correo” en la pantalla UI09 Boleto Digital y Código QR.
2. ⚙️ **[Sistema]** Valida el formato de la dirección de correo electrónico ingresada. [Trayectoria A]
3. ⚙️ **[Sistema]** Recopila la información de la reserva (ID, evento, horario, recinto).
4. ⚙️ **[Sistema]** Genera el pase digital y lo envía mediante el servicio de correo electrónico. [Trayectoria B]
5. ⚙️ **[Sistema]** Muestra el mensaje MSG-22: Correo enviado con éxito.
6. 👤 **[Actor]** Visualiza la notificación en pantalla.

*`----- Fin del caso de uso.`*

#### Trayectoria alternativa A:
> **Condición:** El usuario ingresa un correo con formato incorrecto.
- ⚙️ **[Sistema]** **A-1** Detecta un formato no válido.
- ⚙️ **[Sistema]** **A-2** Muestra el mensaje MSG-E-22 Advertencia: Ingrese un correo valido.
- ⚙️ **[Sistema]** **A-3** Mantiene la pantalla activa para que el asistente corrija el dato.
- ⚙️ **[Sistema]** **A-4** Continúa en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** Fallo de conexión o tiempo de espera agotado.
- ⚙️ **[Sistema]** **B-1** No logra completar la entrega del correo.
- ⚙️ **[Sistema]** **B-2** Muestra el mensaje MSG-E-21: El correo no se pudo enviar, intentelo de nuevo más tarde.
- ⚙️ **[Sistema]** **B-3** Permite al asistente reintentar o volver a la pantalla UI09 Boleto Digital y Código QR.

*`B-4 Fin del caso de uso.`*

*`----- Fin de trayectoria.`*

