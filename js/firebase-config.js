// ============================================================
// 🔥 CONFIGURACIÓN DE FIREBASE
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCWwbHoRPWEBMUH_8yk-k1f3cbuvhfOpOE",
    authDomain: "finanzas-2222c.firebaseapp.com",
    projectId: "finanzas-2222c",
    storageBucket: "finanzas-2222c.firebasestorage.app",
    messagingSenderId: "236811002554",
    appId: "1:236811002554:web:1b22165dd2c1df58195883"
};

// ============================================================
// INICIALIZAR FIREBASE
// ============================================================

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

db.settings({ timestampsInSnapshots: true });

console.log('🔥 Firebase inicializado correctamente');
console.log('📧 API Key:', firebaseConfig.apiKey);
console.log('📧 Project ID:', firebaseConfig.projectId);