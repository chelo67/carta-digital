import { Product, Category } from '@/lib/types';

interface TemplateProps {
  categories: Category[];
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function MinimalTextTemplate({ categories, products, onProductClick }: TemplateProps) {
  const getProductsByCategory = (categoryId: string) => 
    products.filter(p => p.category_id === categoryId && p.is_available);

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="animate-fade-in">
            <h2 className="font-serif text-xl font-medium text-foreground text-center mb-6">
              {category.name}
            </h2>

            <div className="space-y-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="flex items-baseline gap-2 cursor-pointer group py-2 border-b border-border/50 last:border-0"
                >
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors flex-shrink-0">
                    {product.name}
                  </h3>
                  <div className="flex-1 border-b border-dotted border-border/50 min-w-8 translate-y-[-4px]" />
                  <span className="price-tag flex-shrink-0">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
