# Propuesta Y Soft: permisos por usuario, ubicación y operación

## Decisión de arquitectura

Y Soft no debe controlar el acceso con una condición aislada como `role == admin`. La autorización debe resolverse combinando **usuario, organización, rol, ubicación, operación, vigencia y estado**.

> La interfaz puede ocultar acciones, pero Firestore debe volver a comprobar quién es la persona, qué operación intenta realizar, sobre qué ubicación y si su permiso sigue vigente.

La decisión propuesta es que la ubicación determine el inventario operativo, mientras que la categoría permanezca como clasificación de catálogo. Un producto puede pertenecer a la ubicación `abarrotes`, `carnes`, `bebidas` o `almacen_principal`; una categoría como “abarrotes” no debe convertirse automáticamente en un permiso.

## Modelo de alcance

| Capa | Ejemplo | Función |
|---|---|---|
| Organización | `ysoft` | Aísla los datos de cada negocio. |
| Ubicación | `abarrotes`, `carnes`, `bebidas` | Define el inventario que el usuario puede consultar o modificar. |
| Rol | `administrador`, `cajero`, `capturista`, `almacen` | Agrupa capacidades generales, sin reemplazar el alcance por ubicación. |
| Permiso | `sale.capture`, `cash.collect`, `inventory.count` | Describe una operación específica. |
| Vigencia | Permanente o `inicio`/`fin` | Permite autorizaciones temporales sin convertir al usuario en administrador. |
| Sesión operativa | Caja principal o sesión auxiliar | Relaciona capturas y cobros con una jornada y una caja concreta. |

## Colecciones propuestas

Las rutas son una propuesta de nombres; no deben publicarse hasta aprobar la estructura y comprobar la compatibilidad con los documentos existentes.

| Colección | Documento y campos esenciales | Protección principal |
|---|---|---|
| `organizations/{orgId}` | Nombre, estado y parámetros generales. | Solo miembros activos; edición administrativa. |
| `organizations/{orgId}/locations/{locationId}` | Nombre, tipo, estado y responsable operativo. | Lectura según pertenencia; cambios administrativos. |
| `organizations/{orgId}/members/{uid}` | `role`, `status`, `locationIds`, `permanentPermissions`. | El rol y alcance se leen desde este documento confiable, no desde el navegador. |
| `organizations/{orgId}/permissionGrants/{grantId}` | `uid`, `permission`, `locationId`, `startsAt`, `endsAt`, `grantedBy`, `status`, `createdAt`. | Crear, revocar o modificar solo por un administrador autorizado. |
| `organizations/{orgId}/products/{productId}` | Producto, ubicación de inventario, código, unidad, precio y estado. | Lectura por ubicación; edición global o autorizada. |
| `organizations/{orgId}/auxiliarySessions/{sessionId}` | Caja principal, capturista, estado, inicio, fin y acumulados proyectados. | El titular captura; caja administra transferencia y cierre. |
| `organizations/{orgId}/captures/{captureId}` | Estado, `capturedBy`, `transferredToCash`, `locationId`, renglones y total estimado. | Capturista edita solo `borrador`; caja revisa lo transferido. |
| `organizations/{orgId}/sales/{saleId}` | Venta confirmada, caja, renglones inmutables, capturista, cajero y referencias. | Solo caja autorizada confirma; los hechos no se borran. |
| `organizations/{orgId}/inventoryMovements/{movementId}` | Producto, ubicación, cantidad firmada, referencia, motivo y usuario. | Se crea desde operaciones autorizadas; no se edita libremente. |
| `organizations/{orgId}/inventoryCounts/{countId}` | Conteo por ubicación, producto, cantidad física y estado. | Solo permiso de conteo en la ubicación; ajuste posterior separado. |
| `organizations/{orgId}/auditEvents/{eventId}` | Entidad, acción, usuario, antes/después resumido, motivo y fecha. | Solo escritura controlada por operaciones; no borrar ni editar. |

Los saldos y totales visibles son proyecciones. Las ventas confirmadas, pagos, movimientos de inventario, transferencias y eventos de auditoría son los hechos que deben conservarse.

## Permisos mínimos

| Permiso | Capturista | Cajero | Almacén | Administrador |
|---|---:|---:|---:|---:|
| `catalog.read` | Sí, según ubicación | Sí, según caja/ubicación | Sí, según ubicación | Sí |
| `sale.capture` | Sí, si está vigente | Opcional | No por defecto | Sí |
| `sale.transfer` | Sí, sobre su captura | Sí, según sesión | No por defecto | Sí |
| `sale.review` | No | Sí, sobre su caja | No | Sí |
| `cash.collect` | No | Sí, sobre su caja abierta | No | Sí |
| `inventory.count` | No por defecto | No por defecto | Sí, en ubicación autorizada | Sí |
| `inventory.adjust.request` | No por defecto | No por defecto | Puede solicitar | Sí |
| `inventory.adjust.approve` | No | No por defecto | No | Sí o supervisor autorizado |
| `inventory.global.read` | No | No | No | Sí o permiso explícito |
| `permission.grantTemporary` | No | No | No | Sí |

Una autorización temporal debe conceder una operación concreta, no un rol completo. Por ejemplo, `sale.capture` sobre `abarrotes` entre las 18:00 y las 22:00 no concede `cash.collect`, `inventory.global.read` ni acceso a `carnes`.

## Permisos temporales

Un permiso temporal propuesto tendría esta forma conceptual:

```text
permissionGrants/{grantId}
  uid: "uid-de-pedro"
  permission: "sale.capture"
  locationId: "abarrotes"
  startsAt: timestamp
  endsAt: timestamp
  grantedBy: "uid-del-administrador"
  status: "active"
  createdAt: timestamp
  revokedAt: null
  revokeReason: null
```

La regla debe considerar el permiso válido solo cuando el documento está activo, el usuario coincide, la ubicación coincide o está explícitamente autorizada y `request.time` se encuentra dentro del intervalo. La aplicación puede mostrar “Activo” o “Vencido”, pero la fecha confiable debe evaluarse en la regla y no depender del reloj del teléfono.

## Sesión auxiliar de captura

La sesión auxiliar no debe ser una caja y no debe crear ingresos. Su finalidad es agrupar capturas de un capturista para una caja principal.

| Elemento | Regla propuesta |
|---|---|
| Nombre operativo | `Sesión auxiliar de captura`, no “caja parcial”. |
| Titular | Un capturista identificado. |
| Destino | Una caja principal concreta, por ejemplo `Caja 01`. |
| Efecto durante captura | Crear o actualizar capturas pendientes; no crear venta, pago, crédito ni ingreso. |
| Transferencia | Bloquea la captura para el capturista y la entrega a la caja destino. |
| Cierre | Resume cantidad y total estimado; no confirma ventas automáticamente. |
| Auditoría | Conserva quién capturó, transfirió, revisó, autorizó y cobró. |

El flujo de estados recomendado es `borrador → transferida → en_revision → confirmada/rechazada`. La venta confirmada, el movimiento de inventario, el ingreso de caja o el crédito solo nacen en `confirmada`, mediante la operación autorizada por caja.

## Inventario por ubicación

Un usuario con ubicación `abarrotes` puede consultar y contar productos asignados a esa ubicación. Si escanea un producto de `carnes`, la interfaz puede mostrar el motivo, pero la denegación real debe ocurrir en Firestore.

El inventario global requiere `inventory.global.read` o un rol administrativo. Las operaciones globales —entradas de mercancía, transferencias entre ubicaciones, ajustes autorizados y correcciones— deben generar movimientos auditables y no deben depender de una categoría del producto.

## Matriz de decisiones para las reglas

| Pregunta que debe resolver Firestore | Resultado si falla |
|---|---|
| ¿La persona está autenticada? | Rechazar. |
| ¿Pertenece a la organización del documento? | Rechazar. |
| ¿Su perfil está activo? | Rechazar. |
| ¿Tiene el permiso permanente o temporal requerido? | Rechazar. |
| ¿El permiso cubre la ubicación del producto o la sesión? | Rechazar. |
| ¿El permiso temporal está vigente según hora del servidor? | Rechazar. |
| ¿La transición de estado es válida? | Rechazar. |
| ¿Está intentando editar un hecho confirmado? | Rechazar; usar reverso autorizado. |
| ¿La operación tiene identificador idempotente? | Rechazar o devolver el resultado existente. |
| ¿La operación crea stock, caja o cartera? | Exigir transacción y auditoría correspondientes. |

## Forma de la regla propuesta

La siguiente forma es una guía para revisión, no una versión lista para publicar. La implementación final deberá ajustarse a los nombres de colección y documentos existentes:

```text
isSignedIn()
isActiveMember(orgId)
hasLocation(orgId, locationId)
hasPermanentPermission(orgId, permission, locationId)
hasActiveTemporaryGrant(orgId, permission, locationId, request.time)
can(orgId, permission, locationId) =
  isActiveMember(orgId) &&
  (hasPermanentPermission(...) || hasActiveTemporaryGrant(...))
```

Para una captura, la regla debe exigir `sale.capture`, una ubicación autorizada y estado `borrador`; además, el usuario que escribe debe ser el `capturedBy` del documento. Para transferir, debe exigir `sale.transfer`, una caja destino válida y cambiar el estado de forma permitida. Para revisar o cobrar, debe exigir `sale.review` o `cash.collect`, que la caja coincida con la sesión y que la captura esté en `transferida` o `en_revision`.

La escritura de una venta confirmada no debe aceptar desde el cliente un `role`, `authorizedBy`, `cashierUid` o `stockAfter` arbitrario. Esos valores deben derivarse de la sesión autenticada, de la caja abierta y de la transacción que calcula el estado final.

## Riesgos y decisiones pendientes

Esta propuesta no decide impuestos, descuentos, límites de crédito, stock negativo, devoluciones, cancelaciones ni autorización de diferencias de caja. Tampoco activa todavía el permiso de supervisor. Esas políticas deben aprobarse antes de endurecer las reglas y probar escrituras reales.

La primera implementación debe probar por separado: usuario fuera de ubicación, permiso temporal vencido, capturista intentando cobrar, cajero intentando editar una venta confirmada, doble confirmación por red y ajuste de inventario sin permiso.

## Estado

Esta es una **propuesta de diseño**. No modifica reglas activas, no publica cambios en Firebase y no crea documentos reales. Requiere aprobación de nombres de colecciones, permisos, estados y relación entre sesiones auxiliares y cajas antes de convertirla en `firestore.rules`.
