export type Department = 'mujer' | 'hombre' | 'ninos'

export interface Category {
  id: string
  name: string
  department: Department
}

export interface Product {
  id: string
  name: string
  price: number
  categoryId: string
  image: string
  description: string
  sizes: string[]
}

export interface CartItem {
  productId: string
  size: string
  quantity: number
}

export type PaymentMethodId = 'pago_movil' | 'binance' | 'zelle'

export interface PaymentField {
  key: string
  label: string
  value: string
}

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  enabled: boolean
  instructions: string
  fields: PaymentField[]
}
