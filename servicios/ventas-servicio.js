/* Y Soft — adaptador legado: delega la confirmación al servicio Firestore transaccional único. */
(function () {
  'use strict';
  const D = window.YSoft = window.YSoft || {};
  D.services = D.services || {};
  const prepare = (lines, type) => ({ lines, type, total: lines.reduce((sum, line) => sum + Number(line.price || 0) * Number(line.qty || 0), 0) });
  const confirm = (lines, type = 'contado', options = {}) => {
    if (type !== 'contado') return Promise.reject(new Error('La venta a crédito requiere el flujo de captura y autorización pendiente.'));
    if (!D.services.firestore || typeof D.services.firestore.confirmCashSale !== 'function') return Promise.reject(new Error('El servicio Firestore todavía no está disponible.'));
    return D.services.firestore.confirmCashSale({ lines, idempotencyKey: options.idempotencyKey });
  };
  D.services.sales = { prepare, confirm };
})();
