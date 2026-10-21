---
caso_de_uso: "CU31"
nombre: "Emitir boletos directos"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU31: Emitir boletos directos (extend CU-25)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU25-Consultar-mis-eventos]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al Organizador emitir boletos directos asociados a nombre y correo para eventos que administra, sin enviar correos electrónicos y respetando las reservas ya existentes.

### 📋 Ficha de Especificación

| Caso de uso | CU-31 Emitir boletos directos (extend CU-25) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Por definir. |
| **Actor:** | Organizador. |
| **Propósito:** | Permitir al Organizador generar boletos individuales para destinatarios identificados por nombre y correo electrónico, únicamente en eventos que administra y tienen acceso mediante boleto, respetando aforo y unicidad de reservas. |
| **Entradas:** | • ID del evento aprobado administrado por el Organizador.<br>• Nombre y correo electrónico (institucional o externo) del destinatario del boleto.<br>• Confirmación de emisión del boleto directo. |
| **Salidas:** | • Boleto digital individual y su código QR de acceso vinculados al evento y destinatario.<br>• Registro del boleto en las reservas del evento.<br>• Mensaje `MSG-I-08` "Operación realizada con éxito.".<br>• Boleto consultable por el destinatario desde su cuenta en la aplicación; no se envía por correo. |
| **Precondiciones:** | • El Organizador ha iniciado sesión y tiene permisos sobre el evento, desde `CU-25` "Consultar mis eventos".<br>• El evento está aprobado, no ha concluido y tiene habilitado el acceso con boleto.<br>• El destinatario dispone de una cuenta activa: la excepción de `RN-05` para invitados sin cuenta corresponde únicamente a Subdirección. |
| **Postcondiciones:** | • Se registra un boleto activo individual y código QR válido de un solo uso.<br>• La suma de reservas y boletos directos no supera el cupo autorizado del recinto (`RN-07` y `RN-10`).<br>• No se genera un segundo boleto activo para el mismo destinatario y evento (`RN-08`).<br>• El boleto permanece disponible desde el apartado de la aplicación, sin envío de correo electrónico. |
| **Errores:** | • `MSG-E-11` por falta de nombre o correo.<br>• `MSG-E-21` cuando el correo no sea válido.<br>• `MSG-E-49` cuando no exista una cuenta activa para el destinatario.<br>• `MSG-E-48` si el destinatario ya tiene un boleto activo del evento.<br>• `MSG-E-03` o `MSG-E-05` cuando se alcance el límite de cupos.<br>• `MSG-E-07` si el evento no está habilitado.<br>• `MSG-E-08` por fallo al registrar el boleto. |
| **Tipo:** | Secundario; extiende el `CU-25` "Consultar mis eventos". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** El Organizador selecciona un evento aprobado desde `CU-25` "Consultar mis eventos" en `UI14` "Panel de Consulta de Mis Eventos" y abre `UI15` "Panel de Administración y Detalles del Evento".
2. 👤 **[Actor]** Selecciona `[Emitir boleto directo]` para el evento que administra.
3. ⚙️ **[Sistema]** Verifica que el evento admite acceso mediante boleto, sigue vigente y está bajo responsabilidad del Organizador. `[Trayectoria D]`
4. ⚙️ **[Sistema]** Solicita nombre y correo electrónico del destinatario.
5. 👤 **[Actor]** Captura los datos del invitado y selecciona `[Emitir boleto]`.
6. ⚙️ **[Sistema]** Valida los campos, el formato del correo y la existencia de una cuenta activa del destinatario. `[Trayectoria A]`
7. ⚙️ **[Sistema]** Comprueba que no exista otro boleto activo para ese destinatario y que la suma de entradas no supere el aforo permitido del evento. `[Trayectoria B]` `[Trayectoria C]`
8. ⚙️ **[Sistema]** Registra el boleto digital y genera un código QR único, con protección contra reutilización (`RN-11`). `[Trayectoria E]`
9. ⚙️ **[Sistema]** Muestra `MSG-I-08` "Operación realizada con éxito." y pone el boleto a disposición del destinatario en el apartado correspondiente de la aplicación.
10. 👤 **[Actor]** El Organizador puede volver a emitir boletos para otros destinatarios mientras existan cupos.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Datos o destinatario inválidos
> **Condición:** En el paso 6 faltan datos, el correo es inválido o no corresponde a una cuenta activa.
- **A-1.** ⚙️ **[Sistema]** Muestra `MSG-E-11` si faltan campos, `MSG-E-21` si el correo es incorrecto o `MSG-E-49` si la cuenta no existe o está inactiva.
- **A-2.** ⚙️ **[Sistema]** Mantiene los datos capturados para su corrección, sin generar boleto.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Boleto duplicado
> **Condición:** En el paso 7 el destinatario ya tiene una reserva o boleto activo para el evento.
- **B-1.** ⚙️ **[Sistema]** Muestra `MSG-E-48` "El destinatario ya cuenta con un boleto activo para este evento.".
- **B-2.** ⚙️ **[Sistema]** No genera un boleto duplicado y permite indicar otro destinatario.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Evento sin cupo
> **Condición:** En el paso 7 la emisión superaría la capacidad autorizada.
- **C-1.** ⚙️ **[Sistema]** Muestra `MSG-E-03` "La cantidad solicitada excede el límite disponible." o `MSG-E-05` "Evento sin lugares disponibles.".
- **C-2.** ⚙️ **[Sistema]** Impide emitir el boleto, sin modificar reservas anteriores.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Evento no habilitado para emisión
> **Condición:** En el paso 3 el evento no está aprobado, concluyó, fue cancelado o no requiere boletos.
- **D-1.** ⚙️ **[Sistema]** Impide la emisión y muestra `MSG-E-07` "Evento finalizado o inactivo." cuando el evento no está disponible, o indica en pantalla que el evento no tiene acceso con boleto.
- **D-2.** ⚙️ **[Sistema]** Regresa a `UI15` sin generar boletos.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Error al emitir boleto
> **Condición:** En el paso 8 no puede guardarse el boleto o generarse el QR.
- **E-1.** ⚙️ **[Sistema]** Muestra `MSG-E-08` por falla de base de datos o `MSG-E-26` "No fue posible generar el código QR. Intenta nuevamente." según corresponda.
- **E-2.** ⚙️ **[Sistema]** No confirma emisión hasta que el boleto y QR estén registrados correctamente.

*`----- Fin de trayectoria.`*

