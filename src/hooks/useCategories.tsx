import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/lib/types';

export function useCategories(restaurantId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetchCategories();
    }
  }, [restaurantId]);

  const fetchCategories = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  const createCategory = async (category: { name: string; description?: string }) => {
    if (!restaurantId) return { error: new Error('No restaurant found') };

    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map(c => c.display_order)) 
      : 0;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        restaurant_id: restaurantId,
        name: category.name,
        description: category.description || null,
        display_order: maxOrder + 1,
      })
      .select()
      .single();

    if (!error) {
      await fetchCategories();
    }
    return { data, error };
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchCategories();
    }
    return { data, error };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchCategories();
    }
    return { error };
  };

  return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}
