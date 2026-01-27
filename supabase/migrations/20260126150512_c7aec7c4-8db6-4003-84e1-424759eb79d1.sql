-- Drop existing restrictive policies and recreate as permissive

-- Fix restaurants table
DROP POLICY IF EXISTS "Public can view restaurants" ON public.restaurants;
CREATE POLICY "Public can view restaurants" 
ON public.restaurants 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Fix categories table
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" 
ON public.categories 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Fix products table
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" 
ON public.products 
FOR SELECT 
TO anon, authenticated
USING (true);