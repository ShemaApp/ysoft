/* Y Soft — configuración pública, utilidades e inicialización Firebase. */
(function () {
  'use strict';
  const D = window.YSoft = window.YSoft || {};
  const config = window.YSOFT_FIREBASE_CONFIG || { apiKey:'', authDomain:'', projectId:'', storageBucket:'', messagingSenderId:'', appId:'' };
  D.firebaseConfig = config;
  D.hasFirebaseConfig = Boolean(config.apiKey && config.projectId && config.appId);
  D.firebaseAuth = null; D.firestore = null; D.firebaseBootError = '';
  if (D.hasFirebaseConfig && window.firebase) {
    try { if (!firebase.apps.length) firebase.initializeApp(config); D.firebaseAuth = firebase.auth(); D.firestore = firebase.firestore(); }
    catch (error) { D.firebaseBootError = error.message || 'No fue posible iniciar Firebase.'; }
  }
  D.icons = { grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', box:'M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 8 12 13l8.7-5M12 13v8', receipt:'M4 2h16v20l-3-2-3 2-2-2-3 2-3-2-2 2V2zm4 5h8M8 11h8M8 15h5', users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0-0-8 4 4 0 0 0 0 8zm7-7a4 4 0 0 1 0 7.7M22 21v-2a4 4 0 0 0-3-3.87', cash:'M3 6h18v12H3zM7 10a3 3 0 1 0 0 4m10-4a3 3 0 1 1 0 4M12 9v6m-2-2h4', chart:'M4 19V5m0 14h17M8 16v-5m4 5V7m4 9v-8m4 8v-4', search:'m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z', plus:'M12 5v14M5 12h14', arrow:'M5 12h14m-6-6 6 6-6 6', rotate:'M20 11a8.1 8.1 0 0 0-14.7-3L3 11m0 0V5m0 6h6M4 13a8.1 8.1 0 0 0 14.7 3L21 13m0 0v6m0-6h-6', alert:'M10.3 3.1 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.1a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01', check:'m5 12 4 4L19 6', lock:'M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5V10z', logout:'M10 17l5-5-5-5m5 5H3m9-9V2h8v20h-8', moon:'M20.8 15.2A8.5 8.5 0 0 1 8.8 3.2 8.5 8.5 0 1 0 20.8 15.2z', sun:'M12 3v2m0 14v2M3 12h2m14 0h2m-3.36-6.36-1.42 1.42M6.78 17.22l-1.42 1.42m0-13.42 1.42 1.42m10.44 10.44 1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z', menu:'M4 6h16M4 12h16M4 18h16' };
  D.money = (value) => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(value);
  D.initials = (name) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  D.todayLabel = new Intl.DateTimeFormat('es-CO', { weekday:'long', day:'numeric', month:'long' }).format(new Date());
  D.demoProducts = [{ id:'p-001', code:'ARZ-005', name:'Arroz Premium 5 kg', category:'Abarrotes', unit:'bulto', stock:42, price:18500 },{ id:'p-002', code:'ACE-001', name:'Aceite vegetal 1 L', category:'Abarrotes', unit:'caja x 12', stock:18, price:41600 },{ id:'p-003', code:'BEB-012', name:'Bebida de mango 300 ml', category:'Bebidas', unit:'caja x 24', stock:7, price:28900 },{ id:'p-004', code:'LIM-004', name:'Jabón líquido 1 galón', category:'Limpieza', unit:'unidad', stock:23, price:27200 },{ id:'p-005', code:'GRA-009', name:'Fríjol cargamanto 1 kg', category:'Abarrotes', unit:'bulto x 12', stock:4, price:63800 },{ id:'p-006', code:'EMP-007', name:'Bolsas mercado mediana', category:'Empaque', unit:'paquete x 100', stock:31, price:11900 }];
  D.demoCustomers = [{ id:'c-001', name:'Minimercado El Portal', contact:'Cuenta activa · 3 créditos', balance:1234000, status:'Al día' },{ id:'c-002', name:'Tienda La 14', contact:'Cuenta activa · 1 crédito', balance:478000, status:'Al día' },{ id:'c-003', name:'Panadería Central', contact:'Requiere revisión de política', balance:286000, status:'Pendiente' },{ id:'c-004', name:'Comercial Los Andes', contact:'Sin saldo pendiente', balance:0, status:'Al día' }];
  D.demoMovements = [{ id:'m-001', type:'Venta de contado', detail:'Arroz Premium 5 kg · 12 unidades', amount:222000, time:'10:42', color:'green' },{ id:'m-002', type:'Abono recibido', detail:'Minimercado El Portal', amount:180000, time:'09:18', color:'orange' },{ id:'m-003', type:'Ajuste solicitado', detail:'Bebida de mango · faltante por contar', amount:-28900, time:'Ayer', color:'orange' },{ id:'m-004', type:'Venta a crédito', detail:'Tienda La 14 · 4 renglones', amount:318000, time:'Ayer', color:'green' }];
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
