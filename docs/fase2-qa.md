# QA Fase 2 — Catálogo e inventario por ubicación

## Alcance

La Fase 2 incorpora un catálogo consultable con búsqueda por nombre o código, filtros por categoría, ficha de producto, ubicación activa, existencias resumidas por ubicación y movimientos recientes de solo lectura.

## Validaciones realizadas

- Los archivos JavaScript de la PWA pasan `node --check`.
- Se corrigió la precedencia de operadores en el cálculo de stock por ubicación.
- Se corrigió el retorno desde la ficha de producto al catálogo.
- Las cantidades del catálogo y los movimientos no incorporan controles incrementales.
- No se habilitaron escrituras de inventario, ajustes ni transferencias reales.
- La vista previa móvil permanece protegida por Firebase Authentication.

## Limitación pendiente

La captura móvil de `/#productos` mostró la pantalla de acceso porque no hubo una sesión autenticada disponible durante la captura. La navegación protegida se conserva deliberadamente; la revisión visual autenticada queda pendiente de una sesión válida en la misma vista previa.

## Decisión de seguridad

Esta fase solo consulta datos locales y lecturas remotas preparadas. No publica reglas Firestore nuevas, no crea datos de prueba y no modifica existencias reales.
