// ========================================
// SCRIPT.JS - PROYECTO OFFLINE COMPLETO
// ========================================

// ========================================
// 1. FUNCIONES PARA MANEJAR IMÁGENES
// ========================================

/**
 * Cambia la imagen de un elemento HTML
 * @param {string} idElemento - ID del elemento img
 * @param {string} nuevaImagen - Nombre del archivo en images/
 */
function cambiarImagen(idElemento, nuevaImagen) {
    const elemento = document.getElementById(idElemento);
    if (elemento) {
        elemento.src = 'images/' + nuevaImagen;
    }
}

/**
 * Previsualiza una imagen seleccionada localmente
 * @param {HTMLInputElement} input - Input de tipo file
 */
function previsualizarImagen(input) {
    const archivo = input.files[0];
    if (archivo) {
        const lector = new FileReader();
        lector.onload = function(e) {
            const preview = document.getElementById('vista-previa');
            if (preview) {
                preview.src = e.target.result;
            }
        };
        lector.readAsDataURL(archivo);
    }
}

/**
 * Carga una imagen segura (si falla, usa imagen por defecto)
 * @param {HTMLImageElement} imgElement - Elemento img
 * @param {string} imagenDefault - Nombre de la imagen por defecto
 */
function cargarImagenSegura(imgElement, imagenDefault) {
    imgElement.onerror = function() {
        this.src = 'images/' + imagenDefault;
    };
}

/**
 * Verifica si una imagen existe localmente
 * @param {string} ruta - Ruta de la imagen
 * @returns {Promise<boolean>}
 */
function imagenExiste(ruta) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = ruta;
    });
}

/**
 * Obtiene la ruta completa de una imagen en la carpeta images/
 * @param {string} nombreImagen - Nombre del archivo
 * @returns {string} Ruta completa
 */
function getImagePath(nombreImagen) {
    return 'images/' + nombreImagen;
}

// ========================================
// 2. GALERÍA DE IMÁGENES
// ========================================

// Lista de imágenes para la galería
const galeriaImagenes = [
    'images/producto-1.jpg',
    'images/producto-2.jpg',
    'images/producto-3.jpg',
    'images/banner-inicio.jpg'
];

let indiceActual = 0;

/**
 * Cambia la imagen de la galería
 * @param {number} direccion - 1 para siguiente, -1 para anterior
 */
function cambiarGaleria(direccion) {
    const galeriaImg = document.getElementById('galeria');
    if (!galeriaImg) return;
    
    indiceActual = (indiceActual + direccion + galeriaImagenes.length) % galeriaImagenes.length;
    galeriaImg.src = galeriaImagenes[indiceActual];
}

/**
 * Establece una imagen específica en la galería
 * @param {number} indice - Índice de la imagen
 */
function irGaleria(indice) {
    const galeriaImg = document.getElementById('galeria');
    if (!galeriaImg) return;
    
    if (indice >= 0 && indice < galeriaImagenes.length) {
        indiceActual = indice;
        galeriaImg.src = galeriaImagenes[indice];
    }
}

// ========================================
// 3. FUNCIONES DE UTILIDAD
// ========================================

/**
 * Muestra un mensaje en la interfaz
 * @param {string} mensaje - Texto del mensaje
 * @param {string} tipo - success, danger, warning, info
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    const container = document.getElementById('mensajes');
    if (!container) return;
    
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.innerHTML = `
        ${mensaje}
        <button class="close-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(alerta);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alerta.parentElement) {
            alerta.style.transition = 'opacity 0.5s';
            alerta.style.opacity = '0';
            setTimeout(() => alerta.remove(), 500);
        }
    }, 5000);
}

/**
 * Limpia los mensajes mostrados
 */
function limpiarMensajes() {
    const container = document.getElementById('mensajes');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Valida un formulario mostrando mensajes de error
 * @param {HTMLFormElement} form - Formulario a validar
 * @returns {boolean} - true si es válido
 */
function validarFormulario(form) {
    const campos = form.querySelectorAll('[required]');
    let valido = true;
    
    campos.forEach(campo => {
        if (!campo.value.trim()) {
            campo.style.borderColor = '#dc3545';
            valido = false;
        } else {
            campo.style.borderColor = '#28a745';
        }
    });
    
    if (!valido) {
        mostrarMensaje('⚠️ Por favor completa todos los campos obligatorios.', 'danger');
    }
    
    return valido;
}

// ========================================
// 4. EVENTOS Y CONFIGURACIÓN INICIAL
// ========================================

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== CONFIGURAR FORMULARIOS =====
    const formularios = document.querySelectorAll('form[data-validar]');
    formularios.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validarFormulario(this)) {
                e.preventDefault();
            }
        });
    });
    
    // ===== BOTÓN PARA CAMBIAR IMAGEN =====
    const botonCambiar = document.getElementById('btn-cambiar-imagen');
    if (botonCambiar) {
        botonCambiar.addEventListener('click', function() {
            const imagenes = ['logo.png', 'hero-bg.jpg', 'banner-inicio.jpg'];
            const aleatoria = imagenes[Math.floor(Math.random() * imagenes.length)];
            cambiarImagen('mi-imagen', aleatoria);
            mostrarMensaje('✅ Imagen cambiada a: ' + aleatoria, 'success');
        });
    }
    
    // ===== PREVISUALIZAR IMAGEN SUBIDA =====
    const inputFile = document.getElementById('input-file');
    if (inputFile) {
        inputFile.addEventListener('change', function() {
            previsualizarImagen(this);
        });
    }
    
    // ===== CARGAR IMAGEN SEGURA =====
    const miImg = document.getElementById('mi-imagen');
    if (miImg) {
        cargarImagenSegura(miImg, 'logo.png');
    }
    
    // ===== VERIFICAR SI EXISTE UNA IMAGEN LOCAL =====
    imagenExiste('images/logo.png').then(existe => {
        console.log('✅ Logo existe localmente:', existe);
    });
    
    // ===== BOTONES DE GALERÍA =====
    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnAnterior = document.getElementById('btn-anterior');
    
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', function() {
            cambiarGaleria(1);
        });
    }
    
    if (btnAnterior) {
        btnAnterior.addEventListener('click', function() {
            cambiarGaleria(-1);
        });
    }
    
    // ===== MENÚ MÓVIL (Toggle) =====
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // ===== SCROLL SUAVE A SECCIONES =====
    document.querySelectorAll('a[href^="#"]').forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // ===== CERRAR MENSAJES CON BOTÓN =====
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-btn')) {
            const alerta = e.target.closest('.alert');
            if (alerta) {
                alerta.style.transition = 'opacity 0.3s';
                alerta.style.opacity = '0';
                setTimeout(() => alerta.remove(), 300);
            }
        }
    });
    
    // ===== DETECTAR SI HAY INTERNET (Solo para mostrar estado) =====
    const statusInternet = document.getElementById('status-internet');
    if (statusInternet) {
        if (navigator.onLine) {
            statusInternet.textContent = '🌐 En línea';
            statusInternet.style.color = '#28a745';
        } else {
            statusInternet.textContent = '📴 Sin conexión (modo offline)';
            statusInternet.style.color = '#dc3545';
        }
        
        window.addEventListener('online', function() {
            statusInternet.textContent = '🌐 En línea';
            statusInternet.style.color = '#28a745';
            mostrarMensaje('🌐 Conexión restablecida', 'success');
        });
        
        window.addEventListener('offline', function() {
            statusInternet.textContent = '📴 Sin conexión (modo offline)';
            statusInternet.style.color = '#dc3545';
            mostrarMensaje('📴 Sin conexión a internet. Modo offline activo.', 'warning');
        });
    }
    
    // ===== CONSOLA DE INICIO =====
    console.log('✅ Proyecto Offline cargado correctamente');
    console.log('📁 Imágenes disponibles:', galeriaImagenes);
    console.log('🖼️ Total de imágenes en galería:', galeriaImagenes.length);
});

// ========================================
// 5. EXPORTAR FUNCIONES PARA USO GLOBAL
// ========================================

// Exportar para usar en otros scripts o en el navegador
window.cambiarImagen = cambiarImagen;
window.previsualizarImagen = previsualizarImagen;
window.cargarImagenSegura = cargarImagenSegura;
window.imagenExiste = imagenExiste;
window.getImagePath = getImagePath;
window.cambiarGaleria = cambiarGaleria;
window.irGaleria = irGaleria;
window.mostrarMensaje = mostrarMensaje;
window.limpiarMensajes = limpiarMensajes;
window.validarFormulario = validarFormulario;

// ========================================
// 6. FUNCIONES ADICIONALES PARA IMÁGENES
// ========================================

/**
 * Carga una imagen con efectos de transición
 * @param {string} idElemento - ID del elemento img
 * @param {string} nuevaImagen - Nombre del archivo
 * @param {number} duracion - Duración de la transición en ms
 */
function transicionImagen(idElemento, nuevaImagen, duracion = 500) {
    const img = document.getElementById(idElemento);
    if (!img) return;
    
    img.style.transition = `opacity ${duracion}ms`;
    img.style.opacity = '0';
    
    setTimeout(() => {
        img.src = 'images/' + nuevaImagen;
        img.style.opacity = '1';
    }, duracion);
}

/**
 * Crea una imagen de respaldo si no existe la original
 * @param {string} rutaOriginal - Ruta de la imagen original
 * @param {string} rutaRespaldo - Ruta de la imagen de respaldo
 */
function imagenConRespaldo(rutaOriginal, rutaRespaldo) {
    const img = new Image();
    img.onerror = function() {
        this.src = rutaRespaldo;
    };
    img.src = rutaOriginal;
    return img;
}

/**
 * Genera una imagen de color sólido (útil para pruebas)
 * @param {string} color - Color en formato hex o nombre
 * @param {number} width - Ancho de la imagen
 * @param {number} height - Alto de la imagen
 * @param {string} texto - Texto opcional
 * @returns {string} Data URL de la imagen
 */
function generarImagenColor(color, width = 200, height = 200, texto = '') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    if (texto) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, width / 2, height / 2);
    }
    
    return canvas.toDataURL('image/png');
}

/**
 * Obtiene el tamaño de una imagen
 * @param {string} ruta - Ruta de la imagen
 * @returns {Promise<{width: number, height: number}>}
 */
function obtenerTamañoImagen(ruta) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            resolve({ width: this.width, height: this.height });
        };
        img.onerror = function() {
            resolve({ width: 0, height: 0 });
        };
        img.src = ruta;
    });
}

// ========================================
// 7. FUNCIONES PARA EL MENÚ Y NAVEGACIÓN
// ========================================

/**
 * Abre un modal específico
 * @param {string} idModal - ID del modal
 */
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Cierra un modal específico
 * @param {string} idModal - ID del modal
 */
function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Cierra el modal al hacer clic fuera del contenido
 */
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ========================================
// 8. FUNCIONES PARA EL FOOTER Y RELOJ
// ========================================

/**
 * Actualiza el reloj en tiempo real
 */
function actualizarReloj() {
    const ahora = new Date();
    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const reloj = document.getElementById('reloj');
    if (reloj) {
        reloj.textContent = ahora.toLocaleDateString('es-MX', opciones);
    }
}

// Actualizar reloj cada segundo
setInterval(actualizarReloj, 1000);

// ========================================
// 9. FUNCIONES PARA EL BUSCADOR
// ========================================

/**
 * Busca elementos en una tabla o lista
 * @param {string} inputId - ID del input de búsqueda
 * @param {string} containerId - ID del contenedor de elementos
 * @param {string} selector - Selector de los elementos a filtrar
 */
function buscarElementos(inputId, containerId, selector) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    
    if (!input || !container) return;
    
    input.addEventListener('keyup', function() {
        const filtro = this.value.toLowerCase();
        const elementos = container.querySelectorAll(selector);
        
        elementos.forEach(elemento => {
            const texto = elemento.textContent.toLowerCase();
            elemento.style.display = texto.includes(filtro) ? '' : 'none';
        });
    });
}

// ========================================
// 10. INICIALIZAR COMPONENTES AUTOMÁTICAMENTE
// ========================================

// Si hay un buscador con ID 'buscador' y contenedor 'tabla-body'
document.addEventListener('DOMContentLoaded', function() {
    buscarElementos('buscador', 'tabla-body', 'tr');
});

// Si hay elementos con clase 'imagen-offline', cargarlos con respaldo
document.querySelectorAll('.imagen-offline').forEach(img => {
    const respaldo = img.dataset.respaldo || 'logo.png';
    cargarImagenSegura(img, respaldo);
});

console.log('✅ script.js cargado correctamente');