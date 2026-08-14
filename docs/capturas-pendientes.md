# Y Soft: Captura pendiente y transferencia a caja

## Decisión operativa

Y Soft no modelará este flujo como una caja auxiliar, una venta parcial ni un permiso temporal de venta. Se modelará como una **captura de pedido/venta pendiente** que se transfiere a una caja para revisión y confirmación financiera.

> Capturar no significa vender. Transferir no significa cobrar. La venta confirmada nace únicamente cuando el cajero revisa, autoriza y cobra.

El flujo oficial será:

`Capturista → Captura pendiente → Transferencia → Revisión de caja → Confirmación de venta`

## Roles y límites

| Rol | Puede hacer | No puede hacer dentro de este flujo |
|---|---|---|
| Capturista | Buscar o escanear productos, agregar renglones, escribir cantidades, revisar su captura y transferirla a una caja destino. | Cobrar, autorizar la venta, confirmar financieramente, registrar ingreso de caja o modificar una captura ya transferida. |
| Cajero | Ver capturas transferidas a su caja, revisar renglones, agregar o quitar productos, cambiar cantidades, decidir la forma de pago, autorizar y cobrar. | Editar hechos de ventas ya confirmadas sin un flujo de reverso autorizado. |
| Supervisor | Rol reservado para futuras autorizaciones excepcionales. | No se activa en esta primera versión sin una regla de negocio aprobada. |

## Estados del documento

| Estado | Descripción | Responsable de la transición |
|---|---|---|
| `borrador` | Captura abierta que todavía puede editar el capturista. | Capturista |
| `transferida` | Captura enviada a una caja; queda bloqueada para el capturista. | Capturista al transferir |
| `en_revision` | El cajero abrió la captura para verificar productos y cantidades. | Cajero |
| `rechazada` | La caja devuelve la captura con un motivo; no crea venta ni movimiento de caja. | Cajero |
| `confirmada` | El cajero autorizó y cobró; referencia una venta confirmada. | Cajero |
| `cancelada` | La captura se cierra sin convertirse en venta, conservando motivo y auditoría. | Rol autorizado pendiente de confirmar |

No se permitirá editar silenciosamente una captura transferida. Las modificaciones del cajero se registrarán como una revisión con responsable, fecha/hora y resumen de cambios; la venta confirmada usará la revisión final.

## Datos que deben conservarse

La cabecera de `capturasPendientes/{capturaId}` conservará la organización, ubicación, caja destino, estado, cantidad de productos, total estimado, responsable de captura, responsable de transferencia, responsable de revisión, responsable de autorización/cobro, fechas de cada transición, motivo de rechazo o cancelación y la referencia `ventaId` cuando exista.

Cada renglón conservará el producto, código, nombre de catálogo al momento de capturar, cantidad escrita libremente, unidad y datos de referencia necesarios para que el cajero pueda revisar. El precio y el total se tratarán como **estimados hasta la revisión de caja**, sin fijar todavía impuestos, descuentos ni políticas de precio no confirmadas.

La revisión final conservará quién la creó, qué renglones agregó, quitó o modificó y cuál fue la versión usada para crear la venta. La confirmación será la única transición que cree la venta, el descuento de inventario, el movimiento de caja o el crédito correspondiente según la política elegida.

## Pantallas aprobadas para bosquejar

### Teléfono del capturista

La pantalla principal se llamará **Nueva captura**. La acción principal será **Buscar / escanear**. El listado se titulará **Productos capturados** y mostrará producto, cantidad y unidad. El cierre de la captura mostrará cantidad de productos y total estimado, seguido de **Transferir a caja**.

Después de transferir, la pantalla mostrará `Captura enviada a Caja 01`, el identificador de captura y un estado bloqueado. No aparecerán las palabras **Vender**, **Cobrar**, **Autorizar** ni botones de confirmación financiera.

### Teléfono del cajero

La entrada de caja se titulará **Capturas pendientes**. Cada tarjeta mostrará identificador, capturista, fecha/hora, número de productos, total estimado y botón **Revisar**.

Dentro de la captura, el cajero verá los renglones, el subtotal estimado, la posibilidad de **Agregar producto**, **Modificar** y escribir cantidades libremente. El CTA final será **Autorizar y cobrar**. Al terminar, la captura quedará ligada a la venta confirmada y a la caja que efectuó el cobro.

## Criterios de aceptación antes de implementar

| Escenario | Resultado esperado |
|---|---|
| Capturista agrega cuatro productos | Se crea o actualiza una captura en estado `borrador`; no hay venta ni movimiento de caja. |
| Capturista transfiere | La captura pasa a `transferida`, queda bloqueada para él y aparece en la caja destino. |
| Cajero modifica cantidad | Se registra una revisión; el capturista no puede sobrescribirla. |
| Cajero rechaza | La captura pasa a `rechazada` con motivo; no se crea venta, caja ni descuento de inventario. |
| Cajero autoriza y cobra | En una operación idempotente se crea la venta confirmada y sus hechos relacionados; la captura queda `confirmada`. |
| Se repite el envío o cobro por red | No se duplican venta, inventario, caja ni auditoría. |

Las políticas de impuestos, crédito, límites, stock negativo, descuentos, devoluciones y cancelación permanecen pendientes y no se asumirán en el bosquejo ni en la primera implementación.
