import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Category } from '@/lib/types';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { restaurant } = useRestaurant();
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories(restaurant?.id);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleCreate = async (data: { name: string; description?: string }) => {
    const { error } = await createCategory(data);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Categoría creada' });
      setDialogOpen(false);
    }
  };

  const handleUpdate = async (data: { name: string; description?: string }) => {
    if (!editingCategory) return;
    const { error } = await updateCategory(editingCategory.id, data);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Categoría actualizada' });
      setEditingCategory(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Los productos asociados también serán eliminados.')) return;
    const { error } = await deleteCategory(id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Categoría eliminada' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">Categorías</h2>
            <p className="text-muted-foreground">Organiza tu menú en secciones</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No tienes categorías aún</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear tu primera categoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <Card key={category.id} className="group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Nueva Categoría</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              onSubmit={handleCreate} 
              onCancel={() => setDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Editar Categoría</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <CategoryForm 
                category={editingCategory}
                onSubmit={handleUpdate} 
                onCancel={() => setEditingCategory(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
