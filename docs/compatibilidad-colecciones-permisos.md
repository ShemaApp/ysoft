# Y Soft: compatibilidad entre colecciones y permisos

## Propósito

Este documento cruza la referencia guardada de tablas y sugerencias con la propuesta de permisos por **organización, usuario, ubicación, operación y vigencia**. El objetivo es decidir qué sirve para la primera arquitectura real de Y Soft, qué necesita una adaptación y qué debe quedar archivado para una fase futura.

La referencia aporta una decisión central que se conserva:

> Producto → Ubicación → Existencia → Movimiento → Operación → Usuario → Permiso → Auditoría.

También se conservan estas separaciones: **producto no es stock**, **categoría no es ubicación**, **captura no es venta**, **conteo no es ajuste**, y **movimiento histórico no se borra**.

## Convención de implementación

Para que las reglas puedan aislar organizaciones y evaluar permisos, la forma recomendada es:

```text
organizations/{orgId}/...
```

No se recomienda dejar colecciones operativas globales como `products`, `sales` o `users` sin `orgId` comprobable. En Firestore, las rutas propuestas se acompañan de documentos de membresía y permisos que la regla puede leer sin confiar en campos enviados por el cliente.

## Clasificación ejecutiva

| Grupo | Decisión | Qué significa |
|---|---|---|
| **Integrar ahora** | Núcleo operativo y de seguridad | Necesario para capturas, ventas, caja, inventario, clientes, abonos y auditoría. |
| **Integrar con adaptación** | Compatible, pero requiere una decisión de modelo o política | Se puede preparar sin activarlo completamente o debe cambiar de nombre/ruta. |
| **Archivar para futuro** | No se elimina; queda documentado | Aporta crecimiento, pero no debe introducir reglas o campos sin política aprobada. |

## 1. Identidad, organización y permisos

| Referencia guardada | Decisión | Qué sirve, por qué y cómo |
|---|---|---|
| `businesses` | **Integrar con adaptación** | Sirve como aislamiento del negocio. Se recomienda `organizations/{orgId}` para que todas las reglas validen pertenencia antes de leer o escribir. |
| `users` | **Integrar con adaptación** | Sirve para perfil operativo. Se implementa como `organizations/{orgId}/members/{uid}` con `status`, `role`, `locationIds` y permisos permanentes. El UID de Authentication sigue siendo la identidad primaria. |
| `roles` | **Archivar para futuro** | El concepto es útil, pero un catálogo de roles por sí solo no debe conceder acceso. Inicialmente se usan roles explícitos y permisos comprobables; más adelante puede existir un catálogo administrable. |
| `permissions` | **Integrar con adaptación** | Los nombres de permiso sí sirven. Se implementan como claves controladas, por ejemplo `sale.capture`, `sale.transfer`, `sale.review`, `cash.collect`, `inventory.count` e `inventory.adjust.request`. |
| `user_permissions` | **Reemplazar por dos capas** | La idea sirve, pero una tabla plana no expresa bien ubicación y vigencia. Se divide en `members.permanentPermissions` y `permissionGrants` con `uid`, operación, ubicación, inicio, fin, autorizador y estado. |
| `user_locations` | **Integrar con adaptación** | Sirve para alcance por ubicación. Se recomienda guardar `locationIds` o una subcolección de asignaciones con capacidades explícitas, sin confiar únicamente en `defaultLocationId`. |
| `permissionGrants` | **Añadir al núcleo** | Es necesaria para permisos temporales. Solo un administrador autorizado puede crear, revocar o modificar una concesión; las reglas deben evaluar `request.time` contra la vigencia. |

### Implementación de seguridad

La regla debe comprobar autenticación, miembro activo, organización, ubicación y permiso. El rol es una fuente de agrupación, pero no debe permitir por sí mismo una operación que no esté autorizada. Un permiso temporal como `sale.capture` para `abarrotes` no debe otorgar `cash.collect`, acceso global ni acceso a otra ubicación.

## 2. Ubicaciones, cajas y sesiones

| Colección | Decisión | Implementación compatible |
|---|---|---|
| `locations` | **Integrar ahora** | `organizations/{orgId}/locations/{locationId}`. Es el alcance del inventario y de muchas operaciones. Categoría y ubicación permanecen separadas. |
| `registers` | **Integrar ahora** | Representa una caja física o lógica, como `Caja 01`. Debe relacionarse con una ubicación y un estado operativo. |
| `cash_sessions` | **Integrar ahora** | Representa la jornada de una caja, con apertura, responsable, estado y cierre. El cajero confirma ventas y cobros únicamente en una sesión válida. |
| `cash_movements` | **Integrar ahora** | Historial inmutable de cobros, abonos, retiros, devoluciones y otros movimientos permitidos. Requiere permiso y referencia de origen. |
| `cash_transfers` | **Integrar con adaptación** | Sirve para transferencias entre cajas o ubicaciones, pero requiere una política explícita de autorización y conciliación antes de activarse. |
| `auxiliarySessions` | **Añadir al núcleo de captura** | No es una caja parcial. Agrupa capturas de un capturista y las dirige a una caja principal sin crear ingresos ni ventas. |

## 3. Catálogo de productos

| Colección | Decisión | Implementación compatible |
|---|---|---|
| `products` | **Integrar ahora** | Producto maestro con `productType`, unidades, categoría, marca, banderas de control, estado y auditoría. No debe contener el stock actual como única fuente. |
| `product_variants` | **Integrar con adaptación** | Sirve para talla, color, presentación o modelo. Puede quedar preparada, pero no debe complicar la venta básica hasta que se confirme si Y Soft venderá variantes. |
| `product_attributes` / `product_attribute_values` | **Archivar para futuro** | Son útiles para un catálogo muy genérico, pero en la primera fase pueden aumentar la complejidad sin una necesidad operativa aprobada. |
| `product_barcodes` | **Integrar ahora** | Permite varios códigos por producto y soporta el escaneo. Debe resolver el producto dentro de la organización y respetar la ubicación autorizada. |
| `categories` | **Integrar ahora** | Clasifica el catálogo. No concede permiso ni define automáticamente dónde está el producto. |
| `brands` | **Integrar con adaptación** | Útil para búsqueda y reportes, pero no es requisito para autorizar capturas o cobros. |
| `units` | **Integrar ahora** | Necesario para que el campo libre de cantidad tenga una unidad clara. Debe validar enteros, decimales y cantidades por peso según el producto. |
| `unit_conversions` | **Integrar con adaptación** | Sirve para cajas, piezas, kilogramos y litros, pero requiere aprobar reglas de redondeo y conversión antes de afectar stock. |

La propuesta de productos con `trackInventory`, `trackLot`, `trackExpiration`, `trackSerial`, `isWeighted`, `allowSale` y `allowPurchase` es compatible y recomendable. Estas banderas describen el control del artículo; no deben inventar políticas de impuestos, crédito o devoluciones.

## 4. Precios y políticas comerciales

| Colección | Decisión | Qué queda pendiente |
|---|---|---|
| `price_lists` | **Archivar para futuro** | Puede soportar público, mayorista y distribuidor, pero antes se debe decidir quién puede seleccionar una lista y en qué ubicación. |
| `product_prices` | **Integrar con adaptación** | Es preferible a un único `product.price` cuando existan listas o vigencias. Para la primera venta puede conservarse un precio vigente claramente identificado. |
| `tax_profiles` | **Archivar para futuro** | No se deben activar impuestos ni tasas sin la política confirmada por el usuario. El campo puede quedar reservado, no aplicado. |
| `discounts` / `promotions` | **Archivar para futuro** | Requieren reglas de autorización, vigencia, acumulación y auditoría. No deben aparecer como permisos implícitos del capturista o cajero. |

## 5. Inventario y trazabilidad

| Colección | Decisión | Implementación compatible |
|---|---|---|
| `inventory_balances` | **Integrar ahora** | Fotografía actual por producto y ubicación. Se actualiza dentro de una transacción autorizada; no reemplaza el historial. |
| `inventory_movements` | **Integrar ahora** | Libro histórico inmutable. Cada venta confirmada, entrada, ajuste o transferencia autorizada genera un movimiento con origen, usuario, ubicación y cantidad firmada. |
| `inventory_counts` | **Integrar ahora** | Cabecera de un conteo por ubicación, responsable, fecha y estado. El conteo no modifica directamente el stock. |
| `inventory_count_items` | **Integrar ahora** | Detalla sistema, contado y diferencia. La diferencia pasa por revisión y autorización antes de crear un ajuste. |
| `inventory_transfers` / `inventory_transfer_items` | **Integrar con adaptación** | Son compatibles con múltiples ubicaciones, pero requieren permiso de origen y destino, cantidades, estados y autorización de ambos lados. |
| `inventory_adjustments` | **Integrar con adaptación** | Debe ser solicitud o resultado de una autorización, no un cambio directo desde cualquier formulario. Necesita motivo, dirección, usuario y referencia de conteo o devolución. |
| `lots` | **Archivar para futuro** | Aporta trazabilidad de caducidad y retiros, pero requiere confirmar productos por lote, entradas, salidas y política de caducidad. |
| `serial_numbers` | **Archivar para futuro** | Solo se activa cuando existan artículos serializados; no debe obligar a capturar una serie para productos comunes. |

La secuencia compatible es `conteo → diferencia → revisión → autorización → ajuste → movimiento`. El stock negativo, los redondeos y la autorización de diferencias siguen pendientes.

## 6. Compras y proveedores

| Colección | Decisión | Motivo |
|---|---|---|
| `suppliers` | **Archivar para futuro** | Es necesario para compras y lotes, pero no para capturar, transferir y cobrar ventas actuales. |
| `purchase_orders` | **Archivar para futuro** | Una orden no significa que la mercancía haya llegado; se activa cuando exista el flujo de compras. |
| `purchase_receipts` / `purchase_receipt_items` | **Archivar para futuro** | Son correctos para recepción parcial y entrada a ubicación, pero requieren un módulo de compras y permisos separados. |

Archivar no significa eliminar. Estos nombres quedan disponibles para una fase de abastecimiento, sin incorporarlos a las reglas actuales de ventas o caja.

## 7. Captura pendiente y venta confirmada

| Colección | Decisión | Implementación compatible |
|---|---|---|
| `sale_captures` | **Integrar ahora** | Captura borrador o transferida. El capturista puede escanear, buscar y modificar mientras está en `DRAFT` o `CAPTURING`; después de transferir queda bloqueada para él. |
| `sale_capture_items` | **Integrar ahora** | Renglones con producto, unidad y cantidad de escritura libre validada. No crean pagos ni movimiento de caja. |
| `sales` | **Integrar ahora, separada** | La venta nace cuando la caja revisa y autoriza. No se debe convertir automáticamente una captura en venta. |
| `sale_items` | **Integrar ahora** | Renglones inmutables de la venta confirmada, derivados de la captura revisada. |
| `sale_payments` | **Integrar ahora con políticas pendientes** | Registra el cobro cuando la caja autoriza. La forma de pago y el crédito deben obedecer decisiones todavía no confirmadas. |

Los estados recomendados son `DRAFT → CAPTURING → TRANSFERRED → UNDER_REVIEW → MODIFIED → AUTHORIZED → COMPLETED`, con `CANCELLED` o `EXPIRED` solo cuando exista una política de cancelación. `AUTHORIZED` no debe confundirse con “cobrado” si la operación de pago aún no terminó.

## 8. Clientes, crédito y abonos

| Colección | Decisión | Implementación compatible |
|---|---|---|
| `customers` | **Integrar ahora** | Identidad y datos del cliente dentro de la organización. Lectura y edición según permiso. |
| `customer_accounts` | **Integrar ahora con adaptación** | Cuenta o saldo proyectado del cliente. No debe ser la única fuente de verdad; se reconstruye a partir de ventas a crédito y pagos. |
| `customer_credit_limits` | **Archivar para futuro** | La colección sirve, pero el límite de crédito fue declarado pendiente. No se debe imponer ni mostrar como regla activa. |
| `customer_payments` | **Integrar ahora** | Historial inmutable de abonos, con referencia a la cuenta, usuario, caja y operación. Debe coincidir con el movimiento de caja. |

El permiso `credit.apply` y la autorización de una venta a crédito se mantienen separados de `cash.collect` hasta que se aprueben las políticas de crédito, límites, vencimientos y cancelaciones.

## 9. Devoluciones y auditoría

| Colección | Decisión | Motivo |
|---|---|---|
| `returns` / `return_items` | **Integrar con adaptación o archivar temporalmente** | La estructura sirve para relacionar una devolución con una venta de origen. No debe activarse como ajuste libre hasta aprobar reglas de devolución, autorización y efecto sobre caja. |
| `audit_logs` | **Integrar ahora** | Es obligatorio para permisos y trazabilidad. Debe registrar usuario, operación, entidad, ubicación, autorizador, motivo, referencia y fecha; no debe borrarse ni editarse. |
| `notifications` | **Integrar con adaptación** | Sirve para avisar capturas transferidas, errores y vencimientos. Inicialmente puede ser una notificación de interfaz; una colección persistente requiere decidir retención y lectura por usuario. |
| `system_settings` | **Archivar para futuro** | Puede centralizar parámetros, pero al principio aumenta el riesgo de que una configuración cambie reglas sensibles sin auditoría. |

## Entidades que no deben mezclarse

| Mezcla incorrecta | Solución documentada |
|---|---|
| `products.stock` como fuente única | Separar `products`, `inventory_balances` e `inventory_movements`. |
| `categoryId` usado como permiso | Mantener categoría de catálogo y `locationId` de operación como campos independientes. |
| `sale_captures` convertida automáticamente en `sales` | Exigir transferencia, revisión y autorización de caja. |
| `inventory_counts` que modifica stock directamente | Crear diferencia, revisión, autorización y luego ajuste/movimiento. |
| `customer.balance` como única verdad | Conservar ventas a crédito y pagos; el saldo es una proyección verificable. |
| `role` enviado desde la interfaz | Derivar el rol y permisos desde `members` y `permissionGrants` leídos por las reglas. |
| Permiso temporal igual a administrador | Conceder operación, ubicación y vigencia concretas, con autorizador y revocación. |

## Orden recomendado de implementación

| Fase | Entidades | Resultado |
|---:|---|---|
| 1 | `organizations`, `members`, `locations`, `permissionGrants` | Identidad, alcance y permisos verificables. |
| 2 | `products`, `product_barcodes`, `categories`, `units`, `inventory_balances` | Catálogo escaneable e inventario consultable por ubicación. |
| 3 | `auxiliarySessions`, `sale_captures`, `sale_capture_items` | Capturista puede capturar y transferir sin cobrar. |
| 4 | `registers`, `cash_sessions`, `sales`, `sale_items`, `sale_payments`, `cash_movements` | Caja revisa, autoriza y cobra con trazabilidad. |
| 5 | `inventory_counts`, `inventory_count_items`, `inventory_adjustments`, `inventory_movements` | Conteo, revisión y ajuste controlado. |
| 6 | `customers`, `customer_accounts`, `customer_payments` | Cartera y abonos vinculados a caja. |
| 7 | Variantes, lotes, series, compras, precios múltiples, impuestos, promociones y devoluciones | Ampliaciones posteriores con políticas aprobadas. |

## Qué queda archivado y cómo encontrarlo

Las entidades clasificadas como “archivadas para futuro” no se consideran inútiles. Quedan fuera del primer despliegue porque requieren políticas, más reglas o una necesidad operativa todavía no aprobada. Se conservan en la referencia original `docs/referencia-tablas-sugerencias.txt` y en este documento para retomarlas por módulo: catálogo avanzado, compras, lotes/series, precios comerciales, impuestos, promociones, crédito y devoluciones.

## Estado de esta revisión

Esta matriz es una **decisión de modelado previa a implementación**. No cambia `firestore.rules`, no crea colecciones reales y no publica nada en Firebase. Para convertirla en código faltan tres aprobaciones: el nombre final de las rutas, la política de permisos temporales y las reglas pendientes de crédito, impuestos, stock negativo y devoluciones.
