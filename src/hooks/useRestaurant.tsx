import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Restaurant, MenuTemplate } from '@/lib/types';

export function useRestaurant() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRestaurant();
    } else {
      setRestaurant(null);
      setLoading(false);
    }
  }, [user]);

  const fetchRestaurant = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setRestaurant(data as Restaurant);
    }
    setLoading(false);
  };

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!restaurant) return { error: new Error('No restaurant found') };

    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurant.id)
      .select()
      .single();

    if (!error && data) {
      setRestaurant(data as Restaurant);
    }
    return { data, error };
  };

  const updateTemplate = async (template: MenuTemplate) => {
    return updateRestaurant({ selected_template: template });
  };

  return { restaurant, loading, fetchRestaurant, updateRestaurant, updateTemplate };
}
