// ============================================================
// 🔥 FUNCIONES DE FIREBASE PARA EL SISTEMA
// ============================================================

// ============================================================
// AUTENTICACIÓN
// ============================================================

// Iniciar sesión
async function loginFirebase(email, password) {
    try {
        console.log('🔑 Intentando login con:', email);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;
        console.log('✅ Login exitoso, UID:', uid);
        
        const doc = await db.collection('usuarios').doc(uid).get();
        const userData = doc.data();
        const usuario = { uid: uid, ...userData, id: uid };
        localStorage.setItem('sg_usuario_actual', JSON.stringify(usuario));
        
        console.log('📋 Datos del usuario:', usuario);
        return { success: true, user: userCredential.user, data: userData };
    } catch (error) {
        console.error('❌ Error en login:', error);
        let mensaje = 'Error al iniciar sesión';
        if (error.code === 'auth/user-not-found') mensaje = 'Usuario no encontrado en Authentication';
        else if (error.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta';
        else if (error.code === 'auth/invalid-email') mensaje = 'Correo electrónico inválido';
        else if (error.code === 'auth/too-many-requests') mensaje = 'Demasiados intentos. Intenta más tarde';
        else if (error.code === 'auth/network-request-failed') mensaje = 'Error de red. Verifica tu conexión.';
        return { success: false, error: mensaje };
    }
}
// Registrar usuario
async function registrarFirebase(email, password, datosUsuario) {
    try {
        console.log('📧 Registrando con email:', email);
        console.log('👤 Nombre:', datosUsuario.nombre);
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;
        console.log('✅ Usuario creado con UID:', uid);
        
        await db.collection('usuarios').doc(uid).set({
            uid: uid,
            nombre: datosUsuario.nombre || '',
            email: email,
            telefono: datosUsuario.telefono || '',
            area: datosUsuario.area || '',
            puesto: datosUsuario.puesto || '',
            nip: datosUsuario.nip || '',
            rol: datosUsuario.rol || 'usuario',
            fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Datos guardados en Firestore');
        
        return { success: true, uid: uid };
    } catch (error) {
        console.error('❌ Error en registrarFirebase:', error);
        let mensaje = 'Error al registrar usuario';
        if (error.code === 'auth/email-already-in-use') mensaje = 'El correo ya está registrado';
        else if (error.code === 'auth/weak-password') mensaje = 'La contraseña debe tener al menos 6 caracteres';
        else if (error.code === 'auth/invalid-email') mensaje = 'El correo electrónico no es válido';
        else if (error.code === 'auth/operation-not-allowed') mensaje = '⚠️ El registro no está habilitado. Ve a Firebase Console → Authentication → Sign-in methods y activa "Correo electrónico/Contraseña"';
        else if (error.code === 'auth/network-request-failed') mensaje = '❌ Error de red. Verifica tu conexión a internet.';
        else mensaje = error.message || 'Error desconocido';
        return { success: false, error: mensaje };
    }
}

// Cerrar sesión
async function logoutFirebase() {
    try {
        await auth.signOut();
        localStorage.removeItem('sg_usuario_actual');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getCurrentUser() {
    return auth.currentUser;
}

function onAuthStateChanged(callback) {
    auth.onAuthStateChanged(callback);
}

// ============================================================
// USUARIOS (CRUD)
// ============================================================

async function obtenerUsuariosFirebase() {
    try {
        const snapshot = await db.collection('usuarios').get();
        const usuarios = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            usuarios.push({ 
                id: doc.id, 
                ...data,
                fecha_registro: data.fecha_registro ? data.fecha_registro.toDate().toISOString() : null
            });
        });
        // Ordenar manualmente
        usuarios.sort((a, b) => {
            const dateA = a.fecha_registro ? new Date(a.fecha_registro) : new Date(0);
            const dateB = b.fecha_registro ? new Date(b.fecha_registro) : new Date(0);
            return dateB - dateA;
        });
        return { success: true, data: usuarios };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function obtenerUsuarioPorIdFirebase(uid) {
    try {
        const doc = await db.collection('usuarios').doc(uid).get();
        if (doc.exists) {
            const data = doc.data();
            return { 
                success: true, 
                data: { 
                    id: doc.id, 
                    ...data,
                    fecha_registro: data.fecha_registro ? data.fecha_registro.toDate().toISOString() : null
                } 
            };
        } else {
            return { success: false, error: 'Usuario no encontrado' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function actualizarUsuarioFirebase(uid, datos) {
    try {
        await db.collection('usuarios').doc(uid).update({
            ...datos,
            fecha_actualizacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function eliminarUsuarioFirebase(uid) {
    try {
        await db.collection('usuarios').doc(uid).delete();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// FALTAS (CRUD)
// ============================================================

async function agregarFaltaFirebase(usuarioId, fecha, tipo, motivo = '') {
    try {
        const docRef = await db.collection('faltas').add({
            usuario_id: usuarioId,
            fecha_falta: fecha ? firebase.firestore.Timestamp.fromDate(new Date(fecha)) : null,
            tipo: tipo,
            motivo: motivo,
            justificada: false,
            fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function obtenerFaltasFirebase(usuarioId) {
    try {
        const snapshot = await db.collection('faltas')
            .where('usuario_id', '==', usuarioId)
            .get();
        const faltas = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            faltas.push({ 
                id: doc.id, 
                ...data,
                fecha_falta: data.fecha_falta ? data.fecha_falta.toDate().toISOString() : null
            });
        });
        // Ordenar manualmente
        faltas.sort((a, b) => {
            const dateA = a.fecha_falta ? new Date(a.fecha_falta) : new Date(0);
            const dateB = b.fecha_falta ? new Date(b.fecha_falta) : new Date(0);
            return dateB - dateA;
        });
        return { success: true, data: faltas };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function justificarFaltaFirebase(faltaId, motivo, justificada = true) {
    try {
        await db.collection('faltas').doc(faltaId).update({
            motivo: motivo,
            justificada: justificada,
            fecha_justificacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function eliminarFaltaFirebase(faltaId) {
    try {
        await db.collection('faltas').doc(faltaId).delete();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// INCIDENCIAS (CRUD)
// ============================================================

async function agregarIncidenciaFirebase(usuarioId, datos) {
    try {
        const docRef = await db.collection('incidencias').add({
            usuario_id: usuarioId,
            tipo_incidencia: datos.tipo_incidencia || datos.tipo || 'Otra',
            fecha_inicio: datos.fecha_inicio || datos.fecha || '',
            fecha_fin: datos.fecha_fin || '',
            dias: datos.dias || 0,
            motivo: datos.motivo || '',
            observaciones: datos.observaciones || '',
            titulo: datos.titulo || '',
            prioridad: datos.prioridad || 'Media',
            plazo: datos.plazo || '',
            descripcion: datos.descripcion || '',
            pasos: datos.pasos || '',
            evidencia: datos.evidencia || '',
            causa_raiz: datos.causa_raiz || '',
            accion_inmediata: datos.accion_inmediata || '',
            solucion_definitiva: datos.solucion_definitiva || '',
            justificada: false,
            fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function obtenerIncidenciasFirebase(usuarioId) {
    try {
        const snapshot = await db.collection('incidencias')
            .where('usuario_id', '==', usuarioId)
            .get();
        const incidencias = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            incidencias.push({ 
                id: doc.id, 
                ...data,
                fecha_registro: data.fecha_registro ? data.fecha_registro.toDate().toISOString() : null
            });
        });
        // Ordenar manualmente
        incidencias.sort((a, b) => {
            const dateA = a.fecha_registro ? new Date(a.fecha_registro) : new Date(0);
            const dateB = b.fecha_registro ? new Date(b.fecha_registro) : new Date(0);
            return dateB - dateA;
        });
        return { success: true, data: incidencias };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function justificarIncidenciaFirebase(incidenciaId, datosJustificacion) {
    try {
        await db.collection('incidencias').doc(incidenciaId).update({
            ...datosJustificacion,
            justificada: true,
            fecha_justificacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// SERVICIOS (CRUD) - VERSIÓN SIN ÍNDICES
// ============================================================

async function agregarServicioFirebase(datos) {
    try {
        const anio = new Date().getFullYear();
        
        // Obtener todos los servicios del año (sin orderBy)
        const snapshotFolio = await db.collection('servicios')
            .where('anio', '==', anio)
            .get();
        
        // Calcular siguiente folio manualmente
        let siguienteFolio = 1;
        snapshotFolio.forEach(doc => {
            const data = doc.data();
            if (data.folio_anual && data.folio_anual >= siguienteFolio) {
                siguienteFolio = data.folio_anual + 1;
            }
        });
        
        const folio = `SERV-${anio}-${String(siguienteFolio).padStart(4, '0')}`;
        
        const docRef = await db.collection('servicios').add({
            folio: folio,
            folio_anual: siguienteFolio,
            anio: anio,
            anio_archivado: datos.anio_archivado || null,
            resuelto: 0,
            fecha_solicitud: datos.fecha_solicitud || '',
            nombre_solicitante: datos.nombre_solicitante || '',
            subsecretaria: datos.subsecretaria || '',
            direccion: datos.direccion || '',
            departamento: datos.departamento || '',
            descripcion_equipo: datos.descripcion || datos.descripcion_equipo || '',
            marca: datos.marca || '',
            modelo: datos.modelo || '',
            serie: datos.serie || '',
            numero_inventario: datos.numero_inventario || '',
            falla_reportada: datos.falla_reportada || '',
            nombre_entrega: datos.nombre_entrega || '',
            soporte_recibe: datos.soporte_recibe || '',
            accion_realizada: datos.accion_realizada || '',
            estatus: datos.estatus || 'Falla NO corregida',
            modalidad: datos.modalidad || 'Definitiva',
            fecha_realizacion: datos.fecha_realizacion || '',
            hora_conclusion: datos.hora_conclusion || '',
            nombre_recibe: datos.nombre_recibe || '',
            soporte_entrega: datos.soporte_entrega || '',
            es_equipo: datos.es_equipo || 0,
            fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error al agregar servicio:', error);
        return { success: false, error: error.message };
    }
}

async function obtenerServiciosFirebase(activos = true) {
    try {
        let query = db.collection('servicios');
        
        if (activos) {
            query = query.where('anio_archivado', '==', null);
        }
        
        const snapshot = await query.get();
        const servicios = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            servicios.push({ 
                id: doc.id, 
                ...data,
                fecha_registro: data.fecha_registro ? data.fecha_registro.toDate().toISOString() : null
            });
        });
        
        // Ordenar manualmente por fecha_registro (desc)
        servicios.sort((a, b) => {
            const dateA = a.fecha_registro ? new Date(a.fecha_registro) : new Date(0);
            const dateB = b.fecha_registro ? new Date(b.fecha_registro) : new Date(0);
            return dateB - dateA;
        });
        
        return { success: true, data: servicios };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function obtenerServiciosArchivadosFirebase(anio = null) {
    try {
        let query = db.collection('servicios').where('anio_archivado', '>', 0);
        
        if (anio) {
            query = query.where('anio_archivado', '==', parseInt(anio));
        }
        
        const snapshot = await query.get();
        const servicios = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            servicios.push({ 
                id: doc.id, 
                ...data,
                fecha_registro: data.fecha_registro ? data.fecha_registro.toDate().toISOString() : null
            });
        });
        
        // Ordenar manualmente por anio_archivado (desc)
        servicios.sort((a, b) => {
            return (b.anio_archivado || 0) - (a.anio_archivado || 0);
        });
        
        return { success: true, data: servicios };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function obtenerServicioPorIdFirebase(id) {
    try {
        const doc = await db.collection('servicios').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return { 
                success: true, 
                data: { 
                    id: doc.id, 
                    ...data,
                    fecha_registro: data.fecha_registro ? data.fecha_registro.toDate().toISOString() : null
                } 
            };
        } else {
            return { success: false, error: 'Servicio no encontrado' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function actualizarServicioFirebase(id, datos) {
    try {
        await db.collection('servicios').doc(id).update({
            ...datos,
            fecha_actualizacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function archivarServicioFirebase(id, anio) {
    try {
        await db.collection('servicios').doc(id).update({
            anio_archivado: anio || new Date().getFullYear(),
            fecha_archivo: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function cambiarEstadoServicioFirebase(id, resuelto) {
    try {
        await db.collection('servicios').doc(id).update({
            resuelto: resuelto ? 1 : 0,
            fecha_estado: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function eliminarServicioFirebase(id) {
    try {
        await db.collection('servicios').doc(id).delete();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// JUSTIFICACIONES (CRUD)
// ============================================================

async function agregarJustificacionFirebase(usuarioId, datos) {
    try {
        const docRef = await db.collection('justificaciones').add({
            usuario_id: usuarioId,
            tipo_incidencia: datos.tipo_incidencia || datos.tipo || 'Otra',
            fecha_inicio: datos.fecha_inicio || datos.fecha || '',
            fecha_fin: datos.fecha_fin || '',
            motivo: datos.motivo || '',
            observaciones: datos.observaciones || '',
            dias_justificar: datos.dias_justificar || '',
            consecutivo: datos.consecutivo || 'JUS-' + Date.now().toString(36).toUpperCase(),
            lugar_expedicion: datos.lugar_expedicion || 'TUXTLA GUTIÉRREZ, CHIAPAS',
            fecha_expedicion: datos.fecha_expedicion || new Date().toISOString(),
            solicita_nombre: datos.solicita_nombre || '',
            solicita_puesto: datos.solicita_puesto || '',
            autoriza_nombre: datos.autoriza_nombre || '',
            autoriza_puesto: datos.autoriza_puesto || '',
            visto_bueno_nombre: datos.visto_bueno_nombre || '',
            visto_bueno_puesto: datos.visto_bueno_puesto || '',
            fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function obtenerJustificacionesFirebase(usuarioId) {
    try {
        const snapshot = await db.collection('justificaciones')
            .where('usuario_id', '==', usuarioId)
            .get();
        const justificaciones = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            justificaciones.push({ 
                id: doc.id, 
                ...data,
                fecha_registro: data.fecha_registro ? data.fecha_registro.toDate().toISOString() : null
            });
        });
        justificaciones.sort((a, b) => {
            const dateA = a.fecha_registro ? new Date(a.fecha_registro) : new Date(0);
            const dateB = b.fecha_registro ? new Date(b.fecha_registro) : new Date(0);
            return dateB - dateA;
        });
        return { success: true, data: justificaciones };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

async function crearAdminPorDefecto() {
    try {
        const snapshot = await db.collection('usuarios')
            .where('email', '==', 'admin@admin.com')
            .get();
        
        if (snapshot.empty) {
            const userCredential = await auth.createUserWithEmailAndPassword('admin@admin.com', 'admin123');
            const uid = userCredential.user.uid;
            
            await db.collection('usuarios').doc(uid).set({
                uid: uid,
                nombre: 'Administrador',
                email: 'admin@admin.com',
                telefono: '9611234567',
                area: 'Dirección de Tecnologías',
                puesto: 'Administrador del Sistema',
                nip: '0001',
                rol: 'admin',
                fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Usuario administrador creado: admin@admin.com / admin123');
        }
    } catch (error) {
        console.log('ℹ️ El administrador ya existe o hubo un error:', error.message);
    }
}

// ============================================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================================

window.firebaseApp = {
    // Auth
    loginFirebase: loginFirebase,
    registrarFirebase: registrarFirebase,
    logoutFirebase: logoutFirebase,
    getCurrentUser: getCurrentUser,
    onAuthStateChanged: onAuthStateChanged,
    
    // Usuarios
    obtenerUsuariosFirebase: obtenerUsuariosFirebase,
    obtenerUsuarioPorIdFirebase: obtenerUsuarioPorIdFirebase,
    actualizarUsuarioFirebase: actualizarUsuarioFirebase,
    eliminarUsuarioFirebase: eliminarUsuarioFirebase,
    
    // Faltas
    agregarFaltaFirebase: agregarFaltaFirebase,
    obtenerFaltasFirebase: obtenerFaltasFirebase,
    justificarFaltaFirebase: justificarFaltaFirebase,
    eliminarFaltaFirebase: eliminarFaltaFirebase,
    
    // Incidencias
    agregarIncidenciaFirebase: agregarIncidenciaFirebase,
    obtenerIncidenciasFirebase: obtenerIncidenciasFirebase,
    justificarIncidenciaFirebase: justificarIncidenciaFirebase,
    
    // Servicios
    agregarServicioFirebase: agregarServicioFirebase,
    obtenerServiciosFirebase: obtenerServiciosFirebase,
    obtenerServiciosArchivadosFirebase: obtenerServiciosArchivadosFirebase,
    obtenerServicioPorIdFirebase: obtenerServicioPorIdFirebase,
    actualizarServicioFirebase: actualizarServicioFirebase,
    archivarServicioFirebase: archivarServicioFirebase,
    cambiarEstadoServicioFirebase: cambiarEstadoServicioFirebase,
    eliminarServicioFirebase: eliminarServicioFirebase,
    
    // Justificaciones
    agregarJustificacionFirebase: agregarJustificacionFirebase,
    obtenerJustificacionesFirebase: obtenerJustificacionesFirebase,
    
    // Inicialización
    crearAdminPorDefecto: crearAdminPorDefecto,
    
    // Referencias
    db: db,
    auth: auth
};

console.log('🔥 Firebase App cargada correctamente');
console.log('✅ Funciones disponibles:', Object.keys(window.firebaseApp));
console.log('✅ registrarFirebase existe:', typeof window.firebaseApp.registrarFirebase === 'function');