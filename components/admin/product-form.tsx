'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DEPARTMENTS, useStore } from '@/lib/store'
import type { Product } from '@/lib/types'

interface ProductFormProps {
  product?: Product
  onDone: () => void
}

export function ProductForm({ product, onDone }: ProductFormProps) {
  const { categories, addProduct, updateProduct } = useStore()
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [image, setImage] = useState(product?.image ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [sizes, setSizes] = useState(product?.sizes.join(', ') ?? 'S, M, L')
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedPrice = Number.parseFloat(price)
    if (!name.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Revisa el nombre y el precio.')
      return
    }
    if (!categoryId) {
      setError('Selecciona una categoría.')
      return
    }
    const data = {
      name: name.trim(),
      price: parsedPrice,
      categoryId,
      image: image || '/placeholder.svg?height=800&width=600',
      description: description.trim(),
      sizes: sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }
    if (product) {
      updateProduct(product.id, data)
    } else {
      addProduct(data)
    }
    onDone()
  }

  const departmentLabel = (dep: string) => DEPARTMENTS.find((d) => d.id === dep)?.label ?? dep

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-name">Nombre del producto</Label>
        <Input
          id="pf-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Vestido Aurora"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-price">Precio (USD)</Label>
          <Input
            id="pf-price"
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="45.00"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-category">Categoría</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="pf-category" className="w-full">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name} · {departmentLabel(cat.department)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-image">Imagen del producto</Label>
        <Input
          id="pf-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">
          Selecciona una imagen desde tu dispositivo. Si no subes ninguna se usará una imagen de relleno.
        </p>
        {(image || product?.image) && (
          <div className="mt-2 overflow-hidden rounded-md border border-border bg-secondary">
            <img
              src={image || product?.image || '/placeholder.svg'}
              alt="Previsualización de la imagen"
              className="h-40 w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-sizes">Tallas (separadas por coma)</Label>
        <Input
          id="pf-sizes"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="S, M, L"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pf-description">Descripción</Label>
        <Textarea
          id="pf-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe el producto brevemente"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit">{product ? 'Guardar cambios' : 'Añadir producto'}</Button>
      </div>
    </form>
  )
}
