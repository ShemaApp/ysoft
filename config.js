/* Y Soft — configuración y utilidades compartidas. No contiene secretos. */
(function () {
  'use strict';
  const D = window.YSoft = window.YSoft || {};
  const config = window.YSOFT_FIREBASE_CONFIG || window.DISTRIBUIDORA_FIREBASE_CONFIG || { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };
  D.firebaseConfig = config;
  D.hasFirebaseConfig = Boolean(config.apiKey && config.projectId && config.appId);
  D.firebaseAuth = null; D.firestore = null; D.firebaseBootError = '';
  if (D.hasFirebaseConfig && window.firebase) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(config);
      D.firebaseAuth = firebase.auth(); D.firestore = firebase.firestore();
    } catch (error) { D.firebaseBootError = error.message || 'No fue posible iniciar Firebase.'; }
  }
  D.icons = {
    grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', box:'M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 8 12 13l8.7-5M12 13v8',
    receipt:'M4 2h16v20l-3-2-3 2-2-2-3 2-3-2-2 2V2zm4 5h8M8 11h8M8 15h5', users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7-7a4 4 0 0 1 0 7.7M22 21v-2a4 4 0 0 0-3-3.87', 'user-plus':'M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6m-3-3h6', calendar:'M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm3 8h3m2 0h3m-8 4h3', register:'M4 9h16v10H4zM7 9V6h10v3M8 13h8M8 16h3m5 0h1M10 19v2m4-2v2',
    cash:'M3 6h18v12H3zM7 10a3 3 0 1 0 0 4m10-4a3 3 0 1 1 0 4M12 9v6m-2-2h4', chart:'M4 19V5m0 14h17M8 16v-5m4 5V7m4 9v-8m4 8v-4', search:'m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z', moon:'M20.8 15.2A8.5 8.5 0 0 1 8.8 3.2 8.5 8.5 0 1 0 20.8 15.2z', sun:'M12 3v2m0 14v2M3 12h2m14 0h2m-3.36-6.36-1.42 1.42M6.78 17.22l-1.42 1.42m0-13.42 1.42 1.42m10.44 10.44 1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z', menu:'M4 6h16M4 12h16M4 18h16',
    plus:'M12 5v14M5 12h14', arrow:'M5 12h14m-6-6 6 6-6 6', rotate:'M20 11a8.1 8.1 0 0 0-14.7-3L3 11m0 0V5m0 6h6M4 13a8.1 8.1 0 0 0 14.7 3L21 13m0 0v6m0-6h-6', home:'M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9 20v-6h6v6', alert:'M10.3 3.1 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.1a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01', check:'m5 12 4 4L19 6', lock:'M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5V10z', logout:'M10 17l5-5-5-5m5 5H3m9-9V2h8v20h-8',
  };
  D.money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  D.initials = (name) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  D.todayLabel = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
})();
