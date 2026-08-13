/* Y Soft — pantallas de conciliación y control. Las acciones sensibles no se ejecutan sin reglas aprobadas. */
(function () {
  const D = window.YSoft = window.YSoft || {};
  const h = D.h; const { Icon, Button, Status, Ledger } = D;

  D.Screens.CashView = function CashView({ cashOpen, setCashOpen, setToast }) {
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Caja · Turno actual'), h('h1', { className:'page-title' }, 'Cuadrar sin atajos'),
      h('p', { className:'page-intro' }, 'El cierre concilia los movimientos del turno; no altera ventas, pagos ni inventario.'),
      h('div', { className:'cash-hero', style:{ marginTop:21 } }, [
        h('div', { className:'section-kicker' }, cashOpen ? 'Turno abierto · Caja 01' : 'Turno cerrado'),
        h('h2', null, cashOpen ? 'Movimiento bajo control' : 'Esperando nueva apertura'),
        h('p', null, cashOpen ? 'Responsable: J. Duarte · Apertura 08:00' : 'No se pueden confirmar ventas ni abonos hasta abrir caja.'),
        h('div', { className:'cash-amount' }, '$ 2.026.000'),
        h('div', { className:'cash-stats' }, [h('div', { className:'cash-stat' }, [h('span', null, 'Base inicial'), h('strong', null, '$ 180.000')]), h('div', { className:'cash-stat' }, [h('span', null, 'Entradas'), h('strong', null, '$ 1.846.000')]), h('div', { className:'cash-stat' }, [h('span', null, 'Diferencia'), h('strong', null, 'Pendiente')])]),
        h('div', { style:{ marginTop:20 } }, h(Button, { kind:cashOpen ? 'primary' : 'secondary', icon:cashOpen ? 'lock' : 'cash', onClick:() => { setCashOpen(!cashOpen); setToast(cashOpen ? 'Cierre preparado; falta contar y confirmar diferencia.' : 'Apertura preparada para revisión.'); } }, cashOpen ? 'Preparar cierre de turno' : 'Abrir caja')),
      ]),
      h('div', { className:'content-heading' }, [h('div', null, [h('h2', null, 'Movimientos del turno'), h('p', null, 'Ingresos y salidas con origen.')]), h(Button, { kind:'ghost', onClick:() => setToast('Los movimientos se habilitarán al conectar Firestore.') }, 'Exportar')]),
      h(Ledger, { movements:D.demoMovements.slice(0,3) }),
    ]);
  };

  D.Screens.ControlView = function ControlView({ setView, setToast }) {
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Control · Reversos y ajustes'), h('h1', { className:'page-title' }, 'Corregir sin borrar'),
      h('p', { className:'page-intro' }, 'Una devolución o un ajuste son hechos nuevos: conservan la referencia, el motivo y la autorización.'),
      h('div', { className:'content-heading' }, [h('div', null, [h('h2', null, 'Elige el hecho'), h('p', null, 'La política final todavía está pendiente.')]), h(Button, { kind:'ghost', onClick:() => setView('inicio') }, 'Volver')]),
      h('div', { className:'action-rail' }, [
        h('button', { className:'action-card', onClick:() => setToast('Devolución preparada; falta confirmar plazo, condición y autorización.') }, [h('div', { className:'action-icon' }, h(Icon, { name:'rotate', size:17 })), h('div', null, [h('strong', null, 'Solicitar devolución'), h('span', null, 'Venta de origen · motivo · condición de retorno')])]),
        h('button', { className:'action-card', onClick:() => setToast('Ajuste preparado; falta confirmar stock negativo y umbral de autorización.') }, [h('div', { className:'action-icon' }, h(Icon, { name:'box', size:17 })), h('div', null, [h('strong', null, 'Proponer ajuste'), h('span', null, 'Producto · ubicación · cantidad · motivo')])]),
      ]),
      h('div', { className:'panel', style:{ marginTop:18 } }, [h('div', { className:'panel-title' }, h('div', null, [h('h3', null, 'Antes de aplicar'), h('p', null, 'No se afecta inventario ni caja en esta vista.')])), h('div', { className:'panel-rule' }), h('div', { className:'pending-list' }, [h('div', { className:'pending-item' }, [h(Icon, { name:'alert', size:18 }), h('div', null, [h('strong', null, 'Política de devoluciones pendiente'), h('span', null, 'Definir plazo, condición de mercancía y efecto financiero.')])]), h('div', { className:'pending-item' }, [h(Icon, { name:'alert', size:18 }), h('div', null, [h('strong', null, 'Autorización de ajustes pendiente'), h('span', null, 'Definir umbral, rol autorizador y tratamiento de stock negativo.')])])])]),
    ]);
  };

  D.Screens.ReportsView = function ReportsView({ products, customers }) {
    const lowStock = products.filter((product) => product.stock < 8).length;
    const total = customers.reduce((sum, customer) => sum + customer.balance, 0);
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Reportes · Lectura operativa'), h('h1', { className:'page-title' }, 'Lo que pide atención'),
      h('p', { className:'page-intro' }, 'Reportes iniciales de consulta. Los impuestos, costos y márgenes quedan fuera hasta confirmar sus reglas.'),
      h('div', { className:'split-layout', style:{ marginTop:21 } }, [
        h('section', { className:'report-card' }, [h('h3', null, 'Ventas por día'), h('p', null, 'Semana actual · contado y crédito juntos'), h('div', { className:'bar-chart' }, [38,54,47,72,60,88,42].map((height,index) => h('div', { className:'bar-item', key:index }, [h('div', { className:'bar' + (index === 4 ? ' secondary' : ''), style:{ height:height + '%' } }), h('span', { className:'bar-label' }, ['Lun','Mar','Mié','Jue','Vie','Sáb','Hoy'][index])])))]),
        h('section', { className:'report-card' }, [h('h3', null, 'Resumen de cartera'), h('p', null, 'Proyección informativa · sin mora calculada'), h('div', { className:'report-list' }, [h('div', { className:'report-line' }, [h('span', null, 'Saldo pendiente'), h('strong', null, D.money(total))]), h('div', { className:'report-line' }, [h('span', null, 'Clientes con saldo'), h('strong', null, String(customers.filter((customer) => customer.balance > 0).length))]), h('div', { className:'report-line' }, [h('span', null, 'Stock bajo'), h('strong', { style:{ color:lowStock ? 'var(--red)' : 'var(--green)' } }, lowStock + ' productos')]), h('div', { className:'report-line' }, [h('span', null, 'Impuestos'), h(Status, { tone:'orange' }, 'Pendiente')])])]),
      ]),
      h('div', { className:'content-heading' }, h('div', null, [h('h2', null, 'Siguientes lecturas'), h('p', null, 'Cuando las reglas estén aprobadas.')])),
      h('div', { className:'pending-list' }, [
        h('div', { className:'pending-item' }, [h(Icon, { name:'alert', size:18 }), h('div', null, [h('strong', null, 'Margen por producto'), h('span', null, 'Requiere definir método de costeo y tratamiento de impuestos.')])]),
        h('div', { className:'pending-item' }, [h(Icon, { name:'alert', size:18 }), h('div', null, [h('strong', null, 'Cartera vencida'), h('span', null, 'Requiere definir plazo, fecha de vencimiento y recargos.')])]),
      ]),
    ]);
  };

  D.Screens.MenuView = function MenuView({ setView, toggleTheme, darkMode }) {
    const items = [['inicio','grid','Inicio','Resumen del turno'],['productos','box','Inventario','Productos y existencias'],['clientes','users','Clientes','Cartera y contactos'],['reportes','chart','Reportes','Lecturas operativas'],['control','rotate','Devoluciones y ajustes','Operaciones protegidas'],['ajustes','lock','Configuración','Firebase y permisos']];
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Y Soft · Menú secundario'), h('h1', { className:'page-title' }, 'Todo en su lugar'),
      h('p', { className:'page-intro' }, 'Ventas y Caja quedan a mano. Aquí encuentras el resto del cuaderno operativo.'),
      h('div', { className:'secondary-menu', style:{ marginTop:21 } }, items.map(([id,icon,label,detail]) => h('button', { className:'menu-item', key:id, onClick:() => setView(id) }, [h('span', { className:'menu-item-icon' }, h(Icon, { name:icon, size:18 })), h('span', { className:'menu-item-copy' }, [h('strong', null, label), h('small', null, detail)]), h(Icon, { name:'arrow', size:16 })]))),
      h('div', { className:'theme-panel' }, [h('div', null, [h('strong', null, darkMode ? 'Modo oscuro activo' : 'Modo claro activo'), h('span', null, 'Ajusta la lectura para tu turno.')]), h(Button, { kind:'secondary', icon:darkMode ? 'sun' : 'moon', onClick:toggleTheme }, darkMode ? 'Usar claro' : 'Usar oscuro')]),
    ]);
  };

  D.Screens.SettingsView = function SettingsView({ firebaseReady, authUser, logout, setToast }) {
    const pending = ['Impuestos y redondeo monetario','Límite y vencimiento de crédito','Stock negativo y método de costeo','Devoluciones, anulaciones y descuentos','Cajas, ubicaciones y permisos por rol'];
    return h(React.Fragment, null, [
      h('div', { className:'section-kicker' }, 'Configuración · Seguridad'), h('h1', { className:'page-title' }, 'Reglas antes de datos'),
      h('p', { className:'page-intro' }, 'Esta copia está aislada. La conexión real se activa cuando la organización confirme sus políticas y publique reglas Firestore.'),
      h('div', { className:'content-heading' }, h('div', null, [h('h2', null, 'Estado de conexión'), h('p', null, authUser ? 'Sesión autenticada' : 'Revisión local')])),
      h('div', { className:'config-card' }, [h(Icon, { name:firebaseReady ? 'check' : 'alert', size:20 }), h('div', null, [h('strong', null, firebaseReady ? 'Firebase conectado' : 'Firebase pendiente de configuración'), h('span', null, firebaseReady ? 'Auth y Firestore disponibles; faltan reglas y datos reales.' : 'Agrega la configuración en app.js o en el entorno de publicación.')])]),
      h('div', { className:'content-heading' }, h('div', null, [h('h2', null, 'Decisiones pendientes'), h('p', null, 'No se convierten en reglas automáticas.')])),
      h('div', { className:'pending-list' }, pending.map((item) => h('div', { className:'pending-item', key:item }, [h(Icon, { name:'alert', size:18 }), h('div', null, [h('strong', null, item), h('span', null, 'Pendiente de confirmación por el negocio.')])]))),
      h('div', { style:{ marginTop:22 } }, authUser ? h(Button, { kind:'secondary', icon:'logout', onClick:logout }, 'Cerrar sesión') : h(Button, { kind:'secondary', onClick:() => setToast('Esta copia funciona sin sesión para revisión visual. Configura Firebase para activar Auth.') }, 'Revisar modo local')),
    ]);
  };
})();
