# Verificación de preview de Y Soft

## Resultado

La copia del repositorio monta correctamente en un servidor estático temporal y muestra el título `Y Soft · Operación diaria`. El modo de revisión local comunica que no se escriben ventas ni saldos en Firestore mientras la configuración está vacía.

La pantalla inicial presenta Ventas y Caja como acciones principales. La navegación inferior contiene `Vender`, `Caja` y `Más`. El menú `Más` muestra Inicio, Inventario, Clientes, Reportes, Devoluciones y ajustes y Configuración, además de un control visible para alternar entre modo claro y oscuro.

La vista se observa legible en el viewport de revisión y no se detectaron referencias residuales a Bodega Editorial, Distribuidora o al recurso gráfico anterior durante la comprobación de texto del repositorio.

También se verificó el modo oscuro desde Más: la interfaz conserva el fondo carbón verdoso, el verde de crecimiento y la jerarquía de estados. Desde ese modo se abrió Ventas mediante la navegación inferior; el catálogo, carrito, selector Contado/A crédito y el aviso de impuestos pendientes permanecieron disponibles.

En Ventas se agregó Arroz Premium 5 kg al carrito y se confirmó una venta de contado. La app volvió al Inicio y mostró `Venta de contado preparada en modo revisión · $ 18.500`; no se habilitó una escritura real en Firestore.
