/*
  Y Soft — pantallas de operación diaria.
  Cada vista muestra el hecho, su efecto esperado y la configuración pendiente que impide una escritura definitiva.
*/
(function () {
  const D = window.YSoft = window.YSoft || {};
  const h = D.h; const { useState } = React;
  const { Icon, Button, Status, Kpi, Action, Ledger } = D;
  D.Screens = D.Screens || {};

  D.Screens.Dashboard = function Dashboard({ products, setView, movements, cashOpen }) {
    const lowStock = products.filter((product) => product.stock < 8).length;
    return h(React.Fragment, null, [
      h('div', { className:'home-date', key:'date' }, [h('span', { className:'home-date-icon' }, h(Icon, { name:'calendar', size:24 })), h('span', null, D.todayLabel)]),
      h('div', { className:'hero-card', key:'hero' }, [
        h('div', { className:'hero-copy' }, [
          h('div', { className:'section-kicker' }, cashOpen ? 'Turno abierto · Caja 01' : 'Turno cerrado'),
          h('h1', null, 'La caja de hoy empieza contigo.'),
          h('p', null, 'Consulta el pulso de tu operación y decide el siguiente movimiento sin perder el rastro.'),
          h('div', { className:'hero-actions' }, [h(Button, { kind:'primary', icon:'arrow', onClick:() => setView('ventas') }, 'Nueva venta'), h('div', { className:'hero-stamp' }, [h(Icon, { name:'check', size:16 }), 'Registro activo'])]),
        ]),
        h('div', { className:'hero-emblem' }, [h('div', { className:'hero-emblem-ring' }, h(Icon, { name:'register', size:62 }))]),
      ]),
      h('div', { className:'kpi-grid', key:'kpis' }, [
        h(Kpi, { icon:'chart', label:'Venta del turno', value:'$ 1.846.000', note:'+ 8 operaciones', primary:true }),
        h(Kpi, { icon:'users', label:'Cartera pendiente', value:'$ 2.198.000', note:'3 clientes con saldo' }),
        h(Kpi, { icon:'box', label:'Stock por revisar', value:String(lowStock).padStart(2,'0'), note:'productos bajo atención' }),
        h(Kpi, { icon:'cash', label:'Caja esperada', value:'$ 2.026.000', note:'contado + abonos' }),
      ]),
      h('div', { className:'content-heading', key:'heading-actions' }, h('div', null, [h('h2', null, 'Acciones de turno'), h('p', null, 'Lo frecuente, a un toque de distancia.')])),
      h('div', { className:'action-rail', key:'actions' }, [
        h(Action, { icon:'receipt', title:'Vender contado', detail:'Salida y caja', onClick:() => setView('ventas') }),
        h(Action, { icon:'plus', title:'Registrar abono', detail:'Actualizar cartera', onClick:() => setView('clientes') }),
        h(Action, { icon:'users', title:'Ver clientes', detail:'Consultar cartera', onClick:() => setView('clientes') }),
        h(Action, { icon:'box', title:'Revisar stock', detail:lowStock + ' alertas activas', onClick:() => setView('productos') }),
      ]),
      h('div', { className:'split-layout', key:'split' }, [
        h('section', null, [
          h('div', { className:'content-heading' }, [h('div', null, [h('h2', null, 'Últimos movimientos'), h('p', null, 'Hechos recientes del cuaderno.')]), h(Button, { kind:'ghost', onClick:() => setView('reportes') }, 'Ver todo')]),
          h(Ledger, { movements }),
        ]),
        h('section', null, [
          h('div', { className:'content-heading' }, h('div', null, [h('h2', null, 'Inventario atento'), h('p', null, 'Revisión antes de la próxima salida.')])),
          h('div', { className:'panel' }, [
            ...products.filter((product) => product.stock < 10).map((product) => h('div', { className:'customer-card', key:product.id }, [h('div', { className:'customer-avatar' }, h(Icon, { name:'box', size:16 })), h('div', { className:'customer-info' }, [h('strong', null, product.name), h('span', null, product.code + ' · ' + product.unit)]), h('div', { className:'customer-balance' }, [h('strong', { style:{ color:'var(--red)' } }, product.stock), h('span', null, 'en stock')])])),
            h(Button, { kind:'secondary', onClick:() => setView('productos') }, 'Abrir inventario'),
          ]),
        ]),
      ]),
      h('div', { className:'content-heading', key:'protected-heading' }, h('div', null, [h('h2', null, 'Operaciones protegidas'), h('p', null, 'Reversos y cambios siempre con motivo.')])),
      h('div', { className:'action-rail', key:'protected-actions' }, [
        h(Action, { icon:'rotate', title:'Devoluciones', detail:'Reverso trazable', onClick:() => setView('control') }),
        h(Action, { icon:'box', title:'Ajuste de stock', detail:'Conteo con autorización', onClick:() => setView('control') }),
      ]),
    ]);
  };

  D.Screens.ProductsView = function ProductsView({ products, onAdd, setToast }) {
    const [search, setSearch] = useState(''); const [category, setCategory] = useState('Todos');
    const categories = ['Todos', ...Array.from(new Set(products.map((product) => product.category)))];
    const filtered = products.filter((product) => (category === 'Todos' || product.category === category) && (product.name + product.code).toLowerCase().includes(search.toLowerCase()));
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Catálogo y existencias'), h('h1', { className:'page-title' }, 'Inventario'),
      h('p', { className:'page-intro' }, 'El saldo visible es una proyección: cada cambio debe tener un movimiento y un motivo.'),
      h('div', { className:'filter-row' }, [h('div', { className:'search-box' }, [h(Icon, { name:'search', size:16 }), h('input', { className:'input', placeholder:'Buscar producto o código', value:search, onChange:(event) => setSearch(event.target.value) })]), ...categories.map((item) => h('button', { className:'chip' + (category === item ? ' active' : ''), key:item, onClick:() => setCategory(item) }, item))]),
      h('div', { className:'content-heading' }, [h('div', null, [h('h2', null, filtered.length + ' productos'), h('p', null, 'Precios de referencia · impuestos pendientes')]), h(Button, { kind:'primary', icon:'plus', onClick:() => setToast('El alta de productos requiere permisos de administrador.') }, 'Nuevo')]),
      h('div', { className:'product-grid' }, filtered.map((product) => h('article', { className:'product-card', key:product.id }, [
        h('div', { className:'product-top' }, [h('span', { className:'product-code' }, product.code), h(Status, { tone:product.stock < 8 ? 'red' : product.stock < 15 ? 'orange' : 'green' }, product.stock < 8 ? 'Atención' : 'Activo')]),
        h('div', { className:'product-name' }, product.name), h('div', { className:'product-price' }, D.money(product.price)), h('div', { className:'product-unit' }, 'por ' + product.unit),
        h('div', { className:'stock-line' }, [h('span', null, 'Existencia'), h('span', { className:'stock-value' + (product.stock < 8 ? ' low' : '') }, product.stock + ' ' + product.unit)]),
        h(Button, { kind:'secondary', onClick:() => { onAdd(product); setToast(product.name + ' agregado a la venta.'); } }, 'Agregar a venta'),
      ]))),
    ]);
  };

  D.Screens.SalesView = function SalesView({ products, cart, addToCart, updateQty, confirmSale, setView }) {
    const [saleType, setSaleType] = useState('contado'); const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cartItemView = (item) => h('div', { className:'cart-item', key:item.id }, [
      h('div', { className:'cart-item-info' }, [h('strong', null, item.name), h('span', null, D.money(item.price) + ' · ' + item.unit)]),
      h('div', { className:'qty-control' }, [h('button', { onClick:() => updateQty(item.id, -1) }, '−'), h('span', null, item.qty), h('button', { onClick:() => updateQty(item.id, 1) }, '+')]),
    ]);
    const cartContents = cart.length ? h('div', { className:'cart-list' }, cart.map(cartItemView)) : h('div', { className:'empty-state' }, [h(Icon, { name:'receipt', size:25 }), h('strong', null, 'El carrito está vacío'), h('p', null, 'Selecciona productos del catálogo para preparar una venta.')]);
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Operación · Venta'), h('h1', { className:'page-title' }, 'Nueva salida'),
      h('p', { className:'page-intro' }, 'Confirma el hecho antes de afectar inventario, caja o cartera.'),
      h('div', { className:'sale-layout' }, [
        h('section', { className:'panel sale-products' }, [
          h('div', { className:'panel-title' }, [h('div', null, [h('h3', null, 'Productos disponibles'), h('p', null, 'Toca para agregar al carrito.')]), h(Button, { kind:'ghost', icon:'box', onClick:() => setView('productos') }, 'Ver catálogo')]), h('div', { className:'panel-rule' }),
          h('div', { className:'product-grid' }, products.slice(0,6).map((product) => h('button', { className:'product-card', key:product.id, onClick:() => addToCart(product), style:{ textAlign:'left' } }, [h('div', { className:'product-top' }, [h('span', { className:'product-code' }, product.code), h(Icon, { name:'plus', size:16 })]), h('div', { className:'product-name' }, product.name), h('div', { className:'product-price' }, D.money(product.price)), h('div', { className:'product-unit' }, product.stock + ' en stock')]))),
        ]),
        h('aside', { className:'panel' }, [
          h('div', { className:'panel-title' }, h('div', null, [h('h3', null, 'Carrito'), h('p', null, cart.length ? cart.length + ' renglones listos' : 'Todavía sin productos')])), h('div', { className:'panel-rule' }),
          cartContents,
          h('div', { className:'cart-total' }, [h('span', null, 'Total sin impuestos definidos'), h('strong', null, D.money(total))]),
          h('div', { className:'pay-switch' }, [h('button', { className:saleType === 'contado' ? 'active' : '', onClick:() => setSaleType('contado') }, 'Contado'), h('button', { className:saleType === 'credito' ? 'active' : '', onClick:() => setSaleType('credito') }, 'A crédito')]),
          saleType === 'credito' && h('div', { className:'notice' }, [h(Icon, { name:'alert', size:15 }), h('span', null, 'La política de crédito, límite y vencimiento requieren confirmación antes de aprobar.')]),
          h('div', { style:{ marginTop:14 } }, h(Button, { kind:'primary', onClick:() => confirmSale(saleType), disabled:!cart.length }, saleType === 'contado' ? 'Confirmar venta de contado' : 'Solicitar aprobación de crédito')),
        ]),
      ]),
    ]);
  };

  D.Screens.CustomersView = function CustomersView({ customers, registerPayment, setToast }) {
    const total = customers.reduce((sum, customer) => sum + customer.balance, 0);
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Cartera · Clientes'), h('h1', { className:'page-title' }, 'Quién tiene saldo'),
      h('p', { className:'page-intro' }, 'La cartera se respalda con créditos y abonos; este total es solo una lectura rápida.'),
      h('div', { className:'hero-card', style:{ minHeight:'auto', marginTop:20 } }, h('div', { className:'hero-copy' }, [h('div', { className:'section-kicker' }, 'Saldo pendiente proyectado'), h('h1', null, D.money(total)), h('p', null, '3 clientes con saldo pendiente · sin intereses ni recargos calculados')])),
      h('div', { className:'content-heading' }, [h('div', null, [h('h2', null, 'Clientes'), h('p', null, 'Consulta antes de asignar un abono.')]), h(Button, { kind:'primary', icon:'plus', onClick:() => setToast('El alta de clientes requiere permisos de administrador.') }, 'Nuevo')]),
      h('div', { className:'panel' }, customers.map((customer) => h('div', { className:'customer-card', key:customer.id }, [
        h('div', { className:'customer-avatar' }, D.initials(customer.name)), h('div', { className:'customer-info' }, [h('strong', null, customer.name), h('span', null, customer.contact)]),
        h('div', { className:'customer-balance' }, [h('strong', null, customer.balance ? D.money(customer.balance) : 'Sin saldo'), h('span', null, customer.status)]),
        customer.balance > 0 && h(Button, { kind:'secondary', onClick:() => registerPayment(customer.id) }, 'Abono'),
      ]))),
    ]);
  };
})();
