import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'

async function seed() {
  console.log('Iniciando seed de la base de datos...');
  const payload = await getPayload({ config })
  
  console.log('Borrando datos anteriores...')
  await payload.delete({ collection: 'permissions', where: {} });
  await payload.delete({ collection: 'inventory-items', where: {} });
  await payload.delete({ collection: 'users', where: {} });

  console.log('Creando usuario Admin...')
  const adminUser = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@admin.com',
      password: 'test',
      nombre: 'Administrador Global',
      role: 'admin',
    },
  })

  console.log('Creando usuario Regular...')
  const normalUser = await payload.create({
    collection: 'users',
    data: {
      email: 'user@user.com',
      password: 'test',
      nombre: 'Usuario Inventario',
      role: 'user',
    },
  })
  
  const userBasico = await payload.create({
    collection: 'users',
    data: {
      email: 'basico@user.com',
      password: 'test',
      nombre: 'Usuario Sin Acceso',
      role: 'user',
    },
  })

  console.log('Otorgando permisos...')
  await payload.create({
    collection: 'permissions',
    data: {
      user: normalUser.id,
      inventario: {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: false,
      },
      ventas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
      cobranzas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
    },
  })
  
  await payload.create({
    collection: 'permissions',
    data: {
      user: userBasico.id,
      inventario: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
      ventas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
      cobranzas: { canRead: false, canCreate: false, canUpdate: false, canDelete: false },
    },
  })

  console.log('Poblando inventario...')
  const products = [
    { nombre: 'Monitor 4K UltraWide', sku: 'MN-4K-01', precio: 549.99, stock: 25, descripcion: 'Monitor Ultra HD de 34 pulgadas curvo, 144Hz' },
    { nombre: 'Teclado Mecánico RGB', sku: 'KB-MEC-02', precio: 89.99, stock: 120, descripcion: 'Teclado mecánico con switches Cherry MX Red' },
    { nombre: 'Escritorio Ergonómico', sku: 'DSK-ERG-03', precio: 459.00, stock: 8, descripcion: 'Escritorio de altura ajustable eléctrico 160x80cm' },
    { nombre: 'Mouse Inalámbrico Pro', sku: 'MS-WLS-04', precio: 69.99, stock: 200, descripcion: 'Mouse ergonómico inalámbrico con sensor 25K DPI' },
    { nombre: 'Webcam Full HD', sku: 'WC-FHD-05', precio: 129.00, stock: 45, descripcion: 'Webcam 1080p 60fps con autofoco y micrófono dual' },
    { nombre: 'Auriculares Bluetooth', sku: 'AU-BT-06', precio: 199.99, stock: 67, descripcion: 'Auriculares over-ear con cancelación de ruido activa' },
    { nombre: 'Hub USB-C 7 en 1', sku: 'HB-USC-07', precio: 45.00, stock: 150, descripcion: 'Hub USB-C con HDMI 4K, USB 3.0, SD/microSD, PD 100W' },
    { nombre: 'Silla Gaming Pro', sku: 'SL-GAM-08', precio: 349.99, stock: 12, descripcion: 'Silla gaming reclinable 180° con soporte lumbar' },
    { nombre: 'Lámpara LED Escritorio', sku: 'LM-LED-09', precio: 39.99, stock: 85, descripcion: 'Lámpara LED con regulación de brillo y temperatura de color' },
    { nombre: 'Disco SSD NVMe 1TB', sku: 'SS-NVM-10', precio: 89.00, stock: 300, descripcion: 'SSD NVMe M.2 PCIe 4.0, lectura 7000MB/s' },
    { nombre: 'Cable HDMI 2.1 3m', sku: 'CB-HDM-11', precio: 19.99, stock: 500, descripcion: 'Cable HDMI 2.1 Ultra High Speed 48Gbps' },
    { nombre: 'Mousepad XXL', sku: 'MP-XXL-12', precio: 24.99, stock: 180, descripcion: 'Mousepad extendido 900x400mm, base antideslizante' },
    { nombre: 'Soporte Monitor Dual', sku: 'SM-DUL-13', precio: 79.00, stock: 30, descripcion: 'Brazo dual para monitores de 17-32 pulgadas, VESA' },
    { nombre: 'Memoria RAM DDR5 32GB', sku: 'RM-DD5-14', precio: 119.99, stock: 65, descripcion: 'Kit 2x16GB DDR5-6000 CL30 con RGB' },
    { nombre: 'Fuente 850W Gold', sku: 'FT-850-15', precio: 129.00, stock: 40, descripcion: 'Fuente modular 850W 80+ Gold, ventilador 140mm' },
    { nombre: 'Gabinete ATX Mesh', sku: 'GB-ATX-16', precio: 99.99, stock: 22, descripcion: 'Gabinete mid-tower con frontal mesh y 3 ventiladores' },
    { nombre: 'Tarjeta Gráfica RTX', sku: 'TG-RTX-17', precio: 799.99, stock: 5, descripcion: 'GPU RTX con 12GB GDDR6X, ray tracing, DLSS 3' },
    { nombre: 'Micrófono Condensador', sku: 'MC-CND-18', precio: 149.00, stock: 55, descripcion: 'Micrófono condensador USB cardioide para streaming' },
    { nombre: 'UPS 1500VA', sku: 'UP-150-19', precio: 189.99, stock: 18, descripcion: 'UPS interactivo 1500VA/900W con 8 tomas y LCD' },
    { nombre: 'Cable USB-C 2m', sku: 'CB-USC-20', precio: 12.99, stock: 0, descripcion: 'Cable USB-C a USB-C 100W PD, 10Gbps' },
    { nombre: 'Adaptador WiFi 6E', sku: 'WF-6E-21', precio: 49.99, stock: 0, descripcion: 'Adaptador WiFi 6E PCIe AX5400 tri-banda' },
    { nombre: 'Base Refrigerante Laptop', sku: 'BR-LAP-22', precio: 34.99, stock: 3, descripcion: 'Base refrigerante con 5 ventiladores y pantalla LCD' },
    { nombre: 'Procesador 12 núcleos', sku: 'PR-12C-23', precio: 449.00, stock: 15, descripcion: 'CPU 12 núcleos / 24 hilos, 5.2GHz boost, socket AM5' },
    { nombre: 'Placa Base ATX', sku: 'PB-ATX-24', precio: 279.99, stock: 10, descripcion: 'Motherboard ATX AM5 con WiFi 6E y Bluetooth 5.3' },
    { nombre: 'Cooler AIO 240mm', sku: 'CL-AIO-25', precio: 109.00, stock: 28, descripcion: 'Refrigeración líquida AIO con radiador de 240mm y LCD' },
  ]
  
  for (const product of products) {
    await payload.create({ collection: 'inventory-items', data: product })
  }

  console.log('Semilla de datos completada satisfactoriamente.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Error durante la inserción:', err)
  process.exit(1)
})
