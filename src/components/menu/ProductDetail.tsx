import { Product, Category } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ProductDetailProps {
  product: Product | null;
  category?: Category;
  open: boolean;
  onClose: () => void;
}

export function ProductDetail({ product, category, open, onClose }: ProductDetailProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {product.image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-2">
            {category && (
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                {category.name}
              </span>
            )}
            <DialogTitle className="font-serif text-2xl font-semibold pr-8">
              {product.name}
            </DialogTitle>
          </DialogHeader>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {product.ingredients && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Ingredientes</h4>
              <p className="text-sm text-muted-foreground italic">{product.ingredients}</p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <span className="price-tag text-2xl">${product.price.toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
