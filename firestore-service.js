/*
 * Y Soft — escrituras reales.
 * Cada operación crea hechos separados y conserva referencias, usuario, organización y auditoría.
 * Las políticas de crédito, devoluciones, impuestos y stock negativo siguen protegidas.
 */
(function () {
  'use strict';
  const D = window.YSoft = window.YSoft || {};
  D.services = D.services || {};

  const timestamp = () => firebase.firestore.FieldValue.serverTimestamp();
  const currentUser = () => D.firebaseAuth && D.firebaseAuth.currentUser;
  const intValue = (value) => {
    const parsed = Number(String(value ?? '').replace(/[^0-9]/g, ''));
    return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
  };
  const idValue = (value) => String(value || '').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120);
  const operationKey = (prefix, provided) => idValue(provided || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  async function context() {
    if (!D.firestore || !D.firebaseAuth) throw new Error('Firebase no está disponible en este navegador.');
    const user = currentUser();
    if (!user) throw new Error('Inicia sesión con Firebase Authentication antes de guardar.');
    let profile = {};
    try {
      const snapshot = await D.firestore.collection('users').doc(user.uid).get();
      if (snapshot.exists) profile = snapshot.data() || {};
    } catch (error) {
      // El perfil es opcional en esta primera activación; Rules sigue exigiendo Auth.
    }
    return {
      uid: user.uid,
      email: user.email || '',
      role: profile.role || null,
      organizationId: profile.organizationId || D.organizationId,
      locationId: profile.locationId || D.locationId,
    };
  }

  function auditData(ctx, entity, entityId, action, reason, extra = {}) {
    return {
      organizationId: ctx.organizationId,
      entity,
      entityId,
      action,
      reason: reason || null,
      createdBy: ctx.uid,
      actorUid: ctx.uid,
      actorEmail: ctx.email,
      createdAt: timestamp(),
      ...extra,
    };
  }

  async function confirmCashSale({ lines, idempotencyKey }) {
    const ctx = await context();
    if (!Array.isArray(lines) || !lines.length) throw new Error('Agrega al menos un producto antes de confirmar.');
    const saleId = operationKey('sale', idempotencyKey);
    const saleRef = D.firestore.collection('sales').doc(saleId);
    return D.firestore.runTransaction(async (transaction) => {
      const existing = await transaction.get(saleRef);
      if (existing.exists) return { saleId, totalMinor: existing.data().totalMinor || 0, repeated: true };

      const refs = lines.map((line) => D.firestore.collection('products').doc(String(line.id)));
      const snapshots = [];
      for (const ref of refs) snapshots.push(await transaction.get(ref));
      const normalized = snapshots.map((snapshot, index) => {
        if (!snapshot.exists) throw new Error('Uno de los productos ya no existe en Firestore.');
        const source = snapshot.data() || {};
        const quantity = intValue(lines[index].qty);
        const stockBefore = intValue(source.stock ?? source.stockByLocation?.[ctx.locationId]);
        const unitPriceMinor = intValue(source.salePriceMinor ?? source.price);
        if (!source.active && source.active !== undefined) throw new Error(`El producto ${source.name || lines[index].name} está inactivo.`);
        if (quantity <= 0) throw new Error('Todas las cantidades deben ser enteros positivos.');
        if (stockBefore < quantity) throw new Error(`No hay existencia suficiente para ${source.name || lines[index].name}.`);
        return { ref:refs[index], source, quantity, stockBefore, stockAfter:stockBefore - quantity, unitPriceMinor };
      });
      const totalMinor = normalized.reduce((sum, line) => sum + line.unitPriceMinor * line.quantity, 0);
      const saleData = {
        organizationId: ctx.organizationId,
        locationId: ctx.locationId,
        status: 'confirmed',
        saleType: 'contado',
        customerId: null,
        subtotalMinor: totalMinor,
        totalMinor,
        paymentMethod: 'Efectivo',
        cashSessionId: null,
        createdBy: ctx.uid,
        createdAt: timestamp(),
        idempotencyKey: saleId,
      };
      transaction.set(saleRef, saleData);
      normalized.forEach((line, index) => {
        const itemRef = D.firestore.collection('saleItems').doc(`${saleId}-${index + 1}`);
        const movementRef = D.firestore.collection('inventoryMovements').doc(`${saleId}-${index + 1}`);
        transaction.set(itemRef, {
          organizationId:ctx.organizationId, saleId, productId:line.ref.id, productNameSnapshot:line.source.name || '',
          unitSnapshot:line.source.unit || '', quantity:line.quantity, unitPriceMinor:line.unitPriceMinor,
          discountMinor:0, taxMinor:0, lineTotalMinor:line.unitPriceMinor * line.quantity, createdBy:ctx.uid, createdAt:timestamp(),
        });
        transaction.update(line.ref, { stock:line.stockAfter, updatedAt:timestamp(), lastMovementId:movementRef.id, lastMovementType:'sale', lastMovementQuantity:line.quantity });
        transaction.set(movementRef, {
          organizationId:ctx.organizationId, productId:line.ref.id, locationId:ctx.locationId, type:'sale',
          quantity:line.quantity, quantitySigned:-line.quantity, stockBefore:line.stockBefore, stockAfter:line.stockAfter,
          reason:'Salida por venta de contado', sourceType:'sale', sourceId:saleId, createdBy:ctx.uid, createdAt:timestamp(), idempotencyKey:saleId,
        });
      });
      const cashRef = D.firestore.collection('cashMovements').doc(saleId);
      transaction.set(cashRef, { organizationId:ctx.organizationId, cashSessionId:null, type:'sale', amountMinor:totalMinor, method:'Efectivo', sourceType:'sale', sourceId:saleId, createdBy:ctx.uid, createdAt:timestamp() });
      transaction.set(D.firestore.collection('auditEvents').doc(`sale-${saleId}`), auditData(ctx, 'sale', saleId, 'confirmed', 'Venta de contado confirmada', { totalMinor }));
      return { saleId, totalMinor, repeated:false };
    });
  }

  async function registerPayment({ customerId, amountMinor, method, creditId, reference, idempotencyKey }) {
    const ctx = await context();
    const amount = intValue(amountMinor);
    if (!customerId || amount <= 0) throw new Error('Selecciona un cliente y escribe un monto positivo.');
    const creditQuery = D.firestore.collection('credits').where('customerId', '==', customerId).where('status', '==', 'open').limit(2);
    const creditSnapshot = creditId ? null : await creditQuery.get();
    const selectedCreditId = creditId || (creditSnapshot && creditSnapshot.size === 1 ? creditSnapshot.docs[0].id : null);
    if (!selectedCreditId) throw new Error('El abono requiere un crédito abierto asignado.');
    const paymentId = operationKey('payment', idempotencyKey);
    const paymentRef = D.firestore.collection('creditPayments').doc(paymentId);
    const creditRef = D.firestore.collection('credits').doc(selectedCreditId);
    const customerRef = D.firestore.collection('customers').doc(customerId);
    return D.firestore.runTransaction(async (transaction) => {
      const existing = await transaction.get(paymentRef);
      if (existing.exists) return { paymentId, repeated:true };
      const creditSnapshotInTransaction = await transaction.get(creditRef);
      const customerSnapshot = await transaction.get(customerRef);
      if (!creditSnapshotInTransaction.exists) throw new Error('El crédito seleccionado no existe.');
      if (!customerSnapshot.exists) throw new Error('El cliente no existe en Firestore.');
      const credit = creditSnapshotInTransaction.data() || {};
      const balanceBefore = intValue(credit.balanceMinorProjection ?? credit.balanceMinor ?? credit.originalMinor);
      if (credit.customerId !== customerId) throw new Error('El crédito no pertenece al cliente seleccionado.');
      if (credit.status !== 'open' || amount > balanceBefore) throw new Error('El monto supera el saldo abierto del crédito.');
      const balanceAfter = balanceBefore - amount;
      transaction.set(paymentRef, { organizationId:ctx.organizationId, customerId, creditId:selectedCreditId, amountMinor:amount, method:method || 'Efectivo', reference:reference || null, createdBy:ctx.uid, createdAt:timestamp(), idempotencyKey:paymentId });
      transaction.update(creditRef, { balanceMinorProjection:balanceAfter, status:balanceAfter === 0 ? 'settled' : 'open', updatedAt:timestamp(), lastPaymentId:paymentId, lastPaymentAmountMinor:amount });
      const customer = customerSnapshot.data() || {};
      const customerBalance = intValue(customer.balanceMinorProjection ?? customer.balance ?? 0);
      transaction.update(customerRef, { balanceMinorProjection:Math.max(0, customerBalance - amount), updatedAt:timestamp(), lastPaymentId:paymentId, lastPaymentAmountMinor:amount });
      if ((method || 'Efectivo') === 'Efectivo') transaction.set(D.firestore.collection('cashMovements').doc(paymentId), { organizationId:ctx.organizationId, cashSessionId:null, type:'creditPayment', amountMinor:amount, method:'Efectivo', sourceType:'creditPayment', sourceId:paymentId, createdBy:ctx.uid, createdAt:timestamp() });
      transaction.set(D.firestore.collection('auditEvents').doc(`payment-${paymentId}`), auditData(ctx, 'creditPayment', paymentId, 'created', 'Abono aplicado a crédito', { amountMinor:amount, creditId:selectedCreditId }));
      return { paymentId, repeated:false, balanceAfter };
    });
  }

  async function requestInventoryAdjustment({ productId, quantity, direction, reason, idempotencyKey }) {
    const ctx = await context();
    const amount = intValue(quantity);
    if (!productId || amount <= 0 || !reason || !reason.trim()) throw new Error('El ajuste requiere producto, cantidad y motivo.');
    if (!['increase','decrease'].includes(direction)) throw new Error('Selecciona la dirección del ajuste.');
    const adjustmentId = operationKey('adjustment', idempotencyKey);
    const adjustmentRef = D.firestore.collection('inventoryAdjustments').doc(adjustmentId);
    const productSnapshot = await D.firestore.collection('products').doc(productId).get();
    if (!productSnapshot.exists) throw new Error('El producto no existe en Firestore.');
    const batch = D.firestore.batch();
    batch.set(adjustmentRef, { organizationId:ctx.organizationId, productId, locationId:ctx.locationId, direction, quantity:amount, reason:reason.trim(), status:'requested', createdBy:ctx.uid, createdAt:timestamp(), idempotencyKey:adjustmentId });
    batch.set(D.firestore.collection('auditEvents').doc(`adjustment-${adjustmentId}`), auditData(ctx, 'inventoryAdjustment', adjustmentId, 'requested', reason.trim(), { productId, quantity:amount, direction }));
    await batch.commit();
    return { adjustmentId };
  }

  D.services.firestore = { confirmCashSale, registerPayment, requestInventoryAdjustment };
})();
