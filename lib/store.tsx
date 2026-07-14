'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  Category,
  Department,
  PaymentField,
  PaymentMethod,
  PaymentMethodId,
  Product,
} from './types'

export const DEPARTMENTS: { id: Department; label: string }[] = [
  { id: 'mujer', label: 'Mujer' },
  { id: 'hombre', label: 'Hombre' },
  { id: 'ninos', label: 'Niños' },
]

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
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

export const DEFAULT_WHATSAPP = '584120000000'

export function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) return `58${digits.slice(1)}`
  if (digits.startsWith('58')) return digits
  return digits
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const normalized = normalizeWhatsAppNumber(phone)
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

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

const LS_KEYS = {
  products: 'athenea-products',
  categories: 'athenea-categories',
  cart: 'athenea-cart',
  session: 'athenea-admin-session',
  payments: 'athenea-payment-methods',
  whatsapp: 'athenea-whatsapp',
} as const

export const ADMIN_CREDENTIALS = {
  username: 'ethenea',
  password: 'athenea123',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // ignore corrupted data
  }
  return fallback
}

interface StoreContextValue {
  ready: boolean
  products: Product[]
  categories: Category[]
  cart: CartItem[]
  paymentMethods: PaymentMethod[]
  whatsapp: string
  // catalog (admin)
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>
  updateProduct: (id: string, changes: Partial<Omit<Product, 'id'>>) => Promise<Product>
  deleteProduct: (id: string) => void
  addCategory: (name: string, department: Department) => void
  deleteCategory: (id: string) => void
  resetCatalog: () => void
  updatePaymentMethod: (id: PaymentMethodId, changes: Partial<Omit<PaymentMethod, 'id'>>) => void
  updatePaymentField: (methodId: PaymentMethodId, fieldKey: string, value: string) => void
  updateWhatsapp: (value: string) => void
  resetPaymentMethods: () => void
  // cart
  addToCart: (productId: string, size: string) => void
  updateCartQuantity: (productId: string, size: string, quantity: number) => void
  removeFromCart: (productId: string, size: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  // admin session
  isAdmin: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

async function fetchStoreData() {
  const response = await fetch('/api/store', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('No se pudo cargar el catálogo desde la base de datos.')
  }

  return response.json() as Promise<{
    products: Product[]
    categories: Category[]
    paymentMethods: PaymentMethod[]
    whatsapp: string
  }>
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [whatsapp, setWhatsapp] = useState(DEFAULT_WHATSAPP)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadStore = async () => {
      setCart(loadFromStorage(LS_KEYS.cart, []))
      setIsAdmin(loadFromStorage(LS_KEYS.session, false))

      try {
        const store = await fetchStoreData()
        setProducts(store.products)
        setCategories(store.categories)
        setPaymentMethods(store.paymentMethods)
        setWhatsapp(store.whatsapp)
      } catch (error) {
        console.error(error)
        setProducts(DEFAULT_PRODUCTS)
        setCategories(DEFAULT_CATEGORIES)
        setPaymentMethods(DEFAULT_PAYMENT_METHODS)
        setWhatsapp(DEFAULT_WHATSAPP)
      } finally {
        setReady(true)
      }
    }

    loadStore()
  }, [])

  useEffect(() => {
    if (ready) window.localStorage.setItem(LS_KEYS.cart, JSON.stringify(cart))
  }, [cart, ready])

  useEffect(() => {
    if (ready) window.localStorage.setItem(LS_KEYS.session, JSON.stringify(isAdmin))
  }, [isAdmin, ready])

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })

    if (!response.ok) {
      throw new Error('No se pudo guardar el producto.')
    }

    const created = (await response.json()) as Product
    setProducts((prev) => [created, ...prev])
    return created
  }, [])

  const updateProduct = useCallback(async (id: string, changes: Partial<Omit<Product, 'id'>>) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })

    if (!response.ok) {
      throw new Error('No se pudo actualizar el producto.')
    }

    const updated = (await response.json()) as Product
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  const deleteProduct = useCallback((id: string) => {
    fetch(`/api/products/${id}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo eliminar el producto.')
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setCart((prev) => prev.filter((item) => item.productId !== id))
      })
      .catch((error) => console.error(error))
  }, [])

  const addCategory = useCallback((name: string, department: Department) => {
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, department }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo crear la categoría.')
        return response.json() as Promise<Category>
      })
      .then((created) => setCategories((prev) => [...prev, created]))
      .catch((error) => console.error(error))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    fetch(`/api/categories/${id}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo eliminar la categoría.')
        setCategories((prev) => prev.filter((c) => c.id !== id))
        setProducts((prev) => {
          const removedIds = prev.filter((p) => p.categoryId === id).map((p) => p.id)
          setCart((prevCart) => prevCart.filter((item) => !removedIds.includes(item.productId)))
          return prev.filter((p) => p.categoryId !== id)
        })
      })
      .catch((error) => console.error(error))
  }, [])

  const resetCatalog = useCallback(() => {
    fetch('/api/reset-catalog', { method: 'POST' })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo restaurar el catálogo.')
        return fetchStoreData()
      })
      .then((store) => {
        setProducts(store.products)
        setCategories(store.categories)
      })
      .catch((error) => console.error(error))
  }, [])

  const updatePaymentMethod = useCallback(
    (id: PaymentMethodId, changes: Partial<Omit<PaymentMethod, 'id'>>) => {
      fetch(`/api/payment-methods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
        .then((response) => {
          if (!response.ok) throw new Error('No se pudo actualizar el método de pago.')
          return response.json() as Promise<PaymentMethod>
        })
        .then((updated) =>
          setPaymentMethods((prev) => prev.map((method) => (method.id === id ? updated : method))),
        )
        .catch((error) => console.error(error))
    },
    [],
  )

  const updatePaymentField = useCallback(
    (methodId: PaymentMethodId, fieldKey: string, value: string) => {
      fetch(`/api/payment-methods/${methodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldKey, value }),
      })
        .then((response) => {
          if (!response.ok) throw new Error('No se pudo actualizar el campo de pago.')
          setPaymentMethods((prev) =>
            prev.map((method) =>
              method.id === methodId
                ? {
                    ...method,
                    fields: method.fields.map((field) =>
                      field.key === fieldKey ? { ...field, value } : field,
                    ),
                  }
                : method,
            ),
          )
        })
        .catch((error) => console.error(error))
    },
    [],
  )

  const resetPaymentMethods = useCallback(() => {
    fetch('/api/reset-payments', { method: 'POST' })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo restaurar los métodos de pago.')
        return fetchStoreData()
      })
      .then((store) => {
        setPaymentMethods(store.paymentMethods)
        setWhatsapp(store.whatsapp)
      })
      .catch((error) => console.error(error))
  }, [])

  const updateWhatsapp = useCallback((value: string) => {
    fetch('/api/settings/whatsapp', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo actualizar el número de WhatsApp.')
        setWhatsapp(value)
      })
      .catch((error) => console.error(error))
  }, [])

  const addToCart = useCallback((productId: string, size: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.size === size)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { productId, size, quantity: 1 }]
    })
  }, [])

  const updateCartQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) return prev.filter((i) => !(i.productId === productId && i.size === size))
      return prev.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity } : i,
      )
    })
  }, [])

  const removeFromCart = useCallback((productId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const login = useCallback((username: string, password: string) => {
    const ok =
      username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    if (ok) setIsAdmin(true)
    return ok
  }, [])

  const logout = useCallback(() => setIsAdmin(false), [])

  const cartCount = useMemo(() => cart.reduce((acc, i) => acc + i.quantity, 0), [cart])

  const cartTotal = useMemo(
    () =>
      cart.reduce((acc, i) => {
        const product = products.find((p) => p.id === i.productId)
        return acc + (product ? product.price * i.quantity : 0)
      }, 0),
    [cart, products],
  )

  const value = useMemo<StoreContextValue>(
    () => ({
      ready,
      products,
      categories,
      cart,
      paymentMethods,
      whatsapp,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      deleteCategory,
      resetCatalog,
      updatePaymentMethod,
      updatePaymentField,
      updateWhatsapp,
      resetPaymentMethods,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      isAdmin,
      login,
      logout,
    }),
    [
      ready,
      products,
      categories,
      cart,
      paymentMethods,
      whatsapp,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      deleteCategory,
      resetCatalog,
      updatePaymentMethod,
      updatePaymentField,
      updateWhatsapp,
      resetPaymentMethods,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      isAdmin,
      login,
      logout,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}

export function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}
