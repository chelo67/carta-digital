import { Product, Category } from '@/lib/types';

interface TemplateProps {
  categories: Category[];
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ClassicTextTemplate({ categories, products, onProductClick }: TemplateProps) {
  const getProductsByCategory = (categoryId: string) => 
    products.filter(p => p.category_id === categoryId && p.is_available);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="animate-fade-in">
            <div className="border-b-2 border-primary/20 pb-2 mb-6">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-muted-foreground text-sm mt-1 italic">
                  {category.description}
                </p>
              )}
            </div>

            <div className="space-y-6">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-muted-foreground text-sm mt-1">
                          {product.description}
                        </p>
                      )}
                      {product.ingredients && (
                        <p className="text-muted-foreground text-xs mt-1 italic">
                          {product.ingredients}
                        </p>
                      )}
                    </div>
                    <span className="price-tag text-lg whitespace-nowrap">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
