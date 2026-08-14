/*
  Y Soft — shell de aplicación.
  Las operaciones financieras pasan por servicios transaccionales; el crédito y las políticas aún pendientes
  permanecen bloqueados hasta que el negocio publique sus reglas definitivas.
*/
(function () {
  'use strict';
  const D = window.YSoft = window.YSoft || {};
  const h = D.h; const { useEffect, useState } = React; const { Icon, Button, BottomNav } = D;
  const getHashView = () => window.location.hash.replace(/^#/, '') || 'inicio';

  function AuthScreen({ error }) {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(error || ''); const [saving, setSaving] = useState(false);
    const signIn = async (event) => {
      event.preventDefault(); if (saving) return; setMessage(''); setSaving(true);
      try { await D.firebaseAuth.signInWithEmailAndPassword(email, password); } catch (err) { setMessage('No se pudo abrir el cuaderno. Revisa el correo y la contraseña.'); } finally { setSaving(false); }
    };
    return h('div', { className:'auth-screen' }, h('form', { className:'auth-card', onSubmit:signIn }, [
      h('div', { className:'auth-brand-row' }, [h('img', { className:'auth-brand-mark', src:'./ysoft-mark.svg', alt:'Y Soft' }), h('div', { className:'auth-brand-copy' }, [h('strong', null, 'Y Soft'), h('span', null, 'Cuaderno de operación')])]),
      h('div', { className:'auth-ledger-strip' }, [h('span', null, 'TURNO · CAJA · REGISTRO'), h('span', null, 'CRECIMIENTO DIARIO')]),
      h('h1', null, 'Abre el cuaderno de hoy'),
      h('p', null, 'Vende, cobra y registra cada movimiento de tu distribuidora desde un solo lugar.'),
      message && h('div', { className:'error-message' }, message),
      h('div', { className:'field' }, [h('label', { htmlFor:'email' }, 'Correo'), h('input', { id:'email', className:'input', type:'email', value:email, onChange:(event) => setEmail(event.target.value), required:true })]),
      h('div', { className:'field' }, [h('label', { htmlFor:'password' }, 'Contraseña'), h('input', { id:'password', className:'input', type:'password', value:password, onChange:(event) => setPassword(event.target.value), required:true })]),
      h(Button, { kind:'primary', type:'submit', loading:saving, loadingLabel:'Abriendo cuaderno…' }, 'Entrar al cuaderno'),
      h('div', { className:'auth-footnote' }, [h(Icon, { name:'check', size:14 }), h('span', null, 'Acceso protegido · cada operación conserva su rastro')]),
    ]));
  }

  function App() {
    const [authUser, setAuthUser] = useState(null); const [authChecked, setAuthChecked] = useState(!D.hasFirebaseConfig);
    const [view, setViewState] = useState(getHashView); const [products, setProducts] = useState(D.demoProducts); const [customers, setCustomers] = useState(D.demoCustomers);
    const [cart, setCart] = useState([]); const [notification, setNotification] = useState(null); const [savingOperation, setSavingOperation] = useState(''); const [cashOpen, setCashOpen] = useState(true); const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('ysoft-theme') === 'dark');
    const setView = (nextView) => { setViewState(nextView); window.location.hash = nextView === 'inicio' ? '' : nextView; };

    useEffect(() => {
      if (!D.firebaseAuth) return undefined;
      return D.firebaseAuth.onAuthStateChanged((user) => { setAuthUser(user); setAuthChecked(true); });
    }, []);
    useEffect(() => { document.body.classList.toggle('theme-dark', darkMode); window.localStorage.setItem('ysoft-theme', darkMode ? 'dark' : 'light'); }, [darkMode]);

    useEffect(() => {
      const onHashChange = () => setViewState(getHashView());
      onHashChange();
      const initialSync = window.setTimeout(onHashChange, 0);
      window.addEventListener('hashchange', onHashChange);
      return () => { window.clearTimeout(initialSync); window.removeEventListener('hashchange', onHashChange); };
    }, []);

    useEffect(() => {
      if (!D.firestore || !authUser) return undefined;
      const unsubscribe = D.firestore.collection('products').where('active', '==', true).limit(60).onSnapshot((snapshot) => {
        const remote = snapshot.docs.map((doc) => ({ id:doc.id, ...doc.data() }));
        if (remote.length) setProducts(remote.map((product) => ({ ...product, stock:product.stock || 0, price:product.salePriceMinor || product.price || 0 })));
      }, () => setNotification({ message:'No se pudo leer productos remotos; se conserva la vista de revisión.', type:'error' }));
      return unsubscribe;
    }, [authUser]);

    useEffect(() => {
      if (!D.firestore || !authUser) return undefined;
      const unsubscribe = D.firestore.collection('customers').where('active', '==', true).limit(100).onSnapshot((snapshot) => {
        const remote = snapshot.docs.map((doc) => ({ id:doc.id, ...doc.data() }));
        if (remote.length) setCustomers(remote.map((customer) => ({ ...customer, balance:Number(customer.balanceMinorProjection ?? customer.balance ?? 0) })));
      }, () => setNotification({ message:'No se pudo leer clientes remotos; se conserva la vista de revisión.', type:'error' }));
      return unsubscribe;
    }, [authUser]);

    useEffect(() => {
      if (!notification || notification.type === 'loading') return undefined;
      const timer = window.setTimeout(() => setNotification(null), 4200); return () => window.clearTimeout(timer);
    }, [notification]);
    useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {}); }, []);

    const addToCart = (product, rawQty = 1) => setCart((current) => {
      const qty = Math.max(1, Math.min(Number(rawQty) || 1, product.stock));
      const found = current.find((item) => item.id === product.id);
      if (found) return current.map((item) => item.id === product.id ? { ...item, qty:Math.min(Number(item.qty) + qty, product.stock) } : item);
      return [...current, { ...product, qty }];
    });
    const setCartQty = (id, rawValue) => setCart((current) => current.map((item) => item.id === id ? { ...item, qty:Math.max(0, Math.min(Number(String(rawValue).replace(/[^0-9]/g, '')) || 0, item.stock)) } : item).filter((item) => item.qty > 0));
    const notify = (message, type='info') => setNotification({ message, type });
    const confirmSale = async (saleType, customerId) => {
      if (savingOperation) return;
      if (!cart.length) { notify('Agrega al menos un producto antes de confirmar.'); return; }
      if (!cashOpen) { notify('La caja está cerrada; abre un turno antes de vender.', 'error'); return; }
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (saleType === 'credito') { notify(customerId ? 'La venta a crédito está lista, pero la política de crédito sigue pendiente de confirmación.' : 'Selecciona un cliente antes de solicitar la aprobación.'); return; }
      if (!D.services.firestore) { notify('El servicio Firestore todavía no está disponible.', 'error'); return; }
      setSavingOperation('sale'); setNotification({ message:'Guardando venta de contado…', type:'loading' });
      try {
        await D.services.firestore.confirmCashSale({ lines:cart });
        setProducts((current) => current.map((product) => { const line = cart.find((item) => item.id === product.id); return line ? { ...product, stock:product.stock - line.qty } : product; }));
        setCart([]); setNotification({ message:'Venta guardada en Firestore · ' + D.money(total), type:'success' }); setView('inicio');
      } catch (error) { setNotification({ message:error.message || 'No se pudo guardar la venta.', type:'error' }); }
      finally { setSavingOperation(''); }
    };
    const registerPayment = async (customerId, amountMinor, method) => {
      if (savingOperation) return false;
      if (!D.services.firestore) { notify('El servicio Firestore todavía no está disponible.', 'error'); return false; }
      setSavingOperation('payment'); setNotification({ message:'Guardando abono…', type:'loading' });
      try {
        const result = await D.services.firestore.registerPayment({ customerId, amountMinor, method });
        setCustomers((current) => current.map((customer) => customer.id === customerId ? { ...customer, balance:Math.max(0, customer.balance - Number(amountMinor)) } : customer));
        setNotification({ message:result.repeated ? 'El abono ya estaba guardado.' : 'Abono guardado en Firestore.', type:'success' });
        return true;
      } catch (error) { setNotification({ message:error.message || 'No se pudo guardar el abono.', type:'error' }); return false; }
      finally { setSavingOperation(''); }
    };
    const saveAdjustment = async (payload) => {
      if (savingOperation) return false;
      if (!D.services.firestore) { notify('El servicio Firestore todavía no está disponible.', 'error'); return false; }
      setSavingOperation('adjustment'); setNotification({ message:'Guardando solicitud de ajuste…', type:'loading' });
      try {
        await D.services.firestore.requestInventoryAdjustment(payload);
        setNotification({ message:'Solicitud de ajuste guardada en Firestore.', type:'success' });
        return true;
      } catch (error) { setNotification({ message:error.message || 'No se pudo guardar el ajuste.', type:'error' }); return false; }
      finally { setSavingOperation(''); }
    };
    const logout = () => D.firebaseAuth && D.firebaseAuth.signOut();

    if (D.hasFirebaseConfig && !authChecked) return h('div', { className:'auth-screen' }, h('div', { className:'auth-card' }, 'Comprobando acceso…'));
    if (D.hasFirebaseConfig && !authUser) return h(AuthScreen, { error:D.firebaseBootError });
    const Screens = D.Screens;
    const screens = {
      inicio:h(Screens.Dashboard, { products, setView, movements:D.demoMovements, cashOpen }),
      productos:h(Screens.ProductsView, { products, onAdd:addToCart, setToast }),
      ventas:h(Screens.SalesView, { products, customers, cart, addToCart, setCartQty, confirmSale, setView, setToast:notify, savingOperation }),
      clientes:h(Screens.CustomersView, { customers, registerPayment, setToast:notify, savingOperation }),
      caja:h(Screens.CashView, { cashOpen, setCashOpen, setToast }),
      control:h(Screens.ControlView, { products, setView, setToast:notify, saveAdjustment, savingOperation }),
      reportes:h(Screens.ReportsView, { products, customers }),
      menu:h(Screens.MenuView, { setView, toggleTheme:() => setDarkMode((current) => !current), darkMode }),
      ajustes:h(Screens.SettingsView, { firebaseReady:Boolean(D.firestore), authUser, logout, setToast }),
    };
    return h('div', { className:'app-shell' }, [
      h('header', { className:'topbar', key:'top' }, [
        h('button', { className:'brand-lockup brand-home', key:'brand', onClick:() => setView('inicio') }, [h('img', { key:'logo', className:'brand-logo-image', src:'./ysoft-mark.svg', alt:'Y Soft' }), h('span', { key:'copy' }, [h('span', { key:'wordmark', className:'brand-wordmark' }, 'Y Soft'), h('span', { key:'sub', className:'brand-sub' }, 'Operación diaria')])]),
        h('div', { className:'top-actions', key:'actions' }, [h('button', { key:'theme', className:'icon-button', onClick:() => setDarkMode((current) => !current), 'aria-label':darkMode ? 'Usar modo claro' : 'Usar modo oscuro' }, h(Icon, { name:darkMode ? 'sun' : 'moon', size:17 })), h('button', { key:'profile', className:'avatar-button', onClick:() => setView('ajustes'), 'aria-label':'Abrir perfil' }, authUser ? D.initials(authUser.displayName || authUser.email || 'US') : 'YS')]),
      ]),
      !D.hasFirebaseConfig && h('div', { className:'mode-strip', key:'mode' }, [h(Icon, { key:'icon', name:'alert', size:15 }), h('strong', { key:'title' }, 'Modo revisión local'), h('span', { key:'detail' }, 'No se escriben ventas ni saldos en Firestore.'), h('button', { key:'configure', onClick:() => setView('ajustes') }, 'Configurar')]),
      h('main', { className:'app-main', key:'main' }, screens[view] || screens.inicio),
      h(BottomNav, { view, setView, key:'nav' }), notification && h('div', { className:'toast toast-' + notification.type, key:'toast', role:notification.type === 'error' ? 'alert' : 'status', 'aria-live':notification.type === 'error' ? 'assertive' : 'polite' }, [notification.type === 'loading' && h('span', { key:'spinner', className:'toast-spinner', 'aria-hidden':true }), h('span', { key:'message' }, notification.message)]),
    ]);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
