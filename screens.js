/*
  Y Soft — pantallas de operación diaria.
  Diseño operativo: búsqueda primero, hechos explícitos, revisión antes de confirmar y cantidades escritas directamente.
*/
(function () {
  const D = window.YSoft = window.YSoft || {};
  const h = D.h; const { useState } = React;
  const { Icon, Button, Status, Kpi, Action, Ledger } = D;
  D.Screens = D.Screens || {};

  const NumericField = ({ id, label, value, onChange, helper = 'Escritura libre · teclado numérico', placeholder = '0' }) => h('div', { className:'free-number-field' }, [
    h('label', { htmlFor:id }, label),
    h('input', { id, className:'input quantity-input', type:'text', inputMode:'numeric', pattern:'[0-9]*', value, placeholder, onChange:(event) => onChange(event.target.value) }),
    h('span', { className:'field-helper' }, helper),
  ]);

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
        h(Kpi, { icon:'chart', label:'Venta del turno', value:'$ 1.846.000', note:'8 operaciones', primary:true }),
        h(Kpi, { icon:'users', label:'Cartera pendiente', value:'$ 2.198.000', note:'3 clientes con saldo' }),
        h(Kpi, { icon:'box', label:'Stock por revisar', value:String(lowStock).padStart(2,'0'), note:'productos bajo atención' }),
        h(Kpi, { icon:'cash', label:'Caja esperada', value:'$ 2.026.000', note:'contado + abonos' }),
      ]),
      h('div', { className:'content-heading', key:'heading-actions' }, h('div', null, [h('h2', null, 'Acciones de turno'), h('p', null, 'Lo frecuente, a un toque de distancia.')])),
      h('div', { className:'action-rail home-actions', key:'actions' }, [
        h(Action, { icon:'receipt', title:'Vender contado', detail:'Salida y caja', onClick:() => setView('ventas') }),
        h(Action, { icon:'user-plus', title:'Registrar abono', detail:'Actualizar cartera', onClick:() => setView('clientes') }),
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
      h('div', { className:'content-heading' }, [h('div', null, [h('h2', null, filtered.length + ' productos'), h('p', null, 'Precios de referencia · impuestos pendientes')]), h(Button, { kind:'primary', onClick:() => setToast('El alta de productos requiere permisos de administrador.') }, 'Nuevo')]),
      h('div', { className:'product-grid' }, filtered.map((product) => h('article', { className:'product-card', key:product.id }, [
        h('div', { className:'product-top' }, [h('span', { className:'product-code' }, product.code), h(Status, { tone:product.stock < 8 ? 'red' : product.stock < 15 ? 'orange' : 'green' }, product.stock < 8 ? 'Atención' : 'Activo')]),
        h('div', { className:'product-name' }, product.name), h('div', { className:'product-price' }, D.money(product.price)), h('div', { className:'product-unit' }, 'por ' + product.unit),
        h('div', { className:'stock-line' }, [h('span', null, 'Existencia'), h('span', { className:'stock-value' + (product.stock < 8 ? ' low' : '') }, product.stock + ' ' + product.unit)]),
        h(Button, { kind:'secondary', onClick:() => { onAdd(product); setToast(product.name + ' agregado a la salida.'); } }, 'Agregar a venta'),
      ]))),
    ]);
  };

  D.Screens.SalesView = function SalesView({ products, customers, cart, addToCart, setCartQty, confirmSale, setView, setToast }) {
    const [search, setSearch] = useState(''); const [category, setCategory] = useState('Todos'); const [showCategories, setShowCategories] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); const [quantity, setQuantity] = useState('1'); const [saleType, setSaleType] = useState('contado'); const [customerId, setCustomerId] = useState(''); const [review, setReview] = useState(false);
    const categories = ['Todos', ...Array.from(new Set(products.map((product) => product.category)))];
    const recent = products.filter((product) => ['p-001','p-002','p-004'].includes(product.id));
    const filtered = products.filter((product) => (category === 'Todos' || product.category === category) && (product.name + product.code).toLowerCase().includes(search.toLowerCase()));
    const total = cart.reduce((sum, item) => sum + item.price * Number(item.qty || 0), 0);
    const openProduct = (product) => { setSelectedProduct(product); setQuantity('1'); setReview(false); };
    const addSelected = () => { const value = Number(String(quantity).replace(/[^0-9]/g, '')); if (!selectedProduct || !value || value > selectedProduct.stock) { setToast('Escribe una cantidad válida dentro de la existencia disponible.'); return; } addToCart(selectedProduct, value); setSelectedProduct(null); setToast(selectedProduct.name + ' agregado a la salida.'); };
    const cartContents = cart.length ? h('div', { className:'cart-list' }, cart.map((item) => h('div', { className:'cart-item', key:item.id }, [
      h('div', { key:'info', className:'cart-item-info' }, [h('strong', { key:'name' }, item.name), h('span', { key:'meta' }, D.money(item.price) + ' · ' + item.unit)]),
      h('input', { key:'quantity', className:'input quantity-input cart-quantity', type:'text', inputMode:'numeric', pattern:'[0-9]*', value:item.qty, 'aria-label':'Cantidad de ' + item.name, onChange:(event) => setCartQty(item.id, event.target.value) }),
    ]))) : h('div', { className:'empty-state' }, [h(Icon, { name:'receipt', size:25 }), h('strong', null, 'La salida está vacía'), h('p', null, 'Selecciona un producto reciente o explora el catálogo.')]);
    if (review) return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Operación · Revisión'), h('h1', { className:'page-title' }, 'Revisar salida'),
      h('p', { className:'page-intro' }, 'Confirma los renglones y la forma de pago antes de generar el hecho.'),
      h('div', { className:'process-steps' }, [h('span', { className:'done' }, '1 Seleccionar'), h('span', { className:'done' }, '2 Preparar'), h('span', { className:'active' }, '3 Revisar')]),
      h('section', { className:'panel review-panel' }, [h('div', { className:'panel-title' }, h('div', null, [h('h3', null, 'Renglones de la salida'), h('p', null, cart.length + ' productos seleccionados')])), h('div', { className:'review-lines' }, cart.map((item) => h('div', { className:'review-line', key:item.id }, [h('span', null, item.name + ' · ' + item.qty), h('strong', null, D.money(item.price * item.qty))]))), h('div', { className:'cart-total' }, [h('span', null, 'Total sin impuestos definidos'), h('strong', null, D.money(total))])]),
      h('section', { className:'panel review-panel' }, [
        h('h3', null, 'Forma de pago'),
        h('div', { className:'pay-switch' }, [h('button', { className:saleType === 'contado' ? 'active' : '', onClick:() => setSaleType('contado') }, 'Contado'), h('button', { className:saleType === 'credito' ? 'active' : '', onClick:() => setSaleType('credito') }, 'A crédito')]),
        saleType === 'credito' && h(React.Fragment, null, [
          h('div', { className:'field' }, [h('label', { htmlFor:'sale-customer' }, 'Cliente'), h('select', { id:'sale-customer', className:'input', value:customerId, onChange:(event) => setCustomerId(event.target.value) }, [h('option', { value:'' }, 'Selecciona un cliente'), ...customers.map((customer) => h('option', { value:customer.id, key:customer.id }, customer.name))])]),
          h('div', { className:'notice' }, [h(Icon, { name:'alert', size:15 }), h('span', null, 'La política de crédito, límite y vencimiento requieren confirmación antes de aprobar.')]),
        ]),
      ]),
      h('div', { className:'flow-actions' }, [h(Button, { kind:'secondary', onClick:() => setReview(false) }, 'Editar salida'), h(Button, { kind:'primary', onClick:() => confirmSale(saleType, customerId) }, saleType === 'contado' ? 'Confirmar venta de contado' : 'Solicitar aprobación de crédito')]),
    ]);
    if (selectedProduct) return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Nueva salida · Producto'), h('h1', { className:'page-title' }, selectedProduct.name),
      h('p', { className:'page-intro' }, 'Revisa el valor y escribe la cantidad que saldrá del inventario.'),
      h('section', { className:'panel product-detail-panel' }, [h('div', { className:'detail-code' }, selectedProduct.code + ' · ' + selectedProduct.category), h('div', { className:'detail-price' }, D.money(selectedProduct.price)), h('div', { className:'detail-stock' }, selectedProduct.stock + ' disponibles'), h(NumericField, { id:'sale-quantity', label:'Cantidad', value:quantity, onChange:setQuantity, placeholder:'1' }), h('div', { className:'flow-actions' }, [h(Button, { kind:'secondary', onClick:() => setSelectedProduct(null) }, 'Volver'), h(Button, { kind:'primary', onClick:addSelected }, 'Agregar a la salida')])]),
    ]);
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Operación · Venta'), h('h1', { className:'page-title' }, 'Nueva salida'),
      h('p', { className:'page-intro' }, 'Busca, escanea o explora. La salida se confirma después de revisar el carrito.'),
      h('div', { className:'sale-access' }, [h('div', { key:'search', className:'search-box sale-search' }, [h(Icon, { key:'icon', name:'search', size:17 }), h('input', { key:'input', className:'input', placeholder:'Buscar producto...', value:search, onChange:(event) => setSearch(event.target.value) })]), h(Button, { key:'scan', kind:'secondary', icon:'scan', onClick:() => setToast('El escaneo de código se conectará cuando se habilite la cámara del dispositivo.') }, 'Escanear'), h(Button, { key:'categories', kind:'secondary', icon:'grid', onClick:() => setShowCategories((current) => !current) }, 'Categorías')]),
      showCategories && h('div', { className:'category-rail' }, categories.map((item) => h('button', { className:'chip' + (category === item ? ' active' : ''), key:item, onClick:() => { setCategory(item); setShowCategories(false); } }, item))),
      h('section', { className:'recent-section' }, [h('div', { className:'content-heading compact-heading' }, [h('div', { key:'heading' }, [h('h2', { key:'title' }, 'Usados recientemente'), h('p', { key:'detail' }, 'Actividad real del turno · selección rápida')]), h(Button, { key:'clear', kind:'ghost', onClick:() => setSearch('') }, 'Limpiar búsqueda')]), h('div', { className:'recent-list' }, recent.map((product) => h('button', { className:'recent-item', key:product.id, onClick:() => openProduct(product) }, [h('div', { key:'copy', className:'recent-copy' }, [h('strong', { key:'name' }, product.name), h('span', { key:'meta' }, product.stock + ' disponibles · ' + product.code)]), h('span', { key:'price', className:'recent-price' }, D.money(product.price)), h(Icon, { key:'arrow', name:'arrow', size:16 })])))]),
      h('div', { className:'content-heading compact-heading' }, [h('div', null, [h('h2', null, 'Catálogo'), h('p', null, filtered.length + ' productos disponibles')]), h(Button, { kind:'ghost', icon:'box', onClick:() => setView('productos') }, 'Ver inventario')]),
      h('div', { className:'product-grid sale-catalog' }, filtered.map((product) => h('button', { className:'product-card product-card-button', key:product.id, onClick:() => openProduct(product), style:{ textAlign:'left' } }, [h('div', { className:'product-top' }, [h('span', { className:'product-code' }, product.code), h(Status, { tone:product.stock < 8 ? 'red' : 'green' }, product.stock + ' disp.')]), h('div', { className:'product-name' }, product.name), h('div', { className:'product-price' }, D.money(product.price)), h('div', { className:'product-unit' }, 'por ' + product.unit)]))),
      h('section', { className:'panel cart-panel' }, [h('div', { className:'panel-title' }, [h('div', null, [h('h3', null, 'Carrito de salida'), h('p', null, cart.length ? cart.length + ' renglones listos' : 'Todavía sin productos')]), cart.length && h(Status, { tone:'green' }, 'En preparación')]), h('div', { className:'panel-rule' }), cartContents, h('div', { className:'cart-total' }, [h('span', null, 'Total sin impuestos definidos'), h('strong', null, D.money(total))]), h(Button, { kind:'primary', onClick:() => setReview(true), disabled:!cart.length }, 'Revisar salida')]),
    ]);
  };

  D.Screens.CustomersView = function CustomersView({ customers, registerPayment, setToast }) {
    const total = customers.reduce((sum, customer) => sum + customer.balance, 0); const [customerId, setCustomerId] = useState(null); const [step, setStep] = useState(1); const [amount, setAmount] = useState(''); const [method, setMethod] = useState('Efectivo');
    const customer = customers.find((item) => item.id === customerId);
    if (customer && step === 3) return h(React.Fragment, null, [h('div', { className:'section-kicker' }, 'Abonos · Confirmación'), h('h1', { className:'page-title' }, 'Abono registrado'), h('section', { className:'success-panel' }, [h('div', { className:'success-mark' }, h(Icon, { name:'check', size:30 })), h('h2', null, 'Abono guardado'), h('p', null, 'El pago quedó registrado como un hecho propio y actualizó la proyección de cartera.'), h('div', { className:'success-meta' }, [h('span', null, 'Cliente'), h('strong', null, customer.name), h('span', null, 'Monto'), h('strong', null, D.money(Number(amount))), h('span', null, 'Método'), h('strong', null, method)]), h(Button, { kind:'primary', onClick:() => { setCustomerId(null); setStep(1); setAmount(''); } }, 'Nuevo abono')])]);
    if (customer && step === 2) return h(React.Fragment, null, [h('div', { className:'section-kicker' }, 'Abonos · Revisión'), h('h1', { className:'page-title' }, 'Revisar abono'), h('section', { className:'panel review-panel' }, [h('div', { className:'review-lines' }, [h('div', { className:'review-line' }, [h('span', null, 'Cliente'), h('strong', null, customer.name)]), h('div', { className:'review-line' }, [h('span', null, 'Saldo pendiente actual'), h('strong', null, D.money(customer.balance))]), h('div', { className:'review-line' }, [h('span', null, 'Monto del abono'), h('strong', null, D.money(Number(amount)))]), h('div', { className:'review-line' }, [h('span', null, 'Método de pago'), h('strong', null, method)])]), h('div', { className:'notice' }, [h(Icon, { name:'alert', size:15 }), h('span', null, 'El abono disminuye cartera; no modifica inventario. Se asignará a un crédito abierto del cliente.')])]), h('div', { className:'flow-actions' }, [h(Button, { kind:'secondary', onClick:() => setStep(1) }, 'Editar'), h(Button, { kind:'primary', onClick:async () => { const saved = await registerPayment(customer.id, Number(amount), method); if (saved) setStep(3); } }, 'Guardar abono')])]);
    if (customer) return h(React.Fragment, null, [h('div', { className:'section-kicker' }, 'Abonos · Nuevo registro'), h('h1', { className:'page-title' }, 'Registrar abono'), h('p', { className:'page-intro' }, customer.name + ' · saldo pendiente ' + D.money(customer.balance)), h('section', { className:'panel flow-form' }, [h(NumericField, { id:'payment-amount', label:'Monto del abono', value:amount, onChange:setAmount, placeholder:'Escribe el monto' }), h('div', { className:'field' }, [h('label', { htmlFor:'payment-method' }, 'Método de pago'), h('select', { id:'payment-method', className:'input', value:method, onChange:(event) => setMethod(event.target.value) }, ['Efectivo','Transferencia','Otro'].map((item) => h('option', { key:item, value:item }, item)))]), h('div', { className:'flow-actions' }, [h(Button, { kind:'secondary', onClick:() => { setCustomerId(null); setAmount(''); } }, 'Cancelar'), h(Button, { kind:'primary', onClick:() => { if (!Number(amount)) setToast('Escribe el monto del abono.'); else setStep(2); } }, 'Continuar')])])]);
    return h(React.Fragment, null, [h('div', { className:'section-kicker' }, 'Cartera · Clientes'), h('h1', { className:'page-title' }, 'Quién tiene saldo'), h('p', { className:'page-intro' }, 'La cartera se respalda con créditos y abonos; este total es solo una lectura rápida.'), h('div', { className:'hero-card balance-hero' }, h('div', { className:'hero-copy' }, [h('div', { key:'kicker', className:'section-kicker' }, 'Saldo pendiente proyectado'), h('h1', { key:'amount' }, D.money(total)), h('p', { key:'note' }, 'Clientes con saldo pendiente · sin intereses ni recargos calculados')])), h('div', { className:'content-heading' }, [h('div', { key:'heading' }, [h('h2', { key:'title' }, 'Clientes'), h('p', { key:'detail' }, 'Consulta antes de asignar un abono.')]), h(Button, { key:'new', kind:'primary', onClick:() => setToast('El alta de clientes requiere permisos de administrador.') }, 'Nuevo')]), h('div', { className:'panel' }, customers.map((item) => h('div', { className:'customer-card', key:item.id }, [h('div', { key:'avatar', className:'customer-avatar' }, D.initials(item.name)), h('div', { key:'info', className:'customer-info' }, [h('strong', { key:'name' }, item.name), h('span', { key:'contact' }, item.contact)]), h('div', { key:'balance', className:'customer-balance' }, [h('strong', { key:'value' }, item.balance ? D.money(item.balance) : 'Sin saldo'), h('span', { key:'status' }, item.status)]), item.balance > 0 && h(Button, { key:'payment', kind:'secondary', onClick:() => { setCustomerId(item.id); setStep(1); setAmount(''); } }, 'Abono')])))]);
  };
})();
