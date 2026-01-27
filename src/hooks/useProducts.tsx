import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

export function useProducts(restaurantId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetchProducts();
    }
  }, [restaurantId]);

  const fetchProducts = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  const createProduct = async (product: {
    name: string;
    category_id: string;
    price: number;
    description?: string;
    ingredients?: string;
    image_url?: string;
  }) => {
    if (!restaurantId) return { error: new Error('No restaurant found') };

    const categoryProducts = products.filter(p => p.category_id === product.category_id);
    const maxOrder = categoryProducts.length > 0 
      ? Math.max(...categoryProducts.map(p => p.display_order)) 
      : 0;

    const { data, error } = await supabase
      .from('products')
      .insert({
        restaurant_id: restaurantId,
        category_id: product.category_id,
        name: product.name,
        price: product.price,
        description: product.description || null,
        ingredients: product.ingredients || null,
        image_url: product.image_url || null,
        display_order: maxOrder + 1,
      })
      .select()
      .single();

    if (!error) {
      await fetchProducts();
    }
    return { data, error };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchProducts();
    }
    return { data, error };
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchProducts();
    }
    return { error };
  };

  return { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct };
}
