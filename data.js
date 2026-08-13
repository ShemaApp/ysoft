/* Y Soft — datos de revisión local. No son datos de clientes reales ni seed de producción. */
(function () {
  const D = window.YSoft = window.YSoft || {};
  D.demoProducts = [
    { id:'p-001', code:'ARZ-005', name:'Arroz Premium 5 kg', category:'Abarrotes', unit:'bulto', stock:42, price:18500 },
    { id:'p-002', code:'ACE-001', name:'Aceite vegetal 1 L', category:'Abarrotes', unit:'caja x 12', stock:18, price:41600 },
    { id:'p-003', code:'BEB-012', name:'Bebida de mango 300 ml', category:'Bebidas', unit:'caja x 24', stock:7, price:28900 },
    { id:'p-004', code:'LIM-004', name:'Jabón líquido 1 galón', category:'Limpieza', unit:'unidad', stock:23, price:27200 },
    { id:'p-005', code:'GRA-009', name:'Fríjol cargamanto 1 kg', category:'Abarrotes', unit:'bulto x 12', stock:4, price:63800 },
    { id:'p-006', code:'EMP-007', name:'Bolsas mercado mediana', category:'Empaque', unit:'paquete x 100', stock:31, price:11900 },
  ];
  D.demoCustomers = [
    { id:'c-001', name:'Minimercado El Portal', contact:'Cuenta activa · 3 créditos', balance:1234000, status:'Al día' },
    { id:'c-002', name:'Tienda La 14', contact:'Cuenta activa · 1 crédito', balance:478000, status:'Al día' },
    { id:'c-003', name:'Panadería Central', contact:'Requiere revisión de política', balance:286000, status:'Pendiente' },
    { id:'c-004', name:'Comercial Los Andes', contact:'Sin saldo pendiente', balance:0, status:'Al día' },
  ];
  D.demoMovements = [
    { id:'m-001', type:'Venta de contado', detail:'Arroz Premium 5 kg · 12 unidades', amount:222000, time:'10:42', color:'green' },
    { id:'m-002', type:'Abono recibido', detail:'Minimercado El Portal', amount:180000, time:'09:18', color:'orange' },
    { id:'m-003', type:'Ajuste solicitado', detail:'Bebida de mango · faltante por contar', amount:-28900, time:'Ayer', color:'orange' },
    { id:'m-004', type:'Venta a crédito', detail:'Tienda La 14 · 4 renglones', amount:318000, time:'Ayer', color:'green' },
  ];
})();
