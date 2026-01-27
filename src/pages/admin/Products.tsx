import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/lib/types';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { restaurant } = useRestaurant();
  const { categories } = useCategories(restaurant?.id);
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts(restaurant?.id);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleCreate = async (data: any) => {
    const { error } = await createProduct(data);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Producto creado' });
      setDialogOpen(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingProduct) return;
    const { error } = await updateProduct(editingProduct.id, data);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Producto actualizado' });
      setEditingProduct(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    const { error } = await deleteProduct(id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Producto eliminado' });
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sin categoría';
  };

  // Group products by category
  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id),
  })).filter(group => group.products.length > 0);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">Productos</h2>
            <p className="text-muted-foreground">Gestiona los productos de tu menú</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} disabled={categories.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Primero debes crear al menos una categoría
              </p>
              <Button onClick={() => navigate('/admin/categories')}>
                Ir a Categorías
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : productsByCategory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No tienes productos aún</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear tu primer producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {productsByCategory.map(({ category, products: categoryProducts }) => (
              <div key={category.id}>
                <h3 className="font-serif text-lg font-medium text-foreground mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {categoryProducts.map((product) => (
                    <Card key={product.id} className="group">
                      <CardContent className="p-4 flex items-center gap-4">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.description || 'Sin descripción'}
                          </p>
                        </div>
                        <span className="price-tag text-lg">${product.price.toFixed(2)}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Nuevo Producto</DialogTitle>
            </DialogHeader>
            <ProductForm 
              categories={categories}
              onSubmit={handleCreate} 
              onCancel={() => setDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Editar Producto</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm 
                product={editingProduct}
                categories={categories}
                onSubmit={handleUpdate} 
                onCancel={() => setEditingProduct(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
