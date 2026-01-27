import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Category, Product, MenuTemplate } from '@/lib/types';
import { ProductDetail } from '@/components/menu/ProductDetail';
import { ElegantImagesTemplate } from '@/components/menu/templates/ElegantImagesTemplate';
import { ModernImagesTemplate } from '@/components/menu/templates/ModernImagesTemplate';
import { MinimalTextTemplate } from '@/components/menu/templates/MinimalTextTemplate';
import { ClassicTextTemplate } from '@/components/menu/templates/ClassicTextTemplate';
import { UtensilsCrossed } from 'lucide-react';

export default function PublicMenuPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (restaurantId) {
      fetchMenuData();
    }
  }, [restaurantId]);

  const fetchMenuData = async () => {
    setLoading(true);

    // Fetch restaurant
    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .maybeSingle();

    if (restaurantData) {
      setRestaurant(restaurantData as Restaurant);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });

      if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('display_order', { ascending: true });

      if (productsData) {
        setProducts(productsData as Product[]);
      }
    }

    setLoading(false);
  };

  const getCategory = (categoryId: string) => 
    categories.find(c => c.id === categoryId);

  const renderTemplate = () => {
    const props = {
      categories,
      products,
      onProductClick: setSelectedProduct,
    };

    switch (restaurant?.selected_template) {
      case 'modern_images':
        return <ModernImagesTemplate {...props} />;
      case 'minimal_text':
        return <MinimalTextTemplate {...props} />;
      case 'classic_text':
        return <ClassicTextTemplate {...props} />;
      case 'elegant_images':
      default:
        return <ElegantImagesTemplate {...props} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-pulse">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-serif font-semibold text-foreground">
            Menú no encontrado
          </h1>
          <p className="text-muted-foreground mt-2">
            Este restaurante no existe o ha sido eliminado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-8 md:py-12 text-center border-b border-border/50">
        <div className="container">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              {restaurant.description}
            </p>
          )}
        </div>
      </header>

      {/* Menu Content */}
      <main className="container py-8 md:py-12">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Este menú aún no tiene productos
            </p>
          </div>
        ) : (
          renderTemplate()
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Menú digital creado con ❤️
        </p>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        category={selectedProduct ? getCategory(selectedProduct.category_id) : undefined}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
