import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import type { Category, PaymentField, PaymentMethod, PaymentMethodId, Product } from './types'

const dataDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dataDir, 'athenea.db')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  categoryId TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  sizes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL,
  instructions TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  methodId TEXT NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`)

const DEFAULT_WHATSAPP = '584120000000'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'vestidos', name: 'Vestidos', department: 'mujer' },
  { id: 'deportivo', name: 'Deportivo', department: 'mujer' },
  { id: 'corsets', name: 'Corsets', department: 'mujer' },
  { id: 'lenceria', name: 'Lencería', department: 'mujer' },
  { id: 'bikinis', name: 'Bikinis', department: 'mujer' },
  { id: 'camisas', name: 'Camisas', department: 'hombre' },
  { id: 'pantalones', name: 'Pantalones', department: 'hombre' },
  { id: 'deportivo-hombre', name: 'Deportivo', department: 'hombre' },
  { id: 'infantil', name: 'Infantil', department: 'ninos' },
]

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'vestido-marfil',
    name: 'Vestido Marfil',
    price: 45,
    categoryId: 'vestidos',
    image: '/images/vestido-marfil.png',
    description: 'Vestido largo de corte fluido en tono marfil, ideal para ocasiones especiales.',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 'vestido-noche',
    name: 'Vestido Noche',
    price: 38,
    categoryId: 'vestidos',
    image: '/images/vestido-noche.png',
    description: 'Vestido lencero negro de tirantes finos con caída elegante.',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 'conjunto-sage',
    name: 'Conjunto Sage',
    price: 30,
    categoryId: 'deportivo',
    image: '/images/conjunto-sage.png',
    description: 'Conjunto deportivo en verde salvia: top y leggings de alta compresión.',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'chaqueta-onyx',
    name: 'Chaqueta Onyx',
    price: 22,
    categoryId: 'deportivo',
    image: '/images/chaqueta-onyx.png',
    description: 'Chaqueta deportiva negra entallada con cierre frontal.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'corset-negro',
    name: 'Corset Noir',
    price: 35,
    categoryId: 'corsets',
    image: '/images/corset-negro.png',
    description: 'Corset estructurado negro con silueta escultural.',
    sizes: ['XS', 'S', 'M'],
  },
  {
    id: 'conjunto-rosa',
    name: 'Conjunto Rosé',
    price: 28,
    categoryId: 'lenceria',
    image: '/images/conjunto-rosa.png',
    description: 'Conjunto de lencería en seda rosa con detalles de encaje.',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'bikini-terracota',
    name: 'Bikini Terracota',
    price: 26,
    categoryId: 'bikinis',
    image: '/images/bikini-terracota.png',
    description: 'Bikini en tono terracota de tejido acanalado premium.',
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'camisa-lino',
    name: 'Camisa Lino',
    price: 32,
    categoryId: 'camisas',
    image: '/images/camisa-lino.png',
    description: 'Camisa de lino beige de corte relajado, fresca y atemporal.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'pantalon-sastre',
    name: 'Pantalón Sastre',
    price: 40,
    categoryId: 'pantalones',
    image: '/images/pantalon-sastre.png',
    description: 'Pantalón de sastrería gris carbón con caída impecable.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'conjunto-infantil',
    name: 'Conjunto Mini',
    price: 20,
    categoryId: 'infantil',
    image: '/images/conjunto-infantil.png',
    description: 'Conjunto infantil de punto crema con pantalón beige, suave y cómodo.',
    sizes: ['2', '4', '6', '8'],
  },
  {
    id: 'vestido-nina',
    name: 'Vestido Petit',
    price: 24,
    categoryId: 'infantil',
    image: '/images/vestido-nina.png',
    description: 'Vestido blanco de algodón con bordados delicados para niña.',
    sizes: ['2', '4', '6', '8'],
  },
]

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pago_movil',
    label: 'Pago Móvil',
    enabled: true,
    instructions: 'Realiza el pago móvil y envía el comprobante por WhatsApp indicando tu pedido.',
    fields: [
      { key: 'banco', label: 'Banco', value: 'Banesco' },
      { key: 'telefono', label: 'Teléfono', value: '0412-0000000' },
      { key: 'cedula', label: 'Cédula', value: 'V-00000000' },
      { key: 'titular', label: 'Titular', value: 'Athenea Store C.A.' },
    ],
  },
  {
    id: 'binance',
    label: 'Binance',
    enabled: true,
    instructions: 'Envía USDT por Binance Pay o transferencia interna y comparte el comprobante.',
    fields: [
      { key: 'correo', label: 'Correo / ID Binance', value: 'pagos@athenea.com' },
      { key: 'red', label: 'Red', value: 'USDT (TRC20)' },
      { key: 'titular', label: 'Titular', value: 'Athenea Store' },
    ],
  },
  {
    id: 'zelle',
    label: 'Zelle',
    enabled: true,
    instructions: 'Realiza el pago por Zelle y envía captura del comprobante con tu nombre.',
    fields: [
      { key: 'correo', label: 'Correo Zelle', value: 'pagos@athenea.com' },
      { key: 'titular', label: 'Titular', value: 'Athenea Store' },
    ],
  },
]

function serializeSizes(sizes: string[]) {
  return JSON.stringify(sizes)
}

function parseSizes(sizes: string) {
  try {
    return JSON.parse(sizes) as string[]
  } catch {
    return []
  }
}

function toPaymentMethod(row: any, fields: PaymentField[]): PaymentMethod {
  return {
    id: row.id as PaymentMethodId,
    label: row.label,
    enabled: Boolean(row.enabled),
    instructions: row.instructions,
    fields,
  }
}

function seedDefaults() {
  const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count as number
  const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count as number
  const paymentCount = db.prepare('SELECT COUNT(*) AS count FROM payment_methods').get().count as number
  const whatsappRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('whatsapp')

  if (categoryCount === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (id, name, department) VALUES (?, ?, ?)')
    const insertMany = db.transaction((categories: Category[]) => {
      for (const category of categories) {
        insertCategory.run(category.id, category.name, category.department)
      }
    })
    insertMany(DEFAULT_CATEGORIES)
  }

  if (productCount === 0) {
    const insertProduct = db.prepare(
      'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const insertMany = db.transaction((products: Product[]) => {
      for (const product of products) {
        insertProduct.run(
          product.id,
          product.name,
          product.price,
          product.categoryId,
          product.image,
          product.description,
          serializeSizes(product.sizes),
        )
      }
    })
    insertMany(DEFAULT_PRODUCTS)
  }

  if (paymentCount === 0) {
    const insertMethod = db.prepare(
      'INSERT INTO payment_methods (id, label, enabled, instructions) VALUES (?, ?, ?, ?)',
    )
    const insertField = db.prepare(
      'INSERT INTO payment_fields (methodId, key, label, value) VALUES (?, ?, ?, ?)',
    )
    const insertMany = db.transaction((methods: PaymentMethod[]) => {
      for (const method of methods) {
        insertMethod.run(method.id, method.label, method.enabled ? 1 : 0, method.instructions)
        for (const field of method.fields) {
          insertField.run(method.id, field.key, field.label, field.value)
        }
      }
    })
    insertMany(DEFAULT_PAYMENT_METHODS)
  }

  if (!whatsappRow) {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('whatsapp', DEFAULT_WHATSAPP)
  }
}

seedDefaults()

function getProducts(): Product[] {
  return db
    .prepare('SELECT * FROM products ORDER BY rowid DESC')
    .all()
    .map((row: any) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      categoryId: row.categoryId,
      image: row.image,
      description: row.description,
      sizes: parseSizes(row.sizes),
    }))
}

function getCategories(): Category[] {
  return db.prepare('SELECT * FROM categories ORDER BY name COLLATE NOCASE').all() as Category[]
}

function getPaymentMethods(): PaymentMethod[] {
  const methods = db.prepare('SELECT * FROM payment_methods').all()
  const fields = db.prepare('SELECT * FROM payment_fields').all()
  return methods.map((method: any) => {
    const methodFields = fields
      .filter((field: any) => field.methodId === method.id)
      .map((field: any) => ({
        key: field.key,
        label: field.label,
        value: field.value,
      }))
    return toPaymentMethod(method, methodFields)
  })
}

function getWhatsapp(): string {
  return (
    db.prepare('SELECT value FROM settings WHERE key = ?').get('whatsapp')?.value ?? DEFAULT_WHATSAPP
  )
}

export function getStore() {
  return {
    products: getProducts(),
    categories: getCategories(),
    paymentMethods: getPaymentMethods(),
    whatsapp: getWhatsapp(),
  }
}

export function addProduct(product: Omit<Product, 'id'>) {
  const id = `p-${Date.now().toString(36)}`
  db.prepare(
    'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(id, product.name, product.price, product.categoryId, product.image, product.description, serializeSizes(product.sizes))
  return { id, ...product }
}

export function updateProduct(id: string, changes: Partial<Omit<Product, 'id'>>) {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  if (!existing) return null
  const updated = {
    ...existing,
    ...changes,
    sizes: changes.sizes ? serializeSizes(changes.sizes) : existing.sizes,
  }
  db.prepare(
    'UPDATE products SET name = ?, price = ?, categoryId = ?, image = ?, description = ?, sizes = ? WHERE id = ?',
  ).run(updated.name, updated.price, updated.categoryId, updated.image, updated.description, updated.sizes, id)
  return {
    id,
    name: updated.name,
    price: Number(updated.price),
    categoryId: updated.categoryId,
    image: updated.image,
    description: updated.description,
    sizes: parseSizes(updated.sizes),
  }
}

export function deleteProduct(id: string) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
}

export function addCategory(name: string, department: string) {
  const id = `c-${Date.now().toString(36)}`
  db.prepare('INSERT INTO categories (id, name, department) VALUES (?, ?, ?)').run(id, name.trim(), department)
  return { id, name: name.trim(), department }
}

export function deleteCategory(id: string) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  db.prepare('DELETE FROM products WHERE categoryId = ?').run(id)
}

export function resetCatalog() {
  const deleteProducts = db.prepare('DELETE FROM products')
  const deleteCategories = db.prepare('DELETE FROM categories')
  deleteProducts.run()
  deleteCategories.run()

  const insertCategory = db.prepare('INSERT INTO categories (id, name, department) VALUES (?, ?, ?)')
  const insertProduct = db.prepare(
    'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )

  const insertMany = db.transaction(() => {
    for (const category of DEFAULT_CATEGORIES) {
      insertCategory.run(category.id, category.name, category.department)
    }
    for (const product of DEFAULT_PRODUCTS) {
      insertProduct.run(
        product.id,
        product.name,
        product.price,
        product.categoryId,
        product.image,
        product.description,
        serializeSizes(product.sizes),
      )
    }
  })

  insertMany()
}

export function updatePaymentMethod(id: PaymentMethodId, changes: Partial<Omit<PaymentMethod, 'id' | 'fields'>>) {
  const existing = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id)
  if (!existing) return null
  const updated = {
    ...existing,
    ...changes,
    enabled: changes.enabled !== undefined ? Number(changes.enabled) : existing.enabled,
  }
  db.prepare('UPDATE payment_methods SET label = ?, enabled = ?, instructions = ? WHERE id = ?').run(
    updated.label,
    updated.enabled,
    updated.instructions,
    id,
  )
  return toPaymentMethod(updated, getPaymentMethods().find((method) => method.id === id)?.fields ?? [])
}

export function updatePaymentField(methodId: PaymentMethodId, fieldKey: string, value: string) {
  db.prepare('UPDATE payment_fields SET value = ? WHERE methodId = ? AND key = ?').run(value, methodId, fieldKey)
}

export function resetPaymentMethods() {
  const deleteMethods = db.prepare('DELETE FROM payment_methods')
  const deleteFields = db.prepare('DELETE FROM payment_fields')
  deleteMethods.run()
  deleteFields.run()

  const insertMethod = db.prepare(
    'INSERT INTO payment_methods (id, label, enabled, instructions) VALUES (?, ?, ?, ?)',
  )
  const insertField = db.prepare('INSERT INTO payment_fields (methodId, key, label, value) VALUES (?, ?, ?, ?)')

  const insertMany = db.transaction(() => {
    for (const method of DEFAULT_PAYMENT_METHODS) {
      insertMethod.run(method.id, method.label, method.enabled ? 1 : 0, method.instructions)
      for (const field of method.fields) {
        insertField.run(method.id, field.key, field.label, field.value)
      }
    }
  })

  insertMany()
}

export function updateWhatsapp(value: string) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('whatsapp', value)
}
