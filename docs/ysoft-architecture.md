# Arquitectura de Y Soft

Y Soft es una PWA estática para la operación diaria de una distribuidora. Usa HTML, CSS y JavaScript sin proceso de build; React y Firebase se cargan desde CDN. No incorpora backend propio y el repositorio es una copia de trabajo separada de producción.

## Estructura

La aplicación se organiza en `servicios/`, `componentes/` y `pantallas/`. `app.js` compone la navegación; `permisos.js` mantiene la matriz de interfaz; `firebase-init.js` concentra la configuración pública; `firestore.rules` mantiene el bloqueo de seguridad inicial.

## Navegación

Ventas y Caja son las zonas primarias porque concentran los movimientos diarios. Inventario, Productos, Clientes, Créditos, Reportes, Devoluciones y Ajustes y Configuración están disponibles desde Más.

## Transacciones críticas

Una venta no se edita para simular una devolución. Un abono no altera inventario. Un cierre de caja concilia movimientos y no cambia una venta. Un ajuste de stock requiere motivo, autorización y movimiento auditable. Las escrituras reales permanecen bloqueadas hasta configurar Firebase y aprobar reglas.

## Decisiones pendientes

Impuestos, redondeos, moneda, límites y vencimientos de crédito, intereses, stock negativo, método de costeo, descuentos, devoluciones, anulaciones, cajas compartidas, transferencias y permisos finales siguen pendientes de confirmación.
