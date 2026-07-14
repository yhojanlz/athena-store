'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, LogOut, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductForm } from '@/components/admin/product-form'
import { PaymentSettings } from '@/components/admin/payment-settings'
import {
  DEPARTMENTS,
  formatPrice,
  useStore,
  type Department,
  type Product,
} from '@/lib/store'

export function AdminDashboard() {
  const { products, categories, deleteProduct, addCategory, deleteCategory, resetCatalog, logout } =
    useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDep, setNewCategoryDep] = useState<Department>('mujer')

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Sin categoría'
  const departmentLabel = (dep: Department) => DEPARTMENTS.find((d) => d.id === dep)?.label ?? dep

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1
    return counts
  }, [products])

  const openNewProduct = () => {
    setEditingProduct(undefined)
    setDialogOpen(true)
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    addCategory(newCategoryName, newCategoryDep)
    setNewCategoryName('')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <p className="font-serif text-lg tracking-[0.25em]">ATHENEA</p>
            <Badge variant="secondary" className="uppercase tracking-wider">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="size-3.5" />
                Ver tienda
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-3.5" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Panel de administración</h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Gestiona productos, precios y categorías. Los cambios se reflejan al instante en la
              tienda.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetCatalog}>
              <RotateCcw className="size-3.5" />
              Restaurar catálogo
            </Button>
            <Button size="sm" onClick={openNewProduct}>
              <Plus className="size-3.5" />
              Nuevo producto
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Productos</CardDescription>
              <CardTitle className="font-serif text-3xl">{products.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Categorías</CardDescription>
              <CardTitle className="font-serif text-3xl">{categories.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardDescription>Valor del catálogo</CardDescription>
              <CardTitle className="font-serif text-3xl">
                {formatPrice(products.reduce((acc, p) => acc + p.price, 0))}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="productos" className="mt-8">
          <TabsList>
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="mt-4">
            {products.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No hay productos. Usa &quot;Nuevo producto&quot; para añadir el primero.
                </CardContent>
              </Card>
            ) : (
              <ul className="flex flex-col gap-3">
                {products.map((product) => (
                  <li key={product.id}>
                    <Card>
                      <CardContent className="flex items-center gap-4">
                        <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-sm bg-secondary">
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {categoryName(product.categoryId)} · Tallas: {product.sizes.join(', ')}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditProduct(product)}
                            aria-label={`Editar ${product.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteProduct(product.id)}
                            aria-label={`Eliminar ${product.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="categorias" className="mt-4 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nueva categoría</CardTitle>
                <CardDescription>
                  Crea una categoría y asígnala a un departamento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="flex flex-wrap items-end gap-3">
                  <div className="flex min-w-40 flex-1 flex-col gap-2">
                    <Label htmlFor="cat-name">Nombre</Label>
                    <Input
                      id="cat-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ej: Accesorios"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cat-dep">Departamento</Label>
                    <Select
                      value={newCategoryDep}
                      onValueChange={(v) => setNewCategoryDep(v as Department)}
                    >
                      <SelectTrigger id="cat-dep" className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dep) => (
                          <SelectItem key={dep.id} value={dep.id}>
                            {dep.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">
                    <Plus className="size-3.5" />
                    Crear
                  </Button>
                </form>
              </CardContent>
            </Card>

            <ul className="flex flex-col gap-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Card>
                    <CardContent className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium">{cat.name}</p>
                        <Badge variant="outline">{departmentLabel(cat.department)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {productCountByCategory[cat.id] ?? 0} producto
                          {(productCountByCategory[cat.id] ?? 0) === 1 ? '' : 's'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteCategory(cat.id)}
                        aria-label={`Eliminar categoría ${cat.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Al eliminar una categoría también se eliminan sus productos de la tienda y del
              carrito.
            </p>
          </TabsContent>

          <TabsContent value="pagos" className="mt-4">
            <PaymentSettings />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal">
              {editingProduct ? `Editar: ${editingProduct.name}` : 'Nuevo producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Modifica los datos y guarda los cambios.'
                : 'Completa los datos para añadirlo a la tienda.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm product={editingProduct} onDone={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
