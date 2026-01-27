import { Product, Category } from '@/lib/types';

interface TemplateProps {
  categories: Category[];
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ElegantImagesTemplate({ categories, products, onProductClick }: TemplateProps) {
  const getProductsByCategory = (categoryId: string) => 
    products.filter(p => p.category_id === categoryId && p.is_available);

  return (
    <div className="space-y-12">
      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-muted-foreground mt-2">{category.description}</p>
              )}
              <div className="mt-4 mx-auto w-16 h-0.5 bg-primary/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="menu-card cursor-pointer group"
                >
                  {product.image_url && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <span className="price-tag text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
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
