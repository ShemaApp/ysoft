/*
  Y Soft — shell de aplicación.
  Las operaciones de revisión actualizan el estado local para explorar el flujo; ninguna escritura financiera
  se envía a Firestore hasta confirmar políticas y desplegar reglas transaccionales revisadas.
*/
(function () {
  'use strict';
  const D = window.YSoft = window.YSoft || {};
  const h = D.h; const { useEffect, useState } = React; const { Icon, Button, BottomNav } = D;
  const getHashView = () => window.location.hash.replace(/^#/, '') || 'inicio';

  function AuthScreen({ error }) {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(error || '');
    const signIn = async (event) => {
      event.preventDefault(); setMessage('');
      try { await D.firebaseAuth.signInWithEmailAndPassword(email, password); } catch (err) { setMessage('No se pudo iniciar sesión. Revisa las credenciales de Firebase.'); }
    };
    return h('div', { className:'auth-screen' }, h('form', { className:'auth-card', onSubmit:signIn }, [
      h('div', { className:'brand-mark-symbol', 'aria-hidden':true }, 'Y'), h('h1', null, 'Acceso a Y Soft'),
      h('p', null, 'Ingresa con Firebase Authentication para consultar la operación de tu organización.'),
      message && h('div', { className:'error-message' }, message),
      h('div', { className:'field' }, [h('label', { htmlFor:'email' }, 'Correo'), h('input', { id:'email', className:'input', type:'email', value:email, onChange:(event) => setEmail(event.target.value), required:true })]),
      h('div', { className:'field' }, [h('label', { htmlFor:'password' }, 'Contraseña'), h('input', { id:'password', className:'input', type:'password', value:password, onChange:(event) => setPassword(event.target.value), required:true })]),
      h(Button, { kind:'primary', type:'submit' }, 'Entrar al cuaderno'),
    ]));
  }

  function App() {
    const [authUser, setAuthUser] = useState(null); const [authChecked, setAuthChecked] = useState(!D.hasFirebaseConfig);
    const [view, setViewState] = useState(getHashView); const [products, setProducts] = useState(D.demoProducts); const [customers, setCustomers] = useState(D.demoCustomers);
    const [cart, setCart] = useState([]); const [toast, setToast] = useState(''); const [cashOpen, setCashOpen] = useState(true); const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('ysoft-theme') === 'dark');
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
      }, () => setToast('No se pudo leer productos remotos; se conserva la vista de revisión.'));
      return unsubscribe;
    }, [authUser]);

    useEffect(() => {
      if (!toast) return undefined;
      const timer = window.setTimeout(() => setToast(''), 3300); return () => window.clearTimeout(timer);
    }, [toast]);
    useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {}); }, []);

    const addToCart = (product, rawQty = 1) => setCart((current) => {
      const qty = Math.max(1, Math.min(Number(rawQty) || 1, product.stock));
      const found = current.find((item) => item.id === product.id);
      if (found) return current.map((item) => item.id === product.id ? { ...item, qty:Math.min(Number(item.qty) + qty, product.stock) } : item);
      return [...current, { ...product, qty }];
    });
    const setCartQty = (id, rawValue) => setCart((current) => current.map((item) => item.id === id ? { ...item, qty:Math.max(0, Math.min(Number(String(rawValue).replace(/[^0-9]/g, '')) || 0, item.stock)) } : item).filter((item) => item.qty > 0));
    const confirmSale = (saleType, customerId) => {
      if (!cart.length) { setToast('Agrega al menos un producto antes de confirmar.'); return; }
      if (!cashOpen) { setToast('La caja está cerrada; abre un turno antes de vender.'); return; }
      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (saleType === 'credito') { setToast(customerId ? 'La venta a crédito está lista, pero la política de crédito sigue pendiente de confirmación.' : 'Selecciona un cliente antes de solicitar la aprobación.'); return; }
      setProducts((current) => current.map((product) => { const line = cart.find((item) => item.id === product.id); return line ? { ...product, stock:product.stock - line.qty } : product; }));
      setCart([]); setToast('Venta de contado preparada en modo revisión · ' + D.money(total)); setView('inicio');
    };
    const registerPayment = (customerId) => {
      setCustomers((current) => current.map((customer) => customer.id === customerId ? { ...customer, balance:Math.max(0, customer.balance - 180000) } : customer));
      setToast('Abono preparado para revisión; la escritura real requiere Firebase y reglas activas.');
    };
    const logout = () => D.firebaseAuth && D.firebaseAuth.signOut();

    if (D.hasFirebaseConfig && !authChecked) return h('div', { className:'auth-screen' }, h('div', { className:'auth-card' }, 'Comprobando acceso…'));
    if (D.hasFirebaseConfig && !authUser) return h(AuthScreen, { error:D.firebaseBootError });
    const Screens = D.Screens;
    const screens = {
      inicio:h(Screens.Dashboard, { products, setView, movements:D.demoMovements, cashOpen }),
      productos:h(Screens.ProductsView, { products, onAdd:addToCart, setToast }),
      ventas:h(Screens.SalesView, { products, customers, cart, addToCart, setCartQty, confirmSale, setView, setToast }),
      clientes:h(Screens.CustomersView, { customers, registerPayment, setToast }),
      caja:h(Screens.CashView, { cashOpen, setCashOpen, setToast }),
      control:h(Screens.ControlView, { products, setView, setToast }),
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
      h(BottomNav, { view, setView, key:'nav' }), toast && h('div', { className:'toast', key:'toast' }, toast),
    ]);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
