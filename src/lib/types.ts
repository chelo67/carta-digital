export type MenuTemplate = 'elegant_images' | 'modern_images' | 'minimal_text' | 'classic_text';

export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  selected_template: MenuTemplate;
  primary_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category: Category;
}
