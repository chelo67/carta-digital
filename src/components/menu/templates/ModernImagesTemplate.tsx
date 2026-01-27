import { Product, Category } from '@/lib/types';

interface TemplateProps {
  categories: Category[];
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ModernImagesTemplate({ categories, products, onProductClick }: TemplateProps) {
  const getProductsByCategory = (categoryId: string) => 
    products.filter(p => p.category_id === categoryId && p.is_available);

  return (
    <div className="space-y-10">
      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="animate-fade-in">
            <div className="mb-6">
              <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-primary">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                        <span className="text-4xl opacity-30">🍽</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                    {product.name}
                  </h3>
                  <span className="text-primary font-semibold text-sm">
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
