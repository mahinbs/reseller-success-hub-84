
-- Update existing services with appropriate stock images based on their categories
UPDATE public.services 
SET image_url = CASE 
  WHEN category = 'UX/UI Design' THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
  WHEN category = 'Mobile App Development' THEN 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
  WHEN category = 'Web Full-stack Development' THEN 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'
  WHEN category = 'Cloud Computing' THEN 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop'
  WHEN category = 'Artificial Intelligence Development' THEN 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
  WHEN category = 'Data Analytics & BI' THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
  WHEN category = 'IoT Development' THEN 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
  WHEN category = 'VR/AR Development' THEN 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=600&fit=crop'
  WHEN category = 'Blockchain Development' THEN 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'
  WHEN category = 'Game Development' THEN 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop'
  WHEN category = 'Chatbot Development' THEN 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'
END
WHERE image_url IS NULL;

-- Update existing bundles with appropriate stock images
UPDATE public.bundles 
SET image_url = CASE 
  WHEN name ILIKE '%AI%' OR name ILIKE '%Artificial Intelligence%' THEN 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
  WHEN name ILIKE '%Full-Stack%' OR name ILIKE '%Web%' THEN 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'
  WHEN name ILIKE '%Mobile%' OR name ILIKE '%IoT%' THEN 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
  WHEN name ILIKE '%SaaS%' OR name ILIKE '%Starter%' THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
END
WHERE image_url IS NULL;
