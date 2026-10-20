---
caso_de_uso: "CU19"
nombre: "Escanear QR"
actor: "Personal de Logística"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU19: Escanear QR

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permite al personal de logística escanear un código QR de para denegar o validar el acceso de los asistentes

### 📋 Ficha de Especificación

| Caso de Uso | CU-19 Escanear QR |
| --- | --- |
| Resumen de Atributos |  |
| Autor: | Lorena Zuñiga Gonzalez |
| Actor: | Personal de Logística |
| Propósito: | Permitir al personal de logística escanear el código QR del asistente para permitir su acceso para un evento |
| Entradas: | Captura del QR mediante la cámara del dispositivo. |
| Salidas: | Confirmación de acceso mostrando en UI-20 Pantalla de Escáner QR el MSG 46 "Acceso válido" |
| Precondiciones: | Tener habilitado permisos para el acceso a la cámara del dispositivo<br>Estar previamente en la UI-19 Panel de Eventos Asignados<br>Tener vinculado el evento en el que se desea dar acceso mediante QR |
| Postcondiciones: | El sistema marcará el boleto correspondiente como “validado” |
| Errores: | El código no se reconoce por el sistema<br>El código QR ya ha sido validado con anterioridad |
| Tipo: | Secundario de CU 19 |

#### Trayectoria Principal
1. 👤 **[Actor]** Escanea el código QR brindado por el Asistente
2. ⚙️ **[Sistema]** Valida que el código QR sea reconocido por el sistema [Trayectoria A]
3. ⚙️ **[Sistema]** Valida que el código QR no haya sido validado con anterioridad [Trayectoria B]
4. ⚙️ **[Sistema]** Muestra en UI-20 Pantalla de Escáner QR el MSG 46 “Acceso Válido”

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El código no se reconoce por el sistema
⚙️ **[Sistema]** Muestra en UI-20 Pantalla de Escáner QR el MSG 47 “Acceso denegado, el código QR no ha sido reconocido por el sistema.”

*`----- Fin de trayectoria`*

#### Trayectoria alternativa B:
> **Condición:** El código ya se validó con anterioridad
⚙️ **[Sistema]** Muestra en UI-20 Pantalla de Escáner QR el MSG 48 “Acceso denegado, el código QR ya ha sido validado en el sistema.”

*`----- Fin de trayectoria`*

