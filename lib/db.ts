import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import { Pool, type PoolClient } from 'pg'
import type { Category, PaymentField, PaymentMethod, PaymentMethodId, Product } from './types'

declare global {
  var __atheneaPgPool: Pool | undefined
}

const DATABASE_URL = process.env.DATABASE_URL?.trim()
const usePostgres = Boolean(DATABASE_URL)
let pool: Pool | undefined
let sqliteDb: Database.Database | null = null

const dataDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dataDir, 'athenea.db')

const DEFAULT_WHATSAPP = '584120000000'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'vestidos', name: 'Vestidos', department: 'mujer' },
  { id: 'deportivo', name: 'Deportivo', department: 'mujer' },
  { id: 'corsets', name: 'Corsets', department: 'mujer' },
  { id: 'lenceria', name: 'Lencer�a', department: 'mujer' },
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
    description: 'Vestido lencero negro de tirantes finos con ca�da elegante.',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 'conjunto-sage',
    name: 'Conjunto Sage',
    price: 30,
    categoryId: 'deportivo',
    image: '/images/conjunto-sage.png',
    description: 'Conjunto deportivo en verde salvia: top y leggings de alta compresi�n.',
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
    name: 'Conjunto Ros�',
    price: 28,
    categoryId: 'lenceria',
    image: '/images/conjunto-rosa.png',
    description: 'Conjunto de lencer�a en seda rosa con detalles de encaje.',
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
    name: 'Pantal�n Sastre',
    price: 40,
    categoryId: 'pantalones',
    image: '/images/pantalon-sastre.png',
    description: 'Pantal�n de sastrer�a gris carb�n con ca�da impecable.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'conjunto-infantil',
    name: 'Conjunto Mini',
    price: 20,
    categoryId: 'infantil',
    image: '/images/conjunto-infantil.png',
    description: 'Conjunto infantil de punto crema con pantal�n beige, suave y c�modo.',
    sizes: ['2', '4', '6', '8'],
  },
  {
    id: 'vestido-nina',
    name: 'Vestido Petit',
    price: 24,
    categoryId: 'infantil',
    image: '/images/vestido-nina.png',
    description: 'Vestido blanco de algod�n con bordados delicados para ni�a.',
    sizes: ['2', '4', '6', '8'],
  },
]

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pago_movil',
    label: 'Pago M�vil',
    enabled: true,
    instructions: 'Realiza el pago m�vil y env�a el comprobante por WhatsApp indicando tu pedido.',
    fields: [
      { key: 'banco', label: 'Banco', value: 'Banesco' },
      { key: 'telefono', label: 'Tel�fono', value: '0412-0000000' },
      { key: 'cedula', label: 'C�dula', value: 'V-00000000' },
      { key: 'titular', label: 'Titular', value: 'Athenea Store C.A.' },
    ],
  },
  {
    id: 'binance',
    label: 'Binance',
    enabled: true,
    instructions: 'Env�a USDT por Binance Pay o transferencia interna y comparte el comprobante.',
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
    instructions: 'Realiza el pago por Zelle y env�a captura del comprobante con tu nombre.',
    fields: [
      { key: 'correo', label: 'Correo Zelle', value: 'pagos@athenea.com' },
      { key: 'titular', label: 'Titular', value: 'Athenea Store' },
    ],
  },
]

function parseSizes(sizes: unknown): string[] {
  if (Array.isArray(sizes)) return sizes.map((item) => String(item))
  if (typeof sizes === 'string') {
    try {
      return JSON.parse(sizes) as string[]
    } catch {
      return sizes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }

  return []
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

function isPostgresEnabled(): boolean {
  return usePostgres && Boolean(pool)
}

function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    sqliteDb = new Database(dbPath)
  }
  return sqliteDb
}

function getPool(): Pool {
  if (!pool) {
    pool = globalThis.__atheneaPgPool ?? new Pool({
      connectionString: DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production' && DATABASE_URL && !DATABASE_URL.includes('localhost')
          ? { rejectUnauthorized: false }
          : false,
    })
    globalThis.__atheneaPgPool = pool
  }
  return pool
}

async function withPostgresClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    return await callback(client)
  } finally {
    client.release()
  }
}

async function runTransaction<T>(callback: (client: PoolClient | null) => Promise<T>): Promise<T> {
  if (usePostgres) {
    return await withPostgresClient(async (client) => {
      await client.query('BEGIN')
      try {
        const result = await callback(client)
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    })
  }

  const db = getSqliteDb()
  const transaction = db.transaction(() => callback(null))
  return transaction()
}

function normalizeSql(sql: string) {
  if (usePostgres) return sql
  return sql.replace(/\$(\d+)/g, '?')
}

async function queryRows<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (usePostgres) {
    const client = await getPool().connect()
    try {
      const result = await client.query(sql, params)
      return result.rows as T[]
    } finally {
      client.release()
    }
  }

  const db = getSqliteDb()
  return db.prepare(normalizeSql(sql)).all(...params) as T[]
}

async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryRows<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

async function runQuery(sql: string, params: any[] = []) {
  if (usePostgres) {
    return await getPool().query(sql, params)
  }

  const db = getSqliteDb()
  return db.prepare(normalizeSql(sql)).run(...params)
}

function initSqliteSchema() {
  const db = getSqliteDb()
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
}

async function initPostgresSchema() {
  await withPostgresClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        categoryId TEXT NOT NULL,
        image TEXT NOT NULL,
        description TEXT,
        sizes JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        enabled BOOLEAN NOT NULL,
        instructions TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payment_fields (
        id SERIAL PRIMARY KEY,
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
  })
}

let initialized = false

async function ensureStorage() {
  if (initialized) return

  if (usePostgres) {
    await initPostgresSchema()
  } else {
    initSqliteSchema()
  }

  await seedDefaults()
  initialized = true
}

async function seedDefaults() {
  if (usePostgres) {
    await withPostgresClient(async (client) => {
      const categoryCount = Number((await client.query('SELECT COUNT(*) AS count FROM categories')).rows[0].count)
      const productCount = Number((await client.query('SELECT COUNT(*) AS count FROM products')).rows[0].count)
      const paymentCount = Number((await client.query('SELECT COUNT(*) AS count FROM payment_methods')).rows[0].count)
      const whatsappRow = (await client.query('SELECT value FROM settings WHERE key = $1', ['whatsapp'])).rows[0]

      if (categoryCount === 0) {
        await client.query('BEGIN')
        try {
          for (const category of DEFAULT_CATEGORIES) {
            await client.query(
              'INSERT INTO categories (id, name, department) VALUES ($1, $2, $3)',
              [category.id, category.name, category.department],
            )
          }
          await client.query('COMMIT')
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        }
      }

      if (productCount === 0) {
        await client.query('BEGIN')
        try {
          for (const product of DEFAULT_PRODUCTS) {
            await client.query(
              'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [
                product.id,
                product.name,
                product.price,
                product.categoryId,
                product.image,
                product.description,
                product.sizes,
              ],
            )
          }
          await client.query('COMMIT')
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        }
      }

      if (paymentCount === 0) {
        await client.query('BEGIN')
        try {
          for (const method of DEFAULT_PAYMENT_METHODS) {
            await client.query(
              'INSERT INTO payment_methods (id, label, enabled, instructions) VALUES ($1, $2, $3, $4)',
              [method.id, method.label, method.enabled, method.instructions],
            )
            for (const field of method.fields) {
              await client.query(
                'INSERT INTO payment_fields (methodId, key, label, value) VALUES ($1, $2, $3, $4)',
                [method.id, field.key, field.label, field.value],
              )
            }
          }
          await client.query('COMMIT')
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        }
      }

      if (!whatsappRow) {
        await client.query('INSERT INTO settings (key, value) VALUES ($1, $2)', ['whatsapp', DEFAULT_WHATSAPP])
      }
    })
    return
  }

  const db = getSqliteDb()
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
          JSON.stringify(product.sizes),
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

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    categoryId: row.categoryId,
    image: row.image,
    description: row.description,
    sizes: parseSizes(row.sizes),
  }
}

async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const methods = await queryRows<any>('SELECT * FROM payment_methods')
  const fields = await queryRows<any>('SELECT * FROM payment_fields')

  return methods.map((method) => {
    const methodFields = fields
      .filter((field) => field.methodid === method.id || field.methodId === method.id)
      .map((field) => ({ key: field.key, label: field.label, value: field.value }))
    return toPaymentMethod(method, methodFields)
  })
}

export async function getStore() {
  await ensureStorage()
  const products = await queryRows<any>(
    usePostgres
      ? 'SELECT * FROM products ORDER BY created_at DESC'
      : 'SELECT * FROM products ORDER BY rowid DESC',
  )
  const categories = await queryRows<Category>(
    usePostgres ? 'SELECT * FROM categories ORDER BY name' : 'SELECT * FROM categories ORDER BY name COLLATE NOCASE',
  )
  const methods = await queryRows<any>('SELECT * FROM payment_methods')
  const fields = await queryRows<any>('SELECT * FROM payment_fields')
  const whatsapp = (await queryOne<{ value: string }>('SELECT value FROM settings WHERE key = $1', ['whatsapp']))?.value

  return {
    products: products.map(mapProduct),
    categories,
    paymentMethods: methods.map((method) =>
      toPaymentMethod(
        method,
        fields
          .filter((field) => field.methodid === method.id || field.methodId === method.id)
          .map((field) => ({ key: field.key, label: field.label, value: field.value })),
      ),
    ),
    whatsapp: whatsapp ?? DEFAULT_WHATSAPP,
  }
}

export async function addProduct(product: Omit<Product, 'id'>) {
  await ensureStorage()
  const id = `p-${Date.now().toString(36)}`
  if (usePostgres) {
    await runQuery(
      'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, product.name, product.price, product.categoryId, product.image, product.description, product.sizes],
    )
  } else {
    await runQuery(
      'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, product.name, product.price, product.categoryId, product.image, product.description, JSON.stringify(product.sizes)],
    )
  }
  return { id, ...product }
}

export async function updateProduct(id: string, changes: Partial<Omit<Product, 'id'>>) {
  await ensureStorage()
  const existing = await queryOne<any>('SELECT * FROM products WHERE id = $1', [id])
  if (!existing) return null
  const updated = {
    id,
    name: changes.name !== undefined ? changes.name : existing.name,
    price: changes.price !== undefined ? changes.price : existing.price,
    categoryId: changes.categoryId !== undefined ? changes.categoryId : existing.categoryId,
    image: changes.image !== undefined ? changes.image : existing.image,
    description: changes.description !== undefined ? changes.description : existing.description,
    sizes: changes.sizes !== undefined ? changes.sizes : parseSizes(existing.sizes),
  }
  if (usePostgres) {
    await runQuery(
      'UPDATE products SET name = $1, price = $2, categoryId = $3, image = $4, description = $5, sizes = $6 WHERE id = $7',
      [updated.name, Number(updated.price), updated.categoryId, updated.image, updated.description, updated.sizes, id],
    )
  } else {
    await runQuery(
      'UPDATE products SET name = ?, price = ?, categoryId = ?, image = ?, description = ?, sizes = ? WHERE id = ?',
      [updated.name, Number(updated.price), updated.categoryId, updated.image, updated.description, JSON.stringify(parseSizes(updated.sizes)), id],
    )
  }
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

export async function deleteProduct(id: string) {
  await ensureStorage()
  await runQuery(usePostgres ? 'DELETE FROM products WHERE id = $1' : 'DELETE FROM products WHERE id = ?', [id])
}

export async function addCategory(name: string, department: string) {
  await ensureStorage()
  const id = `c-${Date.now().toString(36)}`
  await runQuery(usePostgres ? 'INSERT INTO categories (id, name, department) VALUES ($1, $2, $3)' : 'INSERT INTO categories (id, name, department) VALUES (?, ?, ?)', [
    id,
    name.trim(),
    department,
  ])
  return { id, name: name.trim(), department }
}

export async function deleteCategory(id: string) {
  await ensureStorage()
  await runQuery(usePostgres ? 'DELETE FROM categories WHERE id = $1' : 'DELETE FROM categories WHERE id = ?', [id])
  await runQuery(usePostgres ? 'DELETE FROM products WHERE categoryId = $1' : 'DELETE FROM products WHERE categoryId = ?', [id])
}

export async function resetCatalog() {
  await ensureStorage()
  if (usePostgres) {
    await runTransaction(async (client) => {
      await client.query('DELETE FROM products')
      await client.query('DELETE FROM categories')
      for (const category of DEFAULT_CATEGORIES) {
        await client.query('INSERT INTO categories (id, name, department) VALUES ($1, $2, $3)', [
          category.id,
          category.name,
          category.department,
        ])
      }
      for (const product of DEFAULT_PRODUCTS) {
        await client.query(
          'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [product.id, product.name, product.price, product.categoryId, product.image, product.description, product.sizes],
        )
      }
    })
  } else {
    const db = getSqliteDb()
    const deleteProducts = db.prepare('DELETE FROM products')
    const deleteCategories = db.prepare('DELETE FROM categories')
    const insertCategory = db.prepare('INSERT INTO categories (id, name, department) VALUES (?, ?, ?)')
    const insertProduct = db.prepare(
      'INSERT INTO products (id, name, price, categoryId, image, description, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const restore = db.transaction(() => {
      deleteProducts.run()
      deleteCategories.run()
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
          JSON.stringify(product.sizes),
        )
      }
    })
    restore()
  }
}

export async function updatePaymentMethod(id: PaymentMethodId, changes: Partial<Omit<PaymentMethod, 'id' | 'fields'>>) {
  await ensureStorage()
  const existing = await queryOne<any>(usePostgres ? 'SELECT * FROM payment_methods WHERE id = $1' : 'SELECT * FROM payment_methods WHERE id = ?', [id])
  if (!existing) return null
  const updated = {
    ...existing,
    label: changes.label !== undefined ? changes.label : existing.label,
    instructions: changes.instructions !== undefined ? changes.instructions : existing.instructions,
    enabled: changes.enabled !== undefined ? Boolean(changes.enabled) : Boolean(existing.enabled),
  }
  await runQuery(
    usePostgres
      ? 'UPDATE payment_methods SET label = $1, enabled = $2, instructions = $3 WHERE id = $4'
      : 'UPDATE payment_methods SET label = ?, enabled = ?, instructions = ? WHERE id = ?',
    [updated.label, usePostgres ? updated.enabled : Number(updated.enabled), updated.instructions, id],
  )
  const methods = await getPaymentMethods()
  return methods.find((method) => method.id === id) ?? null
}

export async function updatePaymentField(methodId: PaymentMethodId, fieldKey: string, value: string) {
  await ensureStorage()
  await runQuery(
    usePostgres
      ? 'UPDATE payment_fields SET value = $1 WHERE methodId = $2 AND key = $3'
      : 'UPDATE payment_fields SET value = ? WHERE methodId = ? AND key = ?',
    [value, methodId, fieldKey],
  )
}

export async function resetPaymentMethods() {
  await ensureStorage()
  if (usePostgres) {
    await runTransaction(async (client) => {
      await client.query('DELETE FROM payment_fields')
      await client.query('DELETE FROM payment_methods')
      for (const method of DEFAULT_PAYMENT_METHODS) {
        await client.query(
          'INSERT INTO payment_methods (id, label, enabled, instructions) VALUES ($1, $2, $3, $4)',
          [method.id, method.label, method.enabled, method.instructions],
        )
        for (const field of method.fields) {
          await client.query(
            'INSERT INTO payment_fields (methodId, key, label, value) VALUES ($1, $2, $3, $4)',
            [method.id, field.key, field.label, field.value],
          )
        }
      }
    })
  } else {
    const db = getSqliteDb()
    const deleteMethods = db.prepare('DELETE FROM payment_methods')
    const deleteFields = db.prepare('DELETE FROM payment_fields')
    const insertMethod = db.prepare('INSERT INTO payment_methods (id, label, enabled, instructions) VALUES (?, ?, ?, ?)')
    const insertField = db.prepare('INSERT INTO payment_fields (methodId, key, label, value) VALUES (?, ?, ?, ?)')
    const restore = db.transaction(() => {
      deleteMethods.run()
      deleteFields.run()
      for (const method of DEFAULT_PAYMENT_METHODS) {
        insertMethod.run(method.id, method.label, method.enabled ? 1 : 0, method.instructions)
        for (const field of method.fields) {
          insertField.run(method.id, field.key, field.label, field.value)
        }
      }
    })
    restore()
  }
}

export async function updateWhatsapp(value: string) {
  await ensureStorage()
  await runQuery(
    usePostgres ? 'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value' : 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    ['whatsapp', value],
  )
}