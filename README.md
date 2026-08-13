# Y Soft

PWA estática para la operación diaria de una tienda distribuidora. La navegación principal concentra **Ventas** y **Caja**; Inventario, Productos, Clientes, Créditos, Reportes y operaciones protegidas están disponibles desde **Más**.

## Stack y límites

El proyecto usa HTML, CSS y JavaScript sin proceso de build. React y Firebase se cargan mediante CDN. No incluye backend propio. La configuración Firebase se completa en `firebase-init.js` y las reglas iniciales de `firestore.rules` permanecen cerradas por seguridad hasta definir organización, roles y políticas.

La app contiene modo de revisión local para validar la interfaz. Los datos visibles en ese modo no son datos de producción y las operaciones financieras no se consideran confirmadas hasta configurar Firebase y las reglas transaccionales.

## Despliegue en GitHub Pages

En GitHub, abre **Settings → Pages**, selecciona **Deploy from a branch**, elige `main` y la carpeta `/ (root)`. Guarda la configuración y espera a que GitHub Pages publique `index.html`. El repositorio no requiere Node ni un proceso de build.

Antes de conectar datos reales, completa `firebase-init.js`, publica Authentication y revisa las reglas. No abras reglas globales para resolver errores de interfaz.

## Estructura

La aplicación está organizada en `servicios/`, `componentes/` y `pantallas/`, con `app.js` como composición, `permisos.js` como matriz de interfaz y `firestore.rules` como bloqueo de seguridad inicial.

## Decisiones pendientes

Impuestos, redondeos, moneda, stock negativo, método de costeo, límites y vencimientos de crédito, intereses, devoluciones, anulaciones, descuentos, cajas compartidas y permisos finales no están inventados ni activados.
