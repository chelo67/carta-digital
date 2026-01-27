import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Category } from '@/lib/types';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: {
    name: string;
    category_id: string;
    price: number;
    description?: string;
    ingredients?: string;
    image_url?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, categories, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [description, setDescription] = useState(product?.description || '');
  const [ingredients, setIngredients] = useState(product?.ingredients || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        category_id: categoryId,
        price: parseFloat(price),
        description: description || undefined,
        ingredients: ingredients || undefined,
        image_url: imageUrl || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Producto</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Risotto de Hongos"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción del producto..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredientes (opcional)</Label>
        <Textarea
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Lista de ingredientes separados por comas..."
          rows={2}
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
