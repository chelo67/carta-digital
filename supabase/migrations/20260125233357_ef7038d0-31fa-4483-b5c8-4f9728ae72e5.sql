-- Create enum for template types
CREATE TYPE public.menu_template AS ENUM ('elegant_images', 'modern_images', 'minimal_text', 'classic_text');

-- Create restaurants table (extends user profile)
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Restaurante',
  description TEXT,
  logo_url TEXT,
  selected_template menu_template NOT NULL DEFAULT 'elegant_images',
  primary_color TEXT DEFAULT '#C4704B',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Users can view their own restaurant"
  ON public.restaurants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own restaurant"
  ON public.restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurant"
  ON public.restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can view restaurant for menu display
CREATE POLICY "Public can view restaurants"
  ON public.restaurants FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for categories
CREATE POLICY "Users can manage their restaurant categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE user_id = auth.uid()
    )
  );

-- Public can view categories for menu display
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for products
CREATE POLICY "Users can manage their restaurant products"
  ON public.products FOR ALL
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE user_id = auth.uid()
    )
  );

-- Public can view products for menu display
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  TO anon
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create sample data for new restaurants
CREATE OR REPLACE FUNCTION public.create_sample_menu_data(p_restaurant_id UUID)
RETURNS void AS $$
DECLARE
  v_bebidas_id UUID;
  v_entradas_id UUID;
  v_principales_id UUID;
  v_postres_id UUID;
BEGIN
  -- Create categories
  INSERT INTO public.categories (restaurant_id, name, description, display_order)
  VALUES (p_restaurant_id, 'Bebidas', 'Refrescos, jugos y bebidas especiales', 1)
  RETURNING id INTO v_bebidas_id;
  
  INSERT INTO public.categories (restaurant_id, name, description, display_order)
  VALUES (p_restaurant_id, 'Entradas', 'Para comenzar tu experiencia gastronómica', 2)
  RETURNING id INTO v_entradas_id;
  
  INSERT INTO public.categories (restaurant_id, name, description, display_order)
  VALUES (p_restaurant_id, 'Platos Principales', 'Nuestras especialidades de la casa', 3)
  RETURNING id INTO v_principales_id;
  
  INSERT INTO public.categories (restaurant_id, name, description, display_order)
  VALUES (p_restaurant_id, 'Postres', 'El dulce final perfecto', 4)
  RETURNING id INTO v_postres_id;

  -- Create sample products for Bebidas
  INSERT INTO public.products (restaurant_id, category_id, name, description, ingredients, price, display_order)
  VALUES 
    (p_restaurant_id, v_bebidas_id, 'Limonada Natural', 'Refrescante limonada hecha al momento', 'Limón fresco, agua, azúcar, hielo', 3.50, 1),
    (p_restaurant_id, v_bebidas_id, 'Jugo de Naranja', 'Jugo de naranja recién exprimido', 'Naranjas frescas', 4.00, 2),
    (p_restaurant_id, v_bebidas_id, 'Agua Mineral', 'Agua mineral con o sin gas', 'Agua mineral natural', 2.50, 3);

  -- Create sample products for Entradas
  INSERT INTO public.products (restaurant_id, category_id, name, description, ingredients, price, display_order)
  VALUES 
    (p_restaurant_id, v_entradas_id, 'Bruschetta Clásica', 'Pan artesanal con tomate fresco y albahaca', 'Pan ciabatta, tomate, albahaca, ajo, aceite de oliva', 8.50, 1),
    (p_restaurant_id, v_entradas_id, 'Carpaccio de Res', 'Finas láminas de res con rúcula y parmesano', 'Lomo de res, rúcula, parmesano, alcaparras, aceite de oliva', 14.00, 2),
    (p_restaurant_id, v_entradas_id, 'Tabla de Quesos', 'Selección de quesos artesanales con frutos secos', 'Queso brie, queso azul, queso manchego, nueces, miel', 16.50, 3);

  -- Create sample products for Platos Principales
  INSERT INTO public.products (restaurant_id, category_id, name, description, ingredients, price, display_order)
  VALUES 
    (p_restaurant_id, v_principales_id, 'Risotto de Hongos', 'Cremoso risotto con variedad de hongos silvestres', 'Arroz arborio, hongos porcini, champiñones, vino blanco, parmesano', 22.00, 1),
    (p_restaurant_id, v_principales_id, 'Salmón a la Parrilla', 'Salmón atlántico con vegetales de temporada', 'Salmón fresco, espárragos, limón, mantequilla de hierbas', 28.50, 2),
    (p_restaurant_id, v_principales_id, 'Filete Mignon', 'Corte premium de res con salsa de vino tinto', 'Filete de res, salsa de vino, papas gratinadas, vegetales', 35.00, 3),
    (p_restaurant_id, v_principales_id, 'Pasta Carbonara', 'Pasta tradicional italiana con guanciale', 'Spaghetti, guanciale, yema de huevo, pecorino, pimienta negra', 18.00, 4);

  -- Create sample products for Postres
  INSERT INTO public.products (restaurant_id, category_id, name, description, ingredients, price, display_order)
  VALUES 
    (p_restaurant_id, v_postres_id, 'Tiramisú', 'El clásico postre italiano', 'Mascarpone, café espresso, savoiardi, cacao', 9.50, 1),
    (p_restaurant_id, v_postres_id, 'Crème Brûlée', 'Crema catalana con caramelo crujiente', 'Crema, vainilla, azúcar caramelizada', 8.50, 2),
    (p_restaurant_id, v_postres_id, 'Tarta de Chocolate', 'Intenso pastel de chocolate belga', 'Chocolate 70% cacao, mantequilla, huevos, harina', 10.00, 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_restaurant_id UUID;
BEGIN
  -- Create restaurant profile for new user
  INSERT INTO public.restaurants (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'Mi Restaurante'))
  RETURNING id INTO v_restaurant_id;

  -- Create sample menu data
  PERFORM public.create_sample_menu_data(v_restaurant_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();