-- Update services with correct category matching
UPDATE public.services 
SET image_url = CASE 
  WHEN category = 'Design' THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
  WHEN category = 'Development' AND name ILIKE '%Mobile%' THEN 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
  WHEN category = 'Development' AND name ILIKE '%Web%' THEN 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'
  WHEN category = 'Infrastructure' THEN 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop'
  WHEN category = 'AI & ML' THEN 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
  WHEN category = 'Analytics' THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
  WHEN category = 'IoT' THEN 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
  WHEN category = 'Immersive Tech' THEN 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=600&fit=crop'
  WHEN category = 'Blockchain' THEN 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'
  WHEN category = 'Gaming' THEN 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'
END;