// Datos globales
let clientes = [];
let productos = [];
let facturas = [];
let temporadas = [];
let inversiones = [];
let currentFactura = null;
let currentClienteProductos = null;
let graficoVentas = null;
let editandoCliente = false;
let editandoTemporada = null;
let editandoProducto = null;

// Métodos de pago disponibles
const metodosPago = {
    'contado': {
        nombre: 'Contado',
        descripcion: 'Pago completo al momento de la compra',
        calcularPagos: (total) => [total]
    },
    '50-50': {
        nombre: '50/50',
        descripcion: 'Mitad del pago al momento de la compra y mitad después',
        calcularPagos: (total) => {
            const pagoInicial = Math.round(total / 2);
            return [pagoInicial, total - pagoInicial];
        }
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
});

function inicializarSistema() {
    cargarDatos();
    configurarEventListeners();
    renderizarVistasIniciales();
    mostrarPestaña('clientes');
}

function configurarEventListeners() {
    // Pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            mostrarPestaña(tabId);
        });
    });

    // Formulario de cliente
    document.getElementById('clienteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (editandoCliente) {
            actualizarCliente();
        } else {
            agregarCliente();
        }
    });

    // Botón cancelar edición
    document.getElementById('btnCancelarEdicion').addEventListener('click', cancelarEdicionCliente);

    // Búsqueda de clientes
    document.getElementById('busquedaClientes').addEventListener('input', filtrarClientes);

    // Formulario de producto
    document.getElementById('productoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (editandoProducto) {
            actualizarProducto();
        } else {
            agregarProducto();
        }
    });

    // Botón cancelar edición producto
    document.getElementById('btnCancelarEdicionProducto').addEventListener('click', cancelarEdicionProducto);

    // Botones del modal de factura
    document.getElementById('btnDescargarJPG').addEventListener('click', descargarFacturaJPG);
    document.getElementById('btnEnviarWhatsApp').addEventListener('click', enviarFacturaWhatsApp);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
    document.getElementById('btnCerrarModalFactura').addEventListener('click', cerrarModal);
    document.getElementById('btnGenerarCotizacion').addEventListener('click', generarCotizacion);

    // Botones del modal de temporada
    document.getElementById('btnGuardarTemporada').addEventListener('click', guardarTemporada);
    document.getElementById('btnCancelarTemporada').addEventListener('click', cerrarModalTemporada);
    document.getElementById('btnCerrarModalTemporada').addEventListener('click', cerrarModalTemporada);

    // Botón de inversión
    document.getElementById('btnGuardarInversion').addEventListener('click', guardarInversion);

    // Preview de imagen
    document.getElementById('imagenProducto').addEventListener('change', mostrarPreviewImagen);

    // Modal productos cliente
    document.getElementById('btnGuardarProductosCliente').addEventListener('click', guardarProductosCliente);
    document.getElementById('btnMarcarVendido').addEventListener('click', marcarProductosComoVendidos);
    document.getElementById('btnCerrarModalProductos').addEventListener('click', cerrarModalProductos);
    document.getElementById('buscarProductoCliente').addEventListener('input', filtrarProductosCliente);

    // Configurar eventos para imágenes ampliables
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('img-producto')) {
            abrirModalImagen(e.target.src);
        }
    });

    // Cerrar modal de imagen
    document.getElementById('btnCerrarModalImagen').addEventListener('click', cerrarModalImagen);
}

function mostrarPestaña(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Desactivar todos los botones de pestaña
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activar pestaña seleccionada
    const tabToActivate = document.getElementById(tabId);
    if (tabToActivate) {
        tabToActivate.classList.add('active');
    }

    // Activar botón de pestaña
    const tabButton = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }

    // Actualizar gráfico si es la pestaña de logística
    if (tabId === 'logistica') {
        setTimeout(actualizarGraficoVentas, 100);
    }
}

// Formatear números como moneda CRC con el formato solicitado
function formatoMonedaCRC(valor) {
    const valorRedondeado = Math.round(valor);
    
    // Formato para valores pequeños
    if (valorRedondeado < 1000) {
        return `₡${valorRedondeado.toLocaleString('es-CR')}`;
    }
    
    // Formato para valores entre 1,000 y 999,999
    if (valorRedondeado < 1000000) {
        return `₡${valorRedondeado.toLocaleString('es-CR')}`;
    }
    
    // Formato para valores mayores a 1,000,000
    return `₡${valorRedondeado.toLocaleString('es-CR')}`;
}

// Sistema de clientes
function agregarCliente() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido1 = document.getElementById('apellido1').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();

    if (!nombre || !apellido1 || !whatsapp) {
        mostrarFeedback('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    const nuevoCliente = {
        id: Date.now().toString(),
        nombre,
        apellido1,
        apellido2: document.getElementById('apellido2').value.trim(),
        whatsapp: `+506${whatsapp}`,
        productos: [],
        fechaRegistro: new Date().toLocaleDateString('es-CR')
    };

    clientes.push(nuevoCliente);
    guardarDatos();
    
    document.getElementById('clienteForm').reset();
    renderizarClientes();
    mostrarFeedback('Cliente agregado correctamente', 'success');
}

function editarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) {
        mostrarFeedback('Cliente no encontrado', 'error');
        return;
    }

    editandoCliente = true;
    document.getElementById('clienteId').value = cliente.id;
    document.getElementById('nombre').value = cliente.nombre;
    document.getElementById('apellido1').value = cliente.apellido1;
    document.getElementById('apellido2').value = cliente.apellido2 || '';
    document.getElementById('whatsapp').value = cliente.whatsapp.replace('+506', '');
    
    document.getElementById('btnCancelarEdicion').style.display = 'inline-block';
    document.getElementById('btnGuardarCliente').innerHTML = '<i class="fas fa-save"></i> Actualizar Cliente';
    
    // Scroll al formulario
    document.getElementById('clienteForm').scrollIntoView({ behavior: 'smooth' });
}

function actualizarCliente() {
    const id = document.getElementById('clienteId').value;
    const clienteIndex = clientes.findIndex(c => c.id === id);
    
    if (clienteIndex === -1) {
        mostrarFeedback('Cliente no encontrado', 'error');
        return;
    }

    clientes[clienteIndex] = {
        ...clientes[clienteIndex],
        nombre: document.getElementById('nombre').value.trim(),
        apellido1: document.getElementById('apellido1').value.trim(),
        apellido2: document.getElementById('apellido2').value.trim(),
        whatsapp: `+506${document.getElementById('whatsapp').value.trim()}`
    };

    guardarDatos();
    cancelarEdicionCliente();
    renderizarClientes();
    mostrarFeedback('Cliente actualizado correctamente', 'success');
}

function cancelarEdicionCliente() {
    editandoCliente = false;
    document.getElementById('clienteForm').reset();
    document.getElementById('btnCancelarEdicion').style.display = 'none';
    document.getElementById('btnGuardarCliente').innerHTML = '<i class="fas fa-save"></i> Guardar Cliente';
    document.getElementById('clienteId').value = '';
}

function eliminarCliente(id) {
    if (!confirm('¿Está seguro de eliminar este cliente?')) {
        return;
    }

    clientes = clientes.filter(c => c.id !== id);
    guardarDatos();
    renderizarClientes();
    mostrarFeedback('Cliente eliminado correctamente', 'success');
}

function renderizarClientes() {
    const tbody = document.getElementById('cuerpoTablaClientes');
    if (!tbody) return;

    try {
        tbody.innerHTML = clientes.map(cliente => `
            <tr data-id="${cliente.id}">
                <td>${cliente.nombre} ${cliente.apellido1} ${cliente.apellido2 || ''}</td>
                <td>
                    <a href="https://wa.me/${cliente.whatsapp}" class="whatsapp-link" target="_blank">
                        <i class="fab fa-whatsapp"></i> ${cliente.whatsapp.replace('+506', '')}
                    </a>
                </td>
                <td>${cliente.fechaRegistro}</td>
                <td class="action-buttons">
                    <button onclick="editarCliente('${cliente.id}')" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="abrirModalProductosCliente('${cliente.id}')" class="btn btn-success btn-sm">
                        <i class="fas fa-cart-plus"></i> Productos
                    </button>
                    <button onclick="generarFactura('${cliente.id}')" class="btn btn-warning btn-sm">
                        <i class="fas fa-file-invoice"></i> Factura
                    </button>
                    <button onclick="eliminarCliente('${cliente.id}')" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Error al renderizar clientes:", error);
        tbody.innerHTML = '<tr><td colspan="4" class="error-message">Error al cargar la lista de clientes</td></tr>';
    }
}

function filtrarClientes() {
    const busqueda = document.getElementById('busquedaClientes').value.toLowerCase();
    const filas = document.querySelectorAll('#cuerpoTablaClientes tr');
    
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(busqueda) ? '' : 'none';
    });
}

// Sistema de productos
function agregarProducto() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const precioBase = parseFloat(document.getElementById('precioBase').value);
    const ganancia = parseFloat(document.getElementById('ganancia').value) || 30;
    const categoria = document.getElementById('categoriaProducto').value;
    const imagenInput = document.getElementById('imagenProducto');
    
    if (!nombre || isNaN(precioBase)) {
        mostrarFeedback('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    if (editandoProducto) {
        // Si estamos editando, no requerimos imagen nueva
        actualizarProducto();
        return;
    }

    if (!imagenInput.files || !imagenInput.files[0]) {
        mostrarFeedback('Por favor seleccione una imagen PNG', 'error');
        return;
    }

    // Verificar que el archivo sea PNG
    const file = imagenInput.files[0];
    if (file.type !== 'image/png') {
        mostrarFeedback('Solo se permiten archivos PNG', 'error');
        return;
    }

    const iva = Math.round(precioBase * 0.13);
    const gananciaMonetaria = Math.round(precioBase * (ganancia / 100));
    const precioFinal = Math.round(precioBase + iva + gananciaMonetaria);

    // Convertir imagen a base64 con tamaño 1200x1200
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const targetWidth = 1200;
            const targetHeight = 1200;
            
            // Redimensionar manteniendo proporciones
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            // Convertir a base64
            const imagenComprimida = canvas.toDataURL('image/png');
            
            const nuevoProducto = {
                id: Date.now().toString(),
                nombre,
                precioBase,
                iva,
                ganancia: gananciaMonetaria,
                precioFinal,
                categoria,
                imagen: imagenComprimida,
                ventas: 0,
                estado: 'disponible'
            };

            productos.push(nuevoProducto);
            guardarDatos();
            
            document.getElementById('productoForm').reset();
            document.getElementById('imagePreview').innerHTML = '';
            renderizarProductos();
            mostrarFeedback('Producto agregado correctamente', 'success');
        };
    };
    
    reader.readAsDataURL(file);
}

function actualizarProducto() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const precioBase = parseFloat(document.getElementById('precioBase').value);
    const ganancia = parseFloat(document.getElementById('ganancia').value) || 30;
    const categoria = document.getElementById('categoriaProducto').value;
    
    if (!nombre || isNaN(precioBase)) {
        mostrarFeedback('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    const productoIndex = productos.findIndex(p => p.id === editandoProducto);
    if (productoIndex === -1) {
        mostrarFeedback('Producto no encontrado', 'error');
        return;
    }

    const iva = Math.round(precioBase * 0.13);
    const gananciaMonetaria = Math.round(precioBase * (ganancia / 100));
    const precioFinal = Math.round(precioBase + iva + gananciaMonetaria);

    productos[productoIndex] = {
        ...productos[productoIndex],
        nombre,
        precioBase,
        iva,
        ganancia: gananciaMonetaria,
        precioFinal,
        categoria
    };

    finalizarEdicionProducto();
}

function mostrarPreviewImagen(event) {
    const input = event.target;
    const preview = document.getElementById('imagePreview');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Verificar que sea PNG
        if (file.type !== 'image/png') {
            mostrarFeedback('Solo se permiten archivos PNG', 'error');
            input.value = ''; // Limpiar el input
            preview.innerHTML = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid #ddd; cursor: pointer;" onclick="abrirModalImagen('${e.target.result}')">`;
        };
        
        reader.readAsDataURL(file);
    }
}

function renderizarProductos() {
    const tbody = document.getElementById('cuerpoTablaProductos');
    if (!tbody) return;

    try {
        tbody.innerHTML = productos.map(producto => {
            let estadoClass = '';
            let estadoText = '';
            
            switch(producto.estado) {
                case 'disponible':
                    estadoClass = 'estado-disponible';
                    estadoText = 'Disponible';
                    break;
                case 'reservado':
                    estadoClass = 'estado-reservado';
                    estadoText = 'Reservado';
                    break;
                case 'vendido':
                    estadoClass = 'estado-vendido';
                    estadoText = 'Vendido';
                    break;
                default:
                    estadoClass = 'estado-disponible';
                    estadoText = 'Disponible';
            }
            
            return `
                <tr data-id="${producto.id}">
                    <td><img src="${producto.imagen}" class="img-producto" alt="${producto.nombre}" onclick="abrirModalImagen('${producto.imagen}')"></td>
                    <td>${producto.nombre}</td>
                    <td>${producto.categoria}</td>
                    <td>${formatoMonedaCRC(producto.precioBase)}</td>
                    <td>${formatoMonedaCRC(producto.iva)}</td>
                    <td>${formatoMonedaCRC(producto.ganancia)}</td>
                    <td>${formatoMonedaCRC(producto.precioFinal)}</td>
                    <td class="${estadoClass}">${estadoText}</td>
                    <td class="action-buttons">
                        <button onclick="editarProducto('${producto.id}')" class="btn btn-primary btn-sm">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="eliminarProducto('${producto.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Error al renderizar productos:", error);
        tbody.innerHTML = '<tr><td colspan="9" class="error-message">Error al cargar la lista de productos</td></tr>';
    }
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        mostrarFeedback('Producto no encontrado', 'error');
        return;
    }

    editandoProducto = id;
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombreProducto').value = producto.nombre;
    document.getElementById('precioBase').value = producto.precioBase;
    document.getElementById('ganancia').value = Math.round((producto.ganancia / producto.precioBase) * 100);
    document.getElementById('categoriaProducto').value = producto.categoria;
    document.getElementById('imagePreview').innerHTML = `<img src="${producto.imagen}" style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid #ddd; cursor: pointer;" onclick="abrirModalImagen('${producto.imagen}')">`;
    
    document.getElementById('btnCancelarEdicionProducto').style.display = 'inline-block';
    document.getElementById('btnGuardarProducto').innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
    
    // Scroll al formulario
    document.getElementById('productoForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicionProducto() {
    editandoProducto = null;
    document.getElementById('productoForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('btnCancelarEdicionProducto').style.display = 'none';
    document.getElementById('btnGuardarProducto').innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Producto';
    document.getElementById('productoId').value = '';
}

function finalizarEdicionProducto() {
    guardarDatos();
    editandoProducto = null;
    document.getElementById('productoForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('btnCancelarEdicionProducto').style.display = 'none';
    document.getElementById('btnGuardarProducto').innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Producto';
    document.getElementById('productoId').value = '';
    renderizarProductos();
    mostrarFeedback('Producto actualizado correctamente', 'success');
}

function eliminarProducto(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) {
        return;
    }

    // Verificar si el producto está asignado a algún cliente
    const productoAsignado = clientes.some(cliente => 
        cliente.productos.some(producto => producto.id === id)
    );

    if (productoAsignado) {
        mostrarFeedback('No se puede eliminar el producto porque está asignado a un cliente', 'error');
        return;
    }

    productos = productos.filter(p => p.id !== id);
    guardarDatos();
    renderizarProductos();
    mostrarFeedback('Producto eliminado correctamente', 'success');
}

// Sistema de productos por cliente
function abrirModalProductosCliente(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
        mostrarFeedback('Cliente no encontrado', 'error');
        return;
    }

    currentClienteProductos = cliente;
    renderizarProductosCliente();
    document.getElementById('modalProductosCliente').style.display = 'block';
}

function renderizarProductosCliente() {
    const tbody = document.getElementById('cuerpoTablaProductosCliente');
    const noProductsMsg = document.getElementById('noProductosMessage');
    
    if (!tbody || !currentClienteProductos) return;

    try {
        // Filtrar productos disponibles (no asignados a otros clientes)
        const productosDisponibles = productos.filter(producto => {
            // Si el producto está asignado a este cliente, mostrarlo
            if (currentClienteProductos.productos.some(p => p.id === producto.id)) {
                return true;
            }
            
            // Si no está asignado a ningún cliente, mostrarlo
            return !clientes.some(cliente => 
                cliente.id !== currentClienteProductos.id && 
                cliente.productos.some(p => p.id === producto.id)
            );
        });

        // Mostrar mensaje si no hay productos
        if (productosDisponibles.length === 0) {
            noProductsMsg.style.display = 'block';
            tbody.innerHTML = '';
            return;
        } else {
            noProductsMsg.style.display = 'none';
        }

        tbody.innerHTML = productosDisponibles.map(producto => {
            const productoCliente = currentClienteProductos.productos.find(p => p.id === producto.id);
            const enCarrito = productoCliente !== undefined;
            let estadoText = 'Disponible';
            let estadoClass = 'estado-disponible';
            
            if (enCarrito) {
                estadoText = productoCliente.estado === 'vendido' ? 'Vendido' : 'Reservado';
                estadoClass = productoCliente.estado === 'vendido' ? 'estado-vendido' : 'estado-reservado';
            }

            return `
                <tr data-id="${producto.id}">
                    <td><img src="${producto.imagen}" class="img-producto" alt="${producto.nombre}" onclick="abrirModalImagen('${producto.imagen}')"></td>
                    <td>${producto.nombre}</td>
                    <td>${formatoMonedaCRC(producto.precioFinal)}</td>
                    <td class="${estadoClass}">${estadoText}</td>
                    <td>
                        <button onclick="toggleProductoCliente('${producto.id}')" class="btn ${enCarrito ? 'btn-danger' : 'btn-success'} btn-sm">
                            <i class="fas ${enCarrito ? 'fa-trash' : 'fa-cart-plus'}"></i> ${enCarrito ? 'Quitar' : 'Agregar'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Error al renderizar productos del cliente:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="error-message">Error al cargar los productos</td></tr>';
    }
}

function toggleProductoCliente(productoId) {
    if (!currentClienteProductos) return;

    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const productoIndex = currentClienteProductos.productos.findIndex(p => p.id === productoId);
    
    if (productoIndex === -1) {
        // Agregar producto
        currentClienteProductos.productos.push({
            id: producto.id,
            nombre: producto.nombre,
            precioFinal: producto.precioFinal,
            estado: 'reservado'
        });
    } else {
        // Quitar producto
        currentClienteProductos.productos.splice(productoIndex, 1);
    }

    renderizarProductosCliente();
}

function marcarProductosComoVendidos() {
    if (!currentClienteProductos) return;

    // Verificar si hay productos seleccionados
    if (currentClienteProductos.productos.length === 0) {
        const noProductsMsg = document.getElementById('noProductosMessage');
        noProductsMsg.style.display = 'block';
        noProductsMsg.innerHTML = '<i class="fas fa-info-circle"></i> Agrega los productos a este cliente';
        noProductsMsg.classList.add('error-message');
        setTimeout(() => {
            noProductsMsg.classList.remove('error-message');
        }, 2000);
        return;
    }

    // Marcar todos los productos del cliente como vendidos
    currentClienteProductos.productos.forEach(productoCliente => {
        productoCliente.estado = 'vendido';
        
        // Actualizar el estado en la lista general de productos
        const productoIndex = productos.findIndex(p => p.id === productoCliente.id);
        if (productoIndex !== -1) {
            productos[productoIndex].estado = 'vendido';
            productos[productoIndex].ventas += 1;
        }
    });

    // Crear factura automáticamente
    generarFactura(currentClienteProductos.id);
    
    guardarDatos();
    cerrarModalProductos();
    renderizarProductos();
    mostrarFeedback('Productos marcados como vendidos y factura generada', 'success');
}

function filtrarProductosCliente() {
    const busqueda = document.getElementById('buscarProductoCliente').value.toLowerCase();
    const filas = document.querySelectorAll('#cuerpoTablaProductosCliente tr');
    
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(busqueda) ? '' : 'none';
    });
}

function guardarProductosCliente() {
    if (!currentClienteProductos) return;

    // Actualizar cliente en el array principal
    const clienteIndex = clientes.findIndex(c => c.id === currentClienteProductos.id);
    if (clienteIndex !== -1) {
        clientes[clienteIndex] = currentClienteProductos;
        guardarDatos();
        mostrarFeedback('Productos del cliente actualizados correctamente', 'success');
        cerrarModalProductos();
    }
}

function cerrarModalProductos() {
    const modal = document.getElementById('modalProductosCliente');
    modal.classList.add('closing');
    modal.querySelector('.modal-content').classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        modal.querySelector('.modal-content').classList.remove('closing');
        currentClienteProductos = null;
    }, 300);
}

// Sistema de facturas
function generarFactura(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
        mostrarFeedback('Cliente no encontrado', 'error');
        return;
    }

    // Filtrar solo productos marcados como vendidos (si estamos en modo vendido)
    const productosFactura = cliente.productos.filter(p => p.estado === 'vendido');

    if (productosFactura.length === 0) {
        mostrarFeedback('El cliente no tiene productos vendidos', 'warning');
        return;
    }

    currentFactura = {
        id: Date.now().toString(),
        cliente: { ...cliente },
        productos: productosFactura,
        fecha: new Date().toLocaleDateString('es-CR'),
        hora: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
        total: productosFactura.reduce((sum, p) => sum + p.precioFinal, 0),
        tipo: 'factura',
        metodoPago: 'contado' // Opción por defecto
    };

    renderizarFactura();
    document.getElementById('modalFactura').style.display = 'block';
}

function seleccionarMetodoPago(metodo) {
    if (!currentFactura) return;
    
    currentFactura.metodoPago = metodo;
    renderizarFactura();
    mostrarFeedback(`Método de pago cambiado a: ${metodosPago[metodo].nombre}`, 'success');
}

function generarCotizacion() {
    if (!currentFactura) return;

    // Convertir factura en cotización
    currentFactura.tipo = 'cotizacion';
    renderizarFactura();
    mostrarFeedback('Cotización generada correctamente', 'success');
}

function renderizarFactura() {
    const facturaContenido = document.getElementById('facturaContenido');
    if (!facturaContenido || !currentFactura) return;

    const esCotizacion = currentFactura.tipo === 'cotizacion';
    const subtotal = Math.round(currentFactura.total / 1.13);
    const iva = currentFactura.total - subtotal;
    const metodoPago = metodosPago[currentFactura.metodoPago];
    const pagos = metodoPago.calcularPagos(currentFactura.total);

    facturaContenido.innerHTML = `
        <div class="factura-header">
            <h1 class="factura-title">${esCotizacion ? 'COTIZACIÓN' : 'FACTURA'} #${currentFactura.id}</h1>
            <p class="factura-subtitle">*Fecha:* ${currentFactura.fecha}</p>
            <p class="factura-subtitle">*Hora:* ${currentFactura.hora}</p>
            <p class="factura-subtitle">*Cliente:* ${currentFactura.cliente.nombre} ${currentFactura.cliente.apellido1} ${currentFactura.cliente.apellido2 || ''}</p>
            <p class="factura-subtitle">*Teléfono:* ${currentFactura.cliente.whatsapp.replace('+506', '')}</p>
            <p class="factura-subtitle">*Método de Pago:* ${metodoPago.nombre}</p>
        </div>
        
        <div class="factura-products">
            <h3>*Detalles del Producto:*</h3>
            ${currentFactura.productos.map(p => `
                <div class="product-item">
                    <p>- ${p.nombre}: ${formatoMonedaCRC(p.precioFinal)}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="factura-totals">
            <p>- Subtotal: ${formatoMonedaCRC(subtotal)}</p>
            <p>- IVA (13%): ${formatoMonedaCRC(iva)}</p>
            ${pagos.length > 1 ? `
                ${pagos.map((pago, index) => `
                    <p>- Pago ${index + 1} (${Math.round(100 / pagos.length)}%): ${formatoMonedaCRC(pago)}</p>
                `).join('')}
            ` : ''}
            <p class="total">- *Total:* ${formatoMonedaCRC(currentFactura.total)}</p>
        </div>
        
        <div class="factura-footer">
            <h3>*Términos y Condiciones:*</h3>
            ${esCotizacion ? `
            <p>- Los precios y productos tienen un límite de 15 días como vigencia</p>
            <p>- Cotización válida por 15 días</p>
            ` : ''}
            <p>- Métodos de pago aceptados:</p>
            <p class="payment-method">* Sinpe Móvil: Corrales Brandon Josué 7055 2950</p>
            <p class="payment-method">* Tarjeta BN: Brandon Corrales Badilla CR96015113320010756614</p>
            <p>- Para más información, contáctenos al: 7055-2950</p>
            
            <p class="factura-notes">*Notas:*</p>
            <p class="factura-notes">¡Gracias por confiar en nosotros! Esperamos servirle nuevamente.</p>
        </div>
    `;
}

function cerrarModal() {
    const modal = document.getElementById('modalFactura');
    modal.classList.add('closing');
    modal.querySelector('.modal-content').classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        modal.querySelector('.modal-content').classList.remove('closing');
    }, 300);
}

function cerrarModalTemporada() {
    const modal = document.getElementById('modalTemporada');
    modal.classList.add('closing');
    modal.querySelector('.modal-content').classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        modal.querySelector('.modal-content').classList.remove('closing');
        editandoTemporada = null;
    }, 300);
}

function descargarFacturaJPG() {
    if (!currentFactura) return;
    
    const element = document.getElementById('facturaContenido');
    
    // Ajustar el tamaño del contenido para que quepa en la imagen
    const originalWidth = element.style.width;
    const originalHeight = element.style.height;
    element.style.width = '600px';
    element.style.height = 'auto';
    
    html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        // Restaurar el tamaño original
        element.style.width = originalWidth;
        element.style.height = originalHeight;
        
        // Descargar la imagen
        const link = document.createElement('a');
        link.download = `${currentFactura.tipo}_${currentFactura.id}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
        mostrarFeedback('Imagen descargada correctamente', 'success');
    });
}

function enviarFacturaWhatsApp() {
    if (!currentFactura) return;
    
    const numeroWhatsApp = currentFactura.cliente.whatsapp;
    const tipoDocumento = currentFactura.tipo === 'cotizacion' ? 'cotización' : 'factura';
    const esCotizacion = currentFactura.tipo === 'cotizacion';
    const metodoPago = metodosPago[currentFactura.metodoPago];
    const pagos = metodoPago.calcularPagos(currentFactura.total);
    
    // Crear mensaje con formato similar al ejemplo
    let mensaje = `*${currentFactura.tipo === 'cotizacion' ? 'Cotización' : 'Factura'} #${currentFactura.id}*\n\n`;
    mensaje += `*Fecha:* ${currentFactura.fecha}\n`;
    mensaje += `*Hora:* ${currentFactura.hora}\n`;
    mensaje += `*Cliente:* ${currentFactura.cliente.nombre} ${currentFactura.cliente.apellido1} ${currentFactura.cliente.apellido2 || ''}\n`;
    mensaje += `*Teléfono:* ${currentFactura.cliente.whatsapp.replace('+506', '')}\n`;
    mensaje += `*Método de Pago:* ${metodoPago.nombre}\n\n`;
    mensaje += `*Detalles del Producto:*\n\n`;
    
    currentFactura.productos.forEach(p => {
        mensaje += `- ${p.nombre}: ${formatoMonedaCRC(p.precioFinal)}\n`;
    });
    
    const subtotal = Math.round(currentFactura.total / 1.13);
    const iva = currentFactura.total - subtotal;
    
    mensaje += `\n- Subtotal: ${formatoMonedaCRC(subtotal)}\n`;
    mensaje += `- IVA (13%): ${formatoMonedaCRC(iva)}\n`;
    
    if (pagos.length > 1) {
        pagos.forEach((pago, index) => {
            mensaje += `- Pago ${index + 1} (${Math.round(100 / pagos.length)}%): ${formatoMonedaCRC(pago)}\n`;
        });
    }
    
    mensaje += `- *Total:* ${formatoMonedaCRC(currentFactura.total)}\n\n`;
    mensaje += `*Términos y Condiciones:*\n`;
    
    if (esCotizacion) {
        mensaje += `- Los precios y productos tienen un límite de 15 días como vigencia\n`;
        mensaje += `- Cotización válida por 15 días\n`;
    }
    
    mensaje += `- Métodos de pago aceptados:\n`;
    mensaje += `   * Sinpe Móvil: Corrales Brandon Josué 7055 2950\n`;
    mensaje += `   * Tarjeta BN: Brandon Corrales Badilla CR96015113320010756614\n`;
    mensaje += `- Para más información, contáctenos al: 7055-2950\n\n`;
    mensaje += `*Notas:*\n`;
    mensaje += `¡Gracias por confiar en nosotros! Esperamos servirle nuevamente.`;
    
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
}

// Sistema de temporadas
function renderizarTemporadas() {
    const tbody = document.getElementById('cuerpoTablaTemporadas');
    if (!tbody) return;

    try {
        tbody.innerHTML = temporadas.map(temporada => `
            <tr data-categoria="${temporada.categoria}">
                <td>${temporada.categoria}</td>
                <td>${obtenerNombreMes(temporada.mesInicio)} - ${obtenerNombreMes(temporada.mesFin)}</td>
                <td>${temporada.ventasEsperadas}%</td>
                <td>
                    <button onclick="editarTemporada('${temporada.categoria}')" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Error al renderizar temporadas:", error);
        tbody.innerHTML = '<tr><td colspan="4" class="error-message">Error al cargar las temporadas</td></tr>';
    }
}

function editarTemporada(categoria) {
    const temporada = temporadas.find(t => t.categoria === categoria);
    if (!temporada) return;

    editandoTemporada = categoria;
    document.getElementById('editCategoria').value = temporada.categoria;
    document.getElementById('editMesInicio').value = temporada.mesInicio;
    document.getElementById('editMesFin').value = temporada.mesFin;
    document.getElementById('editVentasEsperadas').value = temporada.ventasEsperadas;
    
    document.getElementById('modalTemporada').style.display = 'block';
}

function guardarTemporada() {
    if (!editandoTemporada) return;

    const temporadaIndex = temporadas.findIndex(t => t.categoria === editandoTemporada);
    if (temporadaIndex === -1) return;

    temporadas[temporadaIndex] = {
        categoria: editandoTemporada,
        mesInicio: parseInt(document.getElementById('editMesInicio').value),
        mesFin: parseInt(document.getElementById('editMesFin').value),
        ventasEsperadas: parseInt(document.getElementById('editVentasEsperadas').value)
    };

    guardarDatos();
    cerrarModalTemporada();
    renderizarTemporadas();
    mostrarFeedback('Temporada actualizada correctamente', 'success');
}

function obtenerNombreMes(numeroMes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[numeroMes - 1] || '';
}

// Sistema de inversión
function guardarInversion() {
    const monto = parseFloat(document.getElementById('montoInversion').value);
    const fecha = document.getElementById('fechaInversion').value;
    const descripcion = document.getElementById('descripcionInversion').value.trim();
    
    if (isNaN(monto) || monto <= 0) {
        mostrarFeedback('Por favor ingrese un monto válido', 'error');
        return;
    }

    if (!fecha) {
        mostrarFeedback('Por favor seleccione una fecha', 'error');
        return;
    }

    const nuevaInversion = {
        id: Date.now().toString(),
        monto: Math.round(monto), // Guardar como número entero
        fecha,
        descripcion: descripcion || 'Inversión general',
        fechaRegistro: new Date().toISOString()
    };

    inversiones.push(nuevaInversion);
    guardarDatos();
    
    // Actualizar resumen
    actualizarResumenInversion();
    mostrarFeedback('Inversión registrada correctamente', 'success');
    
    // Limpiar formulario
    document.getElementById('montoInversion').value = '';
    document.getElementById('fechaInversion').value = '';
    document.getElementById('descripcionInversion').value = '';
}

function actualizarResumenInversion() {
    const totalInvertido = inversiones.reduce((sum, inv) => sum + inv.monto, 0);
    
    // Calcular ganancia por ventas (suma de todos los productos vendidos)
    const gananciaVentas = productos.reduce((sum, producto) => {
        return sum + (producto.ventas * (producto.precioFinal - producto.precioBase - producto.iva));
    }, 0);
    
    const capitalDisponible = gananciaVentas - totalInvertido;
    const gananciaTotal = totalInvertido + gananciaVentas;
    
    document.getElementById('totalInvertido').textContent = formatoMonedaCRC(totalInvertido);
    document.getElementById('gananciaVentas').textContent = formatoMonedaCRC(gananciaVentas);
    document.getElementById('capitalDisponible').textContent = formatoMonedaCRC(capitalDisponible);
    document.getElementById('gananciaTotal').textContent = formatoMonedaCRC(gananciaTotal);
    
    // Establecer clase según si hay ganancia o pérdida
    document.getElementById('gananciaVentas').className = gananciaVentas >= 0 ? 'beneficio-positivo' : 'beneficio-negativo';
    document.getElementById('capitalDisponible').className = capitalDisponible >= 0 ? 'beneficio-positivo' : 'beneficio-negativo';
    document.getElementById('gananciaTotal').className = gananciaTotal >= 0 ? 'beneficio-positivo' : 'beneficio-negativo';
}

// Sistema de gráficos
function actualizarGraficoVentas() {
    const canvas = document.getElementById('graficoVentas');
    if (!canvas) return;

    // Destruir gráfico anterior si existe
    if (graficoVentas) {
        graficoVentas.destroy();
    }

    // Obtener productos más vendidos
    const productosMasVendidos = [...productos]
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5);

    // Crear datos para el gráfico
    const labels = productosMasVendidos.map(p => p.nombre);
    const data = productosMasVendidos.map(p => p.ventas * p.precioFinal);

    // Si no hay datos, usar valores por defecto bajos
    if (data.length === 0) {
        labels.push('Sin datos');
        data.push(100000);
    }

    const ctx = canvas.getContext('2d');
    graficoVentas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas por producto (CRC)',
                data: data,
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatoMonedaCRC(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatoMonedaCRC(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Top productos
function renderizarTopProductos() {
    const tbody = document.getElementById('cuerpoTablaTopProductos');
    if (!tbody) return;

    // Ordenar productos por ventas
    const topProductos = [...productos]
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5);

    try {
        tbody.innerHTML = topProductos.map((producto, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>${producto.ventas}</td>
                <td>${formatoMonedaCRC(producto.ventas * producto.precioFinal)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Error al renderizar top productos:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="error-message">Error al cargar los productos más vendidos</td></tr>';
    }
}

// Funciones de apoyo
function cargarDatos() {
    try {
        clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        productos = JSON.parse(localStorage.getItem('productos')) || [];
        facturas = JSON.parse(localStorage.getItem('facturas')) || [];
        temporadas = JSON.parse(localStorage.getItem('temporadas')) || [
            { categoria: "electronica", mesInicio: 11, mesFin: 12, ventasEsperadas: 40 },
            { categoria: "ropa", mesInicio: 5, mesFin: 6, ventasEsperadas: 30 },
            { categoria: "alimentos", mesInicio: 12, mesFin: 1, ventasEsperadas: 50 }
        ];
        inversiones = JSON.parse(localStorage.getItem('inversiones')) || [];
        
        // Inicializar estado de productos si no existe
        productos.forEach(p => {
            if (!p.estado) p.estado = 'disponible';
            if (!p.ventas) p.ventas = 0;
            if (!p.ganancia) p.ganancia = Math.round(p.precioBase * 0.3); // Valor por defecto 30%
        });
        
        // Actualizar resumen de inversión al cargar
        actualizarResumenInversion();
    } catch (error) {
        console.error("Error al cargar datos:", error);
        resetearDatos();
    }
}

function guardarDatos() {
    try {
        localStorage.setItem('clientes', JSON.stringify(clientes));
        localStorage.setItem('productos', JSON.stringify(productos));
        localStorage.setItem('facturas', JSON.stringify(facturas));
        localStorage.setItem('temporadas', JSON.stringify(temporadas));
        localStorage.setItem('inversiones', JSON.stringify(inversiones));
    } catch (error) {
        console.error("Error al guardar datos:", error);
    }
}

function resetearDatos() {
    clientes = [];
    productos = [];
    facturas = [];
    temporadas = [
        { categoria: "electronica", mesInicio: 11, mesFin: 12, ventasEsperadas: 40 },
        { categoria: "ropa", mesInicio: 5, mesFin: 6, ventasEsperadas: 30 },
        { categoria: "alimentos", mesInicio: 12, mesFin: 1, ventasEsperadas: 50 }
    ];
    inversiones = [];
    guardarDatos();
}

function renderizarVistasIniciales() {
    renderizarClientes();
    renderizarProductos();
    renderizarTemporadas();
    renderizarTopProductos();
}

function mostrarFeedback(mensaje, tipo) {
    const feedback = document.createElement('div');
    feedback.textContent = mensaje;
    feedback.className = `feedback-message ${tipo}`;
    
    const contenedor = document.querySelector('.container');
    if (contenedor) {
        contenedor.insertBefore(feedback, contenedor.firstChild);
    }
    
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// Funciones para manejo de modales con animación
function abrirModalImagen(src) {
    document.getElementById('imagenAmpliada').src = src;
    const modal = document.getElementById('modalImagen');
    modal.style.display = 'block';
    modal.classList.remove('closing');
}

function cerrarModalImagen() {
    const modal = document.getElementById('modalImagen');
    modal.classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
    }, 300);
}

// Funciones globales
window.mostrarPestaña = mostrarPestaña;
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;
window.abrirModalProductosCliente = abrirModalProductosCliente;
window.toggleProductoCliente = toggleProductoCliente;
window.generarFactura = generarFactura;
window.cerrarModal = cerrarModal;
window.cerrarModalTemporada = cerrarModalTemporada;
window.guardarTemporada = guardarTemporada;
window.descargarFacturaJPG = descargarFacturaJPG;
window.enviarFacturaWhatsApp = enviarFacturaWhatsApp;
window.actualizarGraficoVentas = actualizarGraficoVentas;
window.filtrarClientes = filtrarClientes;
window.mostrarPreviewImagen = mostrarPreviewImagen;
window.guardarInversion = guardarInversion;
window.editarTemporada = editarTemporada;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.marcarProductosComoVendidos = marcarProductosComoVendidos;
window.abrirModalImagen = abrirModalImagen;
window.cerrarModalImagen = cerrarModalImagen;
window.seleccionarMetodoPago = seleccionarMetodoPago;